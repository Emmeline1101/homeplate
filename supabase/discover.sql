-- ============================================================
-- Discover Feature — run in Supabase SQL Editor after schema.sql
-- Short Instagram-style "moments" with geo-proximity feed
-- ============================================================

-- ============================================================
-- TABLE: moments
-- ============================================================
create table if not exists public.moments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,

  caption       text check (char_length(caption) <= 300),
  photo_urls    text[] not null default '{}',   -- up to 9 photos in Supabase Storage
  tags          text[] not null default '{}',   -- e.g. ['#ramen', '#homecook']

  lat           double precision,               -- geo for nearby feed
  lng           double precision,

  like_count    int not null default 0,
  comment_count int not null default 0,

  created_at    timestamptz not null default now()
);

create index if not exists moments_user_id_idx    on public.moments(user_id);
create index if not exists moments_created_at_idx on public.moments(created_at desc);
create index if not exists moments_like_count_idx on public.moments(like_count desc);
-- GIN index for tag array contains queries
create index if not exists moments_tags_gin_idx   on public.moments using gin(tags);
-- Bounding-box geo index for nearby queries
create index if not exists moments_lat_lng_idx    on public.moments(lat, lng);


-- ============================================================
-- TABLE: moment_likes  (one row per user per moment)
-- ============================================================
create table if not exists public.moment_likes (
  moment_id   uuid not null references public.moments(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (moment_id, user_id)
);

-- Keep moments.like_count in sync
create or replace function public.update_moment_like_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.moments set like_count = like_count + 1 where id = new.moment_id;
  elsif (TG_OP = 'DELETE') then
    update public.moments set like_count = greatest(like_count - 1, 0) where id = old.moment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_moment_like_change on public.moment_likes;
create trigger on_moment_like_change
  after insert or delete on public.moment_likes
  for each row execute procedure public.update_moment_like_count();


-- ============================================================
-- TABLE: moment_comments
-- ============================================================
create table if not exists public.moment_comments (
  id          uuid primary key default uuid_generate_v4(),
  moment_id   uuid not null references public.moments(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists moment_comments_moment_idx on public.moment_comments(moment_id, created_at);

-- Keep moments.comment_count in sync
create or replace function public.update_moment_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.moments set comment_count = comment_count + 1 where id = new.moment_id;
  elsif (TG_OP = 'DELETE') then
    update public.moments set comment_count = greatest(comment_count - 1, 0) where id = old.moment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_moment_comment_change on public.moment_comments;
create trigger on_moment_comment_change
  after insert or delete on public.moment_comments
  for each row execute procedure public.update_moment_comment_count();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.moments          enable row level security;
alter table public.moment_likes     enable row level security;
alter table public.moment_comments  enable row level security;

-- MOMENTS
create policy "Moments are public"
  on public.moments for select using (true);

create policy "Authenticated users can post moments"
  on public.moments for insert
  with check (auth.uid() = user_id);

create policy "Authors can update own moments"
  on public.moments for update
  using (auth.uid() = user_id);

create policy "Authors can delete own moments"
  on public.moments for delete
  using (auth.uid() = user_id);

-- MOMENT LIKES
create policy "Likes are public"
  on public.moment_likes for select using (true);

create policy "Authenticated users can like"
  on public.moment_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on public.moment_likes for delete
  using (auth.uid() = user_id);

-- MOMENT COMMENTS
create policy "Comments are public"
  on public.moment_comments for select using (true);

create policy "Authenticated users can comment"
  on public.moment_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.moment_comments for delete
  using (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKET for moment photos
-- ============================================================
-- Run once to create the bucket (idempotent-safe: ignore if already exists)
-- insert into storage.buckets (id, name, public) values ('moments', 'moments', true)
--   on conflict (id) do nothing;
