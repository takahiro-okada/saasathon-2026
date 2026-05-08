import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ymicgemwmmaqbtgvftpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWNnZW13bW1hcWJ0Z3ZmdHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzIzOTYsImV4cCI6MjA5MzgwODM5Nn0.DtpLkGsop_LtYWAAjG6cg7ueYAz6BBfsDNxZQbRw_4c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PNS_TOKEN = process.argv[2];
if (!PNS_TOKEN) {
  console.error("Usage: node scripts/seed-foodstuffs.mjs <JWT_TOKEN> [--store-id=<uuid>] [--location=<location_id>]");
  console.error("  --store-id  Foodstuffs store UUID (default: PnS Riccarton)");
  console.error("  --location  store_locations.id to tag results (e.g. pns-riccarton)");
  process.exit(1);
}

// Parse CLI flags
let STORE_ID = "be4c4780-218e-425a-a90f-63e21773572b"; // PnS Riccarton default
let LOCATION_ID = null;

for (const arg of process.argv.slice(3)) {
  if (arg.startsWith("--store-id=")) STORE_ID = arg.split("=")[1];
  if (arg.startsWith("--location=")) LOCATION_ID = arg.split("=")[1];
}

async function searchFoodstuffs(domain, query, store, banner) {
  const res = await fetch(
    `https://${domain}/v1/edge/search/paginated/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PNS_TOKEN}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        origin: `https://www.${store === "paknsave" ? "paknsave" : "newworld"}.co.nz`,
        referer: `https://www.${store === "paknsave" ? "paknsave" : "newworld"}.co.nz/`,
      },
      body: JSON.stringify({
        algoliaQuery: {
          attributesToHighlight: [],
          attributesToRetrieve: ["productID", "Type", "sponsored"],
          facets: ["brand", "onPromotion"],
          filters: `stores:${STORE_ID}`,
          hitsPerPage: 5,
          page: 0,
          query,
          analyticsTags: ["fs#WEB:desktop"],
        },
        algoliaFacetQueries: [],
        storeId: STORE_ID,
        hitsPerPage: 5,
        page: 0,
        sortOrder: "SI_POPULARITY_ASC",
        tobaccoQuery: false,
        precisionMedia: {
          adDomain: "SEARCH_PAGE",
          adPositions: [],
          publishImpressionEvent: false,
          disableAds: true,
        },
        banner,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`${store} API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (data.products ?? []).map((hit) => {
    const productId = (hit.productId ?? "").replace(/-EA-000$/, "");
    const imageUrl = productId
      ? `https://a.fsimg.co.nz/product/retail/fan/image/400x400/${productId}.png`
      : "";

    const priceInCents = hit.singlePrice?.price ?? 0;
    const price = priceInCents / 100;
    const promos = hit.promotions ?? [];
    const bestPromo = promos.find((p) => p.bestPromotion);
    const salePrice = bestPromo ? bestPromo.rewardValue / 100 : null;

    const cp = hit.singlePrice?.comparativePrice;
    const unitPrice = cp
      ? `$${(cp.pricePerUnit / 100).toFixed(2)}/${cp.measureDescription ?? "unit"}`
      : null;

    return {
      name: hit.name ?? "",
      brand: hit.brand ?? "",
      price: salePrice && salePrice < price ? price : price,
      salePrice: salePrice && salePrice < price ? salePrice : null,
      imageUrl,
      inStock: (hit.availability ?? []).includes("ONLINE"),
      size: hit.displayName ?? "",
      unitPrice,
    };
  });
}

async function seedStore(brand, domain, banner, locationId) {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name_ja, name_en, search_query");

  if (!ingredients) {
    console.error("No ingredients found");
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;
  const label = brand.toUpperCase().slice(0, 3);

  for (const ing of ingredients) {
    try {
      const products = await searchFoodstuffs(domain, ing.search_query, brand, banner);
      if (products.length > 0) {
        const p = products[0];

        // Upsert: delete old data for this ingredient+store+location, then insert
        const deleteQuery = supabase
          .from("store_products")
          .delete()
          .eq("ingredient_id", ing.id)
          .eq("store", brand);

        if (locationId) {
          deleteQuery.eq("store_location_id", locationId);
        }
        await deleteQuery;

        await supabase.from("store_products").insert({
          ingredient_id: ing.id,
          store: brand,
          store_location_id: locationId,
          product_name: p.name,
          brand: p.brand,
          price: p.price,
          sale_price: p.salePrice,
          image_url: p.imageUrl,
          in_stock: p.inStock,
          size: p.size,
          unit_price: p.unitPrice,
        });
        console.log(`  ${label} ✓ ${ing.name_ja} → ${p.name} $${p.salePrice ?? p.price}`);
        success++;
      } else {
        console.log(`  ${label} ✗ ${ing.name_ja} — no results`);
      }
    } catch (e) {
      console.log(`  ${label} ✗ ${ing.name_ja} — ${e.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return { success, failed };
}

async function main() {
  // Determine which brand based on the location ID prefix
  const isPns = !LOCATION_ID || LOCATION_ID.startsWith("pns-");
  const isNw = !LOCATION_ID || LOCATION_ID.startsWith("nw-");

  console.log(`Store ID: ${STORE_ID}`);
  console.log(`Location: ${LOCATION_ID ?? "(none — seeding both PnS and NW)"}`);
  console.log("");

  if (isPns) {
    console.log("--- Pak'nSave ---");
    const pns = await seedStore("paknsave", "api-prod.paknsave.co.nz", "PNS",
      LOCATION_ID?.startsWith("pns-") ? LOCATION_ID : null);
    console.log(`PnS: ${pns.success} success, ${pns.failed} failed\n`);
  }

  if (isNw) {
    console.log("--- New World ---");
    const nw = await seedStore("newworld", "api-prod.newworld.co.nz", "NW",
      LOCATION_ID?.startsWith("nw-") ? LOCATION_ID : null);
    console.log(`NW: ${nw.success} success, ${nw.failed} failed\n`);
  }

  console.log("Done!");
}

main().catch(console.error);
