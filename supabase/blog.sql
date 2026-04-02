-- ============================================================
-- Blog Feature — run in Supabase SQL Editor after schema.sql
-- ============================================================

-- ============================================================
-- TABLE: blog_posts
-- ============================================================
create table if not exists public.blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,

  title            text not null,
  slug             text unique not null,          -- URL-safe identifier
  excerpt          text,                          -- max 200 chars summary
  content          text not null default '',      -- markdown / plain text body
  cover_image_url  text,

  category         text not null default 'food_story'
                   check (category in (
                     'health_nutrition',
                     'food_tutorial',
                     'ingredient_intro',
                     'food_story'
                   )),
  tags             text[] default '{}',

  status           text not null default 'draft'
                   check (status in ('draft', 'published')),

  view_count       int not null default 0,
  like_count       int not null default 0,       -- denormalized, updated by trigger

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists blog_posts_user_id_idx    on public.blog_posts(user_id);
create index if not exists blog_posts_status_idx     on public.blog_posts(status);
create index if not exists blog_posts_category_idx   on public.blog_posts(category);
create index if not exists blog_posts_slug_idx       on public.blog_posts(slug);
create index if not exists blog_posts_like_count_idx on public.blog_posts(like_count desc);
-- GIN index for tag array contains queries
create index if not exists blog_posts_tags_gin_idx   on public.blog_posts using gin(tags);

create trigger touch_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.touch_updated_at();


-- ============================================================
-- TABLE: blog_likes  (one row per user per post)
-- ============================================================
create table if not exists public.blog_likes (
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (post_id, user_id)
);

-- Keep blog_posts.like_count in sync
create or replace function public.update_blog_like_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.blog_posts set like_count = like_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.blog_posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_blog_like_change on public.blog_likes;
create trigger on_blog_like_change
  after insert or delete on public.blog_likes
  for each row execute procedure public.update_blog_like_count();


-- ============================================================
-- TABLE: blog_comments
-- ============================================================
create table if not exists public.blog_comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

create index if not exists blog_comments_post_idx on public.blog_comments(post_id, created_at);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.blog_posts    enable row level security;
alter table public.blog_likes    enable row level security;
alter table public.blog_comments enable row level security;

-- BLOG POSTS
create policy "Published posts are public"
  on public.blog_posts for select
  using (status = 'published' or auth.uid() = user_id);

create policy "Authenticated users can create posts"
  on public.blog_posts for insert
  with check (auth.uid() = user_id);

create policy "Authors can update own posts"
  on public.blog_posts for update
  using (auth.uid() = user_id);

create policy "Authors can delete own posts"
  on public.blog_posts for delete
  using (auth.uid() = user_id);

-- BLOG LIKES
create policy "Likes are public"
  on public.blog_likes for select using (true);

create policy "Authenticated users can like"
  on public.blog_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on public.blog_likes for delete
  using (auth.uid() = user_id);

-- BLOG COMMENTS
create policy "Comments on published posts are public"
  on public.blog_comments for select
  using (
    exists (
      select 1 from public.blog_posts
      where id = blog_comments.post_id and status = 'published'
    )
    or auth.uid() = user_id
  );

create policy "Authenticated users can comment"
  on public.blog_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.blog_comments for delete
  using (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKET for blog cover images
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true);
