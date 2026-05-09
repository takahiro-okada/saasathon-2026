import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { searchWoolworths, searchPaknsave, searchNewworld } from "@/app/lib/scraper";
import type { SupermarketProduct } from "@/app/lib/scraper";

type StoreKey = "woolworths" | "paknsave" | "newworld";

function getSearchFn(store: StoreKey): (q: string) => Promise<SupermarketProduct[]> {
  switch (store) {
    case "paknsave": return searchPaknsave;
    case "newworld": return searchNewworld;
    default: return searchWoolworths;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const storeParam = (searchParams.get("store") ?? "woolworths") as StoreKey;
  const store: StoreKey = ["woolworths", "paknsave", "newworld"].includes(storeParam)
    ? storeParam
    : "woolworths";

  if (!query.trim()) {
    return Response.json({ results: [], suggestions: [] });
  }

  const zhToId: Record<string, string> = {
    "大阪烧": "okonomiyaki", "咖喱饭": "curry-rice", "咖喱": "curry-rice",
    "照烧鸡肉": "teriyaki-chicken", "照烧鸡": "teriyaki-chicken", "照烧": "teriyaki-chicken",
    "味噌汤": "miso-soup", "味噌": "miso-soup",
    "亲子丼": "oyakodon", "亲子饭": "oyakodon",
    "土豆炖肉": "nikujaga", "炖肉": "nikujaga",
    "日式炸鸡": "karaage", "炸鸡": "karaage",
    "拉面": "ramen", "拉麵": "ramen",
  };

  const zhMatch = zhToId[query.trim()];
  let recipeFilter = `name_ja.ilike.%${query}%,name_en.ilike.%${query}%`;
  if (zhMatch) {
    recipeFilter += `,id.eq.${zhMatch}`;
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .or(recipeFilter);

  if (!recipes || recipes.length === 0) {
    const { data: allRecipes } = await supabase
      .from("recipes")
      .select("id, name_ja, name_en");
    return Response.json({
      results: [],
      suggestions: allRecipes ?? [],
      message: `「${query}」のレシピは見つかりませんでした。`,
    });
  }

  const searchFn = getSearchFn(store);

  const results = await Promise.all(
    recipes.map(async (recipe) => {
      // レシピの食材を取得（中間テーブル + 食材マスタ JOIN）
      const { data: recipeIngredients } = await supabase
        .from("recipe_ingredients")
        .select(`
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
        `)
        .eq("recipe_id", recipe.id)
        .order("sort_order");

      // 食材ごとに: DBキャッシュ確認 → なければスクレイピング → DB保存
      const ingredients = await Promise.all(
        (recipeIngredients ?? []).map(async (ri) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawIng = ri.ingredients as any;
          const ing = Array.isArray(rawIng) ? rawIng[0] : rawIng;
          if (!ing) return null;

          // DBから最新の価格データを取得（24時間以内）
          const { data: cached } = await supabase
            .from("store_products")
            .select("*")
            .eq("ingredient_id", ing.id)
            .eq("store", store)
            .gte("scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order("scraped_at", { ascending: false })
            .limit(1);

          let liveProduct: {
            name: string;
            price: number;
            salePrice?: number;
            imageUrl: string;
            inStock: boolean;
            store: string;
            unitPrice?: string;
          } | undefined;

          if (cached && cached.length > 0) {
            const c = cached[0];
            liveProduct = {
              name: c.product_name,
              price: Number(c.price),
              salePrice: c.sale_price ? Number(c.sale_price) : undefined,
              imageUrl: c.image_url ?? "",
              inStock: c.in_stock,
              store: c.store,
              unitPrice: c.unit_price ?? undefined,
            };
          } else {
            // キャッシュなし → スクレイピング
            try {
              const products = await searchFn(ing.search_query);
              if (products.length > 0) {
                const p = products[0];
                liveProduct = {
                  name: p.name,
                  price: p.price,
                  salePrice: p.salePrice,
                  imageUrl: p.imageUrl,
                  inStock: p.inStock,
                  store: p.store,
                  unitPrice: p.unitPrice,
                };
                // DBに保存（バックグラウンド、エラー無視）
                supabase
                  .from("store_products")
                  .insert({
                    ingredient_id: ing.id,
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
              }
            } catch {
              // スクレイピング失敗 — liveProduct は undefined のまま
            }
          }

          return {
            ingredient_id: ing.id,
            name_ja: ing.name_ja,
            name_en: ing.name_en,
            nz_product: ing.name_en,
            quantity: ri.quantity,
            aisle: ing.aisle,
            optional: ri.is_optional,
            liveProduct,
          };
        })
      );

      return {
        id: recipe.id,
        name_ja: recipe.name_ja,
        name_en: recipe.name_en,
        description: recipe.description,
        servings: recipe.servings,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        steps: recipe.steps,
        ingredients: ingredients.filter(Boolean),
      };
    })
  );

  return Response.json({ results, store });
}
