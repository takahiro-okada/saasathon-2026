#!/usr/bin/env node
/**
 * Captures JWT token from Foodstuffs website, then queries store APIs directly.
 */

import { chromium } from "playwright";

const BRAND = process.argv[2] || "paknsave";
const DOMAIN = BRAND === "paknsave" ? "paknsave.co.nz" : "newworld.co.nz";
const API_DOMAIN = `api-prod.${DOMAIN}`;

async function main() {
  console.log(`Capturing JWT from ${BRAND}...\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  let jwtToken = null;

  page.on("request", (req) => {
    if (req.url().includes(API_DOMAIN)) {
      const auth = req.headers()["authorization"];
      if (auth?.startsWith("Bearer ") && !jwtToken) {
        jwtToken = auth.slice(7);
      }
    }
  });

  // Visit store page to get JWT
  await page.goto(`https://www.${DOMAIN}/south-island/canterbury/riccarton`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  if (!jwtToken) {
    console.error("Failed to capture JWT token");
    await browser.close();
    return;
  }

  console.log(`JWT captured: ${jwtToken.slice(0, 50)}...`);

  // Query /v1/edge/store/physical — might return all stores
  console.log("\n=== GET /v1/edge/store/physical ===");
  try {
    const res = await fetch(`https://${API_DOMAIN}/v1/edge/store/physical`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        origin: `https://www.${DOMAIN}`,
        referer: `https://www.${DOMAIN}/`,
      },
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);

    if (Array.isArray(data)) {
      console.log(`Found ${data.length} stores`);
      for (const s of data) {
        const id = s.id || s.storeId || s.store_id || "";
        const name = s.name || s.storeName || s.displayName || "";
        const city = s.city || s.suburb || s.address?.city || "";
        if (id || name) {
          console.log(`  ${id} — ${name} (${city})`);
        }
      }
    } else if (data.stores) {
      console.log(`Found ${data.stores.length} stores`);
      for (const s of data.stores) {
        const id = s.id || s.storeId || "";
        const name = s.name || s.storeName || "";
        console.log(`  ${id} — ${name}`);
      }
    } else {
      console.log(JSON.stringify(data, null, 2).slice(0, 3000));
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  // Also try /v1/edge/store
  console.log("\n=== GET /v1/edge/store ===");
  try {
    const res = await fetch(`https://${API_DOMAIN}/v1/edge/store`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        origin: `https://www.${DOMAIN}`,
        referer: `https://www.${DOMAIN}/`,
      },
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    const str = JSON.stringify(data, null, 2);
    // Look for storeId fields
    const ids = str.match(/"(?:id|storeId|store_id)"\s*:\s*"[^"]+"/g);
    if (ids) {
      console.log("Found IDs:");
      for (const id of [...new Set(ids)]) console.log(`  ${id}`);
    }
    console.log(str.slice(0, 2000));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  // Try store search endpoint
  console.log("\n=== GET /v1/edge/store/search?latitude=-43.53&longitude=172.63&maxResults=20 ===");
  try {
    const res = await fetch(
      `https://${API_DOMAIN}/v1/edge/store/search?latitude=-43.53&longitude=172.63&maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          origin: `https://www.${DOMAIN}`,
          referer: `https://www.${DOMAIN}/`,
        },
      }
    );
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} stores`);
      for (const s of data) {
        const id = s.id || s.storeId || "";
        const name = s.name || s.storeName || "";
        console.log(`  ${id} — ${name}`);
      }
    } else {
      console.log(JSON.stringify(data, null, 2).slice(0, 3000));
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  await browser.close();
}

main().catch(console.error);
