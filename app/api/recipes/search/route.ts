import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { searchWoolworths, searchPaknsave, searchNewworld } from "@/app/lib/scraper";
import type { SupermarketProduct } from "@/app/lib/scraper";
import Anthropic from "@anthropic-ai/sdk";

type StoreKey = "woolworths" | "paknsave" | "newworld";

interface AIIngredient {
  name_ja: string;
  name_en: string;
  quantity: string;
  search_query: string;
  aisle: string;
  optional: boolean;
}

interface AIRecipe {
  id: string;
  name_ja: string;
  name_en: string;
  description: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  steps: string[];
  ingredients: AIIngredient[];
}

function getSearchFn(store: StoreKey): (q: string) => Promise<SupermarketProduct[]> {
  switch (store) {
    case "paknsave": return searchPaknsave;
    case "newworld": return searchNewworld;
    default: return searchWoolworths;
  }
}

type Locale = "en" | "ja" | "zh";

const LOCALE_CONFIG: Record<Locale, { label: string; descLang: string; stepsLang: string; qtyFormat: string; ingredientLang: string }> = {
  en: { label: "English", descLang: "English", stepsLang: "English", qtyFormat: "e.g. 200g, 2 tbsp, 1 piece", ingredientLang: "English" },
  ja: { label: "Japanese", descLang: "Japanese", stepsLang: "Japanese", qtyFormat: "e.g. 200g, 大さじ2, 1個", ingredientLang: "Japanese" },
  zh: { label: "Chinese (Simplified)", descLang: "Chinese (Simplified)", stepsLang: "Chinese (Simplified)", qtyFormat: "e.g. 200g, 2大勺, 1个", ingredientLang: "Chinese (Simplified)" },
};

async function generateRecipeWithAI(query: string, locale: Locale = "en"): Promise<AIRecipe | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const anthropic = new Anthropic({ apiKey });
  const lc = LOCALE_CONFIG[locale];

  const prompt = `You are a Japanese cooking expert. Generate a recipe for "${query}".
The input may be in any language (English, Japanese, Chinese, etc.) — interpret it as a dish name.

Return ONLY valid JSON (no markdown, no code fences):
{
  "id": "kebab-style-id",
  "name_ja": "Name in ${lc.ingredientLang}",
  "name_en": "Name in English",
  "description": "Description in ${lc.descLang}",
  "servings": 2,
  "prep_time": 15,
  "cook_time": 20,
  "steps": ["step 1 in ${lc.stepsLang}", "step 2 in ${lc.stepsLang}"],
  "ingredients": [
    {
      "name_ja": "Ingredient name in ${lc.ingredientLang}",
      "name_en": "Ingredient name in English",
      "quantity": "quantity (${lc.qtyFormat})",
      "search_query": "English search term for NZ supermarket (e.g. chicken thigh, soy sauce)",
      "aisle": "where to find in NZ supermarket in English (e.g. Asian aisle, Produce section, Meat section)",
      "optional": false
    }
  ]
}

Rules:
- ONLY list raw ingredients that can be purchased at NZ supermarkets (Woolworths, Pak'nSave, New World)
- NEVER list cooked/prepared items like "cooked rice", "boiled noodles", "steamed vegetables" — list the raw form instead (e.g. "rice" not "cooked rice", "ramen noodles" not "cooked ramen")
- NEVER list "water" as an ingredient
- search_query MUST be the SIMPLEST possible English product name (1-2 words max) that a supermarket search engine would return results for. Use generic terms, NOT specific varieties. Examples: "rice" (NOT "jasmine rice" or "Japanese short grain rice"), "soy sauce" (NOT "Japanese soy sauce"), "chicken thigh", "flour" (NOT "plain flour" or "all purpose flour"), "oil" (NOT "vegetable oil"), "onion", "garlic", "ginger", "egg"
- aisle MUST be in English
- Include 5-12 ingredients
- All user-facing text (description, steps, ingredient names in name_ja, quantity) MUST be in ${lc.label}
- name_en and search_query MUST always be in English
- If the input is not a real dish, return null`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    let text = msg.content[0].type === "text" ? msg.content[0].text : "";
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    if (text === "null" || !text) return null;
    return JSON.parse(text) as AIRecipe;
  } catch {
    return null;
  }
}

