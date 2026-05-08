#!/usr/bin/env node
/**
 * Daily Price Update Script
 *
 * 1. Launches Playwright to capture a fresh JWT from Foodstuffs
 * 2. Reads store_locations from Supabase (with foodstuffs_store_id)
 * 3. For each store, fetches prices for all ingredients
 * 4. Upserts into store_products with store_location_id
 *
 * Usage:
 *   node scripts/daily-price-update.mjs
 *   node scripts/daily-price-update.mjs --jwt <token>   # skip browser, use provided JWT
 *   node scripts/daily-price-update.mjs --brand paknsave # only update one brand
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ymicgemwmmaqbtgvftpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWNnZW13bW1hcWJ0Z3ZmdHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzIzOTYsImV4cCI6MjA5MzgwODM5Nn0.DtpLkGsop_LtYWAAjG6cg7ueYAz6BBfsDNxZQbRw_4c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parse CLI args
let providedJwt = null;
let brandFilter = null;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--jwt" && process.argv[i + 1]) {
    providedJwt = process.argv[++i];
  }
  if (process.argv[i] === "--brand" && process.argv[i + 1]) {
    brandFilter = process.argv[++i];
  }
}

async function captureJwts() {
  const jwts = { paknsave: providedJwt, newworld: providedJwt };
  if (providedJwt) {
    console.log("Using provided JWT token (same for both brands)");
    return jwts;
  }

  console.log("Launching browser to capture JWTs...");
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  for (const [brand, site] of [["paknsave", "paknsave.co.nz"], ["newworld", "newworld.co.nz"]]) {
    if (brandFilter && brandFilter !== brand) continue;

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    let jwt = null;

    page.on("request", (req) => {
      if (req.url().includes(`api-prod.${site}`)) {
        const auth = req.headers()["authorization"];
        if (auth?.startsWith("Bearer ") && !jwt) {
          jwt = auth.slice(7);
        }
      }
    });

    const slug = brand === "paknsave" ? "riccarton" : "ilam";
    await page.goto(`https://www.${site}/south-island/canterbury/${slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(5000);

    if (jwt) {
      jwts[brand] = jwt;
      console.log(`  ${brand} JWT: ${jwt.slice(0, 40)}...`);
    } else {
      console.log(`  ${brand} JWT: FAILED`);
    }

    await context.close();
  }

  await browser.close();
  return jwts;
}

async function searchFoodstuffs(token, domain, query, storeId, banner) {
  const res = await fetch(
    `https://${domain}/v1/edge/search/paginated/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        origin: `https://www.${domain.includes("paknsave") ? "paknsave" : "newworld"}.co.nz`,
        referer: `https://www.${domain.includes("paknsave") ? "paknsave" : "newworld"}.co.nz/`,
      },
      body: JSON.stringify({
        algoliaQuery: {
          attributesToHighlight: [],
          attributesToRetrieve: ["productID", "Type", "sponsored"],
          facets: ["brand", "onPromotion"],
          filters: `stores:${storeId}`,
          hitsPerPage: 5,
          page: 0,
          query,
          analyticsTags: ["fs#WEB:desktop"],
        },
        algoliaFacetQueries: [],
        storeId,
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
    throw new Error(`API error: ${res.status}`);
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
  const jwts = await captureJwts();

  // Get store locations with foodstuffs IDs
  let storeQuery = supabase
    .from("store_locations")
    .select("id, brand, name, foodstuffs_store_id")
    .not("foodstuffs_store_id", "is", null);

  if (brandFilter) {
    storeQuery = storeQuery.eq("brand", brandFilter);
  }

  const { data: stores } = await storeQuery;

  if (!stores || stores.length === 0) {
    console.error("No stores with foodstuffs_store_id found");
    return;
  }

  // Get ingredients
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name_ja, name_en, search_query");

  if (!ingredients) {
    console.error("No ingredients found");
    return;
  }

  console.log(`\nUpdating prices for ${stores.length} stores × ${ingredients.length} ingredients\n`);

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const store of stores) {
    const domain = store.brand === "paknsave" ? "api-prod.paknsave.co.nz" : "api-prod.newworld.co.nz";
    const banner = store.brand === "paknsave" ? "PNS" : "NW";
    let storeSuccess = 0;
    let storeFailed = 0;

    const jwt = jwts[store.brand];
    if (!jwt) {
      console.log(`--- ${store.name} — SKIPPED (no JWT) ---\n`);
      continue;
    }

    console.log(`--- ${store.name} (${store.foodstuffs_store_id.slice(0, 8)}...) ---`);

    for (const ing of ingredients) {
      try {
        const products = await searchFoodstuffs(jwt, domain, ing.search_query, store.foodstuffs_store_id, banner);
        if (products.length > 0) {
          const p = products[0];

          // Delete old data for this ingredient+store+location
          await supabase
            .from("store_products")
            .delete()
            .eq("ingredient_id", ing.id)
            .eq("store", store.brand)
            .eq("store_location_id", store.id);

          await supabase.from("store_products").insert({
            ingredient_id: ing.id,
            store: store.brand,
            store_location_id: store.id,
            product_name: p.name,
            brand: p.brand,
            price: p.price,
            sale_price: p.salePrice,
            image_url: p.imageUrl,
            in_stock: p.inStock,
            size: p.size,
            unit_price: p.unitPrice,
          });
          storeSuccess++;
        }
      } catch (e) {
        console.log(`  ✗ ${ing.name_ja} — ${e.message}`);
        storeFailed++;
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`  ✓ ${storeSuccess} / ✗ ${storeFailed}\n`);
    totalSuccess += storeSuccess;
    totalFailed += storeFailed;

    // Pause between stores
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total: ${totalSuccess} success, ${totalFailed} failed`);
  console.log(`Stores: ${stores.length}, Ingredients: ${ingredients.length}`);
}

main().catch(console.error);
