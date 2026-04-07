'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

function useDraggable(initialBottom: number, initialRight: number) {
  const [pos, setPos] = useState({ bottom: initialBottom, right: initialRight });
  const didDrag = useRef(false);
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const onButtonPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startBottom = posRef.current.bottom;
    const startRight  = posRef.current.right;
    didDrag.current = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
      setPos({
        bottom: Math.max(8, Math.min(window.innerHeight - 64, startBottom - dy)),
        right:  Math.max(8, Math.min(window.innerWidth  - 64, startRight  - dx)),
      });
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  }, []);

  const onHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startBottom = posRef.current.bottom;
    const startRight  = posRef.current.right;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setPos({
        bottom: Math.max(8, Math.min(window.innerHeight - 64, startBottom - dy)),
        right:  Math.max(8, Math.min(window.innerWidth  - 64, startRight  - dx)),
      });
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  }, []);

  return { pos, onButtonPointerDown, onHeaderPointerDown, didDrag };
}

function useResizable(initialWidth: number, initialHeight: number) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const sizeRef = useRef(size);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const onResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = sizeRef.current.width;
    const startH = sizeRef.current.height;

    const onMove = (ev: PointerEvent) => {
      const newW = Math.max(280, Math.min(window.innerWidth  - 32, startW - (ev.clientX - startX)));
      const newH = Math.max(320, Math.min(window.innerHeight - 120, startH - (ev.clientY - startY)));
      setSize({ width: newW, height: newH });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  }, []);

  return { size, onResizePointerDown };
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ''));
        i++;
      }
      i--;
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
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

type ListingCard = {
  id: string;
  title: string;
  emoji: string | null;
  cuisine_tag: string | null;
  price_cents: number;
  quantity_left: number;
  cook_name: string | null;
  city: string | null;
  rating_avg: number | null;
  top_cook_badge: boolean;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  listings?: ListingCard[];
};

const STARTERS = [
  '🥕 I have carrots and ginger — what can I find?',
  '🍳 Recommend me something with eggs and cheese',
  'What can I sell under CA cottage food law?',
  'What allergens must I disclose?',
];

function ListingCardRow({ listing }: { listing: ListingCard }) {
  const price = listing.price_cents === 0 ? 'Free' : `$${(listing.price_cents / 100).toFixed(2)}`;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-2 bg-white border border-amber-100 rounded-xl px-3 py-2 hover:border-amber-300 hover:shadow-sm transition-all group"
    >
      <span className="text-xl shrink-0">{listing.emoji ?? '🍽️'}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-amber-700">
          {listing.title}
          {listing.top_cook_badge && <span className="ml-1 text-[10px] text-amber-500">⭐</span>}
        </p>
        <p className="text-[10px] text-gray-400 truncate">
          {listing.cook_name ?? 'Local cook'}{listing.city ? ` · ${listing.city}` : ''}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-green-700">{price}</p>
        <p className="text-[10px] text-gray-400">{listing.quantity_left} left</p>
      </div>
    </Link>
  );
}

export default function AIChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(13); // px, range 11–18
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const { pos, onButtonPointerDown, onHeaderPointerDown, didDrag } = useDraggable(80, 16);
  const { size, onResizePointerDown } = useResizable(384, 480);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
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
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json() as { text: string; listings?: ListingCard[] };
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.text, listings: data.listings },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
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
        onPointerDown={onButtonPointerDown}
        onClick={() => { if (!didDrag.current) setOpen(v => !v); }}
        className="fixed z-50 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95 touch-none select-none"
        style={{ backgroundColor: '#1a3a2a', bottom: pos.bottom, right: pos.right, cursor: 'grab' }}
        aria-label="AI Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : '✨'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ width: size.width, height: size.height, bottom: pos.bottom + 64, right: pos.right }}
        >
          {/* Resize handle — top-left corner */}
          <div
            onPointerDown={onResizePointerDown}
            className="absolute top-0 left-0 w-5 h-5 z-10 rounded-tl-2xl"
            style={{ cursor: 'nw-resize', touchAction: 'none' }}
            title="拖动调整大小"
          />

          {/* Header — draggable */}
          <div
            onPointerDown={onHeaderPointerDown}
            className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100 touch-none select-none"
            style={{ backgroundColor: '#1a3a2a', cursor: 'grab' }}
          >
            <span className="text-lg">✨</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">HomeBites Assistant</p>
              <p className="text-[10px] text-green-300">Find food · Get recommendations</p>
            </div>

            {/* Font size controls */}
            <div className="flex items-center gap-1 shrink-0" onPointerDown={e => e.stopPropagation()}>
              <button
                onClick={() => setFontSize(s => Math.max(11, s - 1))}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
                title="缩小字体"
              >A−</button>
              <span className="text-[10px] text-green-300 w-6 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(18, s + 1))}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
                title="放大字体"
              >A+</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ fontSize }}>
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-gray-400 text-center pt-2" style={{ fontSize: fontSize - 1 }}>
                  Tell me what ingredients you have and I&apos;ll find food for you ✨
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {STARTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                      style={{ fontSize: fontSize - 1 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: '#1a3a2a' } : {}}
                >
                  {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                </div>

                {m.role === 'assistant' && m.listings && m.listings.length > 0 && (
                  <div className="w-full mt-2 space-y-1.5">
                    <p className="text-gray-400 pl-1" style={{ fontSize: fontSize - 2 }}>Available now on HomeBites:</p>
                    {m.listings.map(listing => (
                      <ListingCardRow key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
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
              placeholder="I have eggs and cheese… find me something!"
              rows={1}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
              style={{ maxHeight: 72, fontSize }}
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
