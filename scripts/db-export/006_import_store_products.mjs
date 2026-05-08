#!/usr/bin/env node
/**
 * Import store_products data from the source Supabase to the target Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=eyJ... node scripts/db-export/006_import_store_products.mjs
 *
 * If no env vars are set, it reads from the source DB and writes a JSON file.
 * If env vars are set, it reads the JSON file and imports to the target DB.
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // これを追加
import { writeFileSync, readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_FILE = join(__dirname, "store_products_data.json");

const SOURCE_URL = "https://ymicgemwmmaqbtgvftpe.supabase.co";
const SOURCE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWNnZW13bW1hcWJ0Z3ZmdHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzIzOTYsImV4cCI6MjA5MzgwODM5Nn0.DtpLkGsop_LtYWAAjG6cg7ueYAz6BBfsDNxZQbRw_4c";

async function exportData() {
  console.log("Exporting store_products from source DB...");

  const supabase = createClient(SOURCE_URL, SOURCE_KEY, {
    auth: { persistSession: false },
realtime: { 
      enabled: false,
      transport: ws // ここに ws を渡す
    }
  });

  const allProducts = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("store_products")
      .select("*")
      .range(offset, offset + limit - 1);

    if (error) { console.error("Error:", error); break; }
    if (!data || data.length === 0) break;

    allProducts.push(...data);
    offset += limit;
    if (data.length < limit) break;
  }

  writeFileSync(JSON_FILE, JSON.stringify(allProducts, null, 2));
  console.log(`Exported ${allProducts.length} records to ${JSON_FILE}`);
}

async function importData() {
  const targetUrl = process.env.SUPABASE_URL;
  const targetKey = process.env.SUPABASE_KEY;

  if (!targetUrl || !targetKey) {
    console.error("Set SUPABASE_URL and SUPABASE_KEY env vars for import target");
    process.exit(1);
  }

  if (!existsSync(JSON_FILE)) {
    console.log("JSON file not found, exporting first...");
    await exportData();
  }

  const products = JSON.parse(readFileSync(JSON_FILE, "utf-8"));
  console.log(`Importing ${products.length} store_products to ${targetUrl}...`);

  const supabase = createClient(SOURCE_URL, SOURCE_KEY, {
    auth: { persistSession: false },
realtime: { 
      enabled: false,
      transport: ws // ここに ws を渡す
    }
  });
  const batchSize = 50;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map(p => ({
      ingredient_id: p.ingredient_id,
      store: p.store,
      product_name: p.product_name,
      brand: p.brand,
      price: p.price,
      sale_price: p.sale_price,
      image_url: p.image_url,
      in_stock: p.in_stock,
      size: p.size,
      unit_price: p.unit_price,
      store_location_id: p.store_location_id,
    }));

    const { error } = await supabase.from("store_products").insert(batch);
    if (error) {
      console.error(`Batch ${i}-${i + batchSize} failed:`, error.message);
    } else {
      process.stdout.write(`\r  ${Math.min(i + batchSize, products.length)}/${products.length}`);
    }
  }

  console.log("\nDone!");
}

const mode = process.argv[2] || "export";
if (mode === "import") {
  importData().catch(console.error);
} else {
  exportData().catch(console.error);
}
