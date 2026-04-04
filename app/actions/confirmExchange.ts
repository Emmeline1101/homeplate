'use server';

import { createClient } from '../lib/supabaseServer';

export async function confirmExchange(
  items: Array<{ listingId: string; quantity: number }>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  for (const { listingId, quantity } of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('decrement_quantity', {
      p_listing_id: listingId,
      p_amount: quantity,
    });

    if (error) {
      // Fallback: manual decrement if RPC doesn't exist
      const { data: listing } = await supabase
        .from('listings')
        .select('quantity_left')
        .eq('id', listingId)
        .single();

      if (listing) {
        const newQty = Math.max(0, listing.quantity_left - quantity);
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            quantity_left: newQty,
            ...(newQty === 0 ? { status: 'sold_out' } : {}),
          })
          .eq('id', listingId);

        if (updateError) return { error: updateError.message };
      }
    }
  }

  return { error: null };
}
