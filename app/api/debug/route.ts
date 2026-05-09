import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const envCheck = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "NOT SET",
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "NOT SET",
    url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) ?? "none",
  };

  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("id, name_ja, name_en")
    .limit(3);

  const { count, error: countError } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  return Response.json({
    env: envCheck,
    recipesResult: { data: recipes, error: recipesError?.message ?? null },
    totalRecipes: { count, error: countError?.message ?? null },
  });
}
