import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import {
  searchWoolworths,
  searchPaknsave,
  searchNewworld,
} from "@/app/lib/scraper";
import type { SupermarketProduct } from "@/app/lib/scraper";

type StoreKey = "woolworths" | "paknsave" | "newworld";

const STORES: StoreKey[] = ["woolworths", "paknsave", "newworld"];

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

type IngredientPrice = {
  ingredient_id: string;
  name_ja: string;
  name_en: string;
  quantity: string;
  is_optional: boolean;
  stores: Record<
    StoreKey,
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
  store: StoreKey;
  total: number;
  available_count: number;
  missing_count: number;
  label: string;
};

async function getProductForStore(
  ingredientId: string,
  searchQuery: string,
  store: StoreKey
): Promise<{
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  in_stock: boolean;
  unit_price?: string;
} | null> {
  const { data: cached } = await supabase
    .from("store_products")
    .select("*")
    .eq("ingredient_id", ingredientId)
    .eq("store", store)
    .gte(
      "scraped_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    )
    .order("scraped_at", { ascending: false })
    .limit(1);

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

  try {
    const searchFn = getSearchFn(store);
    const products = await searchFn(searchQuery);
    if (products.length > 0) {
      const p = products[0];
      supabase
        .from("store_products")
        .insert({
          ingredient_id: ingredientId,
          store,
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
  const recipeId = new URL(request.url).searchParams.get("recipe_id") ?? "";

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
      if (!ing) {
        return null as unknown as IngredientPrice;
      }

      const storeResults = await Promise.all(
        STORES.map(async (store) => {
          const product = await getProductForStore(
            ing.id,
            ing.search_query,
            store
          );
          return [store, product] as const;
        })
      );

      const stores = Object.fromEntries(storeResults) as Record<
        StoreKey,
        IngredientPrice["stores"][StoreKey]
      >;

      return {
        ingredient_id: ing.id,
        name_ja: ing.name_ja,
        name_en: ing.name_en,
        quantity: ri.quantity,
        is_optional: ri.is_optional,
        stores,
      };
    })
  );

  const validIngredients = ingredients.filter(Boolean);
  const requiredIngredients = validIngredients.filter((i) => !i.is_optional);

  const storeTotals: StoreTotal[] = STORES.map((store) => {
    let total = 0;
    let available = 0;
    let missing = 0;

    for (const ing of requiredIngredients) {
      const product = ing.stores[store];
      if (product && product.in_stock) {
        total += product.sale_price ?? product.price;
        available++;
      } else {
        missing++;
      }
    }

    const labels: Record<StoreKey, string> = {
      woolworths: "Woolworths",
      paknsave: "Pak'nSave",
      newworld: "New World",
    };

    return {
      store,
      total: Math.round(total * 100) / 100,
      available_count: available,
      missing_count: missing,
      label: labels[store],
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
    cheapest: storeTotals[0]?.store ?? null,
  });
}
