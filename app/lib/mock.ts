// ── Types ────────────────────────────────────────────────────────────────────

export type Listing = {
  id: string;
  title: string;
  cuisine: string;       // cottage food category
  cook: string;
  cookRating: number;
  cookReviews: number;
  cookCity: string;
  topCook: boolean;
  distance: string;
  portions: number;
  totalPortions: number;
  price: number;         // cents; 0 = free exchange
  emoji: string;
  description: string;
  allergens: string[];
  pickupStart: string;
  pickupEnd: string;
};

export type Recipe = {
  cookTimeMins: number;
  servings: number;
  ingredients: string[];
  steps: string[];
};

export type Review = {
  id: string;
  reviewer: string;
  stars: number;
  comment: string;
  date: string;
};

// ── Category gradient palette ────────────────────────────────────────────────

export const CUISINE_GRADIENTS: Record<string, [string, string]> = {
  'Baked Goods':      ['#d97706', '#92400e'],
  'Asian Sweets':     ['#f472b6', '#db2777'],
  'Jams & Preserves': ['#fbbf24', '#f97316'],
  'Confections':      ['#c084fc', '#7c3aed'],
  'Dried & Packaged': ['#6ee7b7', '#059669'],
  'Fermented':        ['#5eead4', '#0f766e'],
  'Noodles & Pantry': ['#f87171', '#dc2626'],
  'Cookies & Biscuits': ['#bef264', '#65a30d'],
};

// ── 30 cottage food listings ──────────────────────────────────────────────────

