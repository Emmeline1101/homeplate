'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    with: 'Wei Zhang',
    avatar: 'W',
    avatarColors: ['#d97706', '#92400e'] as [string, string],
    lastMessage: 'Sure, I can do Saturday at 11am — see you then!',
    time: '2m ago',
    unread: 2,
    listing: 'Matcha Pound Cake',
    listingEmoji: '🍰',
  },
  {
    id: '2',
    with: 'Lisa Ng',
    avatar: 'L',
    avatarColors: ['#f472b6', '#db2777'] as [string, string],
    lastMessage: 'The egg tarts will be ready by 10am.',
    time: '1h ago',
    unread: 0,
    listing: 'Hong Kong Egg Tarts',
    listingEmoji: '🥚',
  },
  {
    id: '3',
    with: 'Rachel Chen',
    avatar: 'R',
    avatarColors: ['#c084fc', '#7c3aed'] as [string, string],
    lastMessage: 'Do you have any nut-free options?',
    time: 'Yesterday',
    unread: 0,
    listing: 'Matcha White Chocolate Bark',
    listingEmoji: '🍫',
  },
  {
    id: '4',
    with: 'Paul Lin',
    avatar: 'P',
    avatarColors: ['#6ee7b7', '#059669'] as [string, string],
    lastMessage: 'Thank you for the tea — my whole family loved it!',
    time: '3d ago',
    unread: 0,
    listing: 'Chrysanthemum & Wolfberry Tea',
    listingEmoji: '🌸',
  },
];

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>Messages</h1>
          {MOCK_CONVERSATIONS.some(c => c.unread > 0) && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#1a3a2a' }}>
              {MOCK_CONVERSATIONS.reduce((n, c) => n + c.unread, 0)} unread
            </span>
          )}
        </div>

        {MOCK_CONVERSATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-3xl border border-black/[0.05] shadow-sm">
            <div className="text-5xl">💬</div>
            <p className="font-bold text-gray-700">No messages yet</p>
            <p className="text-sm text-gray-400 max-w-xs">When you request or receive an exchange, your conversation will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden divide-y divide-gray-50">
            {MOCK_CONVERSATIONS.map(conv => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3.5 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${conv.avatarColors[0]}, ${conv.avatarColors[1]})` }}
                  >
                    {conv.avatar}
                  </div>
                  {/* Listing emoji badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] shadow-sm border border-gray-100">
                    {conv.listingEmoji}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {conv.with}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.listing}</p>
                  <p className={`text-sm truncate mt-0.5 ${conv.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread dot */}
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
