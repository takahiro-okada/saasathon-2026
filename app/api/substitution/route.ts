import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// サポートするロケール
type Locale = "en" | "ja" | "zh";

// ロケールごとのプロンプト指示
const LOCALE_INSTRUCTIONS: Record<Locale, string> = {
  en: "Respond in English.",
  ja: "日本語で回答してください。",
  zh: "请用中文回答。",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ingredient = searchParams.get("ingredient");
  const recipe = searchParams.get("recipe");
  const localeParam = searchParams.get("locale") ?? "en";

  // ingredient は必須
  if (!ingredient) {
    return Response.json({ error: "ingredient is required" }, { status: 400 });
  }

  // locale のバリデーション
  const locale: Locale = (["en", "ja", "zh"] as const).includes(localeParam as Locale)
    ? (localeParam as Locale)
    : "en";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }

  const anthropic = new Anthropic({ apiKey });

  // レシピコンテキストがある場合は追加
  const recipeContext = recipe ? ` in the context of making ${recipe}` : "";

  const prompt = `You are a helpful cooking assistant for Japanese home cooks living in New Zealand.

Find a practical substitution for the Japanese ingredient "${ingredient}"${recipeContext}.

Rules:
- Only suggest ingredients available at NZ supermarkets: Woolworths, Pak'nSave, or New World
- If the ingredient is a sauce or seasoning, provide a mixing recipe with exact measurements (e.g., "Mix 2 tbsp soy sauce + 1 tbsp sugar + 1 tsp sesame oil")
- Keep your response to 1-2 sentences maximum
- Return plain text only, NOT JSON
- If no reasonable substitute exists at NZ supermarkets, reply with exactly: NO_SUBSTITUTE
- ${LOCALE_INSTRUCTIONS[locale]}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";

    // 代替品が存在しない場合
    if (!text || text === "NO_SUBSTITUTE") {
      return Response.json({ substitution: null });
    }

    return Response.json({ substitution: text });
  } catch (e) {
    console.error("[substitution] Anthropic API error:", e);
    return Response.json(
      { error: "Failed to generate substitution", detail: String(e) },
      { status: 500 }
    );
  }
}
