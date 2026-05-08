#!/usr/bin/env node
/**
 * Foodstuffs Store ID Discovery Script
 *
 * Uses Playwright to visit PnS/NW store pages and capture storeIds
 * from network requests. Run once, save the output to store-locations.json.
 *
 * Usage:
 *   npx playwright install chromium   # first time only
 *   node scripts/discover-store-ids.mjs
 */

import { chromium } from "playwright";

const STORES_TO_DISCOVER = [
  // PnS Christchurch
  { brand: "paknsave", slug: "hornby", domain: "paknsave.co.nz", lat: -43.5425, lng: 172.5228 },
  { brand: "paknsave", slug: "moorhouse", domain: "paknsave.co.nz", lat: -43.5389, lng: 172.6383 },
  { brand: "paknsave", slug: "papanui", domain: "paknsave.co.nz", lat: -43.4854, lng: 172.6150 },
  { brand: "paknsave", slug: "riccarton", domain: "paknsave.co.nz", lat: -43.5310, lng: 172.5962 },
  { brand: "paknsave", slug: "wainoni", domain: "paknsave.co.nz", lat: -43.5132, lng: 172.6940 },
  // NW Christchurch
  { brand: "newworld", slug: "wigram", domain: "newworld.co.nz", lat: -43.5526, lng: 172.5578 },
  { brand: "newworld", slug: "ilam", domain: "newworld.co.nz", lat: -43.5240, lng: 172.5710 },
  { brand: "newworld", slug: "halswell", domain: "newworld.co.nz", lat: -43.5760, lng: 172.5620 },
  { brand: "newworld", slug: "bishopdale", domain: "newworld.co.nz", lat: -43.4960, lng: 172.5970 },
  { brand: "newworld", slug: "ferry-road", domain: "newworld.co.nz", lat: -43.5450, lng: 172.6680 },
  { brand: "newworld", slug: "stanmore", domain: "newworld.co.nz", lat: -43.5220, lng: 172.6590 },
  { brand: "newworld", slug: "prestons", domain: "newworld.co.nz", lat: -43.4950, lng: 172.6340 },
];

async function discoverStoreId(page, store) {
  let capturedStoreId = null;

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/v1/edge/search") || url.includes("/v1/edge/store")) {
      try {
        const body = req.postDataJSON?.() ?? JSON.parse(req.postData() || "{}");
        if (body.storeId) {
          capturedStoreId = body.storeId;
        }
      } catch {}

      // Also check URL params
      const u = new URL(url);
      const sid = u.searchParams.get("storeId");
      if (sid) capturedStoreId = sid;
    }
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/v1/edge/store") && res.status() === 200) {
      try {
        const data = await res.json();
        if (data?.storeId) capturedStoreId = data.storeId;
        if (data?.store?.id) capturedStoreId = data.store.id;
        if (data?.id) capturedStoreId = data.id;
      } catch {}
    }
  });

  const storeUrl = `https://www.${store.domain}/south-island/canterbury/${store.slug}`;
  console.log(`  Visiting ${storeUrl}...`);

  try {
    await page.goto(storeUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try clicking "Set as my store" or similar button
    const setStoreBtn = page.locator('button:has-text("Set as my store"), button:has-text("Make this my store"), button:has-text("Shop this store")');
    if (await setStoreBtn.count() > 0) {
      await setStoreBtn.first().click();
      await page.waitForTimeout(3000);
    }

    // Try to get storeId from cookies
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      if (cookie.name.toLowerCase().includes("store") && cookie.value.includes("-")) {
        if (cookie.value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
          capturedStoreId = cookie.value;
        }
      }
    }

    // Try localStorage
    const localStoreId = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        if (key.toLowerCase().includes("store") && val && val.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
          return val;
        }
        try {
          const parsed = JSON.parse(val);
          if (parsed?.storeId) return parsed.storeId;
          if (parsed?.id && String(parsed.id).match(/^[0-9a-f]{8}-/)) return parsed.id;
        } catch {}
      }
      return null;
    });
    if (localStoreId) capturedStoreId = localStoreId;

  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }

  return capturedStoreId;
}

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    geolocation: { latitude: -43.53, longitude: 172.63 },
    permissions: ["geolocation"],
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const results = [];

  for (const store of STORES_TO_DISCOVER) {
    const page = await context.newPage();
    console.log(`\n[${store.brand}/${store.slug}]`);
    const storeId = await discoverStoreId(page, store);
    if (storeId) {
      console.log(`  ✓ Found storeId: ${storeId}`);
      results.push({ ...store, storeId });
    } else {
      console.log(`  ✗ Could not find storeId`);
      results.push({ ...store, storeId: null });
    }
    await page.close();
  }

  console.log("\n\n=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));

  // Write to file
  const fs = await import("fs");
  fs.writeFileSync(
    new URL("../data/store-locations.json", import.meta.url),
    JSON.stringify(results, null, 2)
  );
  console.log("\nSaved to data/store-locations.json");

  await browser.close();
}

main().catch(console.error);