export const LISTINGS: Listing[] = [

  // ── Baked Goods (5) ──
  {
    id: '1', title: 'Matcha Pound Cake', cuisine: 'Baked Goods',
    cook: 'Wei Zhang', cookRating: 4.9, cookReviews: 43, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.4 mi', portions: 4, totalPortions: 6, price: 1200, emoji: '🍰',
    description: 'Dense, lightly sweet pound cake made with ceremonial-grade matcha from Kyoto. Less sugar than typical American cakes — the bitter green tea flavor shines through. Wrapped individually, shelf-stable for 5 days.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-05T10:00', pickupEnd: '2026-04-05T13:00',
  },
  {
    id: '2', title: 'Ube Brioche Loaf', cuisine: 'Baked Goods',
    cook: 'Lily Chen', cookRating: 4.8, cookReviews: 31, cookCity: 'Los Angeles, CA', topCook: true,
    distance: '0.7 mi', portions: 3, totalPortions: 4, price: 1500, emoji: '🍞',
    description: 'Pillowy Filipino-inspired brioche tinted purple with real ube halaya. Mildly sweet with a buttery crumb and subtle vanilla-coconut aroma. Each loaf is roughly 450g, perfect for toast or sandwiches.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-06T09:00', pickupEnd: '2026-04-06T12:00',
  },
  {
    id: '3', title: 'Pineapple Cakes (凤梨酥)', cuisine: 'Baked Goods',
    cook: 'Grace Wu', cookRating: 4.7, cookReviews: 58, cookCity: 'San Jose, CA', topCook: true,
    distance: '1.1 mi', portions: 6, totalPortions: 8, price: 1000, emoji: '🧁',
    description: 'Traditional Taiwanese pineapple shortcakes with buttery pastry shell and a tangy pineapple-winter-melon jam filling. Each box contains 6 individually wrapped cakes. Far less sweet than store-bought.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-04T11:00', pickupEnd: '2026-04-04T14:00',
  },
  {
    id: '4', title: 'Red Bean Swirl Bread', cuisine: 'Baked Goods',
    cook: 'Mei Lin', cookRating: 4.6, cookReviews: 22, cookCity: 'Fremont, CA', topCook: false,
    distance: '2.3 mi', portions: 2, totalPortions: 4, price: 1100, emoji: '🥐',
    description: 'Soft milk bread swirled with homemade red bean paste (low sugar). The dough is enriched with a touch of tangzhong for a cloud-like texture that stays fresh for 3 days at room temperature.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-07T10:00', pickupEnd: '2026-04-07T13:00',
  },
  {
    id: '5', title: 'Scallion Milk Bread Rolls', cuisine: 'Baked Goods',
    cook: 'Tom Huang', cookRating: 4.5, cookReviews: 17, cookCity: 'Oakland, CA', topCook: false,
    distance: '1.6 mi', portions: 5, totalPortions: 6, price: 900, emoji: '🍞',
    description: 'Savory fluffy dinner rolls filled with caramelized scallion and a hint of sesame oil. Not sweet at all — a perfect savory alternative to butter rolls. Pack of 4 rolls per portion.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-05T14:00', pickupEnd: '2026-04-05T17:00',
  },

  // ── Asian Sweets (5) ──
  {
    id: '6', title: 'Mango Mochi (8-piece)', cuisine: 'Asian Sweets',
    cook: 'Amy Park', cookRating: 4.8, cookReviews: 39, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.6 mi', portions: 5, totalPortions: 8, price: 1400, emoji: '🍡',
    description: 'Handmade mochi filled with Alphonso mango cream. The rice skin is thin and barely sweet, letting the fragrant mango filling take center stage. Best enjoyed within 2 days. Keep refrigerated after pickup.',
    allergens: ['dairy'],
    pickupStart: '2026-04-06T10:00', pickupEnd: '2026-04-06T13:00',
  },
  {
    id: '7', title: 'Tang Yuan — Black Sesame', cuisine: 'Asian Sweets',
    cook: 'Jenny Liu', cookRating: 4.7, cookReviews: 25, cookCity: 'Los Angeles, CA', topCook: false,
    distance: '1.0 mi', portions: 4, totalPortions: 6, price: 800, emoji: '🍡',
    description: 'Frozen glutinous rice balls filled with a rich, nutty black sesame paste. Each portion has 8 pieces. Simply drop into boiling water for 5 minutes. No sugar added to the skin — only the filling is lightly sweetened.',
    allergens: ['sesame'],
    pickupStart: '2026-04-05T11:00', pickupEnd: '2026-04-05T14:00',
  },
  {
    id: '8', title: 'Nian Gao (New Year Cake)', cuisine: 'Asian Sweets',
    cook: 'Chen Wei', cookRating: 4.6, cookReviews: 20, cookCity: 'Cupertino, CA', topCook: false,
    distance: '3.1 mi', portions: 3, totalPortions: 4, price: 900, emoji: '🍮',
    description: 'Traditional sticky rice cake made with glutinous rice flour and palm sugar. Lightly sweet with a chewy, dense texture — great pan-fried with egg. This family recipe uses 40% less sugar than commercial versions.',
    allergens: ['eggs'],
    pickupStart: '2026-04-08T10:00', pickupEnd: '2026-04-08T13:00',
  },
  {
    id: '9', title: 'Hong Kong Egg Tarts (6-pack)', cuisine: 'Asian Sweets',
    cook: 'Lisa Ng', cookRating: 4.9, cookReviews: 67, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.5 mi', portions: 6, totalPortions: 10, price: 1100, emoji: '🥚',
    description: 'Flaky shortcrust pastry shells with silky smooth baked egg custard. Less sweet than dim sum restaurant versions — you can actually taste the egg. Best eaten the same day; pack of 6.',
    allergens: ['gluten', 'eggs', 'dairy'],
    pickupStart: '2026-04-06T11:00', pickupEnd: '2026-04-06T14:00',
  },
  {
    id: '10', title: 'Sesame Balls (芝麻球) — 6 pack', cuisine: 'Asian Sweets',
    cook: 'Michael Wong', cookRating: 4.5, cookReviews: 14, cookCity: 'Oakland, CA', topCook: false,
    distance: '1.9 mi', portions: 2, totalPortions: 4, price: 0, emoji: '🟤',
    description: 'Crispy fried glutinous rice balls rolled in toasted sesame seeds and filled with lotus paste. Made fresh the morning of pickup. Free exchange — I make these every week and love sharing!',
    allergens: ['sesame'],
    pickupStart: '2026-04-05T09:00', pickupEnd: '2026-04-05T12:00',
  },

  // ── Jams & Preserves (4) ──
  {
    id: '11', title: 'Yuzu Honey Marmalade', cuisine: 'Jams & Preserves',
    cook: 'Sarah Kim', cookRating: 4.8, cookReviews: 33, cookCity: 'Berkeley, CA', topCook: true,
    distance: '2.0 mi', portions: 8, totalPortions: 12, price: 1200, emoji: '🍋',
    description: 'Small-batch marmalade made with real Japanese yuzu zest and wildflower honey. No added pectin — sets naturally. Slightly bitter-sweet, incredibly fragrant. 240ml jar; shelf-stable 12 months unopened.',
    allergens: ['none'],
    pickupStart: '2026-04-07T10:00', pickupEnd: '2026-04-07T15:00',
  },
  {
    id: '12', title: 'Ume Plum Jam', cuisine: 'Jams & Preserves',
    cook: 'Yuki Tanaka', cookRating: 4.7, cookReviews: 19, cookCity: 'San Jose, CA', topCook: false,
    distance: '2.8 mi', portions: 5, totalPortions: 6, price: 1400, emoji: '🫙',
    description: 'Tart and complex ume plum jam made from California-grown ume. The flavor is deeply fruity with a pleasant sourness — unlike overly-sweet grocery store jams. Wonderful on toast or with cheese.',
    allergens: ['none'],
    pickupStart: '2026-04-06T12:00', pickupEnd: '2026-04-06T16:00',
  },
  {
    id: '13', title: 'Lychee Rose Jam', cuisine: 'Jams & Preserves',
    cook: 'Ann Pham', cookRating: 4.6, cookReviews: 12, cookCity: 'San Jose, CA', topCook: false,
    distance: '3.4 mi', portions: 4, totalPortions: 6, price: 1000, emoji: '🌹',
    description: 'Delicate jam made with fresh lychee and edible rose petals. Floral and fruity with a gentle sweetness. A unique pairing for scones, crepes, or yogurt. 180ml jar.',
    allergens: ['none'],
    pickupStart: '2026-04-08T11:00', pickupEnd: '2026-04-08T15:00',
  },
  {
    id: '14', title: 'Longan & Ginger Preserve', cuisine: 'Jams & Preserves',
    cook: 'Betty Lam', cookRating: 4.5, cookReviews: 9, cookCity: 'Milpitas, CA', topCook: false,
    distance: '4.1 mi', portions: 3, totalPortions: 4, price: 1100, emoji: '🍯',
    description: 'Dried longan fruit slow-cooked with fresh ginger into a thick preserve. Earthy, warming, and only mildly sweet. Excellent stirred into hot water as a tea or spooned over oatmeal.',
    allergens: ['none'],
    pickupStart: '2026-04-07T14:00', pickupEnd: '2026-04-07T17:00',
  },

  // ── Confections (4) ──
  {
    id: '15', title: 'Matcha White Chocolate Bark', cuisine: 'Confections',
    cook: 'Rachel Chen', cookRating: 4.8, cookReviews: 28, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.9 mi', portions: 6, totalPortions: 8, price: 1300, emoji: '🍫',
    description: 'Thin white chocolate bark infused with ceremonial matcha and topped with toasted almond slivers and freeze-dried strawberry. Slightly bitter, not overly sweet. 100g slab per portion.',
    allergens: ['dairy', 'tree_nuts'],
    pickupStart: '2026-04-05T12:00', pickupEnd: '2026-04-05T16:00',
  },
  {
    id: '16', title: 'Chinese Peanut Brittle (花生糖)', cuisine: 'Confections',
    cook: 'David Zhou', cookRating: 4.7, cookReviews: 34, cookCity: 'Los Angeles, CA', topCook: false,
    distance: '1.3 mi', portions: 7, totalPortions: 10, price: 800, emoji: '🥜',
    description: 'Crispy thin peanut brittle made the traditional way with maltose syrup instead of corn syrup. Less aggressively sweet than American brittle, with a strong roasted peanut flavor. 120g bag.',
    allergens: ['peanuts'],
    pickupStart: '2026-04-06T10:00', pickupEnd: '2026-04-06T15:00',
  },
  {
    id: '17', title: 'Sesame Candy (芝麻糖)', cuisine: 'Confections',
    cook: 'Mary Xu', cookRating: 4.6, cookReviews: 21, cookCity: 'San Mateo, CA', topCook: false,
    distance: '2.2 mi', portions: 5, totalPortions: 8, price: 700, emoji: '🌰',
    description: 'Crunchy sesame seed candy bars made with black and white sesame, bound with a light malt sugar syrup. Deeply nutty, naturally sweet. Wrapped individually, 6 pieces per portion.',
    allergens: ['sesame'],
    pickupStart: '2026-04-07T11:00', pickupEnd: '2026-04-07T15:00',
  },
  {
    id: '18', title: 'Osmanthus Jelly', cuisine: 'Confections',
    cook: 'Kevin Tang', cookRating: 4.9, cookReviews: 41, cookCity: 'Palo Alto, CA', topCook: true,
    distance: '1.7 mi', portions: 4, totalPortions: 6, price: 900, emoji: '🌸',
    description: 'Silky agar jelly infused with dried osmanthus flowers and a hint of wolfberry. Lightly sweet, beautifully floral. Served chilled. 4 individual cups per portion. Lasts 3 days refrigerated.',
    allergens: ['none'],
    pickupStart: '2026-04-05T10:00', pickupEnd: '2026-04-05T14:00',
  },

  // ── Dried & Packaged (4) ──
  {
    id: '19', title: 'Matcha Almond Granola', cuisine: 'Dried & Packaged',
    cook: 'Jessica Wu', cookRating: 4.7, cookReviews: 26, cookCity: 'San Francisco, CA', topCook: false,
    distance: '1.4 mi', portions: 8, totalPortions: 10, price: 1100, emoji: '🌿',
    description: 'Crunchy oat granola toasted with matcha powder, sliced almonds, pumpkin seeds, and a light drizzle of honey. Much less sweet than commercial granola. 250g resealable bag.',
    allergens: ['gluten', 'tree_nuts'],
    pickupStart: '2026-04-08T10:00', pickupEnd: '2026-04-08T16:00',
  },
  {
    id: '20', title: 'Chrysanthemum & Wolfberry Tea', cuisine: 'Dried & Packaged',
    cook: 'Paul Lin', cookRating: 4.8, cookReviews: 30, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.8 mi', portions: 10, totalPortions: 15, price: 900, emoji: '🌼',
    description: 'Loose-leaf blend of dried chrysanthemum flowers, wolfberry (goji), and rock sugar. Cooling in summer, comforting in winter. Just steep in hot water for 5 minutes. 50g bag makes ~20 cups.',
    allergens: ['none'],
    pickupStart: '2026-04-06T09:00', pickupEnd: '2026-04-06T17:00',
  },
  {
    id: '21', title: 'Homemade Chili Crisp', cuisine: 'Dried & Packaged',
    cook: 'Nina Zhao', cookRating: 4.9, cookReviews: 55, cookCity: 'Los Angeles, CA', topCook: true,
    distance: '1.1 mi', portions: 6, totalPortions: 8, price: 1200, emoji: '🌶️',
    description: 'Fragrant, crunchy chili crisp made with Sichuan dried chilies, crispy shallots, garlic, and fermented black beans in quality neutral oil. Not as oily or salty as Lao Gan Ma. 180ml jar.',
    allergens: ['soy'],
    pickupStart: '2026-04-07T12:00', pickupEnd: '2026-04-07T17:00',
  },
  {
    id: '22', title: 'Five-Spice Roasted Cashews', cuisine: 'Dried & Packaged',
    cook: 'Eric Liu', cookRating: 4.6, cookReviews: 18, cookCity: 'Sunnyvale, CA', topCook: false,
    distance: '2.5 mi', portions: 7, totalPortions: 10, price: 900, emoji: '🥜',
    description: 'Raw cashews slow-roasted with five-spice powder, a touch of brown sugar, and sea salt. Savory-sweet, deeply aromatic. 150g bag. No artificial flavors or coatings.',
    allergens: ['tree_nuts'],
    pickupStart: '2026-04-05T13:00', pickupEnd: '2026-04-05T17:00',
  },

  // ── Fermented (3) ──
  {
    id: '23', title: 'House Kimchi (Vegan)', cuisine: 'Fermented',
    cook: 'Helen Park', cookRating: 4.8, cookReviews: 47, cookCity: 'Los Angeles, CA', topCook: true,
    distance: '0.9 mi', portions: 5, totalPortions: 8, price: 1000, emoji: '🥬',
    description: 'Classic napa cabbage kimchi fermented for 3 days. Vegan — uses doenjang instead of fish sauce. Medium spicy, pleasantly sour, not overly funky. 400g jar. My Korean grandmother\'s recipe adapted for modern kitchens.',
    allergens: ['none'],
    pickupStart: '2026-04-06T11:00', pickupEnd: '2026-04-06T15:00',
  },
  {
    id: '24', title: 'Homemade Shiro Miso Paste', cuisine: 'Fermented',
    cook: 'James Sato', cookRating: 4.7, cookReviews: 22, cookCity: 'Berkeley, CA', topCook: false,
    distance: '2.1 mi', portions: 4, totalPortions: 6, price: 1300, emoji: '🫙',
    description: 'White (shiro) miso fermented for 6 months using organic soybeans and koji. Mild, slightly sweet, and incredibly versatile. Use in soups, marinades, or salad dressings. 200g tub.',
    allergens: ['soy'],
    pickupStart: '2026-04-07T10:00', pickupEnd: '2026-04-07T15:00',
  },
  {
    id: '25', title: 'Sichuan Paocai (泡菜)', cuisine: 'Fermented',
    cook: 'Lucy Cheng', cookRating: 4.6, cookReviews: 16, cookCity: 'San Francisco, CA', topCook: false,
    distance: '1.5 mi', portions: 3, totalPortions: 5, price: 0, emoji: '🫙',
    description: 'Quick-pickled Sichuan vegetables (radish, carrot, celery) in a lightly spiced brine. Crunchy, tangy, barely spicy. Fermented 48 hours. Free — I make a big batch weekly and always have extra!',
    allergens: ['none'],
    pickupStart: '2026-04-05T10:00', pickupEnd: '2026-04-05T14:00',
  },

  // ── Noodles & Pantry (3) ──
  {
    id: '26', title: 'Handmade Dried Wheat Noodles', cuisine: 'Noodles & Pantry',
    cook: 'Sandra Wu', cookRating: 4.7, cookReviews: 29, cookCity: 'Daly City, CA', topCook: false,
    distance: '3.0 mi', portions: 4, totalPortions: 6, price: 1000, emoji: '🍜',
    description: 'Sun-dried thin wheat noodles made with just flour, water, and salt. No preservatives, no additives. Cooks in 3 minutes. 300g bundle per portion — enough for 2 servings of noodle soup.',
    allergens: ['gluten'],
    pickupStart: '2026-04-08T11:00', pickupEnd: '2026-04-08T16:00',
  },
  {
    id: '27', title: 'Scallion Ginger Confit Oil', cuisine: 'Noodles & Pantry',
    cook: 'Roger Chan', cookRating: 4.8, cookReviews: 36, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.7 mi', portions: 6, totalPortions: 8, price: 1100, emoji: '🧅',
    description: 'Slow-infused neutral oil with crispy scallion, ginger, and a touch of white pepper. The ultimate flavor booster for rice, noodles, or dumplings. 120ml jar. Inspired by Hong Kong cha chaan teng.',
    allergens: ['none'],
    pickupStart: '2026-04-06T12:00', pickupEnd: '2026-04-06T16:00',
  },
  {
    id: '28', title: 'Homemade XO Sauce', cuisine: 'Noodles & Pantry',
    cook: 'Monica Yip', cookRating: 4.9, cookReviews: 61, cookCity: 'Los Angeles, CA', topCook: true,
    distance: '1.2 mi', portions: 5, totalPortions: 6, price: 1800, emoji: '🫙',
    description: 'Luxurious XO sauce made with dried scallop, dried shrimp, Jinhua ham, and chili. A Hong Kong classic that takes 3 hours to make. Deeply savory, mildly spicy — transforms any dish. 100ml jar.',
    allergens: ['shellfish', 'soy'],
    pickupStart: '2026-04-07T11:00', pickupEnd: '2026-04-07T15:00',
  },

  // ── Cookies & Biscuits (3) ──
  {
    id: '29', title: 'Matcha Almond Shortbread', cuisine: 'Cookies & Biscuits',
    cook: 'Diana Lim', cookRating: 4.8, cookReviews: 38, cookCity: 'San Francisco, CA', topCook: true,
    distance: '1.0 mi', portions: 7, totalPortions: 10, price: 1000, emoji: '🍪',
    description: 'Buttery Scottish-style shortbread with ceremonial matcha and toasted almond flour. Only lightly sweetened — the matcha bitterness balances beautifully. 10 cookies per portion, boxed.',
    allergens: ['gluten', 'dairy', 'eggs', 'tree_nuts'],
    pickupStart: '2026-04-05T11:00', pickupEnd: '2026-04-05T15:00',
  },
  {
    id: '30', title: 'Black Sesame Crinkle Cookies', cuisine: 'Cookies & Biscuits',
    cook: 'Frank Zhou', cookRating: 4.7, cookReviews: 24, cookCity: 'San Jose, CA', topCook: false,
    distance: '2.4 mi', portions: 5, totalPortions: 8, price: 900, emoji: '🍪',
    description: 'Chewy crinkle cookies made with freshly ground black sesame paste and a tiny coating of powdered sugar. Deeply nutty, not too sweet. 8 cookies per portion. Stays soft for 4 days in an airtight container.',
    allergens: ['gluten', 'dairy', 'eggs', 'sesame'],
    pickupStart: '2026-04-06T10:00', pickupEnd: '2026-04-06T14:00',
  },
];

