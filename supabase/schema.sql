-- ============================================================
-- HomePlate Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- for geo queries (if available on your plan)


-- ============================================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  name            text,
  avatar_url      text,
  bio             text,
  phone           text,

  -- Location (city-level only, never exact address)
  city            text,
  state           text,
  zip             text,
  lat             double precision,
  lng             double precision,

  -- Cook stats (updated by DB trigger)
  rating_avg      numeric(3,2) default 0,
  review_count    int default 0,
  top_cook_badge  boolean default false,

  -- Payment
  stripe_account_id text,

  -- Permit & Moderation
  permit_status   text default 'none'
                  check (permit_status in ('none','pending','verified')),
  is_suspended    boolean default false,
  requires_admin_approval boolean default false, -- rating < 3.0

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-create user row when someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- TABLE: listings
-- ============================================================
create table if not exists public.listings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  -- Content
  title           text not null,
  description     text,
  cuisine_tag     text,                    -- matches CUISINE_GRADIENTS keys
  emoji           text,                    -- display emoji e.g. '🍰'
  allergens       text[] default '{}',     -- REQUIRED before publishing
  photo_urls      text[] default '{}',
  video_url       text,

  -- Quantity & Pricing
  quantity_total  int not null default 1,
  quantity_left   int not null default 1,
  price_cents     int not null default 0,  -- 0 = free

  -- Timing
  made_at         timestamptz,
  expires_at      timestamptz,             -- auto-set: made_at + 48h
  pickup_start    timestamptz,
  pickup_end      timestamptz,

  -- Location (city-level)
  lat             double precision,
  lng             double precision,
  city            text,
  state           text,

  -- Status & Moderation
  status          text not null default 'draft'
                  check (status in ('draft','active','hidden','expired','sold_out')),
  report_count    int default 0,
  is_flagged      boolean default false,   -- true when report_count >= 3

  -- Linked recipe
  recipe_id       uuid,                    -- FK added after recipes table

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-set expires_at = made_at + 48 hours
create or replace function public.set_listing_expiry()
returns trigger language plpgsql as $$
begin
  if new.made_at is not null and new.expires_at is null then
    new.expires_at := new.made_at + interval '48 hours';
  end if;
  return new;
end;
$$;

drop trigger if exists set_listing_expiry_trigger on public.listings;
create trigger set_listing_expiry_trigger
  before insert or update on public.listings
  for each row execute procedure public.set_listing_expiry();

-- Auto-expire listings
create or replace function public.expire_old_listings()
returns void language plpgsql as $$
begin
  update public.listings
  set status = 'expired'
  where status = 'active'
    and expires_at < now();
end;
$$;


