-- ============================================================
-- Blog Seed Data
-- Run in Supabase Dashboard → SQL Editor AFTER schema.sql + blog.sql + seed.sql
-- Uses the 3 demo users created in seed.sql
-- ============================================================

insert into public.blog_posts (
  id, user_id, title, slug, excerpt, content,
  cover_image_url, category, tags, status,
  view_count, like_count, created_at
) values

-- ── Wei Zhang (aaaaaaaa) ──────────────────────────────────────

(
  'b1000001-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Why I Use Ceremonial Grade Matcha in Everything I Bake',
  'why-i-use-ceremonial-grade-matcha-b10000',
  'After years of experimenting with culinary vs. ceremonial grade matcha, I stopped compromising. Here''s what changed my baking — and why the price difference is worth every penny.',
  'I used to reach for the green tin of culinary matcha without thinking twice. It was cheap, widely available, and technically "made for cooking." Then a friend brought me a small pouch of ceremonial grade from a family farm in Uji, and I tasted the difference.

The color was the first thing I noticed. Ceremonial matcha is a vivid, almost neon green — the kind of color that makes people ask if you added food dye. Culinary matcha is duller, more olive-toned. When you fold it into a batter, that color carries through. A matcha pound cake made with ceremonial grade looks like it was painted.

But color is just aesthetics. What really matters is flavor.

Culinary matcha is harvested later in the season, often from lower leaves that get more sun exposure. More sun means more bitterness, more astringency. That''s fine when you''re masking it with sugar in a heavily sweetened dessert — but I don''t bake that way. My cakes use 25–30% less sugar than standard recipes. At that sugar level, every nuance in your matcha is exposed.

Ceremonial grade is shaded for three to four weeks before harvest. The shade stress forces the plant to produce more chlorophyll and L-theanine (the amino acid responsible for matcha''s calming umami note). The result is sweeter, grassier, more complex. When you taste it in a pound cake, you get floral, vegetal, slightly sweet — not just "bitter green."

**The math:**
A ceremonial-grade tin runs about $25–35 for 30g. My pound cake recipe uses 15g per loaf, so roughly $12–17 in matcha per loaf. That sounds steep until you realize the matcha is the whole point of the cake — it''s not a flavoring, it''s the main ingredient.

If you''re making matcha cookies where the flavor is one note among many, culinary grade is fine. But if matcha is the star — in a pound cake, financier, or soft serve — use the good stuff. Your neighbors will taste the difference.

**Where I source mine:**
I rotate between a few Japanese importers. Look for harvest date on the tin (you want last season), shade-grown designation, and stone-milled. Those three signals usually mean you''re getting something worth baking with.',
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop',
  'food_tutorial',
  array['matcha', 'baking', 'ingredients', 'japanese'],
  'published',
  284, 47,
  now() - interval '18 days'
),

