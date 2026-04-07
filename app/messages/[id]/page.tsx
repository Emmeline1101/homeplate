'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';
import { createClient } from '../../lib/supabase';
import type { Message } from '../../lib/database.types';

type ConvInfo = {
  listing: { title: string; emoji: string | null } | null;
  other: { id: string; name: string; colors: [string, string] };
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

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [convId, setConvId] = useState('');
  const [myId, setMyId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [info, setInfo] = useState<ConvInfo | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve params and load everything
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

      // Fetch conversation info in parallel with message history
      const [convResult, msgsResult] = await Promise.all([
        supabase
          .from('conversations')
          .select(`
            listing_id, buyer_id, seller_id,
            listing:listing_id(title, emoji),
            buyer:users!conversations_buyer_id_fkey(id, name),
            seller:users!conversations_seller_id_fkey(id, name)
          `)
          .eq('id', convId)
          .single() as Promise<{ data: {
            listing_id: string | null;
            buyer_id: string;
            seller_id: string;
            listing: { title: string; emoji: string | null } | null;
            buyer: { id: string; name: string | null } | null;
            seller: { id: string; name: string | null } | null;
          } | null; error: unknown }>,
        supabase
          .from('messages')
          .select('id, conversation_id, sender_id, body, is_read, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true }),
      ]);

      if (convResult.data) {
        const conv = convResult.data;
        const isMe = conv.buyer_id === user.id;
        const otherUser = isMe ? conv.seller : conv.buyer;
        const name = otherUser?.name ?? 'Unknown';
        setInfo({
          listing: conv.listing,
          other: { id: otherUser?.id ?? '', name, colors: getColors(name) },
        });
      }

      if (msgsResult.data) {
        setMessages(msgsResult.data as Message[]);

        // Mark incoming messages as read
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

    // Realtime: listen for new messages in this conversation
    const supabase2 = createClient();
    const channel = supabase2
      .channel(`conv:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMyId(id => {
            // Only add messages from the other person; own messages come from optimistic update
            if (msg.sender_id !== id) {
              setMessages(prev => [...prev, msg]);
              // Mark as read immediately
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
      // Replace optimistic with real record
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

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      {/* Header */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-gray-100"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <BackButton fallback="/messages" variant="ghost" />

        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
          >
            {info?.other.name[0]?.toUpperCase() ?? '?'}
          </div>
          {info?.listing?.emoji && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[9px] shadow-sm border border-gray-100">
              {info.listing.emoji}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{info?.other.name ?? '…'}</p>
          {info?.listing && (
            <p className="text-xs text-gray-400 truncate">{info.listing.title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="text-4xl">👋</div>
            <p className="text-sm font-semibold text-gray-600">Say hello!</p>
            <p className="text-xs text-gray-400">Be the first to send a message.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div
                    className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold text-white mb-4"
                    style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                  >
                    {info?.other.name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="max-w-[72%]">
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? 'text-white rounded-3xl rounded-br-md shadow-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-md shadow-sm'
                    }`}
                    style={isMe ? { backgroundColor: '#1a3a2a' } : {}}
                  >
                    {msg.body}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.created_at)}
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
        className="shrink-0 px-4 py-3 flex items-end gap-2 border-t border-gray-100 mb-16 md:mb-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all leading-relaxed"
          style={{ maxHeight: 120 }}
        />
        <button
          onClick={sendMessage}
          disabled={!draft.trim() || sending}
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:opacity-90"
          style={{ backgroundColor: '#1a3a2a' }}
        >
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
