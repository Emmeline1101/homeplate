-- ============================================================
-- Direct Message Migration
-- Allows conversations not tied to a specific listing
-- (e.g. initiated from a user profile page).
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Partial unique index: one direct conversation per buyer↔seller pair
-- (only applies when listing_id IS NULL)
create unique index if not exists conversations_direct_unique
  on public.conversations (buyer_id, seller_id)
  where listing_id is null;
