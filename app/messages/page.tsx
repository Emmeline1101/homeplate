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
  other: { id: string; name: string; avatarLetter: string; colors: [string, string]; avatar_url: string | null };
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

function Avatar({ name, avatarUrl, colors, size = 48 }: { name: string; avatarUrl: string | null; colors: [string, string]; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        fontSize: size * 0.35,
      }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
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
          other: {
            id: otherUser?.id ?? '',
            name,
            avatarLetter: name[0]?.toUpperCase() ?? '?',
            colors: getColors(name),
            avatar_url: otherUser?.avatar_url ?? null,
          },
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

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-6 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>
            Messages
          </h1>
          {totalUnread > 0 && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              {totalUnread} new
            </span>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/[0.04]">
            {[1, 2, 3, 4].map((i, idx) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-4 py-3.5 animate-pulse"
                style={{ borderTop: idx > 0 ? '1px solid #f3f0eb' : undefined }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.04] shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
              style={{ backgroundColor: '#f0f7f4' }}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#1a3a2a" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-bold text-gray-800">No messages yet</p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              When you message a cook or get messaged about a listing, conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/[0.04]">
            {convs.map((conv, idx) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[#f7f4ef] active:bg-[#f0ede7]"
                style={{
                  borderTop: idx > 0 ? '1px solid #f3f0eb' : undefined,
                  backgroundColor: conv.unread > 0 ? '#f5faf7' : undefined,
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar
                    name={conv.other.name}
                    avatarUrl={conv.other.avatar_url}
                    colors={conv.other.colors}
                    size={48}
                  />
                  {conv.listing?.emoji && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm ring-1 ring-black/5">
                      {conv.listing.emoji}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {conv.other.name}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                      {conv.lastTime ? relativeTime(conv.lastTime) : ''}
                    </span>
                  </div>

                  {conv.listing && (
                    <p className="text-[11px] text-gray-400 truncate mb-0.5" style={{ color: '#7a9e8a' }}>
                      {conv.listing.title}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[13px] truncate ${conv.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                      {conv.lastMessage ?? 'No messages yet'}
                    </p>
                    {conv.unread > 0 && (
                      <div
                        className="shrink-0 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                        style={{ backgroundColor: '#1a3a2a' }}
                      >
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
