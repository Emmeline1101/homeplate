'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { createClient } from '../lib/supabase';
import type { Message } from '../lib/database.types';

type ConvRow = {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listing: { title: string; emoji: string | null } | null;
  buyer: { id: string; name: string | null; avatar_url: string | null } | null;
  seller: { id: string; name: string | null; avatar_url: string | null } | null;
};

type ConvView = {
  id: string;
  listing: { title: string; emoji: string | null } | null;
  other: { id: string; name: string; avatarLetter: string; colors: [string, string] };
  lastMessage: string | null;
  lastTime: string | null;
  unread: number;
};

const COLOR_PALETTES: [string, string][] = [
  ['#d97706', '#92400e'],
  ['#f472b6', '#db2777'],
  ['#c084fc', '#7c3aed'],
  ['#6ee7b7', '#059669'],
  ['#60a5fa', '#1d4ed8'],
  ['#fb923c', '#c2410c'],
  ['#34d399', '#065f46'],
  ['#f87171', '#b91c1c'],
];

function getColors(name: string): [string, string] {
  return COLOR_PALETTES[(name.charCodeAt(0) || 0) % COLOR_PALETTES.length];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const [convs, setConvs] = useState<ConvView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let myId = '';

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      myId = user.id;

      const { data: rows } = await supabase
        .from('conversations')
        .select(`
          id, listing_id, buyer_id, seller_id, created_at,
          listing:listing_id(title, emoji),
          buyer:users!conversations_buyer_id_fkey(id, name, avatar_url),
          seller:users!conversations_seller_id_fkey(id, name, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`) as { data: ConvRow[] | null };

      if (!rows?.length) { setLoading(false); return; }

      const convIds = rows.map(r => r.id);
      const { data: msgs } = await supabase
        .from('messages')
        .select('conversation_id, body, created_at, is_read, sender_id')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false }) as { data: (Pick<Message, 'conversation_id' | 'body' | 'created_at' | 'is_read' | 'sender_id'>)[] | null };

      const lastMsgMap: Record<string, typeof msgs[0]> = {};
      const unreadMap: Record<string, number> = {};
      for (const m of msgs ?? []) {
        if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m;
        if (!m.is_read && m.sender_id !== user.id) {
          unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1;
        }
      }

      const views: ConvView[] = rows.map(r => {
        const isMe = r.buyer_id === user.id;
        const otherUser = isMe ? r.seller : r.buyer;
        const name = otherUser?.name ?? 'Unknown';
        const last = lastMsgMap[r.id];
        return {
          id: r.id,
          listing: r.listing,
          other: { id: otherUser?.id ?? '', name, avatarLetter: name[0]?.toUpperCase() ?? '?', colors: getColors(name) },
          lastMessage: last?.body ?? null,
          lastTime: last?.created_at ?? r.created_at,
          unread: unreadMap[r.id] ?? 0,
        };
      });

      views.sort((a, b) => new Date(b.lastTime!).getTime() - new Date(a.lastTime!).getTime());
      setConvs(views);
      setLoading(false);
    }

    load();

    // Realtime: update last message when any message arrives
    const channel = supabase
      .channel('messages-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        setConvs(prev => {
          const updated = prev.map(c => {
            if (c.id !== msg.conversation_id) return c;
            return {
              ...c,
              lastMessage: msg.body,
              lastTime: msg.created_at,
              unread: msg.sender_id !== myId ? c.unread + 1 : c.unread,
            };
          });
          return [...updated].sort((a, b) => new Date(b.lastTime!).getTime() - new Date(a.lastTime!).getTime());
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalUnread = convs.reduce((n, c) => n + c.unread, 0);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>Messages</h1>
          {totalUnread > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#1a3a2a' }}>
              {totalUnread} unread
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-black/[0.05] shadow-sm px-4 py-4 flex items-center gap-3.5 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-3xl border border-black/[0.05] shadow-sm">
            <div className="text-5xl">💬</div>
            <p className="font-bold text-gray-700">No messages yet</p>
            <p className="text-sm text-gray-400 max-w-xs">
              When you message a cook or get messaged about a listing, your conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden divide-y divide-gray-50">
            {convs.map(conv => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3.5 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${conv.other.colors[0]}, ${conv.other.colors[1]})` }}
                  >
                    {conv.other.avatarLetter}
                  </div>
                  {conv.listing?.emoji && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] shadow-sm border border-gray-100">
                      {conv.listing.emoji}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {conv.other.name}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {conv.lastTime ? relativeTime(conv.lastTime) : ''}
                    </span>
                  </div>
                  {conv.listing && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.listing.title}</p>
                  )}
                  <p className={`text-sm truncate mt-0.5 ${conv.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    {conv.lastMessage ?? 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <div
                    className="shrink-0 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: '#1a3a2a' }}
                  >
                    {conv.unread}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
