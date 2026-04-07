// UI-only constants (not fake data)

// ── Category gradient palette ────────────────────────────────────────────────

export const CUISINE_GRADIENTS: Record<string, [string, string]> = {
  // Packaged / shelf categories
  'Baked Goods':        ['#d97706', '#92400e'],
  'Asian Sweets':       ['#f472b6', '#db2777'],
  'Jams & Preserves':   ['#fbbf24', '#f97316'],
  'Confections':        ['#c084fc', '#7c3aed'],
  'Dried & Packaged':   ['#6ee7b7', '#059669'],
  'Fermented':          ['#5eead4', '#0f766e'],
  'Noodles & Pantry':   ['#f87171', '#dc2626'],
  'Cookies & Biscuits': ['#bef264', '#65a30d'],
  // Cuisine / nationality categories
  'Chinese':            ['#dc2626', '#7f1d1d'],
  'Mexican':            ['#f97316', '#7c2d12'],
  'Italian':            ['#16a34a', '#14532d'],
  'Japanese':           ['#e11d48', '#881337'],
  'Indian':             ['#f59e0b', '#78350f'],
  'American':           ['#2563eb', '#1e3a8a'],
  'Vietnamese':         ['#dc2626', '#065f46'],
  'Thai':               ['#7c3aed', '#4c1d95'],
  'Korean':             ['#db2777', '#831843'],
  'Ethiopian':          ['#16a34a', '#1e3a5f'],
  'Greek':              ['#2563eb', '#1e40af'],
  'Lebanese':           ['#16a34a', '#4c1d1d'],
};

// ── Mock listings data (used when Supabase has no rows yet) ──────────────────

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const pickupStart = new Date(tomorrow);
pickupStart.setHours(12, 0, 0, 0);
const pickupEnd = new Date(tomorrow);
pickupEnd.setHours(18, 0, 0, 0);

