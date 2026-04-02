-- Migration: profile avatar & cover image support
-- Run this in Supabase SQL Editor

-- 1. Add cover_url column to users
alter table public.users
  add column if not exists cover_url text;

-- 2. Create storage buckets (run in Supabase dashboard Storage tab or via SQL)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
  on conflict (id) do nothing;

-- 3. RLS policies: users can upload/update their own avatar & cover
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can upload their own cover"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'covers' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own cover"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'covers' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public can view covers"
  on storage.objects for select
  to public
  using (bucket_id = 'covers');