(
  'b1000002-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'The Real Reason I Cut Sugar by 30% in All My Recipes',
  'the-real-reason-i-cut-sugar-30-percent-b10000',
  'It started with a comment from my mom. Now every recipe I develop uses significantly less sugar — and people keep asking how they taste more flavorful, not less.',
  'My mom visited from Chengdu two years ago and tried a slice of the blueberry pound cake I was selling at the time. She ate half a slice and put it down. "It''s very sweet," she said, in the way Chinese moms say things that are critiques disguised as observations.

I''d been baking American-style for so long I''d stopped noticing. I pulled up the recipe: 200g sugar for an 8-slice loaf. That''s 25g of sugar per slice — about 6 teaspoons. I went back to the blueberries I was folding in. They were ripe and plenty sweet on their own.

I dropped the sugar to 140g the next batch. Then 130g. I started calibrating by taste rather than following the recipe as written.

**What I learned:**

Sugar doesn''t just sweeten — it does structural work in baking. It tenderizes crumb, promotes browning, retains moisture, and affects how the proteins and starches set. You can''t just subtract it without adjusting other variables.

For my pound cakes, here''s what changed:
- Reduced sugar from 200g to 140g (−30%)
- Increased butter slightly (from 180g to 200g) to maintain tenderness
- Added a small amount of honey (15g) for hygroscopic moisture retention
- Reduced bake temperature by 10°F to compensate for less caramelization

The result: the cakes brown more gently, stay moist longer, and the primary flavor — whether that''s matcha, yuzu, or hojicha — comes forward instead of being buried under sweetness.

**The health side:**
I''m not going to claim my pound cake is health food. But for people watching sugar intake, the difference between 25g and 17g per slice matters over time. And I find that lower-sugar baked goods are actually more satisfying — you don''t get the crash, and you stop at one slice instead of two.

The real test is that people who normally don''t like "health food" love these cakes. They don''t taste like they''re missing anything. They just taste like good baking, with the flavors clean and present instead of glazed over.

My mom, on her last visit, finished the whole slice.',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&auto=format&fit=crop',
  'health_nutrition',
  array['sugar', 'health', 'baking-tips', 'recipe-development'],
  'published',
  193, 38,
  now() - interval '9 days'
),


-- ── Lily Chen (bbbbbbbb) ──────────────────────────────────────

(
  'b2000001-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Ube Is Not Just a Color: A Guide to the Real Purple Yam',
  'ube-is-not-just-a-color-guide-to-purple-b20000',
  'Ube went viral as an Instagram aesthetic. But in Filipino kitchens it''s been a pantry staple for generations. Here''s what you actually need to know about the real ingredient.',
  'Every few months I see a new café announce an "ube latte" or "ube croissant" and post a photo of something aggressively purple. I click through, curious — and nine times out of ten, the ingredient list says "ube flavoring" or "purple sweet potato."

I get it. Real ube (Dioscorea alata, the purple yam) is harder to source than purple sweet potato, which is cheaper, more available, and still turns things purple. But they''re not the same thing, and if you''ve grown up eating real ube halaya at your lola''s table, you can tell immediately.

**What ube actually tastes like:**
Real ube is mild, slightly sweet, with a subtle vanilla-like nuttiness and a hint of what I can only describe as earthiness — almost like a more delicate version of taro. It''s not aggressively sweet. The flavor is gentle and the purple color is naturally vivid but not garish.

Taro is earthier, starchier, and more savory. Purple sweet potato is sweeter and more potato-forward. Neither one is a substitute for ube if ube is the point.

**Forms of ube you''ll find:**
- **Fresh ube root:** Hard to find outside specialty Filipino grocers. Purple flesh, rough brown skin. Best for making halaya from scratch.
- **Ube halaya (jam):** The cooked, sweetened paste — this is what goes into my brioche. Look for brands like Goldilocks or homemade from your local Filipino community.
- **Ube extract:** Concentrated flavoring, usually with a purple dye component. Fine for adding color boost, but don''t use this as your only ube source.
- **Frozen grated ube:** The easiest form to cook with. I get mine from Seafood City.

**In my brioche:**
I use a combination of ube halaya folded into the dough and a small amount of ube extract for color consistency (the color can fade during baking). The halaya adds flavor and moisture; the extract ensures the crumb stays that signature violet-purple.

The goal is always for ube to taste like ube — not like purple. If your product is more aesthetic than flavor, you might want to reconsider your sourcing.',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&auto=format&fit=crop',
  'ingredient_intro',
  array['ube', 'filipino', 'ingredients', 'purple-yam'],
  'published',
  412, 89,
  now() - interval '22 days'
),

