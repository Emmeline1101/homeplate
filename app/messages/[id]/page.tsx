'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';
import { createClient } from '../../lib/supabase';
import type { Message } from '../../lib/database.types';

type ConvInfo = {
  listing: { title: string; emoji: string | null } | null;
  other: { id: string; name: string; colors: [string, string]; avatar_url: string | null };
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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime()) return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function isSameGroup(a: Message, b: Message) {
  if (a.sender_id !== b.sender_id) return false;
  return Math.abs(new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) < 2 * 60 * 1000;
}

function OtherAvatar({ name, avatarUrl, colors }: { name: string; avatarUrl: string | null; colors: [string, string] }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [convId, setConvId] = useState('');
  const [myId, setMyId] = useState('');
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [info, setInfo] = useState<ConvInfo | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    params.then(({ id }) => setConvId(id));
  }, [params]);

  useEffect(() => {
    if (!convId) return;
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMyId(user.id);

      const [convResult, msgsResult, meResult] = await Promise.all([
        supabase
          .from('conversations')
          .select(`
            listing_id, buyer_id, seller_id,
            listing:listing_id(title, emoji),
            buyer:users!conversations_buyer_id_fkey(id, name, avatar_url),
            seller:users!conversations_seller_id_fkey(id, name, avatar_url)
          `)
          .eq('id', convId)
          .single() as unknown as Promise<{ data: {
            listing_id: string | null;
            buyer_id: string;
            seller_id: string;
            listing: { title: string; emoji: string | null } | null;
            buyer: { id: string; name: string | null; avatar_url: string | null } | null;
            seller: { id: string; name: string | null; avatar_url: string | null } | null;
          } | null; error: unknown }>,
        supabase
          .from('messages')
          .select('id, conversation_id, sender_id, body, is_read, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true }),
        supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single(),
      ]);

      if (meResult.data) {
        setMyAvatarUrl((meResult.data as { avatar_url: string | null }).avatar_url);
      }

      if (convResult.data) {
        const conv = convResult.data;
        const isMe = conv.buyer_id === user.id;
        const otherUser = isMe ? conv.seller : conv.buyer;
        const name = otherUser?.name ?? 'Unknown';
        setInfo({
          listing: conv.listing,
          other: { id: otherUser?.id ?? '', name, colors: getColors(name), avatar_url: otherUser?.avatar_url ?? null },
        });
      }

      if (msgsResult.data) {
        setMessages(msgsResult.data as Message[]);

        const unreadIds = (msgsResult.data as Message[])
          .filter(m => !m.is_read && m.sender_id !== user.id)
          .map(m => m.id);
        if (unreadIds.length) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }

      setLoading(false);
    }

    load();

    const supabase2 = createClient();
    const channel = supabase2
      .channel(`conv:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMyId(id => {
            if (msg.sender_id !== id) {
              setMessages(prev => [...prev, msg]);
              supabase2.from('messages').update({ is_read: true }).eq('id', msg.id);
            }
            return id;
          });
        },
      )
      .subscribe();

    return () => { supabase2.removeChannel(channel); };
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [draft]);

  async function sendMessage() {
    if (!draft.trim() || sending || !myId) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: convId,
      sender_id: myId,
      body: text,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const supabase = createClient();
    const { data: inserted } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, sender_id: myId, body: text })
      .select('id, conversation_id, sender_id, body, is_read, created_at')
      .single();

    if (inserted) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? inserted as Message : m));
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const colors = info?.other.colors ?? ['#1a3a2a', '#2d6a4f'];

  // Build grouped message list with date separators
  type GroupedItem =
    | { type: 'separator'; label: string; key: string }
    | { type: 'group'; messages: Message[]; isMe: boolean; key: string };

  const grouped: GroupedItem[] = [];
  let currentGroup: Message[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = messages[i - 1];

    // Date separator
    if (!prev || !isSameDay(prev.created_at, msg.created_at)) {
      if (currentGroup.length > 0) {
        grouped.push({
          type: 'group',
          messages: [...currentGroup],
          isMe: currentGroup[0].sender_id === myId,
          key: `group-${currentGroup[0].id}`,
        });
        currentGroup = [];
      }
      grouped.push({ type: 'separator', label: formatDateSeparator(msg.created_at), key: `sep-${msg.created_at}` });
    }

    if (prev && isSameGroup(prev, msg)) {
      currentGroup.push(msg);
    } else {
      if (currentGroup.length > 0) {
        grouped.push({
          type: 'group',
          messages: [...currentGroup],
          isMe: currentGroup[0].sender_id === myId,
          key: `group-${currentGroup[0].id}`,
        });
      }
      currentGroup = [msg];
    }
  }
  if (currentGroup.length > 0) {
    grouped.push({
      type: 'group',
      messages: [...currentGroup],
      isMe: currentGroup[0].sender_id === myId,
      key: `group-${currentGroup[0].id}`,
    });
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      {/* Header */}
      <div
        className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-black/[0.06]"
        style={{ backgroundColor: 'rgba(247,244,239,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <BackButton fallback="/messages" variant="ghost" />

        <Link href={info ? `/profile/${info.other.id}` : '#'} className="relative shrink-0 group">
          {info?.other.avatar_url ? (
            <img
              src={info.other.avatar_url}
              alt={info.other.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
            >
              {info?.other.name[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{info?.other.name ?? '…'}</p>
          {info?.listing && (
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 truncate max-w-full"
              style={{ backgroundColor: '#eef5f1', color: '#3a6e52' }}
            >
              {info.listing.emoji ? `${info.listing.emoji} ` : ''}{info.listing.title}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#eef5f1' }}
            >
              {info?.other.avatar_url ? (
                <img src={info.other.avatar_url} alt={info.other.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>
                  {info?.other.name[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Say hello to {info?.other.name ?? 'them'}</p>
              <p className="text-xs text-gray-400 mt-0.5">Be the first to send a message.</p>
            </div>
          </div>
        ) : (
          grouped.map(item => {
            if (item.type === 'separator') {
              return (
                <div key={item.key} className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-semibold text-gray-400 shrink-0">{item.label}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              );
            }

            const { messages: grpMsgs, isMe } = item;

            return (
              <div key={item.key} className={`flex items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {/* Other person's avatar — only on last message of group */}
                {!isMe && (
                  <div className="shrink-0 w-7 self-end mb-5">
                    <OtherAvatar name={info?.other.name ?? '?'} avatarUrl={info?.other.avatar_url ?? null} colors={colors} />
                  </div>
                )}

                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {grpMsgs.map((msg, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === grpMsgs.length - 1;
                    return (
                      <div
                        key={msg.id}
                        className={`px-3.5 py-2 text-sm leading-relaxed break-words ${
                          isMe
                            ? `text-white ${isFirst && !isLast ? 'rounded-2xl rounded-br-md' : isLast && !isFirst ? 'rounded-2xl rounded-tr-md rounded-br-sm' : !isFirst && !isLast ? 'rounded-xl rounded-r-md' : 'rounded-2xl rounded-br-sm'}`
                            : `bg-white shadow-sm ${isFirst && !isLast ? 'rounded-2xl rounded-bl-md' : isLast && !isFirst ? 'rounded-2xl rounded-tl-md rounded-bl-sm' : !isFirst && !isLast ? 'rounded-xl rounded-l-md' : 'rounded-2xl rounded-bl-sm'} text-gray-800`
                        }`}
                        style={isMe ? { backgroundColor: '#1a3a2a' } : {}}
                      >
                        {msg.body}
                      </div>
                    );
                  })}
                  {/* Timestamp once per group */}
                  <p className={`text-[10px] text-gray-400 mt-0.5 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(grpMsgs[grpMsgs.length - 1].created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 py-3 mb-16 md:mb-0 border-t border-black/[0.05]"
        style={{ backgroundColor: 'rgba(247,244,239,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-end gap-2 bg-white rounded-full border border-gray-200 shadow-sm pl-4 pr-1.5 py-1.5">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-gray-800 placeholder-gray-400 leading-relaxed py-1"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            <svg className="w-3.5 h-3.5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
