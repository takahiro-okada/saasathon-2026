import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import {
  searchWoolworths,
  searchPaknsave,
  searchNewworld,
} from "@/app/lib/scraper";
import type { SupermarketProduct } from "@/app/lib/scraper";

type StoreKey = "woolworths" | "paknsave" | "newworld";

const BRANDS: StoreKey[] = ["woolworths", "paknsave", "newworld"];

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSearchFn(
  store: StoreKey
): (q: string) => Promise<SupermarketProduct[]> {
  switch (store) {
    case "paknsave":
      return searchPaknsave;
    case "newworld":
      return searchNewworld;
    default:
      return searchWoolworths;
  }
}

type StoreLocationInfo = {
  id: string;
  brand: StoreKey;
  name: string;
  distance_km: number;
};

type IngredientPrice = {
  ingredient_id: string;
  name_ja: string;
  name_en: string;
  quantity: string;
  is_optional: boolean;
  stores: Record<
    string,
    {
      product_name: string;
      price: number;
      sale_price?: number;
      image_url: string;
      in_stock: boolean;
      unit_price?: string;
    } | null
  >;
};

type StoreTotal = {
  store_location_id: string;
  store: StoreKey;
  store_name: string;
  distance_km: number;
  total: number;
  available_count: number;
  missing_count: number;
};

async function getNearestStores(
  lat: number,
  lng: number
): Promise<StoreLocationInfo[]> {
  const { data: locations } = await supabase
    .from("store_locations")
    .select("id, brand, name, lat, lng");

  if (!locations) return [];

  const withDistance = locations.map((loc) => ({
    id: loc.id,
    brand: loc.brand as StoreKey,
    name: loc.name,
    distance_km:
      Math.round(haversineDistance(lat, lng, loc.lat, loc.lng) * 10) / 10,
  }));

  withDistance.sort((a, b) => a.distance_km - b.distance_km);

  const nearest: StoreLocationInfo[] = [];
  const found: Partial<Record<StoreKey, boolean>> = {};
  for (const s of withDistance) {
    if (!found[s.brand]) {
      nearest.push(s);
      found[s.brand] = true;
    }
    if (nearest.length === BRANDS.length) break;
  }
  return nearest;
}

async function getProductForStore(
  searchQuery: string,
  brand: StoreKey,
  ingredientId?: string,
  storeLocationId?: string | null
): Promise<{
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  in_stock: boolean;
  unit_price?: string;
} | null> {
  if (ingredientId) {
    let query = supabase
      .from("store_products")
      .select("*")
      .eq("ingredient_id", ingredientId)
      .eq("store", brand)
      .gte(
        "scraped_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("scraped_at", { ascending: false })
      .limit(1);

    if (storeLocationId) {
      query = query.eq("store_location_id", storeLocationId);
    }

    const { data: cached } = await query;

    if (cached && cached.length > 0) {
      const c = cached[0];
      return {
        product_name: c.product_name,
        price: Number(c.price),
        sale_price: c.sale_price ? Number(c.sale_price) : undefined,
        image_url: c.image_url ?? "",
        in_stock: c.in_stock,
        unit_price: c.unit_price ?? undefined,
      };
    }
  }

  try {
    const searchFn = getSearchFn(brand);
    const products = await searchFn(searchQuery);
    if (products.length > 0) {
      const p = products[0];
      if (ingredientId) {
        supabase
          .from("store_products")
          .insert({
            ingredient_id: ingredientId,
            store: brand,
            store_location_id: storeLocationId ?? null,
            product_name: p.name,
            brand: p.brand,
            price: p.price,
            sale_price: p.salePrice ?? null,
            image_url: p.imageUrl,
            in_stock: p.inStock,
            size: p.size,
            unit_price: p.unitPrice ?? null,
          })
          .then(() => {});
      }
      return {
        product_name: p.name,
        price: p.price,
        sale_price: p.salePrice,
        image_url: p.imageUrl,
        in_stock: p.inStock,
        unit_price: p.unitPrice,
      };
    }
  } catch {
    // scraping failed
  }
  return null;
}

interface CompareIngredient {
  ingredient_id?: string;
  name_ja: string;
  name_en: string;
  quantity: string;
  optional: boolean;
  search_query?: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ingredients: CompareIngredient[] = body.ingredients ?? [];
  const recipeName: string = body.recipe_name ?? "";
  const lat = parseFloat(body.lat ?? "");
  const lng = parseFloat(body.lng ?? "");

  if (ingredients.length === 0) {
    return Response.json({ error: "ingredients are required" }, { status: 400 });
  }

  let compareStores: StoreLocationInfo[];
  if (!isNaN(lat) && !isNaN(lng)) {
    compareStores = await getNearestStores(lat, lng);
  } else {
    compareStores = BRANDS.map((brand) => ({
      id: "",
      brand,
      name: brand === "woolworths" ? "Woolworths" : brand === "paknsave" ? "Pak'nSave" : "New World",
      distance_km: 0,
    }));
  }

  const priceResults: IngredientPrice[] = await Promise.all(
    ingredients.map(async (ing) => {
      const searchQuery = ing.search_query ?? ing.name_en;

      const storeResults = await Promise.all(
        compareStores.map(async (cs) => {
          const product = await getProductForStore(
            searchQuery,
            cs.brand,
            ing.ingredient_id,
            cs.id || null
          );
          return [cs.id || cs.brand, product] as const;
        })
      );

      return {
        ingredient_id: ing.ingredient_id ?? ing.name_en,
        name_ja: ing.name_ja,
        name_en: ing.name_en,
        quantity: ing.quantity,
        is_optional: ing.optional,
        stores: Object.fromEntries(storeResults),
      };
    })
  );

  const requiredIngredients = priceResults.filter((i) => !i.is_optional);

  const storeTotals: StoreTotal[] = compareStores.map((cs) => {
    const key = cs.id || cs.brand;
    let total = 0;
    let available = 0;
    let missing = 0;

    for (const ing of requiredIngredients) {
      const product = ing.stores[key];
      if (product && product.in_stock) {
        total += product.sale_price ?? product.price;
        available++;
      } else {
        missing++;
      }
    }

    return {
      store_location_id: cs.id,
      store: cs.brand,
      store_name: cs.name,
      distance_km: cs.distance_km,
      total: Math.round(total * 100) / 100,
      available_count: available,
      missing_count: missing,
    };
  });

  storeTotals.sort((a, b) => {
    if (a.missing_count !== b.missing_count)
      return a.missing_count - b.missing_count;
    return a.total - b.total;
  });

  return Response.json({
    recipe: { name: recipeName },
    ingredients: priceResults,
    store_totals: storeTotals,
    cheapest: storeTotals[0]?.store ?? null,
    compare_stores: compareStores,
  });
}
