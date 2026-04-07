/**
 * scripts/seed-policies.ts
 *
 * Seeds policy_chunks table with California Cottage Food Law and FDA allergen rules.
 * Run once (or re-run after schema changes):
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... VOYAGE_API_KEY=... \
 *   npx tsx scripts/seed-policies.ts
 */

import { createClient } from '@supabase/supabase-js';

// ── Raw policy documents ──────────────────────────────────────────────────────
// Each entry becomes one row in policy_chunks.

const POLICIES: { source: string; title: string; chunk_text: string }[] = [
  // ── California AB 1616 (Cottage Food Law) ──────────────────────────────────
  {
    source: 'CA_AB1616',
    title: 'Allowed Cottage Food Products',
    chunk_text: `California AB 1616 (Cottage Food Law) permits the following non-potentially-hazardous foods to be made and sold from a private home kitchen:
- Baked goods that do not require refrigeration (breads, cakes, cookies, brownies, pastries without cream or custard fillings)
- Candy and confections (fudge, toffee, brittle, truffles)
- Chocolate-covered nonperishable foods
- Jams, jellies, preserves, and fruit butters (pH 4.6 or lower)
- Fruit pies (not custard or cream pies)
- Granola, trail mix, and cereal
- Roasted nuts and nut mixes
- Dried herbs, herb blends, and seasonings
- Dried pasta (without egg, or shelf-stable dried egg pasta)
- Honey and bee products
- Vinegar and mustard
- Popcorn and popcorn balls
- Roasted coffee beans (unbrewed)
- Tea blends (dried, not fresh)
- Waffle cones and pizzelles`,
  },
  {
    source: 'CA_AB1616',
    title: 'Prohibited Cottage Food Products',
    chunk_text: `The following foods are NOT permitted under California AB 1616 Cottage Food Law and cannot be made or sold from a home kitchen:
- Any food requiring refrigeration for safety
- Meat, poultry, or seafood products
- Fresh pasta containing raw eggs
- Custard-filled or cream-filled pastries (eclairs, cream puffs, boston cream pie)
- Cheesecake or dairy-based desserts requiring refrigeration
- Canned or pickled vegetables with a pH above 4.6
- Foods containing raw sprouts
- Alcoholic beverages
- Hot prepared foods sold for immediate consumption
- Juices or dairy products
- Fermented foods not listed (e.g. kimchi, kombucha require separate permits)
- Products containing cannabis or CBD`,
  },
  {
    source: 'CA_AB1616',
    title: 'Class A vs Class B Operations',
    chunk_text: `California Cottage Food Operations are classified as Class A or Class B:

Class A (direct sales only):
- Sell directly to consumers from home or at community events, farmers markets, bake sales
- Annual gross sales cap: $75,000
- No permit required, but county registration may be needed
- No home inspection required

Class B (direct + indirect sales):
- Can sell through third-party retailers, restaurants, or delivery platforms
- Annual gross sales cap: $75,000
- Requires a county health permit and a home inspection
- Must comply with labeling requirements

HomePlate is considered an indirect sales channel, so sellers must hold a valid Class B permit to list food for sale through the platform.`,
  },
  {
    source: 'CA_AB1616',
    title: 'Labeling Requirements',
    chunk_text: `All cottage food products sold in California must be labeled with:
1. Name of the product
2. Name and address of the cottage food operation
3. Date the product was made
4. Net weight or volume
5. A complete list of ingredients in descending order by weight
6. All major food allergens (as defined by federal law)
7. The following statement in 12-point or larger font:
   "MADE IN A HOME KITCHEN THAT IS NOT INSPECTED BY THE STATE OR LOCAL HEALTH DEPARTMENT"

Labels must be legible and clearly affixed to the product packaging. Electronic labels are not permitted for in-person sales.`,
  },
  {
    source: 'CA_AB1616',
    title: 'Food Handler Requirements',
    chunk_text: `California Cottage Food operators must:
- Complete a food handler course approved by the California Department of Public Health (CDPH)
- Obtain a food handler card or food safety manager certification
- Renew certification as required by CDPH

The primary food handler at the cottage food operation must hold a valid certification. Food handler courses cover safe food temperatures, cross-contamination prevention, personal hygiene, and proper storage.`,
  },
  // ── California SB 1591 ──────────────────────────────────────────────────────
  {
    source: 'CA_SB1591',
    title: 'SB 1591 — Microenterprise Home Kitchen Operations',
    chunk_text: `California SB 1591 (signed 2018) created the Microenterprise Home Kitchen (MEHKO) permit, separate from the Cottage Food Law:

- Allows cooking of a wider variety of foods including hot meals, refrigerated items, and meat-based dishes
- Requires a county-issued MEHKO permit (not all counties have opted in)
- Must pass a home kitchen inspection by the county environmental health department
- Limited to 30 meals per day and 60 meals per week
- Annual gross revenue cap: $50,000
- Food must be sold directly to consumers (no third-party retail)
- Cook must hold a valid food safety manager certification (e.g. ServSafe)

MEHKO is distinct from Cottage Food: it allows hot food and refrigerated items that Cottage Food prohibits, but has stricter inspections and lower volume limits.`,
  },
  // ── FDA Major Allergens ────────────────────────────────────────────────────
  {
    source: 'FDA_ALLERGEN',
    title: 'FDA Major Food Allergens (FALCPA + FASTER Act)',
    chunk_text: `Under the Food Allergen Labeling and Consumer Protection Act (FALCPA) and the FASTER Act of 2021, the following 9 ingredients are designated as Major Food Allergens and must be declared on all food labels:

1. Milk (including all dairy: butter, cheese, cream, whey, casein)
2. Eggs
3. Fish (e.g. bass, flounder, cod)
4. Shellfish (e.g. crab, lobster, shrimp, oysters, clams)
5. Tree nuts (e.g. almonds, cashews, walnuts, pecans, pistachios, macadamia, brazil nuts, hazelnuts)
6. Peanuts (legume, must be declared separately from tree nuts)
7. Wheat (and any wheat-containing grains: spelt, kamut, farro — note: gluten-free oats are allowed if no cross-contamination)
8. Soybeans (soy, edamame, miso, tofu, tempeh)
9. Sesame (sesame seeds, tahini, sesame oil — added by FASTER Act, effective January 1, 2023)

Cross-contact: Even trace amounts of an allergen can cause a severe reaction. Sellers must disclose if their kitchen also handles any of the 9 major allergens, even if not present in the recipe.`,
  },
  {
    source: 'FDA_ALLERGEN',
    title: 'Common Allergen-Containing Ingredients',
    chunk_text: `Hidden allergen sources that sellers frequently overlook:

MILK: butter, ghee, cream, half-and-half, sour cream, yogurt, cheese (all types), whey protein, casein, lactalbumin, lactose, milk powder
EGGS: egg wash, mayonnaise, meringue, lecithin (if egg-derived), albumin
WHEAT/GLUTEN: all-purpose flour, bread flour, cake flour, wheat starch, semolina, durum, spelt, einkorn, malt, barley, rye, triticale
TREE NUTS: marzipan (almond), Nutella (hazelnut), praline, pesto (pine nuts), coconut (classified as tree nut by FDA)
PEANUTS: peanut oil, ground nuts, beer nuts, mixed nuts
SOY: soy lecithin, tofu, miso, edamame, tempeh, soy sauce, teriyaki sauce
SESAME: tahini, halva, hummus, sesame oil, til/gingelly oil, sesame flour
SHELLFISH: shrimp paste, oyster sauce, fish sauce (may contain shellfish)
FISH: worcestershire sauce (anchovies), caesar dressing, some Asian fish sauces

Asian baking ingredients to watch: matcha (safe), ube (safe), taro (safe), mochi (check for wheat starch), red bean paste (usually safe but check for wheat thickeners), pandan (safe).`,
  },
  {
    source: 'FDA_ALLERGEN',
    title: 'Allergen Disclosure Best Practices for Home Cooks',
    chunk_text: `Best practices for allergen disclosure in cottage food operations:

1. List every ingredient — even minor ones like vanilla extract (may contain alcohol) or food coloring
2. Cross-contact warning: If your kitchen handles peanuts, tree nuts, wheat, dairy, eggs, soy, shellfish, fish, or sesame in other dishes, include a "made in a facility that also processes X" statement
3. Use plain language: say "milk" not just "lactose" or "casein"
4. Update labels whenever a recipe changes
5. Never assume an ingredient is allergen-free without checking the manufacturer's label
6. Coconut: The FDA classifies coconut as a tree nut; always disclose if coconut is used
7. Natural flavors: Declare the source if derived from a major allergen (e.g. "natural flavor (milk)")
8. Chocolate: Most chocolate contains milk (check for dairy-free / vegan certified labels)
9. Shared equipment: Cross-contact risk must be disclosed even if allergen is not an ingredient`,
  },
  // ── California Health & Safety Code ───────────────────────────────────────
  {
    source: 'CA_HSC',
    title: 'Food Temperature Safety (California Health & Safety Code)',
    chunk_text: `California Health & Safety Code Section 113996 defines Potentially Hazardous Food (PHF) as any food that requires temperature control for safety:

Temperature Danger Zone: 41°F – 135°F (5°C – 57°C)
- Cold foods must be held at or below 41°F (5°C)
- Hot foods must be held at or above 135°F (57°C)

Cottage food products must be non-potentially-hazardous, meaning they are safe at room temperature without refrigeration. Prohibited PHF examples:
- Custards and pastry creams (contain eggs + dairy)
- Cheesecake (contains soft cheese + eggs)
- Cream-filled doughnuts or eclairs
- Meringue pies (lemon meringue: the curd contains egg yolk)
- Fresh fruit tarts with pastry cream

Safe alternatives:
- Fruit pies (no custard) with fruit filling: allowed
- Glazed or frosted cakes using shelf-stable fondant or royal icing: allowed
- Ganache-topped items (ganache with high chocolate:cream ratio, shelf-stable): check ratio
- Cookies, brownies, and bar cookies: allowed`,
  },
  {
    source: 'CA_HSC',
    title: 'Restricted Ingredients for Cottage Food',
    chunk_text: `Ingredients that trigger compliance concerns for California Cottage Food Operations:

ABSOLUTELY PROHIBITED (makes food a PHF):
- Raw or lightly cooked eggs used as a filling or frosting ingredient (e.g. Italian meringue buttercream with uncooked egg whites)
- Fresh soft cheeses (ricotta, mascarpone, cream cheese in fillings)
- Raw milk or unpasteurized dairy
- Meat, poultry, fish, or shellfish

REQUIRES CAUTION (allowed if properly formulated):
- Butter: allowed in baked goods (solid fat, shelf-stable); not allowed as a cream filling
- Cream cheese: allowed only in non-refrigerated shelf-stable contexts (rare) — usually makes product a PHF
- Eggs: allowed in baked goods where the egg is fully cooked into the matrix; not allowed as uncooked filling
- Chocolate ganache: allowed if ratio ensures shelf stability (generally 2:1 chocolate:cream or higher)
- Fruit fillings: allowed if acidic (pH ≤ 4.6) or fully baked

COMMONLY MISCLASSIFIED:
- Macarons: shells are cottage-food safe; but if filled with buttercream containing raw egg, the filled macaron may not be
- Tiramisu: contains mascarpone + raw egg yolk — NOT allowed
- No-bake cheesecake: contains cream cheese + dairy — NOT allowed`,
  },
];

// ── Embedding + insert ────────────────────────────────────────────────────────

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: [text], model: 'voyage-3' }),
  });
  if (!res.ok) throw new Error(`Voyage error ${res.status}: ${await res.text()}`);
  const json = await res.json() as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const voyageKey = process.env.VOYAGE_API_KEY;

  if (!supabaseUrl || !serviceKey || !voyageKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log(`Seeding ${POLICIES.length} policy chunks…\n`);

  for (const [i, policy] of POLICIES.entries()) {
    process.stdout.write(`[${i + 1}/${POLICIES.length}] ${policy.source} — ${policy.title} … `);

    const embedding = await getEmbedding(policy.chunk_text);

    const { error } = await supabase.from('policy_chunks').insert({
      source: policy.source,
      title: policy.title,
      chunk_text: policy.chunk_text,
      embedding,
    });

    if (error) {
      console.error(`FAILED: ${error.message}`);
    } else {
      console.log('OK');
    }

    // Rate limit: Voyage free tier allows ~100 req/min
    if (i < POLICIES.length - 1) await new Promise(r => setTimeout(r, 700));
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