// ── Recipe templates by category ─────────────────────────────────────────────

const RECIPES: Record<string, Recipe> = {
  'Baked Goods': {
    cookTimeMins: 70,
    servings: 8,
    ingredients: [
      '200g all-purpose flour',
      '15g ceremonial matcha powder',
      '180g unsalted butter, softened',
      '120g caster sugar (adjust to taste)',
      '3 large eggs, room temperature',
      '1 tsp vanilla extract',
      '1/2 tsp baking powder',
      'Pinch of sea salt',
    ],
    steps: [
      'Preheat oven to 170°C (340°F). Grease and line a 9×5" loaf pan.',
      'Sift flour, matcha, baking powder, and salt together. Set aside.',
      'Beat butter and sugar with a hand mixer until pale and fluffy, about 4 minutes.',
      'Add eggs one at a time, beating well after each addition. Mix in vanilla.',
      'Fold in the flour mixture in three additions until just combined — do not overmix.',
      'Pour into prepared pan and smooth the top. Tap gently to release air bubbles.',
      'Bake 55–60 minutes until a skewer inserted in the center comes out clean.',
      'Cool in pan for 10 minutes, then turn out onto a wire rack to cool completely.',
    ],
  },
  'Asian Sweets': {
    cookTimeMins: 45,
    servings: 8,
    ingredients: [
      '200g glutinous rice flour',
      '30g cornstarch',
      '50g sugar',
      '250ml water',
      '200ml coconut cream',
      '300g ripe mango, cubed',
      '100ml heavy cream, whipped',
      'Toasted sesame seeds for dusting',
    ],
    steps: [
      'Mix glutinous rice flour, cornstarch, and sugar in a heatproof bowl.',
      'Whisk in water and coconut cream until completely smooth.',
      'Cover with plastic wrap and microwave on medium for 3 minutes, stir, then 2 more minutes.',
      'Stir vigorously until a smooth, pliable dough forms. Let cool covered.',
      'Fold mango cubes into whipped cream. Refrigerate filling while dough cools.',
      'Dust work surface with cornstarch. Divide dough into 8 portions.',
      'Flatten each portion, place a spoonful of filling in center, and pinch edges to seal.',
      'Roll in sesame seeds and serve immediately or refrigerate for up to 2 days.',
    ],
  },
  'Jams & Preserves': {
    cookTimeMins: 60,
    servings: 24,
    ingredients: [
      '500g yuzu (or Meyer lemon), washed',
      '400g caster sugar',
      '3 tbsp wildflower honey',
      '200ml water',
      '1 tbsp lemon juice',
      '2 sterilized 240ml jars',
    ],
    steps: [
      'Scrub yuzu well. Remove zest in thin strips, avoiding the white pith.',
      'Halve and juice all the fruit. Strain juice into a heavy-bottomed pot.',
      'Blanch the zest in boiling water for 2 minutes, drain, and repeat once more.',
      'Combine juice, blanched zest, water, and sugar in the pot. Stir over medium heat until sugar dissolves.',
      'Bring to a boil, skimming any foam. Cook for 20–25 minutes until thickened.',
      'Test set: drop a small amount on a cold plate — it should wrinkle when pushed.',
      'Stir in honey and lemon juice. Remove from heat.',
      'Ladle into sterilized jars, seal immediately, and invert for 5 minutes. Store in a cool dark place.',
    ],
  },
  'Confections': {
    cookTimeMins: 30,
    servings: 12,
    ingredients: [
      '300g good-quality white chocolate, finely chopped',
      '15g ceremonial matcha powder, sifted',
      '50g sliced almonds, lightly toasted',
      '30g freeze-dried strawberry pieces',
      '1/4 tsp flaky sea salt',
      'Parchment-lined baking sheet',
    ],
    steps: [
      'Melt white chocolate in a heatproof bowl over barely simmering water, stirring gently.',
      'Remove from heat. Sift in matcha and stir until fully incorporated and smooth.',
      'Pour onto a parchment-lined baking sheet and spread into a thin even layer.',
      'Immediately scatter almonds, freeze-dried strawberry, and sea salt over the surface.',
      'Refrigerate for 30 minutes until fully set and hard.',
      'Break into irregular shards. Store in an airtight container in a cool place for up to 2 weeks.',
    ],
  },
  'Dried & Packaged': {
    cookTimeMins: 40,
    servings: 10,
    ingredients: [
      '300g rolled oats',
      '10g matcha powder',
      '100g raw almonds, roughly chopped',
      '50g pumpkin seeds',
      '60ml neutral oil',
      '60ml raw honey',
      '1 tsp vanilla extract',
      '1/4 tsp sea salt',
    ],
    steps: [
      'Preheat oven to 160°C (320°F). Line a large baking sheet with parchment.',
      'Whisk together oil, honey, vanilla, and salt in a large bowl.',
      'Add oats, matcha, almonds, and pumpkin seeds. Toss until evenly coated.',
      'Spread in a thin, even layer on the baking sheet — resist the urge to stir during baking.',
      'Bake for 35–40 minutes until golden, rotating the pan halfway through.',
      'Remove from oven and let cool completely undisturbed — this is how clusters form.',
      'Break into pieces and transfer to airtight bags. Keeps up to 3 weeks at room temperature.',
    ],
  },
  'Fermented': {
    cookTimeMins: 30,
    servings: 8,
    ingredients: [
      '1 medium napa cabbage (about 1.5kg)',
      '3 tbsp coarse sea salt (non-iodized)',
      '1 tbsp gochugaru (Korean chili flakes)',
      '4 cloves garlic, minced',
      '1 tsp fresh ginger, grated',
      '3 stalks green onion, cut into 1" pieces',
      '1 tsp sugar',
      '1 tbsp doenjang (soybean paste) — for vegan version',
    ],
    steps: [
      'Quarter the cabbage lengthwise and cut crosswise into 2-inch pieces.',
      'Toss with salt in a large bowl. Let stand for 1–2 hours until wilted, turning occasionally.',
      'Rinse cabbage thoroughly under cold water twice. Squeeze out as much water as possible.',
      'Mix gochugaru, garlic, ginger, sugar, and doenjang into a paste.',
      'Add drained cabbage and green onion to the paste. Toss with gloved hands until evenly coated.',
      'Pack tightly into clean glass jars, pressing down to eliminate air pockets.',
      'Leave 1 inch of headspace. Seal and leave at room temperature for 24–48 hours to ferment.',
      'Refrigerate once pleasantly tangy. Keeps for up to 3 months refrigerated.',
    ],
  },
  'Noodles & Pantry': {
    cookTimeMins: 20,
    servings: 6,
    ingredients: [
      '1 cup neutral oil (e.g. canola)',
      '6 stalks scallion, cut into 2" pieces',
      '4 slices fresh ginger',
      '2 shallots, sliced',
      '1/2 tsp white pepper',
      '1 tsp sea salt',
    ],
    steps: [
      'Combine scallion, ginger, and shallots in a small saucepan with the oil.',
      'Place over medium-low heat. The oil should gently bubble — not sizzle aggressively.',
      'Cook undisturbed for 15 minutes until scallion is golden and crispy.',
      'Add white pepper and salt in the final minute.',
      'Strain the oil through a fine mesh sieve into a clean jar. Reserve crispy bits separately.',
      'Let cool to room temperature. Combine strained oil and crispy bits back in the jar.',
      'Seal and refrigerate. Lasts 3 weeks. Use on rice, noodles, congee, or dumplings.',
    ],
  },
  'Cookies & Biscuits': {
    cookTimeMins: 55,
    servings: 10,
    ingredients: [
      '225g unsalted butter, room temperature',
      '80g powdered sugar (sifted)',
      '15g ceremonial matcha, sifted',
      '250g all-purpose flour',
      '40g toasted almond flour',
      '1/4 tsp sea salt',
    ],
    steps: [
      'Beat butter with an electric mixer until smooth and creamy, about 2 minutes.',
      'Add powdered sugar and beat on medium until light and fluffy, 3 minutes.',
      'Sift in matcha, flour, almond flour, and salt. Mix on low until just combined.',
      'Shape dough into a 2-inch diameter log. Wrap in plastic wrap and refrigerate 1 hour.',
      'Preheat oven to 160°C (320°F). Line two baking sheets with parchment.',
      'Slice log into 1cm-thick rounds. Place on sheets with 1 inch between each cookie.',
      'Bake 18–20 minutes until edges are just set — centers should still look slightly underdone.',
      'Cool on the pan for 5 minutes before transferring. They firm up as they cool.',
    ],
  },
};

