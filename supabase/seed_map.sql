-- ============================================================
-- HomePlate Map Listings Seed — Cottage Food Edition
-- Run in Supabase Dashboard → SQL Editor
-- Creates 12 cooks + 12 cottage-food listings matching map pins
-- UUID key:
--   cooks:    00000000-0000-4000-8000-0000000000XX
--   listings: 00000000-0000-4001-8000-0000000000XX
--   recipes:  00000000-0000-4002-8000-0000000000XX
-- ============================================================

-- ── Step 1: Create auth users (triggers public.users insert) ──

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_user_meta_data,
  is_sso_user, deleted_at
) values
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000001','authenticated','authenticated','mei@homeplate.demo','',now(),now(),now(),'{"full_name":"Mei Lin"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000002','authenticated','authenticated','carlos@homeplate.demo','',now(),now(),now(),'{"full_name":"Carlos Reyes"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000003','authenticated','authenticated','sofia@homeplate.demo','',now(),now(),now(),'{"full_name":"Sofia Marchetti"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000004','authenticated','authenticated','kenji@homeplate.demo','',now(),now(),now(),'{"full_name":"Kenji Tanaka"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000005','authenticated','authenticated','priya@homeplate.demo','',now(),now(),now(),'{"full_name":"Priya Sharma"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000006','authenticated','authenticated','jake@homeplate.demo','',now(),now(),now(),'{"full_name":"Jake Williams"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000007','authenticated','authenticated','linh@homeplate.demo','',now(),now(),now(),'{"full_name":"Linh Nguyen"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000008','authenticated','authenticated','nong@homeplate.demo','',now(),now(),now(),'{"full_name":"Nong Panyawong"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000009','authenticated','authenticated','jisu@homeplate.demo','',now(),now(),now(),'{"full_name":"Jisu Kim"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000010','authenticated','authenticated','hana@homeplate.demo','',now(),now(),now(),'{"full_name":"Hana Girma"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000011','authenticated','authenticated','elena@homeplate.demo','',now(),now(),now(),'{"full_name":"Elena Vassilou"}'::jsonb,false,null),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-8000-000000000012','authenticated','authenticated','omar@homeplate.demo','',now(),now(),now(),'{"full_name":"Omar Farhat"}'::jsonb,false,null)
on conflict (id) do nothing;


-- ── Step 2: Fill in cook profiles ──

update public.users set city='San Francisco', state='CA', lat=37.7749, lng=-122.4194, bio='Born in SF to a family of bakers. My sourdough starter is 5 years old and named Dough Vader.', rating_avg=4.8, review_count=32, top_cook_badge=true  where id='00000000-0000-4000-8000-000000000001';
update public.users set city='Los Angeles',   state='CA', lat=34.0522, lng=-118.2437, bio='Mexico City-raised, LA-based. I bake traditional Mexican sweets and cookies every weekend.', rating_avg=4.9, review_count=58, top_cook_badge=true  where id='00000000-0000-4000-8000-000000000002';
update public.users set city='New York',      state='NY', lat=40.7128, lng=-74.006,   bio='Third-generation Italian baker. My focaccia uses olive oil my grandmother imports from Puglia.', rating_avg=4.7, review_count=21, top_cook_badge=false where id='00000000-0000-4000-8000-000000000003';
update public.users set city='Seattle',       state='WA', lat=47.6062, lng=-122.3321, bio='Former pastry chef turned artisan snack maker. Miso goes in everything — even the caramel.', rating_avg=4.9, review_count=44, top_cook_badge=true  where id='00000000-0000-4000-8000-000000000004';
update public.users set city='Chicago',       state='IL', lat=41.8781, lng=-87.6298,  bio='Home baker specializing in South Asian-inspired cakes and confections. Cardamom is my love language.', rating_avg=4.6, review_count=17, top_cook_badge=false where id='00000000-0000-4000-8000-000000000005';
update public.users set city='Houston',       state='TX', lat=29.7604, lng=-95.3698,  bio='Backyard orchard owner. I water-bath jam every summer — peaches are my specialty.', rating_avg=4.8, review_count=29, top_cook_badge=false where id='00000000-0000-4000-8000-000000000006';
update public.users set city='Portland',      state='OR', lat=45.5051, lng=-122.675,  bio='Fermentation enthusiast. I make vegan kimchi because great food should be for everyone.', rating_avg=4.9, review_count=51, top_cook_badge=true  where id='00000000-0000-4000-8000-000000000007';
update public.users set city='Miami',         state='FL', lat=25.7617, lng=-80.1918,  bio='Thai expat and mochi devotee. I learned Asian sweets from my grandmother in Chiang Mai.', rating_avg=4.7, review_count=23, top_cook_badge=false where id='00000000-0000-4000-8000-000000000008';
update public.users set city='Bellevue',      state='WA', lat=47.6101, lng=-122.2015, bio='Candy maker with a Southern-Korean crossover obsession. Brittle, caramels, and everything sweet.', rating_avg=4.8, review_count=36, top_cook_badge=false where id='00000000-0000-4000-8000-000000000009';
update public.users set city='Washington',    state='DC', lat=38.9072, lng=-77.0369,  bio='I import spice ingredients from my family farm in Ethiopia and hand-grind blends every week.', rating_avg=4.9, review_count=42, top_cook_badge=true  where id='00000000-0000-4000-8000-000000000010';
update public.users set city='Chicago',       state='IL', lat=41.85,   lng=-87.65,    bio='Greek pastry maker trained in Thessaloniki. My baklava is a 90-year family recipe.', rating_avg=4.6, review_count=14, top_cook_badge=false where id='00000000-0000-4000-8000-000000000011';
update public.users set city='Miami',         state='FL', lat=25.78,   lng=-80.21,    bio='Lebanese home baker. Mamoul molds hand-carved by my grandfather in Beirut.', rating_avg=4.8, review_count=27, top_cook_badge=false where id='00000000-0000-4000-8000-000000000012';


-- ── Step 3: Insert / update listings ──
-- Uses ON CONFLICT DO UPDATE so re-running the script refreshes existing rows.

insert into public.listings (
  id, user_id, title, description, cuisine_tag, emoji,
  allergens, quantity_total, quantity_left, price_cents,
  made_at, pickup_start, pickup_end,
  lat, lng, city, state, status
) values
(
  '00000000-0000-4001-8000-000000000001', '00000000-0000-4000-8000-000000000001',
  'Sourdough Starter Bread',
  'Wild-fermented sourdough loaf with a blistered crust and open crumb. Made with a 5-year-old starter named "Dough Vader." Baked fresh the morning of pickup. Available as a full loaf.',
  'Baked Goods', '🍞', array['gluten'], 6, 4, 450,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  37.7749, -122.4194, 'San Francisco', 'CA', 'active'
),
(
  '00000000-0000-4001-8000-000000000002', '00000000-0000-4000-8000-000000000002',
  'Horchata Rice Cookies',
  'Soft chewy cookies inspired by Mexican horchata — toasted rice flour, cinnamon, and vanilla, rolled in cinnamon sugar and dipped in white chocolate. One dozen per order.',
  'Cookies & Biscuits', '🍪', array['gluten','dairy','eggs'], 12, 8, 500,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  34.0522, -118.2437, 'Los Angeles', 'CA', 'active'
),
(
  '00000000-0000-4001-8000-000000000003', '00000000-0000-4000-8000-000000000003',
  'Rosemary Olive Focaccia',
  'Extra-virgin olive oil-drenched Italian focaccia dimpled with fresh rosemary, flaky sea salt, and Castelvetrano olives. Baked in cast iron for a crispy golden bottom.',
  'Baked Goods', '🫓', array['gluten'], 4, 2, 800,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  40.7128, -74.006, 'New York', 'NY', 'active'
),
(
  '00000000-0000-4001-8000-000000000004', '00000000-0000-4000-8000-000000000004',
  'Miso Caramel Granola',
  'Clusters of rolled oats, puffed quinoa, and toasted sesame tossed in a miso–brown butter caramel. Less sweet than typical granola — deeply savory and crunchy. Sold in 8 oz bags.',
  'Dried & Packaged', '🥣', array['soy','sesame','tree_nuts'], 8, 5, 750,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  47.6062, -122.3321, 'Seattle', 'WA', 'active'
),
(
  '00000000-0000-4001-8000-000000000005', '00000000-0000-4000-8000-000000000005',
  'Cardamom Honey Cake',
  'Fragrant Indian-inspired honey cake with green cardamom, warming spices, and a rose water glaze. Moist for days. Available as a full 9-inch round or individual slices.',
  'Baked Goods', '🍰', array['gluten','dairy','eggs'], 8, 6, 650,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  41.8781, -87.6298, 'Chicago', 'IL', 'active'
),
(
  '00000000-0000-4001-8000-000000000006', '00000000-0000-4000-8000-000000000006',
  'Peach Jalapeño Jam',
  'Small-batch summer jam made with fresh Texas peaches and fire-roasted jalapeños. Sweet up front, slow heat on the finish. 8 oz jar, properly sealed and water-bath processed.',
  'Jams & Preserves', '🫙', array['none'], 6, 3, 0,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  29.7604, -95.3698, 'Houston', 'TX', 'active'
),
(
  '00000000-0000-4001-8000-000000000007', '00000000-0000-4000-8000-000000000007',
  'Vegan Kimchi',
  'Traditional-style kimchi made without fish sauce — gochugaru, garlic, ginger, and napa cabbage fermented for 3 weeks. 1-quart jar. Vegan, gluten-free, and made with love.',
  'Fermented', '🥬', array['none'], 10, 7, 0,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  45.5051, -122.675, 'Portland', 'OR', 'active'
),
(
  '00000000-0000-4001-8000-000000000008', '00000000-0000-4000-8000-000000000008',
  'Mango Coconut Mochi',
  'Chewy Japanese-style mochi filled with a mango-coconut cream center. Made with glutinous rice flour, real Ataulfo mangoes, and coconut milk. 6 pieces per box. No artificial colors.',
  'Asian Sweets', '🍡', array['none'], 8, 4, 599,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  25.7617, -80.1918, 'Miami', 'FL', 'active'
),
(
  '00000000-0000-4001-8000-000000000009', '00000000-0000-4000-8000-000000000009',
  'Sesame Peanut Brittle',
  'Old-fashioned Southern peanut brittle with a Korean twist — black and white sesame seeds baked into every crispy slab. Free to share with neighbors. Gluten-free and vegan.',
  'Confections', '🍬', array['peanuts','sesame'], 8, 5, 0,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  47.6101, -122.2015, 'Bellevue', 'WA', 'active'
),
(
  '00000000-0000-4001-8000-000000000010', '00000000-0000-4000-8000-000000000010',
  'Berbere Spice Blend',
  'Authentic Ethiopian berbere hand-ground from 15 spices — black cardamom, fenugreek, bishop''s weed, and dried chilies sourced from a family farm in Addis Ababa. 2 oz jar, shelf stable.',
  'Dried & Packaged', '🌶️', array['none'], 6, 2, 800,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  38.9072, -77.0369, 'Washington', 'DC', 'active'
),
(
  '00000000-0000-4001-8000-000000000011', '00000000-0000-4000-8000-000000000011',
  'Baklava Rolls',
  'Rolled Greek baklava with layers of hand-buttered phyllo, crushed pistachios and walnuts, soaked in a citrus-honey syrup. Individual rolls sold by the half-dozen. A 90-year family recipe.',
  'Confections', '🥐', array['gluten','dairy','tree_nuts'], 15, 9, 499,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  41.85, -87.65, 'Chicago', 'IL', 'active'
),
(
  '00000000-0000-4001-8000-000000000012', '00000000-0000-4000-8000-000000000012',
  'Mamoul Date Cookies',
  'Traditional Lebanese semolina cookies filled with sweetened Medjool date paste scented with rose water and orange blossom. Pressed in hand-carved wooden molds. 6 per box.',
  'Cookies & Biscuits', '🌸', array['gluten','dairy'], 8, 3, 750,
  now(), now() + interval '1 day 12 hours', now() + interval '1 day 18 hours',
  25.78, -80.21, 'Miami', 'FL', 'active'
)
on conflict (id) do update set
  title          = excluded.title,
  description    = excluded.description,
  cuisine_tag    = excluded.cuisine_tag,
  emoji          = excluded.emoji,
  allergens      = excluded.allergens,
  quantity_total = excluded.quantity_total,
  quantity_left  = excluded.quantity_left,
  price_cents    = excluded.price_cents,
  status         = excluded.status;


-- ── Step 4: Recipes (3 cottage-food recipes) ──

insert into public.recipes (
  id, listing_id, user_id, title, ingredients, steps, cook_time_mins, servings, is_public
) values (
  '00000000-0000-4002-8000-000000000001',
  '00000000-0000-4001-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Sourdough Starter Bread',
  '[
    {"name":"Bread flour","amount":"450","unit":"g"},
    {"name":"Active sourdough starter","amount":"100","unit":"g"},
    {"name":"Water (room temp)","amount":"330","unit":"g"},
    {"name":"Fine sea salt","amount":"9","unit":"g"}
  ]'::jsonb,
  '[
    {"step_number":1,"instruction":"Mix flour and water; rest 30 minutes (autolyse). Add starter and salt, dimple in and fold to incorporate."},
    {"step_number":2,"instruction":"Perform 4 sets of stretch-and-folds every 30 minutes over 2 hours, then bulk ferment at room temp until dough has grown 50–75% (4–6 hours total)."},
    {"step_number":3,"instruction":"Shape into a tight boule, place seam-side up in a floured banneton, cover, and cold-proof in the fridge overnight (8–16 hours)."},
    {"step_number":4,"instruction":"Preheat oven to 500°F / 260°C with a Dutch oven inside for 45 minutes. Score the dough, bake covered 20 min, uncover and bake another 20–25 min until deep amber."}
  ]'::jsonb,
  90, 1, true
) on conflict (id) do update set
  title       = excluded.title,
  ingredients = excluded.ingredients,
  steps       = excluded.steps;

insert into public.recipes (
  id, listing_id, user_id, title, ingredients, steps, cook_time_mins, servings, is_public
) values (
  '00000000-0000-4002-8000-000000000002',
  '00000000-0000-4001-8000-000000000002',
  '00000000-0000-4000-8000-000000000002',
  'Horchata Rice Cookies',
  '[
    {"name":"Rice flour (toasted)","amount":"200","unit":"g"},
    {"name":"All-purpose flour","amount":"100","unit":"g"},
    {"name":"Unsalted butter (softened)","amount":"115","unit":"g"},
    {"name":"Granulated sugar","amount":"150","unit":"g"},
    {"name":"Egg","amount":"1","unit":"large"},
    {"name":"Vanilla extract","amount":"1","unit":"tsp"},
    {"name":"Ground cinnamon","amount":"2","unit":"tsp"},
    {"name":"White chocolate chips","amount":"100","unit":"g"},
    {"name":"Cinnamon sugar (for rolling)","amount":"3","unit":"tbsp"}
  ]'::jsonb,
  '[
    {"step_number":1,"instruction":"Toast rice flour in a dry skillet over medium heat for 3–4 minutes until fragrant and slightly golden. Let cool completely."},
    {"step_number":2,"instruction":"Beat butter and sugar until light and fluffy. Add egg and vanilla; beat 1 more minute."},
    {"step_number":3,"instruction":"Fold in toasted rice flour, all-purpose flour, and cinnamon until a soft dough forms. Chill 30 minutes."},
    {"step_number":4,"instruction":"Roll into 1-inch balls, coat in cinnamon sugar, place on lined baking sheet. Bake at 350°F / 175°C for 11–13 minutes until edges are just set. Cool 5 minutes then dip bottoms in melted white chocolate."}
  ]'::jsonb,
  45, 24, true
) on conflict (id) do update set
  title       = excluded.title,
  ingredients = excluded.ingredients,
  steps       = excluded.steps;

insert into public.recipes (
  id, listing_id, user_id, title, ingredients, steps, cook_time_mins, servings, is_public
) values (
  '00000000-0000-4002-8000-000000000003',
  '00000000-0000-4001-8000-000000000003',
  '00000000-0000-4000-8000-000000000003',
  'Rosemary Olive Focaccia',
  '[
    {"name":"Bread flour","amount":"500","unit":"g"},
    {"name":"Water (warm)","amount":"400","unit":"g"},
    {"name":"Active dry yeast","amount":"7","unit":"g"},
    {"name":"Extra-virgin olive oil","amount":"80","unit":"ml"},
    {"name":"Fine sea salt","amount":"10","unit":"g"},
    {"name":"Fresh rosemary","amount":"3","unit":"sprigs"},
    {"name":"Castelvetrano olives (pitted)","amount":"80","unit":"g"},
    {"name":"Flaky sea salt","amount":"1","unit":"tsp"}
  ]'::jsonb,
  '[
    {"step_number":1,"instruction":"Mix flour, yeast, and salt. Add warm water and 2 tbsp olive oil. Stir until a shaggy dough forms; no kneading needed. Cover and rest 20 minutes."},
    {"step_number":2,"instruction":"Perform 3 sets of folds every 20 minutes. Transfer to an oiled cast iron or baking pan, cover, and let rise until doubled (1.5–2 hours)."},
    {"step_number":3,"instruction":"Drizzle remaining olive oil generously over the dough. Press your fingers deep into the dough to create dimples all over."},
    {"step_number":4,"instruction":"Press rosemary sprigs and olives into the dimples. Sprinkle with flaky salt. Bake at 425°F / 220°C for 25–30 minutes until deep golden. Rest 10 minutes before slicing."}
  ]'::jsonb,
  150, 8, true
) on conflict (id) do update set
  title       = excluded.title,
  ingredients = excluded.ingredients,
  steps       = excluded.steps;
