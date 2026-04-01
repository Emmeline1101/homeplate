'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { createClient } from '../../lib/supabase';

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

// Mock seed messages for UI demo when Supabase isn't wired up yet
const SEED: Record<string, { with: string; listing: string; messages: Omit<Message, 'id'>[] }> = {
  '1': {
    with: 'Wei Zhang',
    listing: 'Matcha Pound Cake',
    messages: [
      { sender_id: 'them', body: 'Hi! I saw your listing for the Matcha Pound Cake. Is pickup still available on Saturday?', created_at: '2026-04-05T09:00:00' },
      { sender_id: 'me',   body: 'Yes! I have 2 portions left. I can do Saturday morning, around 10–12pm.', created_at: '2026-04-05T09:05:00' },
      { sender_id: 'them', body: 'Sure, I can do Saturday at 11am — see you then!', created_at: '2026-04-05T09:10:00' },
    ],
  },
  '2': {
    with: 'Lisa Ng',
    listing: 'Hong Kong Egg Tarts (6-pack)',
    messages: [
      { sender_id: 'me',   body: 'Hi Lisa! Are the egg tarts still available for this weekend?', created_at: '2026-04-04T14:00:00' },
      { sender_id: 'them', body: 'The egg tarts will be ready by 10am.', created_at: '2026-04-04T14:30:00' },
    ],
  },
  '3': {
    with: 'Rachel Chen',
    listing: 'Matcha White Chocolate Bark',
    messages: [
      { sender_id: 'me', body: 'Do you have any nut-free options?', created_at: '2026-04-03T11:00:00' },
    ],
  },
  '4': {
    with: 'Paul Lin',
    listing: 'Chrysanthemum & Wolfberry Tea',
    messages: [
      { sender_id: 'them', body: 'Your tea blend was absolutely wonderful!', created_at: '2026-04-01T18:00:00' },
      { sender_id: 'me',   body: 'So glad you enjoyed it! I\'ll be making another batch soon.', created_at: '2026-04-01T18:30:00' },
      { sender_id: 'them', body: 'Thank you for the tea — my whole family loved it!', created_at: '2026-04-01T19:00:00' },
    ],
  },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [convId, setConvId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState({ with: '', listing: '' });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve params and seed messages
  useEffect(() => {
    params.then(({ id }) => {
      setConvId(id);
      const seed = SEED[id];
      if (seed) {
        setInfo({ with: seed.with, listing: seed.listing });
        setMessages(seed.messages.map((m, i) => ({ ...m, id: `seed-${i}` })));
      }
    });
  }, [params]);

  // Subscribe to Supabase Realtime for new messages
  useEffect(() => {
    if (!convId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => [...prev, msg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [convId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);

    // Optimistic UI: add locally
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender_id: 'me',
      body: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    // Persist to Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('messages').insert({
        conversation_id: convId,
        sender_id: user.id,
        body: text,
      });
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/messages" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: '#1a3a2a' }}
        >
          {info.with[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{info.with || '…'}</p>
          <p className="text-xs text-gray-400 truncate">{info.listing}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map(msg => {
          const isMe = msg.sender_id === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'text-white rounded-br-md'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
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
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-3">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all leading-relaxed"
          style={{ maxHeight: 120 }}
        />
        <button
          onClick={sendMessage}
          disabled={!draft.trim() || sending}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40"
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
