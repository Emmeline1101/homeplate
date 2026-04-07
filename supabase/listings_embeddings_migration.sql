-- ============================================================
-- MIGRATION: Add vector embeddings to listings for AI chat search
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Ensure pgvector extension is enabled (safe to re-run)
create extension if not exists vector;

-- Add embedding column to listings table
alter table public.listings
  add column if not exists embedding vector(1024);

-- IVFFlat index for fast cosine similarity search on listings
create index if not exists listings_embedding_idx
  on public.listings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

-- Drop existing function first to allow return type change
drop function if exists search_listings(vector, float, int);

-- Semantic search function called by /api/chat
create or replace function search_listings(
  query_embedding vector(1024),
  match_threshold float default 0.1,
  match_count     int   default 8
)
returns table (
  id         uuid,
  similarity float
)
language sql stable as $$
  select
    id,
    1 - (embedding <=> query_embedding) as similarity
  from public.listings
  where embedding is not null
    and status = 'active'
    and quantity_left > 0
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
