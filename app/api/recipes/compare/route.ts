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
  ingredientId: string,
  searchQuery: string,
  brand: StoreKey,
  storeLocationId: string | null
): Promise<{
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  in_stock: boolean;
  unit_price?: string;
} | null> {
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

  // Fallback: try without store_location_id filter (legacy data)
  if (storeLocationId) {
    const { data: fallback } = await supabase
      .from("store_products")
      .select("*")
      .eq("ingredient_id", ingredientId)
      .eq("store", brand)
      .order("scraped_at", { ascending: false })
      .limit(1);

    if (fallback && fallback.length > 0) {
      const c = fallback[0];
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

  // Last resort: live scrape
  try {
    const searchFn = getSearchFn(brand);
    const products = await searchFn(searchQuery);
    if (products.length > 0) {
      const p = products[0];
      supabase
        .from("store_products")
        .insert({
          ingredient_id: ingredientId,
          store: brand,
          store_location_id: storeLocationId,
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

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const recipeId = params.get("recipe_id") ?? "";
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");

  if (!recipeId.trim()) {
    return Response.json({ error: "recipe_id is required" }, { status: 400 });
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Determine which stores to compare
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

  const { data: recipeIngredients } = await supabase
    .from("recipe_ingredients")
    .select(
      `
      quantity,
      is_optional,
      sort_order,
      ingredients (
        id,
        name_ja,
        name_en,
        search_query,
        aisle,
        is_optional
      )
    `
    )
    .eq("recipe_id", recipeId)
    .order("sort_order");

  const ingredients: IngredientPrice[] = await Promise.all(
    (recipeIngredients ?? []).map(async (ri) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawIng = ri.ingredients as any;
      const ing = Array.isArray(rawIng) ? rawIng[0] : rawIng;
      if (!ing) return null as unknown as IngredientPrice;

      const storeResults = await Promise.all(
        compareStores.map(async (cs) => {
          const product = await getProductForStore(
            ing.id,
            ing.search_query,
            cs.brand,
            cs.id || null
          );
          return [cs.id || cs.brand, product] as const;
        })
      );

      return {
        ingredient_id: ing.id,
        name_ja: ing.name_ja,
        name_en: ing.name_en,
        quantity: ri.quantity,
        is_optional: ri.is_optional,
        stores: Object.fromEntries(storeResults),
      };
    })
  );

  const validIngredients = ingredients.filter(Boolean);
  const requiredIngredients = validIngredients.filter((i) => !i.is_optional);

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
    recipe: {
      id: recipe.id,
      name_ja: recipe.name_ja,
      name_en: recipe.name_en,
      servings: recipe.servings,
    },
    ingredients: validIngredients,
    store_totals: storeTotals,
    cheapest: storeTotals[0] ?? null,
    compare_stores: compareStores,
  });
}
