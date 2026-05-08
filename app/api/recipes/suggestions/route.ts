import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("recipes")
    .select("id, name_ja, name_en")
    .order("name_ja");

  return Response.json({ suggestions: data ?? [] });
}
