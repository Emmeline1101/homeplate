'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase';

export default function MessageSellerButton({ cookName, listingId }: { cookName: string; listingId: string }) {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // For now, route to a mock conversation keyed by listingId.
    // In production: upsert a conversation row and navigate to its id.
    router.push(`/messages/${listingId}`);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-2xl py-3.5 text-base font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Message {cookName.split(' ')[0]}
    </button>
  );
}
