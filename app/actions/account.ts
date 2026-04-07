'use server';

import { createClient } from '../lib/supabaseServer';

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const newEmail = (formData.get('email') as string)?.trim();
  if (!newEmail) return { error: 'Email is required' };
  if (newEmail === user.email) return { error: 'This is already your current email' };

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: error.message };

  return { error: null, message: 'Confirmation email sent — check your new inbox to complete the change.' };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const currentPassword = (formData.get('current_password') as string) ?? '';
  const newPassword = (formData.get('new_password') as string) ?? '';
  const confirmPassword = (formData.get('confirm_password') as string) ?? '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }
  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' };
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (signInError) return { error: 'Current password is incorrect' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { error: null, message: 'Password updated successfully.' };
}
