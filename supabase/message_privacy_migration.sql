-- ============================================================
-- Message Privacy Migration
-- Adds message_privacy preference to users table.
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS message_privacy text NOT NULL DEFAULT 'everyone'
  CHECK (message_privacy IN ('everyone', 'followers', 'following', 'friends'));

COMMENT ON COLUMN public.users.message_privacy IS
  'Controls who can initiate a conversation: everyone | followers | following | friends';