(
  'b2000002-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'How I Finally Learned to Make Mochi (After Many Sticky Failures)',
  'how-i-finally-learned-to-make-mochi-b20000',
  'Mochi looks simple. It''s mostly rice flour and water. It took me eleven attempts to make something I wasn''t embarrassed to share. Here''s what I learned the hard way.',
  'I have a specific memory of the first time I tried to make mochi. I pulled the dough out of the microwave and it looked right — translucent, thick, slightly stretchy. Then I tried to shape it. It stuck to my hands, the counter, the plastic wrap, the spoon. It stuck to everything except itself.

I ended up eating a shapeless mochi blob straight from the bowl with a fork and telling no one.

That was attempt number one. Here''s what changed across the next ten:

**The flour matters more than you think.**
There are several types of glutinous rice flour and they behave differently. Mochiko (the blue-boxed Koda Farms brand) is what I use for microwave mochi — it produces a softer, slightly stickier dough that''s more forgiving. Thai sweet rice flour (like Erawan brand) is better for steamed preparations. I wasted four batches not knowing this.

**The starch dredge is non-negotiable.**
Katakuriko (potato starch) is the traditional dredging starch for mochi — it''s finer and less powdery than cornstarch, and it doesn''t interfere with the texture. Coat your work surface, your hands, and each piece generously. Cheap out on this step and you''re back to the fork-and-bowl situation.

**Shaping is about speed and cold.**
Mochi dough becomes exponentially stickier as it warms from the heat of your hands. Work quickly. I portion all my pieces before shaping any of them — cutting with a bench scraper rather than pulling, which stretches the gluten and makes sealing harder. If you''re filling mochi, have your filling chilled and portioned in the freezer beforehand so it''s firm when it goes in.

**The microwave method is not inferior.**
I know some purists insist on steaming. The microwave method — mixing the dough, covering, microwaving in 2-minute intervals and stirring — gives you equivalent texture in a fraction of the time. The key is not to over-microwave: you want the dough translucent and pulling away from the bowl, not brown or dried at the edges.

My mango coconut mochi took eleven tries to nail. It now takes me about 45 minutes from start to finish, and I haven''t had a single batch fail in over a year. Every skill looks easy once you''ve learned it the hard way.',
  'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=900&auto=format&fit=crop',
  'food_tutorial',
  array['mochi', 'japanese', 'technique', 'beginner'],
  'published',
  337, 64,
  now() - interval '14 days'
),


-- ── Grace Wu (cccccccc) ──────────────────────────────────────

(
  'b3000001-0000-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Fermentation 101: Why Your Gut Wants You to Eat More Kimchi',
  'fermentation-101-why-your-gut-wants-kimchi-b30000',
  'I''ve been fermenting kimchi for 40 years. The science behind why it''s good for you finally caught up with what my body already knew.',
  'When I was growing up in Taiwan, we didn''t talk about "gut microbiome" or "probiotics." We just knew that fermented foods made you feel good, that they settled your stomach, that grandmothers who ate them lived long lives. The science has taken a while to explain what traditional food cultures understood for millennia.

Here''s what we know now:

**Fermentation creates live cultures.**
The lacto-fermentation process in kimchi — where naturally occurring bacteria on the vegetables (primarily Lactobacillus species) convert sugars into lactic acid — produces a living food teeming with beneficial microorganisms. These are the same types of bacteria found in yogurt and kefir. When you eat properly fermented kimchi, you''re introducing live cultures into your digestive system.

**Your gut microbiome affects more than digestion.**
Research over the past decade has linked gut microbiome diversity to immune function, inflammation, mental health (via the gut-brain axis), and metabolic health. A diverse microbiome — fed by a variety of fermented and fiber-rich foods — is associated with better outcomes across all of these. Kimchi provides both: the probiotics from fermentation and the prebiotic fiber from cabbage and vegetables.

**Not all kimchi is created equal.**
Most store-bought kimchi is pasteurized, which kills the live cultures. (Check the refrigerated section — properly live kimchi will have a slightly inflated lid from gas production.) For the full probiotic benefit, you want raw, unpasteurized kimchi that''s been actively fermenting.

My kimchi is fermented for a minimum of 5 days before I sell it. At that point it''s tangy, crunchy, and biologically active. It continues to ferment slowly in your refrigerator — which is why the taste changes over weeks. Young kimchi is bright and crisp; older kimchi is more sour and complex, better for cooking.

**How much do you need?**
A few tablespoons a day is plenty. Add it to rice, eggs, noodles, or just eat it straight from the jar. Consistency matters more than quantity. I''ve eaten kimchi with almost every meal for 40 years. That might be why, at 62, I still don''t need reading glasses.',
  'https://images.unsplash.com/photo-1583059013454-f8b0acfe8a36?w=900&auto=format&fit=crop',
  'health_nutrition',
  array['kimchi', 'fermentation', 'gut-health', 'probiotics'],
  'published',
  521, 112,
  now() - interval '30 days'
),