// ── Review pool ───────────────────────────────────────────────────────────────

const REVIEW_POOL: Review[] = [
  { id: 'r1',  reviewer: 'Sandra K.', stars: 5, comment: 'Absolutely incredible — nothing like the overly-sweet versions at the store. Will order again!', date: 'Mar 2026' },
  { id: 'r2',  reviewer: 'Tom H.',    stars: 5, comment: 'The packaging was thoughtful and the flavor was exactly as described. A real gem!', date: 'Feb 2026' },
  { id: 'r3',  reviewer: 'Amy L.',    stars: 4, comment: 'Very tasty and authentic. Pickup was easy. Slightly smaller than expected but worth it.', date: 'Mar 2026' },
  { id: 'r4',  reviewer: 'Jason Y.',  stars: 5, comment: 'Made this for our whole family and everyone asked for the contact. Outstanding quality.', date: 'Jan 2026' },
  { id: 'r5',  reviewer: 'Iris W.',   stars: 4, comment: 'Love that it\'s not too sweet. Refreshing to find baked goods that respect the ingredients.', date: 'Feb 2026' },
  { id: 'r6',  reviewer: 'Kevin M.',  stars: 5, comment: 'The real thing. Reminds me of what my mom used to make. Can\'t believe I found this here.', date: 'Mar 2026' },
  { id: 'r7',  reviewer: 'Priya N.',  stars: 5, comment: 'As a non-Asian person I was nervous, but the seller explained everything so well. Delicious!', date: 'Feb 2026' },
  { id: 'r8',  reviewer: 'Chris T.',  stars: 4, comment: 'Great product and super friendly exchange. The homemade quality really shows.', date: 'Jan 2026' },
  { id: 'r9',  reviewer: 'Mei Y.',    stars: 5, comment: 'Exactly like my grandmother used to make. This platform is such a treasure.', date: 'Mar 2026' },
  { id: 'r10', reviewer: 'David B.',  stars: 3, comment: 'Good, but not my style. The seller was very kind and responsive though.', date: 'Feb 2026' },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getRecipe(category: string): Recipe {
  return RECIPES[category] ?? RECIPES['Baked Goods'];
}

export function getReviews(id: string): Review[] {
  const n = parseInt(id, 10);
  const count = (n % 2 === 0) ? 3 : 2;
  const start = (n * 3) % REVIEW_POOL.length;
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    reviews.push(REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
  }
  return reviews;
}
