-- ============================================================
-- HomePlate Seed Data
-- Run in Supabase Dashboard → SQL Editor AFTER schema.sql
-- ============================================================
--
-- IMPORTANT: This seed creates fake users directly in auth.users.
-- These are demo accounts only — passwords are empty/unusable.
-- For real testing, sign up via the app and use YOUR real user ID.
-- ============================================================

-- ── Step 1: Create auth users (triggers public.users via handle_new_user) ──

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_user_meta_data,
  is_sso_user, deleted_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated', 'authenticated',
    'wei@homeplate.demo', '',
    now(), now(), now(),
    '{"full_name": "Wei Zhang"}'::jsonb,
    false, null
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'authenticated', 'authenticated',
    'lily@homeplate.demo', '',
    now(), now(), now(),
    '{"full_name": "Lily Chen"}'::jsonb,
    false, null
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'authenticated', 'authenticated',
    'grace@homeplate.demo', '',
    now(), now(), now(),
    '{"full_name": "Grace Wu"}'::jsonb,
    false, null
  )
on conflict (id) do nothing;


-- ── Step 2: Fill in extra profile fields ──

update public.users set
  city = 'San Francisco', state = 'CA', zip = '94110',
  lat = 37.7589, lng = -122.4148,
  bio = 'Home baker specializing in Asian-inspired treats. Matcha everything!',
  rating_avg = 4.9, review_count = 43,
  top_cook_badge = true,
  permit_status = 'verified'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.users set
  city = 'Los Angeles', state = 'CA', zip = '90026',
  lat = 34.0635, lng = -118.2695,
  bio = 'Filipino-American baker. I grew up eating ube everything and now I make it for you.',
  rating_avg = 4.8, review_count = 31,
  top_cook_badge = true,
  permit_status = 'verified'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.users set
  city = 'San Jose', state = 'CA', zip = '95112',
  lat = 37.3490, lng = -121.8946,
  bio = 'Taiwanese grandma recipes, made fresh weekly. Less sugar, more love.',
  rating_avg = 4.7, review_count = 58,
  top_cook_badge = true,
  permit_status = 'pending'
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';


-- ── Step 3: Insert listings ──

insert into public.listings (
  id, user_id, title, description, cuisine_tag, emoji,
  allergens, quantity_total, quantity_left, price_cents,
  made_at, pickup_start, pickup_end,
  lat, lng, city, state, status
) values

-- Wei's listings
(
  '11111111-0001-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Matcha Pound Cake',
  'Dense, lightly sweet pound cake made with ceremonial-grade matcha from Kyoto. Less sugar than typical American cakes — the bitter green tea flavor shines through. Wrapped individually, shelf-stable for 5 days.',
  'Baked Goods', '🍰',
  array['gluten', 'eggs', 'dairy'], 6, 4, 1200,
  now() - interval '2 hours',
  now() + interval '1 day', now() + interval '1 day 3 hours',
  37.7589, -122.4148, 'San Francisco', 'CA', 'active'
),
(
  '11111111-0002-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Hojicha Shortbread Cookies',
  'Buttery, crumbly shortbread infused with roasted hojicha tea. Earthy, slightly smoky flavor profile. Pack of 8 individually wrapped cookies.',
  'Cookies & Biscuits', '🍪',
  array['gluten', 'dairy'], 10, 7, 800,
  now() - interval '1 hour',
  now() + interval '2 days', now() + interval '2 days 4 hours',
  37.7589, -122.4148, 'San Francisco', 'CA', 'active'
),
(
  '11111111-0003-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Strawberry Yuzu Jam',
  'Small-batch jam made with California strawberries and fresh yuzu zest. Low sugar, high fruit content. 200ml jar. Refrigerate after opening.',
  'Jams & Preserves', '🫙',
  array['none'], 8, 8, 900,
  now() - interval '3 hours',
  now() + interval '3 days', now() + interval '3 days 2 hours',
  37.7589, -122.4148, 'San Francisco', 'CA', 'active'
),

