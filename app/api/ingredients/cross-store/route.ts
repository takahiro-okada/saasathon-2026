import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

/** 対応するストア一覧 */
const STORES = ["woolworths", "paknsave", "newworld"] as const;
type StoreKey = (typeof STORES)[number];

/** クロスストア価格比較のレスポンス型 */
interface CrossStoreAlternative {
  store: StoreKey;
  product_name: string;
  price: number;
  sale_price: number | null;
  in_stock: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ingredientId = searchParams.get("ingredient_id");

  // ingredient_id は必須パラメータ
  if (!ingredientId || !ingredientId.trim()) {
    return Response.json(
      { error: { code: "MISSING_PARAMETER", message: "ingredient_id は必須パラメータです。" } },
      { status: 400 }
    );
  }

  // 全ストアの在庫あり商品を一括取得
  const { data, error } = await supabase
    .from("store_products")
    .select("store, product_name, price, sale_price, in_stock")
    .eq("ingredient_id", ingredientId.trim())
    .in("store", STORES)
    .eq("in_stock", true);

  if (error) {
    return Response.json(
      { error: { code: "DATABASE_ERROR", message: "データの取得に失敗しました。" } },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return Response.json({ alternatives: [] });
  }

  // 実効価格（sale_price ?? price）の昇順でソート
  const alternatives: CrossStoreAlternative[] = (data as CrossStoreAlternative[])
    .sort((a, b) => {
      const effectivePriceA = a.sale_price ?? a.price;
      const effectivePriceB = b.sale_price ?? b.price;
      return effectivePriceA - effectivePriceB;
    });

  return Response.json({ alternatives });
}
