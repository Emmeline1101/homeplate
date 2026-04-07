-- ============================================================
-- User Code Migration
-- Adds a unique 6-digit user_code to every user.
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Helper function: generate a unique 6-digit code ───────
create or replace function public.generate_user_code()
returns text language plpgsql as $$
declare
  code text;
begin
  loop
    code := lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.users where user_code = code);
  end loop;
  return code;
end;
$$;

-- ── 2. Add user_code column ──────────────────────────────────
alter table public.users
  add column if not exists user_code text unique;

-- ── 3. Back-fill existing rows that have no code yet ─────────
update public.users
set user_code = public.generate_user_code()
where user_code is null;

-- ── 4. Make column non-nullable with auto-default ────────────
alter table public.users
  alter column user_code set default public.generate_user_code();

alter table public.users
  alter column user_code set not null;

-- ── 5. Index for fast lookup by code ─────────────────────────
create index if not exists users_user_code_idx on public.users(user_code);

-- ── 6. Index for fast name search (ilike queries) ────────────
create index if not exists users_name_lower_idx
  on public.users (lower(name));

-- ── 7. Update handle_new_user trigger to include user_code ───
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, avatar_url, user_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    public.generate_user_code()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── 8. RLS: allow anyone to read user_code + name (for search) ─
-- The users table already has a public SELECT policy in most setups.
-- If not, add one scoped to safe columns only:
drop policy if exists "Public can search users by name or code" on public.users;
create policy "Public can search users by name or code"
  on public.users for select
  using (true);
