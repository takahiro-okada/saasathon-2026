#!/usr/bin/env node
/**
 * Foodstuffs Store ID Discovery Script
 *
 * Visits each store page in headed mode, clicks "Set as my store",
 * then captures the storeId from subsequent API requests.
 *
 * Usage:
 *   node scripts/discover-store-ids.mjs
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const STORES_TO_DISCOVER = [
  { brand: "paknsave", slug: "hornby", domain: "paknsave.co.nz", apiDomain: "api-prod.paknsave.co.nz", lat: -43.5425, lng: 172.5228 },
  { brand: "paknsave", slug: "moorhouse", domain: "paknsave.co.nz", apiDomain: "api-prod.paknsave.co.nz", lat: -43.5389, lng: 172.6383 },
  { brand: "paknsave", slug: "papanui", domain: "paknsave.co.nz", apiDomain: "api-prod.paknsave.co.nz", lat: -43.4854, lng: 172.6150 },
  { brand: "paknsave", slug: "riccarton", domain: "paknsave.co.nz", apiDomain: "api-prod.paknsave.co.nz", lat: -43.5310, lng: 172.5962 },
  { brand: "paknsave", slug: "wainoni", domain: "paknsave.co.nz", apiDomain: "api-prod.paknsave.co.nz", lat: -43.5132, lng: 172.6940 },
  { brand: "newworld", slug: "wigram", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.5526, lng: 172.5578 },
  { brand: "newworld", slug: "ilam", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.5240, lng: 172.5710 },
  { brand: "newworld", slug: "halswell", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.5760, lng: 172.5620 },
  { brand: "newworld", slug: "bishopdale", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.4960, lng: 172.5970 },
  { brand: "newworld", slug: "ferry-road", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.5450, lng: 172.6680 },
  { brand: "newworld", slug: "stanmore", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.5220, lng: 172.6590 },
  { brand: "newworld", slug: "prestons", domain: "newworld.co.nz", apiDomain: "api-prod.newworld.co.nz", lat: -43.4950, lng: 172.6340 },
];

async function discoverStoreId(browser, store) {
  // Fresh context per store to avoid cookie contamination
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const capturedIds = new Set();
  let jwtToken = null;

  // Intercept all API requests to capture storeId
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes(store.apiDomain)) {
      // Capture JWT token
      const auth = req.headers()["authorization"];
      if (auth?.startsWith("Bearer ")) {
        jwtToken = auth.slice(7);
      }

      try {
        const postData = req.postData();
        if (postData) {
          const body = JSON.parse(postData);
          if (body.storeId) capturedIds.add(body.storeId);
        }
      } catch {}
    }

    // Also check store selection API calls
    if (url.includes("/v1/edge/store") || url.includes("/store/set") || url.includes("/store/select")) {
      try {
        const postData = req.postData();
        if (postData) {
          const body = JSON.parse(postData);
          if (body.storeId) capturedIds.add(body.storeId);
          if (body.id) capturedIds.add(body.id);
        }
      } catch {}

      const u = new URL(url);
      for (const [, val] of u.searchParams) {
        if (val.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) capturedIds.add(val);
      }
    }
  });

  // Also intercept responses for store data
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/v1/edge/store") && res.status() === 200) {
      try {
        const data = await res.json();
        if (data?.storeId) capturedIds.add(data.storeId);
        if (data?.store?.id) capturedIds.add(data.store.id);
        if (data?.store?.storeId) capturedIds.add(data.store.storeId);
        if (data?.id) capturedIds.add(data.id);
      } catch {}
    }
  });

  const storeUrl = `https://www.${store.domain}/south-island/canterbury/${store.slug}`;
  console.log(`  Visiting ${storeUrl}...`);

  try {
    await page.goto(storeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try clicking store selection buttons
    const buttonTexts = [
      "Set as my store",
      "Make this my store",
      "Shop this store",
      "Change store",
      "Select store",
      "Shop here",
    ];

    for (const text of buttonTexts) {
      const btn = page.locator(`button:has-text("${text}"), a:has-text("${text}")`);
      if (await btn.count() > 0) {
        console.log(`  Clicking "${text}"...`);
        await btn.first().click();
        await page.waitForTimeout(5000);
        break;
      }
    }

    // If we found a storeId from API calls, great
    if (capturedIds.size > 0) {
      await page.close();
      await context.close();
      return { storeIds: [...capturedIds], jwt: jwtToken };
    }

    // Fallback: navigate to search page and search for something to trigger API with storeId
    console.log(`  Trying search to capture storeId...`);
    const searchUrl = `https://www.${store.domain}/shop/search?q=milk`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }

  await page.close();
  await context.close();
  return { storeIds: [...capturedIds], jwt: jwtToken };
}

async function main() {
  console.log("Launching browser (headed)...\n");
  const browser = await chromium.launch({ headless: false });

  const results = [];

  for (const store of STORES_TO_DISCOVER) {
    console.log(`[${store.brand}/${store.slug}]`);
    const { storeIds, jwt } = await discoverStoreId(browser, store);

    if (storeIds.length > 0) {
      // Clean up IDs (remove |False suffix if present)
      const cleanIds = storeIds.map(id => id.split("|")[0]);
      console.log(`  ✓ Found storeId(s): ${cleanIds.join(", ")}`);
      results.push({ ...store, storeIds: cleanIds, jwt: jwt ? "(captured)" : null });
    } else {
      console.log(`  ✗ Could not find storeId`);
      results.push({ ...store, storeIds: [], jwt: jwt ? "(captured)" : null });
    }
    console.log("");
  }

  console.log("\n=== RESULTS ===");
  const output = results.map(r => ({
    brand: r.brand,
    slug: r.slug,
    lat: r.lat,
    lng: r.lng,
    storeIds: r.storeIds,
  }));
  console.log(JSON.stringify(output, null, 2));

  const outPath = join(__dirname, "..", "data", "store-locations.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${outPath}`);

  await browser.close();
}

main().catch(console.error);
