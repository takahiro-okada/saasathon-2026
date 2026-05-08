import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ymicgemwmmaqbtgvftpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWNnZW13bW1hcWJ0Z3ZmdHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzIzOTYsImV4cCI6MjA5MzgwODM5Nn0.DtpLkGsop_LtYWAAjG6cg7ueYAz6BBfsDNxZQbRw_4c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PNS_TOKEN = process.argv[2];
if (!PNS_TOKEN) {
  console.error("Usage: node scripts/seed-foodstuffs.mjs <JWT_TOKEN>");
  process.exit(1);
}

const STORE_ID = "be4c4780-218e-425a-a90f-63e21773572b";

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

async function main() {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name_ja, name_en, search_query");

  if (!ingredients) {
    console.error("No ingredients found");
    return;
  }

  console.log(`Found ${ingredients.length} ingredients. Seeding PnS and NW...`);

  let successPns = 0;
  let successNw = 0;
  let failed = 0;

  for (const ing of ingredients) {
    // Pak'nSave
    try {
      const pnsProducts = await searchFoodstuffs(
        "api-prod.paknsave.co.nz",
        ing.search_query,
        "paknsave",
        "PNS"
      );
      if (pnsProducts.length > 0) {
        const p = pnsProducts[0];
        await supabase.from("store_products").insert({
          ingredient_id: ing.id,
          store: "paknsave",
          product_name: p.name,
          brand: p.brand,
          price: p.price,
          sale_price: p.salePrice,
          image_url: p.imageUrl,
          in_stock: p.inStock,
          size: p.size,
          unit_price: p.unitPrice,
        });
        console.log(`  PnS ✓ ${ing.name_ja} → ${p.name} $${p.salePrice ?? p.price}`);
        successPns++;
      } else {
        console.log(`  PnS ✗ ${ing.name_ja} — no results`);
      }
    } catch (e) {
      console.log(`  PnS ✗ ${ing.name_ja} — ${e.message}`);
      failed++;
    }

    // New World (same token works for both)
    try {
      const nwProducts = await searchFoodstuffs(
        "api-prod.newworld.co.nz",
        ing.search_query,
        "newworld",
        "NW"
      );
      if (nwProducts.length > 0) {
        const p = nwProducts[0];
        await supabase.from("store_products").insert({
          ingredient_id: ing.id,
          store: "newworld",
          product_name: p.name,
          brand: p.brand,
          price: p.price,
          sale_price: p.salePrice,
          image_url: p.imageUrl,
          in_stock: p.inStock,
          size: p.size,
          unit_price: p.unitPrice,
        });
        console.log(`  NW  ✓ ${ing.name_ja} → ${p.name} $${p.salePrice ?? p.price}`);
        successNw++;
      } else {
        console.log(`  NW  ✗ ${ing.name_ja} — no results`);
      }
    } catch (e) {
      console.log(`  NW  ✗ ${ing.name_ja} — ${e.message}`);
      failed++;
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nDone! PnS: ${successPns}, NW: ${successNw}, Failed: ${failed}`);
}

main().catch(console.error);
