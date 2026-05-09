import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

// POST /api/activity — ユーザーアクティビティを記録する
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    user_id,
    action_type,
    recipe_id,
    store,
    owned_ingredients,
    cheapest_store,
    total_price,
  } = body;

  if (!user_id || !action_type) {
    return Response.json(
      { error: "user_id and action_type required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("user_activity").insert({
    user_id,
    action_type,
    recipe_id: recipe_id ?? null,
    store: store ?? null,
    owned_ingredients: owned_ingredients ?? [],
    cheapest_store: cheapest_store ?? null,
    total_price: total_price ?? null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

// GET /api/activity?user_id=xxx — レコメンデーション用にアクティビティを取得する
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return Response.json({ error: "user_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ activities: data });
}