-- Lily's listings
(
  '22222222-0001-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Ube Brioche Loaf',
  'Pillowy Filipino-inspired brioche tinted purple with real ube halaya. Mildly sweet with a buttery crumb and subtle vanilla-coconut aroma. Each loaf ~450g.',
  'Baked Goods', '🍞',
  array['gluten', 'eggs', 'dairy'], 4, 2, 1500,
  now() - interval '4 hours',
  now() + interval '1 day', now() + interval '1 day 2 hours',
  34.0635, -118.2695, 'Los Angeles', 'CA', 'active'
),
(
  '22222222-0002-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Mango Coconut Mochi',
  'Soft, chewy mochi filled with fresh Ataulfo mango and toasted coconut cream. 4 pieces per pack. Best enjoyed same day or refrigerate up to 2 days.',
  'Asian Sweets', '🍡',
  array['none'], 5, 5, 1000,
  now() - interval '2 hours',
  now() + interval '1 day', now() + interval '1 day 3 hours',
  34.0635, -118.2695, 'Los Angeles', 'CA', 'active'
),

-- Grace's listings
(
  '33333333-0001-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Pineapple Cakes (凤梨酥)',
  'Traditional Taiwanese pineapple shortcakes with buttery pastry and tangy pineapple-winter-melon jam filling. Box of 6, individually wrapped.',
  'Baked Goods', '🧁',
  array['gluten', 'eggs', 'dairy'], 8, 6, 1000,
  now() - interval '5 hours',
  now() + interval '2 days', now() + interval '2 days 3 hours',
  37.3490, -121.8946, 'San Jose', 'CA', 'active'
),
(
  '33333333-0002-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Kimchi (Classic Napa)',
  'Traditional napa cabbage kimchi fermented for 5 days. Crunchy, balanced heat. 500ml jar. Vegan (no fish sauce). Ready to eat or use in cooking.',
  'Fermented', '🥬',
  array['none'], 6, 6, 0,
  now() - interval '6 hours',
  now() + interval '2 days', now() + interval '2 days 2 hours',
  37.3490, -121.8946, 'San Jose', 'CA', 'active'
),
(
  '33333333-0003-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Sesame Peanut Noodle Sauce',
  'Ready-to-use sauce for cold noodles or dipping. Toasted sesame paste, peanut butter, soy, ginger, garlic. 300ml jar. Makes 4–6 servings.',
  'Noodles & Pantry', '🍜',
  array['peanuts', 'sesame', 'soy'], 10, 9, 700,
  now() - interval '1 hour',
  now() + interval '4 days', now() + interval '4 days 3 hours',
  37.3490, -121.8946, 'San Jose', 'CA', 'active'
);


-- ── Step 4: Insert recipes ──

