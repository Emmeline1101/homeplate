'use client';

import { useState, useRef, useEffect } from 'react';

function renderMarkdown(text: string) {
  // Split into lines to handle block-level elements
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      // skip blank lines between blocks
      continue;
    }

    // Bullet list item
    if (/^[-*•]\s+/.test(line)) {
      // collect consecutive list items
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ''));
        i++;
      }
      i--; // back up one since the for loop will increment
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    } else {
      elements.push(<p key={key++} className="my-0.5">{inlineMarkdown(line)}</p>);
    }
  }
  return elements;
}

function inlineMarkdown(text: string): React.ReactNode[] {
  // Handle **bold** inline
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'What can I sell under CA cottage food law?',
  'Help me describe my matcha pound cake',
  'Is kimchi allowed as cottage food?',
  'What allergens must I disclose?',
];

export default function AIChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const { text: reply } = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center text-2xl transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#1a3a2a' }}
        aria-label="AI Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          '✨'
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: 420 }}>

          {/* Header */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#1a3a2a' }}>
            <span className="text-lg">✨</span>
            <div>
              <p className="text-sm font-bold text-white">HomeBites Assistant</p>
              <p className="text-[10px] text-green-300">Cottage food expert</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center pt-2">
                  Ask me about cottage food law, recipes, or descriptions ✨
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {STARTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: '#1a3a2a' } : {}}
                >
                  {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 px-3 py-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={1}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
              style={{ maxHeight: 72 }}
            />
            <button
              onClick={() => send(draft)}
              disabled={!draft.trim() || loading}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              <svg className="w-3.5 h-3.5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
