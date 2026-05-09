import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

interface Activity {
  action_type: string;
  recipe_id: string | null;
  store: string | null;
  owned_ingredients: string[];
  cheapest_store: string | null;
  total_price: number | null;
  created_at: string;
}

interface StoreProduct {
  ingredient_id: string;
  store: string;
  product_name: string;
  price: number;
  sale_price: number | null;
  in_stock: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return Response.json({ error: "user_id required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }

  const { data: activities } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!activities || activities.length < 3) {
    return Response.json({
      insights: [],
      message: "Not enough usage data yet. Keep searching recipes to get personalized recommendations!",
    });
  }

  const typedActivities = activities as Activity[];

  const recipeCounts: Record<string, number> = {};
  const storeCounts: Record<string, number> = {};
  const ownedSet = new Set<string>();

  for (const a of typedActivities) {
    if (a.recipe_id) recipeCounts[a.recipe_id] = (recipeCounts[a.recipe_id] ?? 0) + 1;
    if (a.store) storeCounts[a.store] = (storeCounts[a.store] ?? 0) + 1;
    if (a.owned_ingredients) {
      for (const ing of a.owned_ingredients) ownedSet.add(ing);
    }
  }

  const { data: priceData } = await supabase
    .from("store_products")
    .select("ingredient_id, store, product_name, price, sale_price, in_stock")
    .in("store", ["woolworths", "paknsave", "newworld"])
    .eq("in_stock", true)
    .limit(200);

  const typedPrices = (priceData ?? []) as StoreProduct[];

  const storePriceSummary: Record<string, { total: number; count: number }> = {};
  for (const p of typedPrices) {
    if (!storePriceSummary[p.store]) storePriceSummary[p.store] = { total: 0, count: 0 };
    storePriceSummary[p.store].total += p.sale_price ?? p.price;
    storePriceSummary[p.store].count++;
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are a smart grocery shopping advisor for Japanese cooking in New Zealand.

Analyze this user's behavior and current store prices, then generate exactly 3 personalized insights in JSON format.

USER BEHAVIOR (last 14 days):
- Recipe searches: ${JSON.stringify(recipeCounts)}
- Store preferences: ${JSON.stringify(storeCounts)}
- Ingredients they usually have at home: ${JSON.stringify([...ownedSet])}
- Total activities: ${typedActivities.length}

CURRENT PRICE DATA (average per store):
${Object.entries(storePriceSummary).map(([s, d]) => `- ${s}: avg $${(d.total / d.count).toFixed(2)}/item (${d.count} items in stock)`).join("\n")}

AVAILABLE RECIPES: curry-rice, ramen, karaage, teriyaki-chicken, okonomiyaki, miso-soup, nikujaga, oyakodon

Generate 3 insights, each with a different type:
1. "cost_saving" — suggest switching stores or timing for a recipe they frequently search
2. "pattern" — observe their cooking pattern and suggest something new based on it
3. "inventory" — based on ingredients they own, suggest what they can make with minimal additional purchases

Return ONLY valid JSON array, no markdown:
[{"type":"cost_saving","title":"...","description":"...","savings":"$X.XX","store":"paknsave|woolworths|newworld","recipe_id":"..."},{"type":"pattern","title":"...","description":"...","recipe_id":"..."},{"type":"inventory","title":"...","description":"...","extra_cost":"$X.XX","recipe_id":"..."}]`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    let text = msg.content[0].type === "text" ? msg.content[0].text : "";
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const insights = JSON.parse(text);

    return Response.json({ insights, activity_count: typedActivities.length });
  } catch (e) {
    return Response.json(
      { error: "Failed to generate recommendations", detail: String(e) },
      { status: 500 }
    );
  }
}