(
  'b3000002-0000-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'The Story Behind Pineapple Cakes — and Why My Recipe Is Different',
  'the-story-behind-pineapple-cakes-b30000',
  'Pineapple cakes are Taiwan''s most iconic souvenir food. But most of what you buy at the airport isn''t what they used to be. I''m trying to make them the way I remember.',
  'If you''ve visited Taiwan, you''ve probably come home with a box of 鳳梨酥 (fènglí sū) — the small, square shortcakes with a golden pastry crust and a dense fruit filling. They''re sold everywhere: bakeries, 7-Elevens, night market stalls, high-end gift shops. They are, arguably, the most Taiwanese thing you can eat.

But here''s something most people outside Taiwan don''t know: the filling in most commercial pineapple cakes isn''t pineapple.

It''s winter melon (冬瓜).

This isn''t fraud — it''s a very old substitution. Pure pineapple filling is difficult to work with; it''s acidic and watery, which interferes with the pastry texture. Winter melon is neutral in flavor and absorbs the pineapple juice and citrus zest added to the filling, giving you a product that tastes pineapple-forward but handles like a dream. Most Taiwanese bakeries have used this blend for decades.

Then in the early 2000s, a small bakery in Tainan called Chia Te started making what they called 土鳳梨酥 — "native pineapple cakes" — using actual local pineapple, a more acidic heirloom variety with intense flavor. They became famous. Now every shop in Taiwan offers both versions, and the 土鳳梨酥 are sold out days in advance.

**My version:**
I use a blend — roughly 60% pineapple pulp to 40% winter melon. This gives me real pineapple flavor with enough structural stability to get a clean cut. I reduce the fruit mixture over low heat for about 45 minutes until it''s thick, jammy, and deeply golden. No artificial flavoring. No food coloring.

The pastry is the part I''m most particular about. Traditional 鳳梨酥 dough is very short — high fat, low water, crumbling into sandy fragments at the touch. I use a mix of butter and a small amount of cream cheese for richness, and just enough egg yolk to bind it without making it tough. It should barely hold its shape when you press it into the mold.

My grandmother made these at Lunar New Year every year. The recipe I use is hers, adjusted over fifteen years of baking in a California kitchen with American butter and Pacific Coast pineapples. It''s close enough that eating one still feels like being home.',
  'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=900&auto=format&fit=crop',
  'food_story',
  array['taiwanese', 'pineapple-cake', 'culture', 'tradition'],
  'published',
  308, 76,
  now() - interval '25 days'
);


-- ── Seed a few likes so like_count is accurate ───────────────
-- (the trigger handles incrementing like_count, but we seeded
--  like_count directly above for simplicity — this block just
--  adds representative like rows for UI testing)

insert into public.blog_likes (post_id, user_id, created_at) values
  ('b1000001-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '15 days'),
  ('b1000001-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '12 days'),
  ('b2000001-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '20 days'),
  ('b2000001-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '18 days'),
  ('b3000001-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '28 days'),
  ('b3000001-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '25 days'),
  ('b3000002-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '22 days'),
  ('b2000002-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '10 days')
on conflict do nothing;
