-- ============================================================
-- Conversations Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. conversations table ───────────────────────────────────
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid references public.listings(id) on delete set null,
  buyer_id    uuid not null,
  seller_id   uuid not null,
  created_at  timestamptz default now(),

  -- One conversation per buyer per listing
  unique (listing_id, buyer_id),

  -- Named constraints required by PostgREST for disambiguating joined queries
  constraint conversations_buyer_id_fkey
    foreign key (buyer_id) references public.users(id) on delete cascade,
  constraint conversations_seller_id_fkey
    foreign key (seller_id) references public.users(id) on delete cascade
);

create index if not exists conversations_buyer_idx  on public.conversations(buyer_id);
create index if not exists conversations_seller_idx on public.conversations(seller_id);

-- ── 2. Add FK from messages → conversations ──────────────────
-- Only if no existing exchange-based rows; if you have old data skip this.
alter table public.messages
  drop constraint if exists messages_conversation_id_fkey;

alter table public.messages
  add constraint messages_conversation_id_fkey
  foreign key (conversation_id) references public.conversations(id) on delete cascade;

-- ── 3. RLS on conversations ──────────────────────────────────
alter table public.conversations enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

-- ── 4. Update messages RLS to use conversations ──────────────
drop policy if exists "Conversation participants can read messages"  on public.messages;
drop policy if exists "Conversation participants can send messages" on public.messages;
drop policy if exists "Participants can update is_read"            on public.messages;

create policy "Conversation participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Conversation participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can mark messages as read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ── 5. Enable Realtime ───────────────────────────────────────
-- In Supabase Dashboard → Database → Replication, enable these tables.
-- Or run:
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
