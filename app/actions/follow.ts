'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabaseServer'

export async function followUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetId })

  revalidatePath(`/profile/${targetId}`)
  revalidatePath(`/profile/me`)
}

export async function unfollowUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
  revalidatePath(`/profile/${targetId}`)
  revalidatePath(`/profile/me`)
}
