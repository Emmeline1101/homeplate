-- ============================================================
-- Discover (Moments) Seed Data
-- Run AFTER seed.sql and discover.sql
-- ============================================================

insert into public.moments (id, user_id, caption, photo_urls, tags, lat, lng, like_count, comment_count, created_at) values

  -- Wei Zhang moments
  (
    'd0000001-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'First batch of matcha mochi came out perfectly chewy today 🍵 took three tries to get the texture right',
    array['https://picsum.photos/seed/mochi1/600/600', 'https://picsum.photos/seed/mochi2/600/600'],
    array['#matcha', '#mochi', '#homecook'],
    37.7589, -122.4148,
    24, 5,
    now() - interval '2 hours'
  ),
  (
    'd0000001-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Sunday morning prep — sourdough starter is finally active after 7 days! The smell is everything 🥖',
    array['https://picsum.photos/seed/bread1/600/600'],
    array['#sourdough', '#breadbaking'],
    37.7589, -122.4148,
    18, 3,
    now() - interval '1 day'
  ),
  (
    'd0000001-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Testing a new red bean paste recipe for the upcoming holiday season 🧧',
    array['https://picsum.photos/seed/redbean/600/600', 'https://picsum.photos/seed/redbean2/600/600', 'https://picsum.photos/seed/redbean3/600/600'],
    array['#redbean', '#mooncake', '#chinesefood'],
    37.7589, -122.4148,
    41, 9,
    now() - interval '3 days'
  ),

  -- Lily Chen moments
  (
    'd0000002-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Farmers market haul! Got the most beautiful heirloom tomatoes — pasta sauce this weekend 🍅',
    array['https://picsum.photos/seed/tomato1/600/600', 'https://picsum.photos/seed/tomato2/600/600'],
    array['#farmersmarket', '#seasonal', '#pasta'],
    34.0522, -118.2437,
    33, 7,
    now() - interval '5 hours'
  ),
  (
    'd0000002-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'These strawberry jam labels turned out so cute 🍓 hand-stamped every single one',
    array['https://picsum.photos/seed/jam1/600/600'],
    array['#strawberryjam', '#cottage', '#handmade'],
    34.0522, -118.2437,
    56, 12,
    now() - interval '2 days'
  ),
  (
    'd0000002-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Kimchi day! Made 10 jars with my grandma''s recipe. Your fridge will thank you 🥬',
    array['https://picsum.photos/seed/kimchi1/600/600', 'https://picsum.photos/seed/kimchi2/600/600'],
    array['#kimchi', '#fermented', '#koreanfood'],
    34.0522, -118.2437,
    29, 6,
    now() - interval '4 days'
  ),

  -- Grace Wu moments
  (
    'd0000003-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Dim sum at home hits different on a rainy Saturday ☔ har gow from scratch — worth every fold',
    array['https://picsum.photos/seed/dimsum1/600/600', 'https://picsum.photos/seed/dimsum2/600/600'],
    array['#dimsum', '#hargao', '#cantonese'],
    37.3382, -121.8863,
    47, 11,
    now() - interval '30 minutes'
  ),
  (
    'd0000003-0000-0000-0000-000000000002',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Scallion pancake dough is resting. The trick is letting it sit for a full hour before rolling 🧅',
    array['https://picsum.photos/seed/pancake1/600/600'],
    array['#scallionpancake', '#chinesefood', '#tip'],
    37.3382, -121.8863,
    22, 4,
    now() - interval '6 hours'
  ),
  (
    'd0000003-0000-0000-0000-000000000003',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Trying to perfect lion''s head meatballs for my next listing. Round 4 today 🦁',
    array['https://picsum.photos/seed/meatball1/600/600', 'https://picsum.photos/seed/meatball2/600/600'],
    array['#lionshead', '#shanghainese', '#recipe'],
    37.3382, -121.8863,
    38, 8,
    now() - interval '5 days'
  )

on conflict (id) do nothing;


-- ── Seed some likes ──

insert into public.moment_likes (moment_id, user_id, created_at) values
  ('d0000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now()),
  ('d0000001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now()),
  ('d0000002-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
  ('d0000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now()),
  ('d0000003-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
  ('d0000003-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now())
on conflict do nothing;


-- ── Seed some comments ──

insert into public.moment_comments (moment_id, user_id, content, created_at) values
  ('d0000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'These look absolutely perfect!! What brand of matcha do you use?', now() - interval '1 hour'),
  ('d0000001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Saving this, need to try 😍', now() - interval '45 minutes'),
  ('d0000002-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Heirloom tomatoes are the best!! Which farm did you get them from?', now() - interval '4 hours'),
  ('d0000003-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'The folds on these har gow are so clean, please share your technique!', now() - interval '20 minutes')
on conflict do nothing;
