-- ============================================================
-- TABLE: listing_views
-- Tracks which listings each user has viewed.
-- Used to power personalized recommendations.
-- ============================================================

create table if not exists public.listing_views (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  source      text default 'feed',  -- 'feed' | 'map' | 'search' | 'recommendation'
  viewed_at   timestamptz default now()
);

-- Fast lookup: recent views per user
create index if not exists listing_views_user_idx
  on public.listing_views (user_id, viewed_at desc);

-- Fast lookup: view count per listing
create index if not exists listing_views_listing_idx
  on public.listing_views (listing_id);

alter table public.listing_views enable row level security;

create policy "Users can record own views"
  on public.listing_views for insert
  with check (auth.uid() = user_id);

create policy "Users can read own views"
  on public.listing_views for select
  using (auth.uid() = user_id);
