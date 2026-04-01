'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';

// Mock conversations for UI demo
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    with: 'Wei Zhang',
    avatar: 'W',
    lastMessage: 'Sure, I can do Saturday at 11am — see you then!',
    time: '2m ago',
    unread: 2,
    listing: 'Matcha Pound Cake',
  },
  {
    id: '2',
    with: 'Lisa Ng',
    avatar: 'L',
    lastMessage: 'The egg tarts will be ready by 10am.',
    time: '1h ago',
    unread: 0,
    listing: 'Hong Kong Egg Tarts',
  },
  {
    id: '3',
    with: 'Rachel Chen',
    avatar: 'R',
    lastMessage: 'Do you have any nut-free options?',
    time: 'Yesterday',
    unread: 0,
    listing: 'Matcha White Chocolate Bark',
  },
  {
    id: '4',
    with: 'Paul Lin',
    avatar: 'P',
    lastMessage: 'Thank you for the tea — my whole family loved it!',
    time: '3d ago',
    unread: 0,
    listing: 'Chrysanthemum & Wolfberry Tea',
  },
];

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-5" style={{ color: '#1a3a2a' }}>Messages</h1>

        {MOCK_CONVERSATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-5xl">💬</div>
            <p className="font-semibold text-gray-700">No messages yet</p>
            <p className="text-sm text-gray-400">When you request or receive an exchange, your conversation will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {MOCK_CONVERSATIONS.map(conv => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                  style={{ backgroundColor: '#1a3a2a' }}
                >
                  {conv.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">{conv.with}</p>
                    <span className="text-xs text-gray-400 shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-0.5">{conv.listing}</p>
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: '#1a3a2a' }}
                  >
                    {conv.unread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