async function suggestAlternatives(ingredientName: string): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const anthropic = new Anthropic({ apiKey });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `"${ingredientName}" is not available at NZ supermarkets. Suggest 3 alternative ingredients that could substitute it and are commonly found at Woolworths/Pak'nSave/New World in New Zealand.

Return ONLY a JSON array of simple 1-2 word English search terms. Example: ["rice", "sushi rice", "medium grain rice"]`,
      }],
    });

    let text = msg.content[0].type === "text" ? msg.content[0].text : "";
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return JSON.parse(text) as string[];
  } catch {
    return [];
  }
}

async function findCachedRecipe(query: string, locale: Locale) {
  const normalizedQuery = query.trim().toLowerCase();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .or(`name_en.ilike.%${normalizedQuery}%,name_ja.ilike.%${normalizedQuery}%,id.ilike.%${normalizedQuery}%`)
    .limit(1);

  if (!recipes || recipes.length === 0) return null;

  const recipe = recipes[0];

  const { data: recipeIngs } = await supabase
    .from("recipe_ingredients")
    .select("*, ingredients(*)")
    .eq("recipe_id", recipe.id)
    .order("sort_order", { ascending: true });

  if (!recipeIngs || recipeIngs.length === 0) return null;

  return {
    recipe,
    ingredients: recipeIngs.map((ri: { quantity: string; is_optional: boolean; ingredients: { id: string; name_ja: string; name_en: string; search_query: string; aisle: string } }) => ({
      ingredient_id: ri.ingredients.id,
      name_ja: ri.ingredients.name_ja,
      name_en: ri.ingredients.name_en,
      search_query: ri.ingredients.search_query,
      aisle: ri.ingredients.aisle,
      quantity: ri.quantity,
      optional: ri.is_optional,
    })),
  };
}