insert into public.recipes (
  id, listing_id, user_id, title,
  ingredients, steps, cook_time_mins, servings, is_public
) values
(
  'eeeeeeee-0001-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Matcha Pound Cake',
  '[
    {"name": "all-purpose flour",          "amount": "200",  "unit": "g"},
    {"name": "ceremonial-grade matcha",    "amount": "15",   "unit": "g"},
    {"name": "unsalted butter (softened)", "amount": "200",  "unit": "g"},
    {"name": "sugar",                      "amount": "150",  "unit": "g"},
    {"name": "eggs (room temp)",           "amount": "3",    "unit": "large"},
    {"name": "baking powder",             "amount": "1",    "unit": "tsp"},
    {"name": "salt",                       "amount": "0.5",  "unit": "tsp"},
    {"name": "whole milk",                 "amount": "60",   "unit": "ml"}
  ]'::jsonb,
  '[
    {"step_number": 1, "instruction": "Preheat oven to 170°C (340°F). Grease and flour a 9×5 loaf pan."},
    {"step_number": 2, "instruction": "Sift together flour, matcha, baking powder, and salt. Set aside."},
    {"step_number": 3, "instruction": "Beat butter and sugar on medium-high speed until pale and fluffy, about 5 minutes."},
    {"step_number": 4, "instruction": "Add eggs one at a time, beating well after each addition."},
    {"step_number": 5, "instruction": "Fold in the flour mixture in 3 additions, alternating with milk. Start and end with flour."},
    {"step_number": 6, "instruction": "Pour batter into prepared pan. Smooth the top and tap on counter to release bubbles."},
    {"step_number": 7, "instruction": "Bake 50–55 minutes until a toothpick inserted in the center comes out clean."},
    {"step_number": 8, "instruction": "Cool in pan 10 minutes, then turn out onto a rack. Cool completely before slicing."}
  ]'::jsonb,
  60, 8, true
),
(
  'eeeeeeee-0002-0000-0000-000000000000', '22222222-0002-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Mango Coconut Mochi',
  '[
    {"name": "glutinous rice flour (mochiko)", "amount": "200", "unit": "g"},
    {"name": "sugar",                           "amount": "80",  "unit": "g"},
    {"name": "coconut milk",                    "amount": "240", "unit": "ml"},
    {"name": "fresh Ataulfo mango",             "amount": "2",   "unit": "medium"},
    {"name": "toasted shredded coconut",        "amount": "60",  "unit": "g"},
    {"name": "heavy cream",                     "amount": "120", "unit": "ml"},
    {"name": "powdered sugar (for dusting)",    "amount": "30",  "unit": "g"}
  ]'::jsonb,
  '[
    {"step_number": 1, "instruction": "Whip heavy cream with 1 tbsp powdered sugar to stiff peaks. Fold in toasted coconut. Chill filling."},
    {"step_number": 2, "instruction": "Dice mango into 1cm cubes. Keep refrigerated."},
    {"step_number": 3, "instruction": "Mix glutinous rice flour, sugar, and coconut milk until smooth. Cover with plastic wrap."},
    {"step_number": 4, "instruction": "Microwave mixture 2 minutes, stir, then 1 more minute. The dough should be translucent and thick."},
    {"step_number": 5, "instruction": "Dust a clean surface with cornstarch. Turn out dough and divide into 8 equal portions."},
    {"step_number": 6, "instruction": "Flatten each portion into a 10cm circle. Place a spoonful of coconut cream and 3–4 mango cubes in center."},
    {"step_number": 7, "instruction": "Pinch edges together to seal, then roll gently into a ball. Dust with remaining powdered sugar."},
    {"step_number": 8, "instruction": "Refrigerate at least 30 minutes before serving."}
  ]'::jsonb,
  45, 8, true
);


-- ── Step 5: Insert exchanges (needed for reviews) ──

insert into public.exchanges (
  id, listing_id, requester_id, provider_id,
  quantity, pickup_time, status, amount_cents
) values
(
  'ffffffff-0001-0000-0000-000000000000',
  '11111111-0001-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',  -- Lily requested from Wei
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- Wei provided
  2, now() - interval '10 days',
  'reviewed', 2400
),
(
  'ffffffff-0002-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- Grace requested from Lily
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',  -- Lily provided
  1, now() - interval '7 days',
  'reviewed', 1500
),
(
  'ffffffff-0003-0000-0000-000000000000',
  '33333333-0001-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- Wei requested from Grace
  'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- Grace provided
  2, now() - interval '5 days',
  'reviewed', 2000
);


-- ── Step 6: Insert reviews ──
-- Note: rating triggers update users.rating_avg automatically

insert into public.reviews (
  id, exchange_id, reviewer_id, reviewee_id,
  stars_taste, stars_safety, stars_packaging, stars_punctuality, comment
) values
(
  'dddddddd-0001-0000-0000-000000000000',
  'ffffffff-0001-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',  -- Lily reviewing Wei
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  5, 5, 5, 5,
  'Amazing matcha pound cake — way better than anything I''ve found at a café. The bitterness of the matcha was perfectly balanced. Will definitely order again!'
),
(
  'dddddddd-0002-0000-0000-000000000000',
  'ffffffff-0002-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- Grace reviewing Lily
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  5, 5, 4, 5,
  'The ube brioche was pillowy and the ube flavor was real — not artificial. Beautiful purple color. My whole family loved it.'
),
(
  'dddddddd-0003-0000-0000-000000000000',
  'ffffffff-0003-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- Wei reviewing Grace
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  5, 5, 5, 4,
  'Pineapple cakes tasted exactly like what I grew up eating in Taipei. Less sweet than the commercial ones. Grace is the real deal.'
);