export const MOCK_LISTINGS = [
  {
    listing: {
      id: '1', user_id: 'u1', title: 'Kung Pao Chicken', emoji: '🐔',
      description: 'Wok-fired chicken with dried chilies, peanuts, and a glossy soy-vinegar glaze. Numbing Sichuan peppercorns give it the classic mala kick. Serves well over steamed jasmine rice.',
      cuisine_tag: 'Chinese', allergens: ['peanuts', 'soy', 'sesame'],
      quantity_total: 6, quantity_left: 4, price_cents: 0,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: 'r1', made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u1', name: 'Mei Lin', avatar_url: null, rating_avg: 4.8, review_count: 32, top_cook_badge: true, city: 'San Francisco' },
    recipe: {
      id: 'r1', listing_id: '1', user_id: 'u1', title: 'Kung Pao Chicken',
      cook_time_mins: 25, servings: 4, is_public: true,
      ingredients: [
        { name: 'Chicken thigh', amount: '500', unit: 'g' },
        { name: 'Dried chilies', amount: '10', unit: 'pcs' },
        { name: 'Roasted peanuts', amount: '60', unit: 'g' },
        { name: 'Sichuan peppercorn', amount: '1', unit: 'tsp' },
        { name: 'Soy sauce', amount: '3', unit: 'tbsp' },
        { name: 'Shaoxing wine', amount: '2', unit: 'tbsp' },
        { name: 'Black vinegar', amount: '1', unit: 'tbsp' },
        { name: 'Sugar', amount: '1', unit: 'tsp' },
      ],
      steps: [
        { step_number: 1, instruction: 'Marinate chicken in soy sauce, Shaoxing wine, and cornstarch for 15 minutes.' },
        { step_number: 2, instruction: 'Heat oil in a wok until smoking. Stir-fry dried chilies and Sichuan peppercorn for 30 seconds.' },
        { step_number: 3, instruction: 'Add chicken and cook on high heat until golden, about 3–4 minutes.' },
        { step_number: 4, instruction: 'Add sauce mixture and toss. Fold in peanuts and scallions. Serve immediately.' },
      ],
      created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    reviews: [
      { id: 'rv1', stars_avg: 5, comment: 'Incredibly authentic! The Sichuan peppercorn numbs your mouth in the best way.', created_at: now.toISOString(), reviewer: { name: 'Jake W.' } },
      { id: 'rv2', stars_avg: 5, comment: 'Better than restaurant quality. Will order again!', created_at: now.toISOString(), reviewer: { name: 'Priya S.' } },
    ],
  },
  {
    listing: {
      id: '2', user_id: 'u2', title: 'Tacos al Pastor', emoji: '🌮',
      description: 'Slow-marinated pork shoulder with guajillo and achiote, piled into warm corn tortillas with charred pineapple, white onion, and cilantro. A street-taco classic from Mexico City.',
      cuisine_tag: 'Mexican', allergens: ['none'],
      quantity_total: 12, quantity_left: 8, price_cents: 599,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: 'r2', made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u2', name: 'Carlos Reyes', avatar_url: null, rating_avg: 4.9, review_count: 58, top_cook_badge: true, city: 'Los Angeles' },
    recipe: {
      id: 'r2', listing_id: '2', user_id: 'u2', title: 'Tacos al Pastor',
      cook_time_mins: 180, servings: 6, is_public: true,
      ingredients: [
        { name: 'Pork shoulder', amount: '1', unit: 'kg' },
        { name: 'Guajillo chilies', amount: '4', unit: 'pcs' },
        { name: 'Achiote paste', amount: '2', unit: 'tbsp' },
        { name: 'Pineapple', amount: '200', unit: 'g' },
        { name: 'Corn tortillas', amount: '12', unit: 'pcs' },
        { name: 'White onion', amount: '1', unit: 'medium' },
        { name: 'Cilantro', amount: '1', unit: 'bunch' },
      ],
      steps: [
        { step_number: 1, instruction: 'Blend guajillo (soaked), achiote, garlic, cumin, oregano, and orange juice into a marinade.' },
        { step_number: 2, instruction: 'Slice pork thin, marinate overnight or at least 4 hours.' },
        { step_number: 3, instruction: 'Cook on a hot griddle or grill until caramelized and slightly charred.' },
        { step_number: 4, instruction: 'Warm tortillas, top with pork, charred pineapple, onion, and cilantro.' },
      ],
      created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    reviews: [
      { id: 'rv3', stars_avg: 5, comment: 'Literally the best tacos I\'ve had outside Mexico. That pineapple hit!', created_at: now.toISOString(), reviewer: { name: 'Mei L.' } },
    ],
  },
  {
    listing: {
      id: '3', user_id: 'u3', title: 'Homemade Lasagna', emoji: '🫕',
      description: 'Classic Bolognese lasagna with slow-cooked beef ragù, house-made béchamel, and fresh pasta sheets. Baked until bubbling with a golden parmesan crust.',
      cuisine_tag: 'Italian', allergens: ['gluten', 'dairy', 'eggs'],
      quantity_total: 4, quantity_left: 2, price_cents: 899,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 40.7128, lng: -74.006, city: 'New York', state: 'NY',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: 'r3', made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u3', name: 'Sofia Marchetti', avatar_url: null, rating_avg: 4.7, review_count: 21, top_cook_badge: false, city: 'New York' },
    recipe: {
      id: 'r3', listing_id: '3', user_id: 'u3', title: 'Lasagna Bolognese',
      cook_time_mins: 120, servings: 4, is_public: true,
      ingredients: [
        { name: 'Ground beef', amount: '400', unit: 'g' },
        { name: 'Fresh pasta sheets', amount: '250', unit: 'g' },
        { name: 'Tomato passata', amount: '500', unit: 'ml' },
        { name: 'Whole milk', amount: '500', unit: 'ml' },
        { name: 'Butter', amount: '50', unit: 'g' },
        { name: 'Flour', amount: '50', unit: 'g' },
        { name: 'Parmesan', amount: '100', unit: 'g' },
      ],
      steps: [
        { step_number: 1, instruction: 'Brown beef with onion and garlic. Add passata and simmer 45 minutes.' },
        { step_number: 2, instruction: 'Make béchamel: melt butter, whisk in flour, slowly add milk, stir until thick.' },
        { step_number: 3, instruction: 'Layer pasta, ragù, béchamel, and parmesan. Repeat 3 times.' },
        { step_number: 4, instruction: 'Bake at 190°C / 375°F for 35 minutes until golden.' },
      ],
      created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    reviews: [
      { id: 'rv4', stars_avg: 5, comment: 'Reminded me of my nonna\'s cooking. Absolute comfort food.', created_at: now.toISOString(), reviewer: { name: 'Carlos R.' } },
    ],
  },
  {
    listing: {
      id: '4', user_id: 'u4', title: 'Tonkotsu Ramen', emoji: '🍜',
      description: 'Rich 18-hour pork bone broth with thin straight noodles, chashu pork belly, soft-boiled marinated egg, nori, and bamboo shoots. A bowl of pure umami.',
      cuisine_tag: 'Japanese', allergens: ['gluten', 'soy', 'eggs', 'sesame'],
      quantity_total: 6, quantity_left: 5, price_cents: 799,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 47.6062, lng: -122.3321, city: 'Seattle', state: 'WA',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: 'r4', made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u4', name: 'Kenji Tanaka', avatar_url: null, rating_avg: 4.9, review_count: 44, top_cook_badge: true, city: 'Seattle' },
    recipe: null,
    reviews: [
      { id: 'rv5', stars_avg: 5, comment: 'The broth is unreal — silky and deep. 10/10.', created_at: now.toISOString(), reviewer: { name: 'Hana G.' } },
    ],
  },
  {
    listing: {
      id: '5', user_id: 'u5', title: 'Butter Chicken', emoji: '🍛',
      description: 'Tender chicken thighs slow-cooked in a creamy tomato-cashew sauce with aromatic spices. Pairs perfectly with garlic naan or basmati rice. Mild-to-medium heat.',
      cuisine_tag: 'Indian', allergens: ['dairy', 'tree_nuts'],
      quantity_total: 8, quantity_left: 6, price_cents: 699,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u5', name: 'Priya Sharma', avatar_url: null, rating_avg: 4.6, review_count: 17, top_cook_badge: false, city: 'Chicago' },
    recipe: null,
    reviews: [],
  },
  {
    listing: {
      id: '6', user_id: 'u6', title: 'BBQ Brisket', emoji: '🥩',
      description: 'Texas-style beef brisket smoked low and slow over oak for 14 hours. Bark-crusted exterior, melt-in-your-mouth interior. Served with house pickles and white bread.',
      cuisine_tag: 'American', allergens: ['gluten'],
      quantity_total: 5, quantity_left: 3, price_cents: 1199,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 29.7604, lng: -95.3698, city: 'Houston', state: 'TX',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u6', name: 'Jake Williams', avatar_url: null, rating_avg: 4.8, review_count: 29, top_cook_badge: false, city: 'Houston' },
    recipe: null,
    reviews: [
      { id: 'rv6', stars_avg: 5, comment: 'Competition-level BBQ. That bark is everything.', created_at: now.toISOString(), reviewer: { name: 'Omar F.' } },
    ],
  },
  {
    listing: {
      id: '7', user_id: 'u7', title: 'Phở Bò', emoji: '🍵',
      description: 'Fragrant Vietnamese beef noodle soup with charred onion and ginger broth, rice noodles, rare beef slices, and a fresh herb plate (basil, bean sprouts, lime, jalapeño). Free to share.',
      cuisine_tag: 'Vietnamese', allergens: ['none'],
      quantity_total: 8, quantity_left: 7, price_cents: 0,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 45.5051, lng: -122.675, city: 'Portland', state: 'OR',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u7', name: 'Linh Nguyen', avatar_url: null, rating_avg: 4.9, review_count: 51, top_cook_badge: true, city: 'Portland' },
    recipe: null,
    reviews: [
      { id: 'rv7', stars_avg: 5, comment: 'The broth took my soul to Hanoi. Thank you Linh!', created_at: now.toISOString(), reviewer: { name: 'Jisu K.' } },
    ],
  },
  {
    listing: {
      id: '8', user_id: 'u8', title: 'Green Curry', emoji: '🥘',
      description: 'Thai green curry with coconut milk, eggplant, zucchini, and your choice of chicken or tofu. Made with homemade curry paste, lemongrass, kaffir lime, and galangal.',
      cuisine_tag: 'Thai', allergens: ['none'],
      quantity_total: 6, quantity_left: 4, price_cents: 649,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 25.7617, lng: -80.1918, city: 'Miami', state: 'FL',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u8', name: 'Nong Panyawong', avatar_url: null, rating_avg: 4.7, review_count: 23, top_cook_badge: false, city: 'Miami' },
    recipe: null,
    reviews: [],
  },
  {
    listing: {
      id: '9', user_id: 'u9', title: 'Kimchi Jjigae', emoji: '🍲',
      description: 'Deeply fermented kimchi stew with aged kimchi, pork belly, tofu, and mushrooms. The longer the kimchi ages the richer the stew — this batch uses 3-month kimchi. Free to neighbors!',
      cuisine_tag: 'Korean', allergens: ['soy'],
      quantity_total: 6, quantity_left: 5, price_cents: 0,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 47.6101, lng: -122.2015, city: 'Bellevue', state: 'WA',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u9', name: 'Jisu Kim', avatar_url: null, rating_avg: 4.8, review_count: 36, top_cook_badge: false, city: 'Bellevue' },
    recipe: null,
    reviews: [
      { id: 'rv8', stars_avg: 5, comment: 'So warming and rich. Exactly what I needed on a rainy Seattle day!', created_at: now.toISOString(), reviewer: { name: 'Kenji T.' } },
    ],
  },
  {
    listing: {
      id: '10', user_id: 'u10', title: 'Doro Wat', emoji: '🍗',
      description: 'Ethiopian spiced chicken stew simmered in berbere-spiced niter kibbeh (clarified butter) with hard-boiled eggs. Served with spongy injera flatbread for scooping.',
      cuisine_tag: 'Ethiopian', allergens: ['eggs', 'gluten'],
      quantity_total: 4, quantity_left: 2, price_cents: 749,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 38.9072, lng: -77.0369, city: 'Washington', state: 'DC',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u10', name: 'Hana Girma', avatar_url: null, rating_avg: 4.9, review_count: 42, top_cook_badge: true, city: 'Washington DC' },
    recipe: null,
    reviews: [
      { id: 'rv9', stars_avg: 5, comment: 'Incredible complexity of flavor. The injera made it perfect.', created_at: now.toISOString(), reviewer: { name: 'Sofia M.' } },
    ],
  },
  {
    listing: {
      id: '11', user_id: 'u11', title: 'Spanakopita', emoji: '🥧',
      description: 'Crispy layers of phyllo pastry filled with seasoned spinach, Greek feta, onions, dill, and egg. Cut into squares — perfect as a meal or mezze. A family recipe from Thessaloniki.',
      cuisine_tag: 'Greek', allergens: ['gluten', 'dairy', 'eggs'],
      quantity_total: 12, quantity_left: 9, price_cents: 499,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 41.85, lng: -87.65, city: 'Chicago', state: 'IL',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u11', name: 'Elena Vassilou', avatar_url: null, rating_avg: 4.6, review_count: 14, top_cook_badge: false, city: 'Chicago' },
    recipe: null,
    reviews: [],
  },
  {
    listing: {
      id: '12', user_id: 'u12', title: 'Lamb Kofta', emoji: '🍢',
      description: 'Spiced ground lamb skewers with parsley, onion, allspice, and cinnamon, grilled over charcoal. Served with creamy tahini sauce, pita, and a fresh tomato-cucumber salad.',
      cuisine_tag: 'Lebanese', allergens: ['sesame', 'gluten'],
      quantity_total: 6, quantity_left: 3, price_cents: 849,
      pickup_start: pickupStart.toISOString(), pickup_end: pickupEnd.toISOString(),
      photo_urls: [], lat: 25.78, lng: -80.21, city: 'Miami', state: 'FL',
      status: 'active' as const, report_count: 0, is_flagged: false,
      recipe_id: null, made_at: now.toISOString(), expires_at: tomorrow.toISOString(),
      video_url: null, created_at: now.toISOString(), updated_at: now.toISOString(),
    },
    cook: { id: 'u12', name: 'Omar Farhat', avatar_url: null, rating_avg: 4.8, review_count: 27, top_cook_badge: false, city: 'Miami' },
    recipe: null,
    reviews: [
      { id: 'rv10', stars_avg: 5, comment: 'The tahini sauce alone was worth it. Perfect spice blend.', created_at: now.toISOString(), reviewer: { name: 'Nong P.' } },
    ],
  },
] as const;