async function saveRecipeToDB(aiRecipe: AIRecipe): Promise<void> {
  await supabase.from("recipes").upsert({
    id: aiRecipe.id,
    name_ja: aiRecipe.name_ja,
    name_en: aiRecipe.name_en,
    description: aiRecipe.description,
    servings: aiRecipe.servings,
    prep_time: aiRecipe.prep_time,
    cook_time: aiRecipe.cook_time,
    steps: aiRecipe.steps,
  });

  for (let i = 0; i < aiRecipe.ingredients.length; i++) {
    const aiIng = aiRecipe.ingredients[i];

    const { data: existing } = await supabase
      .from("ingredients")
      .select("id")
      .or(`name_en.ilike.${aiIng.name_en},search_query.ilike.${aiIng.search_query}`)
      .limit(1);

    let ingredientId: string;

    if (existing && existing.length > 0) {
      ingredientId = existing[0].id;
    } else {
      const { data: inserted } = await supabase
        .from("ingredients")
        .insert({
          name_ja: aiIng.name_ja,
          name_en: aiIng.name_en,
          search_query: aiIng.search_query,
          aisle: aiIng.aisle,
          is_optional: aiIng.optional,
        })
        .select("id")
        .single();

      if (!inserted) continue;
      ingredientId = inserted.id;
    }

    await supabase.from("recipe_ingredients").insert({
      recipe_id: aiRecipe.id,
      ingredient_id: ingredientId,
      quantity: aiIng.quantity,
      is_optional: aiIng.optional,
      sort_order: i,
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const storeParam = (searchParams.get("store") ?? "woolworths") as StoreKey;
  const store: StoreKey = ["woolworths", "paknsave", "newworld"].includes(storeParam)
    ? storeParam
    : "woolworths";
  const localeParam = searchParams.get("locale") ?? "en";
  const locale: Locale = (["en", "ja", "zh"] as const).includes(localeParam as Locale)
    ? (localeParam as Locale)
    : "en";

  if (!query.trim()) {
    return Response.json({ results: [], suggestions: [] });
  }

  const searchFn = getSearchFn(store);

  async function lookupIngredientPrice(searchQuery: string, ingredientId?: string) {
    let liveProduct: {
      name: string;
      price: number;
      salePrice?: number;
      imageUrl: string;
      inStock: boolean;
      store: string;
      unitPrice?: string;
    } | undefined;

    if (ingredientId) {
      const { data: cached } = await supabase
        .from("store_products")
        .select("*")
        .eq("ingredient_id", ingredientId)
        .eq("store", store)
        .gte("scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("scraped_at", { ascending: false })
        .limit(1);

      if (cached && cached.length > 0) {
        const c = cached[0];
        return {
          name: c.product_name,
          price: Number(c.price),
          salePrice: c.sale_price ? Number(c.sale_price) : undefined,
          imageUrl: c.image_url ?? "",
          inStock: c.in_stock,
          store: c.store,
          unitPrice: c.unit_price ?? undefined,
        };
      }
    }

    try {
      const products = await searchFn(searchQuery);
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
        if (ingredientId) {
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
        }
      }
    } catch {
      // scraping failed
    }
    return liveProduct;
  }

  // 1. Check DB cache first
  const cached = await findCachedRecipe(query, locale);

  if (cached) {
    const ingredients = await Promise.all(
      cached.ingredients.map(async (ing) => {
        const liveProduct = await lookupIngredientPrice(ing.search_query, ing.ingredient_id);
        return {
          ingredient_id: ing.ingredient_id,
          name_ja: ing.name_ja,
          name_en: ing.name_en,
          nz_product: ing.name_en,
          quantity: ing.quantity,
          aisle: ing.aisle,
          optional: ing.optional,
          liveProduct,
          alternatives: [] as { name: string; search_query: string; liveProduct: typeof liveProduct }[],
        };
      })
    );

    return Response.json({
      results: [{
        id: cached.recipe.id,
        name_ja: cached.recipe.name_ja,
        name_en: cached.recipe.name_en,
        description: cached.recipe.description,
        servings: cached.recipe.servings,
        prep_time: cached.recipe.prep_time,
        cook_time: cached.recipe.cook_time,
        steps: cached.recipe.steps,
        ingredients,
      }],
      store,
      ai_generated: false,
    });
  }

  // 2. AI generates recipe (cache miss)
  const aiRecipe = await generateRecipeWithAI(query, locale);

  if (!aiRecipe) {
    return Response.json({
      results: [],
      message: `「${query}」のレシピは見つかりませんでした。`,
    });
  }

  // 3. Save to DB for next time (non-blocking)
  saveRecipeToDB(aiRecipe).catch(() => {});

  // 4. Match AI ingredients against DB ingredients for price data
  const ingredients = await Promise.all(
    aiRecipe.ingredients.map(async (aiIng) => {
      const { data: dbMatch } = await supabase
        .from("ingredients")
        .select("id, name_ja, name_en, search_query, aisle")
        .or(`name_ja.ilike.%${aiIng.name_ja}%,name_en.ilike.%${aiIng.name_en}%`)
        .limit(1);

      const matched = dbMatch?.[0];
      const searchQuery = matched?.search_query ?? aiIng.search_query;
      const ingredientId = matched?.id;

      const liveProduct = await lookupIngredientPrice(searchQuery, ingredientId);

      let altResults: { name: string; search_query: string; liveProduct: typeof liveProduct }[] = [];
      if (!liveProduct) {
        const altTerms = await suggestAlternatives(aiIng.name_en);
        for (const alt of altTerms) {
          const altProduct = await lookupIngredientPrice(alt);
          if (altProduct) {
            altResults.push({ name: alt, search_query: alt, liveProduct: altProduct });
            break;
          }
        }
      }

      return {
        ingredient_id: ingredientId ?? undefined,
        name_ja: aiIng.name_ja,
        name_en: aiIng.name_en,
        nz_product: aiIng.name_en,
        quantity: aiIng.quantity,
        aisle: matched?.aisle ?? aiIng.aisle,
        optional: aiIng.optional,
        liveProduct,
        alternatives: altResults,
      };
    })
  );

  return Response.json({
    results: [{
      id: aiRecipe.id,
      name_ja: aiRecipe.name_ja,
      name_en: aiRecipe.name_en,
      description: aiRecipe.description,
      servings: aiRecipe.servings,
      prep_time: aiRecipe.prep_time,
      cook_time: aiRecipe.cook_time,
      steps: aiRecipe.steps,
      ingredients,
    }],
    store,
    ai_generated: true,
  });
}
