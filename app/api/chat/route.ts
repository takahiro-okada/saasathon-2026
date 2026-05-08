import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI機能は現在利用できません（APIキー未設定）" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const messages: ChatMessage[] = body.messages ?? [];
  const ownedIngredients: string[] = body.owned_ingredients ?? [];

  if (messages.length === 0) {
    return Response.json({ error: "メッセージが必要です" }, { status: 400 });
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("name_ja, name_en");

  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("name_ja, name_en, category");

  const recipeList = (recipes ?? [])
    .map((r) => `${r.name_ja} (${r.name_en})`)
    .join(", ");
  const ingredientList = (ingredients ?? [])
    .map((i) => `${i.name_ja}(${i.name_en})`)
    .join(", ");

  const ownedContext =
    ownedIngredients.length > 0
      ? `\n\nユーザーが既に持っている食材: ${ownedIngredients.join(", ")}`
      : "";

  const systemPrompt = `あなたはNZに住む日本人のための料理アシスタントです。NZのスーパー（Woolworths、Pak'nSave、New World）で手に入る食材を使った日本料理のアドバイスをします。

対応レシピ: ${recipeList}
DB登録済み食材: ${ingredientList}${ownedContext}

ルール:
- 日本語で回答する
- NZで手に入りにくい食材の代替品を提案する
- ユーザーが持っている食材がある場合、追加購入が少ないレシピを優先的に提案する
- 回答は簡潔に（3-5文程度）
- 対応レシピにあるものを優先的に勧める（アプリで価格比較できるため）`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
      return Response.json(
        { error: "AI応答の取得に失敗しました" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply =
      data.content?.[0]?.text ?? "すみません、回答を生成できませんでした。";

    return Response.json({ reply });
  } catch {
    return Response.json(
      { error: "AI応答の取得に失敗しました" },
      { status: 500 }
    );
  }
}
