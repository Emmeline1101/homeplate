'use server';

import { createClient } from '../lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Record<string, string | null> = {};

  // Text fields
  const name = formData.get('name');
  const bio = formData.get('bio');
  const city = formData.get('city');
  const state = formData.get('state');
  if (typeof name === 'string') updates.name = name.trim() || null;
  if (typeof bio === 'string') updates.bio = bio.trim() || null;
  if (typeof city === 'string') updates.city = city.trim() || null;
  if (typeof state === 'string') updates.state = state.trim() || null;

  // Avatar upload
  const avatarFile = formData.get('avatar') as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
    if (uploadErr) return { error: uploadErr.message };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    // Bust cache with timestamp
    updates.avatar_url = `${publicUrl}?t=${Date.now()}`;
  }

  // Cover upload
  const coverFile = formData.get('cover') as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/cover.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('covers')
      .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
    if (uploadErr) return { error: uploadErr.message };
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path);
    updates.cover_url = `${publicUrl}?t=${Date.now()}`;
  }

  if (Object.keys(updates).length === 0) return { error: null };

  const { error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/profile/${user.id}`);
  revalidatePath('/profile/me');
  return { error: null };
}
