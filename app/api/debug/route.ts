import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const envCheck = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "NOT SET",
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "NOT SET",
    ANTHROPIC_KEY: process.env.ANTHROPIC_API_KEY ? "set" : "NOT SET",
    url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) ?? "none",
  };

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("ingredients")
    .select("id, name_ja, name_en")
    .limit(3);

  const { count, error: countError } = await supabase
    .from("ingredients")
    .select("*", { count: "exact", head: true });

  return Response.json({
    env: envCheck,
    ingredientsResult: { data: ingredients, error: ingredientsError?.message ?? null },
    totalIngredients: { count, error: countError?.message ?? null },
  });
}
