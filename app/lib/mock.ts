// ── Types ────────────────────────────────────────────────────────────────────

export type Listing = {
  id: string;
  title: string;
  cuisine: string;
  cook: string;
  cookRating: number;
  cookReviews: number;
  cookCity: string;
  topCook: boolean;
  distance: string;
  portions: number;
  totalPortions: number;
  price: number; // cents
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

// ── Gradient palette (shared with feed) ──────────────────────────────────────

export const CUISINE_GRADIENTS: Record<string, [string, string]> = {
  Chinese:    ['#f87171', '#f97316'],
  Mexican:    ['#fb923c', '#eab308'],
  Italian:    ['#4ade80', '#16a34a'],
  Japanese:   ['#818cf8', '#3b82f6'],
  Indian:     ['#fbbf24', '#f97316'],
  American:   ['#94a3b8', '#475569'],
  Vietnamese: ['#86efac', '#22c55e'],
  Thai:       ['#c084fc', '#7c3aed'],
  Korean:     ['#f472b6', '#db2777'],
  Ethiopian:  ['#fb923c', '#b45309'],
  Greek:      ['#67e8f9', '#2563eb'],
  Lebanese:   ['#5eead4', '#0f766e'],
};

// ── 30 listings ───────────────────────────────────────────────────────────────

export const LISTINGS: Listing[] = [
  // ── Chinese ──
  {
    id: '1', title: 'Kung Pao Chicken', cuisine: 'Chinese',
    cook: 'Wei Zhang', cookRating: 4.8, cookReviews: 37, cookCity: 'San Francisco, CA', topCook: true,
    distance: '0.4 mi', portions: 4, totalPortions: 6, price: 900, emoji: '🥡',
    description: 'Classic Sichuan stir-fry with tender wok-tossed chicken, roasted peanuts, dried chilies, and Sichuan peppercorns. This three-generation family recipe balances numbing heat with a savory-sweet sauce.',
    allergens: ['peanuts', 'soy', 'gluten'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '2', title: 'Xiao Long Bao', cuisine: 'Chinese',
    cook: 'Mei Lin', cookRating: 4.9, cookReviews: 52, cookCity: 'New York, NY', topCook: true,
    distance: '0.8 mi', portions: 6, totalPortions: 8, price: 1200, emoji: '🥟',
    description: 'Hand-folded Shanghainese soup dumplings filled with seasoned pork and rich gelatinous broth. Each batch of 8 dumplings is made fresh the morning of pickup.',
    allergens: ['gluten', 'soy'],
    pickupStart: '2026-03-28T10:00', pickupEnd: '2026-03-28T13:00',
  },
  {
    id: '3', title: 'Mapo Tofu', cuisine: 'Chinese',
    cook: 'Chen Wei', cookRating: 4.7, cookReviews: 28, cookCity: 'Los Angeles, CA', topCook: false,
    distance: '1.2 mi', portions: 3, totalPortions: 5, price: 800, emoji: '🫕',
    description: 'Silken tofu and ground pork simmered in a deeply spiced sauce of doubanjiang, fermented black beans, and Sichuan peppercorns. Numbingly good.',
    allergens: ['soy', 'gluten'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  // ── Mexican ──
  {
    id: '4', title: 'Tacos al Pastor', cuisine: 'Mexican',
    cook: 'Maria Flores', cookRating: 4.9, cookReviews: 64, cookCity: 'Los Angeles, CA', topCook: true,
    distance: '0.6 mi', portions: 10, totalPortions: 12, price: 0, emoji: '🌮',
    description: 'Marinated pork shoulder slow-cooked with achiote, guajillo chiles, and pineapple. Served with handmade corn tortillas, cilantro, and salsa verde. Free exchange — no catch!',
    allergens: ['none'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
  {
    id: '5', title: 'Chicken Enchiladas', cuisine: 'Mexican',
    cook: 'Rosa Gutierrez', cookRating: 4.7, cookReviews: 31, cookCity: 'Austin, TX', topCook: false,
    distance: '1.0 mi', portions: 5, totalPortions: 6, price: 1000, emoji: '🫔',
    description: 'Rolled corn tortillas stuffed with shredded chicken, black beans, and Oaxacan cheese, smothered in homemade red mole sauce and baked until bubbly.',
    allergens: ['dairy', 'gluten'],
    pickupStart: '2026-03-28T11:30', pickupEnd: '2026-03-28T14:30',
  },
  {
    id: '6', title: 'Tamales de Pollo', cuisine: 'Mexican',
    cook: 'Carmen Vega', cookRating: 4.8, cookReviews: 44, cookCity: 'Houston, TX', topCook: true,
    distance: '1.8 mi', portions: 8, totalPortions: 10, price: 800, emoji: '🌽',
    description: 'Traditional masa tamales filled with spiced chicken and roasted salsa verde, wrapped in corn husks and slow-steamed. A family Christmas recipe made year-round.',
    allergens: ['none'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  // ── Italian ──
  {
    id: '7', title: 'Homemade Lasagna', cuisine: 'Italian',
    cook: 'Gianna Ricci', cookRating: 4.7, cookReviews: 29, cookCity: 'New York, NY', topCook: false,
    distance: '0.7 mi', portions: 2, totalPortions: 4, price: 1200, emoji: '🍝',
    description: 'Seven-layer lasagna with house-made Bolognese, béchamel, and aged Parmigiano-Reggiano. Rested overnight for full flavor development.',
    allergens: ['gluten', 'dairy', 'eggs'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '8', title: 'Truffle Risotto', cuisine: 'Italian',
    cook: 'Marco Bianchi', cookRating: 4.9, cookReviews: 55, cookCity: 'Chicago, IL', topCook: true,
    distance: '1.4 mi', portions: 3, totalPortions: 4, price: 1400, emoji: '🫘',
    description: 'Carnaroli rice slowly cooked with homemade chicken stock, white wine, shaved black truffle, and Pecorino Romano. Finished with cold butter for an ultra-creamy texture.',
    allergens: ['dairy'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '9', title: 'Pasta Carbonara', cuisine: 'Italian',
    cook: 'Sofia Romano', cookRating: 4.6, cookReviews: 22, cookCity: 'Boston, MA', topCook: false,
    distance: '0.9 mi', portions: 4, totalPortions: 5, price: 1100, emoji: '🍜',
    description: 'Authentic Roman carbonara — spaghetti with guanciale, egg yolks, Pecorino Romano, and black pepper. No cream, ever. Rich, silky, and perfected over years.',
    allergens: ['gluten', 'dairy', 'eggs'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
  // ── Japanese ──
  {
    id: '10', title: 'Tonkotsu Ramen', cuisine: 'Japanese',
    cook: 'Hana Nakamura', cookRating: 5.0, cookReviews: 81, cookCity: 'Seattle, WA', topCook: true,
    distance: '2.3 mi', portions: 5, totalPortions: 6, price: 1000, emoji: '🍜',
    description: 'Rich, milky pork bone broth simmered for 18 hours. Topped with chashu pork belly, soft-boiled marinated egg, bamboo shoots, and nori. The real deal.',
    allergens: ['gluten', 'soy', 'eggs'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '11', title: 'Chicken Karaage', cuisine: 'Japanese',
    cook: 'Yuki Tanaka', cookRating: 4.8, cookReviews: 40, cookCity: 'San Francisco, CA', topCook: false,
    distance: '0.5 mi', portions: 4, totalPortions: 6, price: 900, emoji: '🍗',
    description: 'Double-fried chicken thighs marinated in soy, ginger, and sake. Incredibly juicy inside, shatteringly crispy outside. Served with Japanese mayo and lemon.',
    allergens: ['soy', 'gluten'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '12', title: 'Salmon Sushi Platter', cuisine: 'Japanese',
    cook: 'Kenji Ito', cookRating: 4.9, cookReviews: 67, cookCity: 'New York, NY', topCook: true,
    distance: '1.1 mi', portions: 2, totalPortions: 3, price: 1500, emoji: '🍣',
    description: '12-piece nigiri and maki platter with sushi-grade salmon, tuna, and yellowtail. Rice seasoned with house-made vinegar blend. Includes pickled ginger and wasabi.',
    allergens: ['soy', 'sesame', 'shellfish'],
    pickupStart: '2026-03-28T10:00', pickupEnd: '2026-03-28T13:00',
  },
  // ── Indian ──
  {
    id: '13', title: 'Butter Chicken & Naan', cuisine: 'Indian',
    cook: 'Priya Sharma', cookRating: 4.6, cookReviews: 33, cookCity: 'Chicago, IL', topCook: false,
    distance: '0.9 mi', portions: 3, totalPortions: 8, price: 900, emoji: '🍛',
    description: 'Tender chicken in a velvety tomato-cream sauce with aromatic spices. Served with freshly baked garlic naan. My mother\'s recipe from Lucknow, made mild-to-medium spicy.',
    allergens: ['dairy', 'gluten'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '14', title: 'Lamb Biryani', cuisine: 'Indian',
    cook: 'Arjun Patel', cookRating: 4.8, cookReviews: 48, cookCity: 'Houston, TX', topCook: true,
    distance: '1.3 mi', portions: 4, totalPortions: 5, price: 1100, emoji: '🍚',
    description: 'Hyderabadi-style dum biryani with slow-cooked lamb, aged basmati rice, saffron, and fried onions. Sealed and cooked in its own steam for two hours.',
    allergens: ['dairy', 'tree_nuts'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '15', title: 'Dal Makhani', cuisine: 'Indian',
    cook: 'Ananya Krishnan', cookRating: 4.7, cookReviews: 26, cookCity: 'Washington, DC', topCook: false,
    distance: '0.7 mi', portions: 6, totalPortions: 8, price: 800, emoji: '🫕',
    description: 'Black lentils and kidney beans slow-cooked overnight with butter, cream, and whole spices. A restaurant classic made at home. Pairs perfectly with rice or roti.',
    allergens: ['dairy'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
  // ── American ──
  {
    id: '16', title: 'Slow-Smoked BBQ Brisket', cuisine: 'American',
    cook: 'James Carter', cookRating: 4.8, cookReviews: 59, cookCity: 'Austin, TX', topCook: true,
    distance: '1.5 mi', portions: 1, totalPortions: 3, price: 1500, emoji: '🥩',
    description: 'Central Texas-style brisket smoked low and slow over post oak for 14 hours. Salt and pepper only. Bark is mahogany, interior is juicy and pulls apart beautifully.',
    allergens: ['none'],
    pickupStart: '2026-03-28T14:00', pickupEnd: '2026-03-28T17:00',
  },
  {
    id: '17', title: 'New England Clam Chowder', cuisine: 'American',
    cook: 'Sarah Mitchell', cookRating: 4.7, cookReviews: 35, cookCity: 'Boston, MA', topCook: false,
    distance: '0.6 mi', portions: 5, totalPortions: 6, price: 800, emoji: '🍲',
    description: 'Thick, creamy chowder loaded with fresh clams, Yukon Gold potatoes, and smoky bacon. Made from scratch with a house-made clam stock. Served with oyster crackers.',
    allergens: ['dairy', 'shellfish', 'gluten'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '18', title: 'Fried Chicken & Waffles', cuisine: 'American',
    cook: 'Marcus Johnson', cookRating: 4.9, cookReviews: 72, cookCity: 'Atlanta, GA', topCook: true,
    distance: '1.0 mi', portions: 4, totalPortions: 5, price: 1000, emoji: '🧇',
    description: 'Buttermilk-brined, double-fried chicken on top of crispy Belgian waffles. Drizzled with hot honey and served with whipped maple butter. A Southern Sunday tradition.',
    allergens: ['gluten', 'dairy', 'eggs'],
    pickupStart: '2026-03-28T10:00', pickupEnd: '2026-03-28T13:00',
  },
  // ── Vietnamese ──
  {
    id: '19', title: 'Phở Bò', cuisine: 'Vietnamese',
    cook: 'Linh Nguyen', cookRating: 4.8, cookReviews: 43, cookCity: 'Portland, OR', topCook: false,
    distance: '0.8 mi', portions: 6, totalPortions: 7, price: 900, emoji: '🍜',
    description: 'Slow-simmered beef bone broth with charred ginger and onion, star anise, cloves, and cinnamon. Served with rice noodles, rare beef slices, and a full herb plate.',
    allergens: ['gluten', 'soy'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  {
    id: '20', title: 'Bánh Mì Thịt Nướng', cuisine: 'Vietnamese',
    cook: 'An Tran', cookRating: 4.7, cookReviews: 19, cookCity: 'Seattle, WA', topCook: false,
    distance: '1.2 mi', portions: 8, totalPortions: 10, price: 0, emoji: '🥖',
    description: 'Crispy French baguette stuffed with lemongrass grilled pork, house pickled daikon and carrot, jalapeños, cilantro, and housemade sriracha mayo. Free this week!',
    allergens: ['gluten', 'soy'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  // ── Thai ──
  {
    id: '21', title: 'Green Curry & Jasmine Rice', cuisine: 'Thai',
    cook: 'Nong Saesow', cookRating: 4.9, cookReviews: 57, cookCity: 'Miami, FL', topCook: true,
    distance: '0.9 mi', portions: 5, totalPortions: 6, price: 900, emoji: '🍛',
    description: 'Fragrant green curry with chicken, Thai eggplant, and bamboo shoots in coconut milk. House-ground curry paste with fresh galangal and kaffir lime leaves.',
    allergens: ['shellfish'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '22', title: 'Pad Thai', cuisine: 'Thai',
    cook: 'Pim Charoenwong', cookRating: 4.7, cookReviews: 38, cookCity: 'Los Angeles, CA', topCook: false,
    distance: '1.6 mi', portions: 7, totalPortions: 8, price: 800, emoji: '🍝',
    description: 'Wok-tossed rice noodles with shrimp, tofu, egg, and bean sprouts in a tamarind-palm sugar sauce. Topped with crushed peanuts, lime, and dried chili.',
    allergens: ['peanuts', 'shellfish', 'eggs', 'soy'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
  // ── Korean ──
  {
    id: '23', title: 'Kimchi Jjigae', cuisine: 'Korean',
    cook: 'Jisoo Park', cookRating: 4.8, cookReviews: 41, cookCity: 'Seattle, WA', topCook: false,
    distance: '0.5 mi', portions: 4, totalPortions: 6, price: 800, emoji: '🫕',
    description: 'Deeply savory kimchi stew with well-fermented kimchi, tender pork belly, silken tofu, and green onions. Simmered low and slow for maximum umami depth.',
    allergens: ['soy', 'shellfish'],
    pickupStart: '2026-03-28T11:30', pickupEnd: '2026-03-28T14:30',
  },
  {
    id: '24', title: 'LA Galbi (Short Ribs)', cuisine: 'Korean',
    cook: 'Min-jun Lee', cookRating: 5.0, cookReviews: 93, cookCity: 'New York, NY', topCook: true,
    distance: '1.9 mi', portions: 3, totalPortions: 4, price: 1600, emoji: '🥩',
    description: 'Flanken-cut beef short ribs marinated for 24 hours in Asian pear, soy, garlic, and sesame oil. Grilled over charcoal until caramelized and smoky.',
    allergens: ['soy', 'sesame', 'tree_nuts'],
    pickupStart: '2026-03-28T14:00', pickupEnd: '2026-03-28T17:00',
  },
  {
    id: '25', title: 'Bibimbap', cuisine: 'Korean',
    cook: 'Soyeon Kim', cookRating: 4.6, cookReviews: 27, cookCity: 'San Francisco, CA', topCook: false,
    distance: '0.7 mi', portions: 5, totalPortions: 6, price: 900, emoji: '🍱',
    description: 'Stone bowl rice topped with seasoned vegetables, bulgogi beef, fried egg, and house-made gochujang. Served in a hot dolsot for the crispy bottom crust.',
    allergens: ['soy', 'sesame', 'eggs'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  // ── Ethiopian ──
  {
    id: '26', title: 'Doro Wat with Injera', cuisine: 'Ethiopian',
    cook: 'Tigist Haile', cookRating: 4.9, cookReviews: 50, cookCity: 'Washington, DC', topCook: true,
    distance: '1.1 mi', portions: 4, totalPortions: 6, price: 0, emoji: '🫓',
    description: 'National dish of Ethiopia — slow-cooked chicken in a fiery berbere and niter kibbeh sauce with hard-boiled eggs. Served on sour injera flatbread. Free this week to share culture.',
    allergens: ['eggs', 'gluten'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '27', title: 'Tibs & Injera Platter', cuisine: 'Ethiopian',
    cook: 'Almaz Kebede', cookRating: 4.8, cookReviews: 36, cookCity: 'Minneapolis, MN', topCook: false,
    distance: '2.0 mi', portions: 3, totalPortions: 4, price: 1000, emoji: '🥘',
    description: 'Sautéed lamb tibs with jalapeños, rosemary, and onions, plus three vegetable sides (misir, gomen, and fosolia) on fresh injera. A full Ethiopian feast.',
    allergens: ['gluten'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
  // ── Greek ──
  {
    id: '28', title: 'Spanakopita', cuisine: 'Greek',
    cook: 'Elena Papadopoulos', cookRating: 4.7, cookReviews: 31, cookCity: 'Chicago, IL', topCook: false,
    distance: '0.8 mi', portions: 6, totalPortions: 8, price: 800, emoji: '🥬',
    description: 'Flaky phyllo triangles filled with spinach, feta, and herbs. Brushed with olive oil and baked until golden. My yiayia\'s recipe from Thessaloniki.',
    allergens: ['gluten', 'dairy', 'eggs'],
    pickupStart: '2026-03-28T11:00', pickupEnd: '2026-03-28T14:00',
  },
  // ── Lebanese ──
  {
    id: '29', title: 'Lamb Kofta & Hummus', cuisine: 'Lebanese',
    cook: 'Layla Khalil', cookRating: 4.9, cookReviews: 62, cookCity: 'Miami, FL', topCook: true,
    distance: '1.3 mi', portions: 4, totalPortions: 5, price: 1200, emoji: '🫕',
    description: 'Grilled ground lamb kofta spiced with allspice, cinnamon, and pine nuts, served over silky house-made hummus and warm pita. Finished with pomegranate molasses.',
    allergens: ['gluten', 'sesame', 'tree_nuts'],
    pickupStart: '2026-03-28T12:00', pickupEnd: '2026-03-28T15:00',
  },
  {
    id: '30', title: 'Kibbeh Platter', cuisine: 'Lebanese',
    cook: 'Omar Nassar', cookRating: 4.8, cookReviews: 44, cookCity: 'Denver, CO', topCook: false,
    distance: '1.7 mi', portions: 5, totalPortions: 6, price: 1000, emoji: '🧆',
    description: 'Baked kibbeh — a shell of bulgur wheat and lamb encasing a savory filling of spiced ground beef, onions, and pine nuts. Served with yogurt sauce and fattoush.',
    allergens: ['gluten', 'tree_nuts'],
    pickupStart: '2026-03-28T13:00', pickupEnd: '2026-03-28T16:00',
  },
];

// ── Recipe templates by cuisine ───────────────────────────────────────────────

const RECIPES: Record<string, Recipe> = {
  Chinese: {
    cookTimeMins: 25, servings: 2,
    ingredients: ['450g boneless chicken thigh, cubed','½ cup roasted peanuts','8 dried red chilies','1 tsp Sichuan peppercorns','3 cloves garlic, minced','1 tbsp fresh ginger','2 tbsp soy sauce','1 tbsp dark soy sauce','1 tbsp Shaoxing wine','1 tsp cornstarch','1 tbsp doubanjiang','1 tsp sesame oil','1 tsp sugar'],
    steps: ['Marinate chicken in soy sauce, Shaoxing wine, and cornstarch for 15 minutes.','Mix sauce: combine dark soy, doubanjiang, sugar, and sesame oil.','Heat wok until smoking. Fry chilies and Sichuan peppercorns 30 seconds.','Add chicken, sear undisturbed 90 seconds, then toss until golden.','Push chicken aside; stir-fry garlic and ginger 30 seconds.','Pour in sauce and toss to coat everything evenly.','Add peanuts and scallions. Stir-fry 60 seconds over high heat.','Plate and serve with steamed jasmine rice.'],
  },
  Mexican: {
    cookTimeMins: 40, servings: 4,
    ingredients: ['600g pork shoulder, thin-sliced','2 tbsp achiote paste','3 guajillo chilies, toasted','1 chipotle in adobo','4 cloves garlic','½ cup pineapple juice','2 tbsp apple cider vinegar','1 tsp cumin','1 tsp oregano','Salt to taste','Corn tortillas to serve','Fresh cilantro and white onion'],
    steps: ['Blend achiote, guajillo, chipotle, garlic, pineapple juice, vinegar, and spices into a smooth marinade.','Coat pork slices in marinade and refrigerate at least 2 hours, ideally overnight.','Stack pork slices and roast at 425°F for 30 minutes until caramelized.','Rest 5 minutes, then slice thinly against the grain.','Warm tortillas on a dry comal until lightly charred.','Fill tortillas with pork, pineapple chunks, cilantro, and onion.','Serve with salsa verde and lime wedges.'],
  },
  Italian: {
    cookTimeMins: 90, servings: 4,
    ingredients: ['400g fresh lasagna sheets','500g beef and pork Bolognese','500ml béchamel sauce','200g aged Parmigiano-Reggiano, grated','1 cup whole milk mozzarella','2 tbsp unsalted butter','Nutmeg to taste','Salt and black pepper'],
    steps: ['Prepare Bolognese: brown mixed mince with soffritto, add wine, tomatoes, and simmer 2 hours.','Make béchamel: melt butter, whisk in flour, add warm milk gradually, season with nutmeg.','Blanch lasagna sheets 1 minute in salted water; lay flat on oiled surface.','Layer: béchamel → pasta → Bolognese → Parmigiano. Repeat 6 times.','Top layer: béchamel, mozzarella, and a generous shower of Parmigiano.','Cover with foil and bake at 375°F for 40 minutes. Uncover last 15 minutes.','Rest 20 minutes before cutting — this is non-negotiable.','Serve with crusty bread and a simple green salad.'],
  },
  Japanese: {
    cookTimeMins: 30, servings: 2,
    ingredients: ['500g pork bones (neck and feet)','200g chashu pork belly','2 soft-boiled marinated eggs','200g fresh ramen noodles','2 sheets nori','Bamboo shoots (menma)','2 tbsp tare (soy-mirin seasoning)','Green onions to garnish'],
    steps: ['Blanch pork bones in boiling water 5 minutes; rinse thoroughly.','Simmer cleaned bones in fresh water 12–18 hours until broth is milky white.','Season broth with tare to taste.','Roll and tie pork belly; braise in soy, mirin, sake 3 hours.','Soft-boil eggs 6½ minutes; marinate overnight in soy-mirin mixture.','Cook ramen noodles per package, drain, and portion into bowls.','Ladle boiling broth over noodles.','Top with sliced chashu, halved egg, nori, bamboo shoots, and green onions.'],
  },
  Indian: {
    cookTimeMins: 45, servings: 3,
    ingredients: ['700g chicken thighs, boneless','1 cup tomato purée','½ cup heavy cream','3 tbsp butter','1 tbsp ginger-garlic paste','1 tsp garam masala','1 tsp cumin','1 tsp coriander','½ tsp turmeric','1 tsp kashmiri chili powder','Salt to taste','Fresh cilantro to garnish'],
    steps: ['Marinate chicken in yogurt, ginger-garlic paste, and spices for 30 minutes.','Grill or broil chicken until slightly charred. Set aside.','Melt butter; sauté onions until golden. Add ginger-garlic paste.','Add tomato purée and cook until oil separates, ~10 minutes.','Blend sauce smooth. Return to pan, add spices, simmer 5 minutes.','Add cream and charred chicken. Simmer 10 minutes.','Finish with kasuri methi and a knob of cold butter.','Serve with garlic naan or basmati rice.'],
  },
  American: {
    cookTimeMins: 840, servings: 6,
    ingredients: ['3 kg beef brisket (point and flat)','3 tbsp kosher salt','2 tbsp coarse black pepper','Post oak or hickory wood chunks','Optional: 1 tsp garlic powder'],
    steps: ['Trim brisket to ¼-inch fat cap. Do not over-trim.','Season generously with salt and pepper only. Rest at room temp 1 hour.','Set smoker to 225°F with post oak. Maintain consistent temperature.','Smoke fat-side up for 6 hours, spritzing with apple cider vinegar every 2 hours.','Wrap in butcher paper (Texas crutch). Return to smoker.','Continue smoking 6–8 hours until internal temp reaches 203°F.','Rest wrapped brisket in a cooler for 1–2 hours. This step is critical.','Slice against the grain ¼-inch thick. Bark should be dark and crusty.'],
  },
  Vietnamese: {
    cookTimeMins: 360, servings: 4,
    ingredients: ['1 kg beef marrow bones and oxtail','200g rice noodles (bánh phở)','300g beef sirloin, thin-sliced','1 onion, charred','4-inch ginger knob, charred','3 star anise','4 cloves','1 cinnamon stick','Fish sauce to taste','Bean sprouts, Thai basil, lime to serve'],
    steps: ['Char onion and ginger directly over flame until blackened. Rinse.','Blanch bones in boiling water 5 minutes; discard water, rinse bones.','Add bones to fresh water with charred aromatics. Simmer 6 hours, skimming regularly.','Toast star anise, cloves, and cinnamon in dry pan; add to broth last 30 minutes.','Season with fish sauce and rock sugar. Strain broth, keep hot.','Soak rice noodles per package; divide into bowls.','Lay raw sirloin slices over noodles; ladle boiling broth over (it cooks the beef).','Serve with a plate of bean sprouts, Thai basil, lime, and hoisin/sriracha.'],
  },
  Thai: {
    cookTimeMins: 30, servings: 3,
    ingredients: ['400g chicken thigh, cut into chunks','400ml full-fat coconut milk','3 tbsp green curry paste','200g Thai eggplant, quartered','100g bamboo shoots','4 kaffir lime leaves','2 tbsp fish sauce','1 tsp palm sugar','Fresh Thai basil','Jasmine rice to serve'],
    steps: ['Heat 4 tbsp coconut cream in wok until it splits and sizzles.','Fry curry paste in cream 2 minutes until fragrant.','Add chicken; stir-fry until outside turns white, ~3 minutes.','Pour in remaining coconut milk. Bring to a gentle simmer.','Add eggplant and bamboo shoots. Cook 5 minutes until tender.','Season with fish sauce and palm sugar. Adjust to taste.','Tear in kaffir lime leaves and Thai basil off heat.','Serve over jasmine rice.'],
  },
  Korean: {
    cookTimeMins: 35, servings: 2,
    ingredients: ['300g well-fermented kimchi, chopped','200g pork belly, sliced','1 block soft tofu, cubed','1 cup kimchi brine','2 cups anchovy-kelp stock','1 tbsp gochugaru','1 tbsp soy sauce','1 tsp sesame oil','Green onions and tofu to garnish'],
    steps: ['Sauté pork belly in a clay pot or heavy pot until fat renders and edges crisp.','Add kimchi and stir-fry with pork 3 minutes.','Add kimchi brine, stock, and gochugaru. Bring to boil.','Reduce heat; simmer 20 minutes until kimchi is silky and broth is deep red.','Add tofu cubes gently. Simmer 5 more minutes without stirring.','Season with soy sauce; finish with sesame oil.','Scatter green onions on top. Serve boiling hot.','Eat with steamed rice and banchan.'],
  },
  Ethiopian: {
    cookTimeMins: 120, servings: 4,
    ingredients: ['1 whole chicken, cut into pieces','4 hard-boiled eggs, pricked','2 cups red onion, very finely chopped','3 tbsp niter kibbeh (spiced butter)','3 tbsp berbere spice blend','1 cup red wine or tej','4 cloves garlic','1 tbsp fresh ginger','Salt to taste','Injera flatbread to serve'],
    steps: ['Caramelize onions in dry pot over medium heat 20 minutes until jammy. No oil.','Add niter kibbeh and berbere; cook 5 minutes until fragrant.','Add garlic and ginger; stir 2 minutes.','Add chicken pieces; turn to coat in sauce.','Pour in wine; bring to simmer. Cover and cook 45 minutes.','Add hard-boiled eggs (prick them so sauce penetrates). Cook 15 more minutes.','Sauce should be thick and glossy. Adjust salt.','Serve on injera with eggs halved on top.'],
  },
  Greek: {
    cookTimeMins: 60, servings: 6,
    ingredients: ['500g fresh spinach, wilted and squeezed','300g feta cheese, crumbled','2 eggs','1 onion, finely diced','3 cloves garlic','2 tbsp fresh dill','Fresh mint leaves','16 sheets phyllo dough','½ cup olive oil','Black pepper to taste'],
    steps: ['Wilt spinach, squeeze thoroughly dry, and chop roughly.','Mix spinach with crumbled feta, eggs, onion, garlic, dill, and mint. Season.','Brush baking dish with olive oil. Layer 8 phyllo sheets, brushing each with oil.','Spread filling evenly. Layer remaining 8 sheets on top, brushing each.','Score top into triangles with a sharp knife. Brush surface with egg wash.','Bake at 375°F for 40–45 minutes until deeply golden.','Rest 15 minutes before cutting through score lines.','Serve warm or at room temperature.'],
  },
  Lebanese: {
    cookTimeMins: 30, servings: 4,
    ingredients: ['500g ground lamb','1 onion, very finely grated','2 tbsp parsley, minced','1 tsp allspice','½ tsp cinnamon','¼ tsp nutmeg','½ cup pine nuts, toasted','400g chickpeas, cooked','4 tbsp tahini','2 tbsp lemon juice','2 cloves garlic','Warm pita to serve'],
    steps: ['Mix lamb with grated onion, parsley, allspice, cinnamon, nutmeg, and salt.','Knead mixture 3 minutes until cohesive. Rest 30 minutes in fridge.','Shape onto flat metal skewers in elongated ovals. Flatten slightly.','Grill over high heat 3–4 minutes per side until charred and cooked through.','Make hummus: blend chickpeas, tahini, lemon, garlic until ultra-smooth. Season.','Swipe hummus across a plate in a circular motion.','Lay kofta on hummus. Scatter pine nuts and paprika oil.','Serve with warm pita, sliced tomato, and pickled turnips.'],
  },
};

export function getRecipe(cuisine: string): Recipe {
  return RECIPES[cuisine] ?? RECIPES['American'];
}

// ── Review pool ───────────────────────────────────────────────────────────────

const REVIEW_POOL: Review[][] = [
  [
    { id:'r1', reviewer:'Priya S.',    stars:5, comment:'Absolutely incredible. Every bite was perfectly balanced. Will definitely request again!',              date:'Mar 22, 2026' },
    { id:'r2', reviewer:'James T.',   stars:5, comment:'Generous portion, beautifully packaged. The flavor was restaurant-quality.',                             date:'Mar 15, 2026' },
    { id:'r3', reviewer:'Hana N.',    stars:4, comment:'Really delicious — slightly spicier than expected but my whole family loved it.',                         date:'Mar 10, 2026' },
  ],
  [
    { id:'r1', reviewer:'Marco B.',   stars:5, comment:'Best homemade food I\'ve had in years. The technique and seasoning were flawless.',                        date:'Mar 20, 2026' },
    { id:'r2', reviewer:'Linh T.',    stars:5, comment:'Fresh, authentic, and so much better than any restaurant nearby. Thank you!',                             date:'Mar 14, 2026' },
    { id:'r3', reviewer:'Sofia R.',   stars:4, comment:'Great portion size and the packaging kept everything warm. Definitely ordering again.',                    date:'Mar 8, 2026'  },
  ],
  [
    { id:'r1', reviewer:'Aisha K.',   stars:5, comment:'The depth of flavor was unreal. You could taste the care that went into every step.',                     date:'Mar 19, 2026' },
    { id:'r2', reviewer:'Carlos M.',  stars:4, comment:'Very tasty and authentic. Pickup was smooth and the cook was super friendly.',                             date:'Mar 12, 2026' },
    { id:'r3', reviewer:'Yuki I.',    stars:5, comment:'Exceeded expectations — the texture and spicing were spot on. I\'m already planning my next order.',       date:'Mar 5, 2026'  },
  ],
];

export function getReviews(id: string): Review[] {
  return REVIEW_POOL[parseInt(id) % REVIEW_POOL.length];
}

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}
