'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../lib/supabaseServer';

export async function clearHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthenticated' };

  await supabase.from('listing_views').delete().eq('user_id', user.id);
  revalidatePath('/history');
  return { ok: true };
}