-- ============================================================
-- TABLE: recipes
-- ============================================================
create table if not exists public.recipes (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references public.listings(id) on delete set null,
  user_id         uuid not null references public.users(id) on delete cascade,

  title           text,
  ingredients     jsonb not null default '[]',   -- [{name, amount, unit}]
  steps           jsonb not null default '[]',   -- [{step_number, instruction}]
  cook_time_mins  int,
  servings        int,
  is_public       boolean default true,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Add FK from listings to recipes
alter table public.listings
  add constraint listings_recipe_id_fkey
  foreign key (recipe_id) references public.recipes(id) on delete set null;


-- ============================================================
-- TABLE: exchanges (the transaction between cook & requester)
-- ============================================================
create table if not exists public.exchanges (
  id                uuid primary key default uuid_generate_v4(),
  listing_id        uuid not null references public.listings(id) on delete restrict,
  requester_id      uuid not null references public.users(id) on delete restrict,
  provider_id       uuid not null references public.users(id) on delete restrict,

  quantity          int not null default 1,
  pickup_time       timestamptz,
  message           text,                         -- optional note from requester

  -- Status flow: pending → confirmed → completed → reviewed
  status            text not null default 'pending'
                    check (status in ('pending','confirmed','completed','reviewed','cancelled')),

  -- Payment (only for paid listings)
  payment_intent_id text,
  amount_cents      int default 0,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);


-- ============================================================
-- TABLE: reviews
-- ============================================================
create table if not exists public.reviews (
  id                uuid primary key default uuid_generate_v4(),
  exchange_id       uuid not null references public.exchanges(id) on delete cascade,
  reviewer_id       uuid not null references public.users(id) on delete cascade,
  reviewee_id       uuid not null references public.users(id) on delete cascade,

  -- Multi-dimensional ratings (1-5)
  stars_taste       int check (stars_taste between 1 and 5),
  stars_safety      int check (stars_safety between 1 and 5),
  stars_packaging   int check (stars_packaging between 1 and 5),
  stars_punctuality int check (stars_punctuality between 1 and 5),
  comment           text,

  -- Computed avg for convenience
  stars_avg         numeric(3,2) generated always as (
    (stars_taste + stars_safety + stars_packaging + stars_punctuality)::numeric / 4
  ) stored,

  created_at        timestamptz default now(),

  unique (exchange_id, reviewer_id)  -- one review per person per exchange
);

-- Update user rating_avg and review_count after every review
create or replace function public.update_user_rating()
returns trigger language plpgsql security definer as $$
declare
  v_avg numeric(3,2);
  v_count int;
begin
  select
    round(avg(stars_avg), 2),
    count(*)
  into v_avg, v_count
  from public.reviews
  where reviewee_id = new.reviewee_id;

  update public.users
  set
    rating_avg = coalesce(v_avg, 0),
    review_count = v_count,
    requires_admin_approval = (coalesce(v_avg, 0) < 3.0 and v_count >= 3)
  where id = new.reviewee_id;

  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_user_rating();


-- ============================================================
-- TABLE: reports
-- ============================================================
create table if not exists public.reports (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.users(id) on delete cascade,
  reason      text not null
              check (reason in ('spam','unsafe','inappropriate','mislabeled','other')),
  details     text,
  created_at  timestamptz default now(),

  unique (listing_id, reporter_id)  -- one report per user per listing
);

-- Auto-hide listing after 3 reports
create or replace function public.handle_report()
returns trigger language plpgsql security definer as $$
declare
  v_count int;
begin
  update public.listings
  set report_count = report_count + 1
  where id = new.listing_id
  returning report_count into v_count;

  if v_count >= 3 then
    update public.listings
    set status = 'hidden', is_flagged = true
    where id = new.listing_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_report_created on public.reports;
create trigger on_report_created
  after insert on public.reports
  for each row execute procedure public.handle_report();


-- ============================================================
-- TABLE: messages (for cook↔requester chat)
-- ============================================================
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null,           -- = exchange_id (reuse as convo ID)
  sender_id       uuid not null references public.users(id) on delete cascade,
  body            text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

-- Index for fast conversation fetch
create index if not exists messages_conversation_idx
  on public.messages(conversation_id, created_at);


-- ============================================================
-- TABLE: saved_listings (bookmarks/favorites)
-- ============================================================
create table if not exists public.saved_listings (
  user_id     uuid not null references public.users(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (user_id, listing_id)
);


-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index if not exists listings_user_id_idx    on public.listings(user_id);
create index if not exists listings_status_idx     on public.listings(status);
create index if not exists listings_cuisine_idx    on public.listings(cuisine_tag);
create index if not exists listings_location_idx   on public.listings(lat, lng);
create index if not exists exchanges_requester_idx on public.exchanges(requester_id);
create index if not exists exchanges_provider_idx  on public.exchanges(provider_id);
create index if not exists reviews_reviewee_idx    on public.reviews(reviewee_id);


-- ============================================================
-- UPDATED_AT auto-update triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_users_updated_at
  before update on public.users
  for each row execute procedure public.touch_updated_at();

create trigger touch_listings_updated_at
  before update on public.listings
  for each row execute procedure public.touch_updated_at();

create trigger touch_recipes_updated_at
  before update on public.recipes
  for each row execute procedure public.touch_updated_at();

create trigger touch_exchanges_updated_at
  before update on public.exchanges
  for each row execute procedure public.touch_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.users          enable row level security;
alter table public.listings       enable row level security;
alter table public.recipes        enable row level security;
alter table public.exchanges      enable row level security;
alter table public.reviews        enable row level security;
alter table public.reports        enable row level security;
alter table public.messages       enable row level security;
alter table public.saved_listings enable row level security;

-- USERS
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- LISTINGS
create policy "Active listings are public"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

create policy "Authenticated users can create listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Cook can update own listing"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Cook can delete own listing"
  on public.listings for delete
  using (auth.uid() = user_id);

-- RECIPES
create policy "Public recipes are viewable by everyone"
  on public.recipes for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can manage own recipes"
  on public.recipes for all
  using (auth.uid() = user_id);

-- EXCHANGES
create policy "Users see their own exchanges"
  on public.exchanges for select
  using (auth.uid() = requester_id or auth.uid() = provider_id);

create policy "Authenticated users can create exchanges"
  on public.exchanges for insert
  with check (auth.uid() = requester_id);

create policy "Parties can update exchange status"
  on public.exchanges for update
  using (auth.uid() = requester_id or auth.uid() = provider_id);

-- REVIEWS
create policy "Reviews are public"
  on public.reviews for select using (true);

create policy "Users can write one review per exchange"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- REPORTS
create policy "Users can report listings"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Reporters see own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- MESSAGES
create policy "Conversation participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.exchanges
      where id = messages.conversation_id
        and (requester_id = auth.uid() or provider_id = auth.uid())
    )
  );

create policy "Conversation participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.exchanges
      where id = conversation_id
        and (requester_id = auth.uid() or provider_id = auth.uid())
    )
  );

-- SAVED LISTINGS
create policy "Users manage own saved listings"
  on public.saved_listings for all
  using (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage (or via SQL)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('permit-docs', 'permit-docs', false);
