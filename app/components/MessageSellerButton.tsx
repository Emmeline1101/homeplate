'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase';

type MessagePrivacy = 'everyone' | 'followers' | 'following' | 'friends';

const BLOCKED_MSGS: Record<Exclude<MessagePrivacy, 'everyone'>, string> = {
  followers: 'This cook only accepts messages from their followers. Follow them first!',
  following: 'This cook only accepts messages from people they follow.',
  friends:   'This cook only accepts messages from mutual followers (friends).',
};

export default function MessageSellerButton({
  cookName,
  listingId,
  sellerId,
  compact = false,
}: {
  cookName: string;
  listingId?: string;
  sellerId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setBlockedMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (user.id === sellerId) {
      setLoading(false);
      return;
    }

    // Fetch seller's message privacy setting
    const { data: seller } = await supabase
      .from('users')
      .select('message_privacy')
      .eq('id', sellerId)
      .single();

    const privacy: MessagePrivacy = seller?.message_privacy ?? 'everyone';

    if (privacy !== 'everyone') {
      const buyerId = user.id;

      // Fetch follow relationships in parallel
      const [{ data: buyerFollowsSeller }, { data: sellerFollowsBuyer }] = await Promise.all([
        supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', buyerId)
          .eq('following_id', sellerId)
          .maybeSingle(),
        supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', sellerId)
          .eq('following_id', buyerId)
          .maybeSingle(),
      ]);

      const allowed =
        privacy === 'followers' ? !!buyerFollowsSeller :
        privacy === 'following' ? !!sellerFollowsBuyer :
        /* friends */              !!buyerFollowsSeller && !!sellerFollowsBuyer;

      if (!allowed) {
        setBlockedMsg(BLOCKED_MSGS[privacy]);
        setLoading(false);
        return;
      }
    }

    // Find or create conversation
    let conv: { id: string } | null = null;

    if (listingId) {
      // Listing-scoped: upsert on (listing_id, buyer_id)
      const { data, error } = await supabase
        .from('conversations')
        .upsert(
          { listing_id: listingId, buyer_id: user.id, seller_id: sellerId },
          { onConflict: 'listing_id,buyer_id' },
        )
        .select('id')
        .single();
      if (error || !data) {
        console.error('[MessageSellerButton] upsert error:', error);
        setLoading(false);
        return;
      }
      conv = data;
    } else {
      // Direct (profile-based): select existing, then insert if absent
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .is('listing_id', null)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (existing) {
        conv = existing;
      } else {
        const { data: created, error } = await supabase
          .from('conversations')
          .insert({ listing_id: null, buyer_id: user.id, seller_id: sellerId })
          .select('id')
          .single();
        if (error || !created) {
          console.error('[MessageSellerButton] insert error:', error);
          setLoading(false);
          return;
        }
        conv = created;
      }
    }

    if (!conv) {
      setLoading(false);
      return;
    }

    router.push(`/messages/${conv.id}`);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={compact
          ? "rounded-full px-3.5 py-1.5 text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-60"
          : "w-full rounded-2xl py-3.5 text-base font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {loading ? 'Opening chat…' : `Message ${cookName.split(' ')[0]}`}
      </button>

      {blockedMsg && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
          🔒 {blockedMsg}
        </p>
      )}
    </div>
  );
}
