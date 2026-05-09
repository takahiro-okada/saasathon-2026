"use client";

import { useState } from "react";
import type { IngredientWithPricing, StoreKey, CompareResponse } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t, ingredientName, quantity as tq } from "@/app/lib/i18n";
import { STORE_LABELS, STORE_BG_COLORS, STORE_TEXT_COLORS, STORE_MAP_QUERIES } from "@/constants/stores";
import { logActivity } from "@/lib/activity";

export function PriceComparePanel({ recipeId, recipeName, locale, ingredients: recipeIngredients }: { recipeId: string; recipeName: string; locale: Locale; ingredients: IngredientWithPricing[] }) {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  const fetchComparison = async () => {
    if (data) { setOpen(!open); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_name: recipeName,
          ingredients: recipeIngredients.map((i) => ({
            ingredient_id: i.ingredient_id,
            name_ja: i.name_ja,
            name_en: i.name_en,
            quantity: i.quantity,
            optional: i.optional,
            search_query: i.nz_product,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const json: CompareResponse = await res.json();
      setData(json);
      setOpen(true);
      if (json.cheapest) {
        const bestTotal = json.store_totals.find((s) => s.store === json.cheapest);
        logActivity({
          action_type: "compare",
          recipe_id: recipeId,
          cheapest_store: json.cheapest,
          total_price: bestTotal?.total,
        });
      }
    } catch {
      setError(t("compare.error", locale));
    } finally {
      setLoading(false);
    }
  };

  const toggleOwned = (id: string) => {
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      logActivity({
        action_type: "ingredient_check",
        recipe_id: recipeId,
        owned_ingredients: [...next],
      });
      return next;
    });
  };

  const requiredIngredients = data?.ingredients.filter((i) => !i.is_optional) ?? [];
  const adjustedTotals = data
    ? (["woolworths", "paknsave", "newworld"] as StoreKey[]).map((store) => {
        let total = 0;
        let available = 0;
        let missing = 0;
        for (const ing of requiredIngredients) {
          if (owned.has(ing.ingredient_id)) continue;
          const product = ing.stores[store];
          if (product && product.in_stock) {
            total += product.sale_price ?? product.price;
            available++;
          } else {
            missing++;
          }
        }
        return {
          store,
          total: Math.round(total * 100) / 100,
          available_count: available,
          missing_count: missing,
          label: STORE_LABELS[store],
        };
      })
    : [];

  adjustedTotals.sort((a, b) => {
    if (a.missing_count !== b.missing_count) return a.missing_count - b.missing_count;
    return a.total - b.total;
  });

  const cheapest = adjustedTotals[0]?.store ?? null;
  const ownedCount = owned.size;

  return (
    <div className="mt-3">
      <button
        onClick={fetchComparison}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            {t("compare.loading", locale)}
          </>
        ) : open ? (
          `▲ ${t("compare.close", locale)}`
        ) : data ? (
          `▼ ${t("compare.open", locale)}`
        ) : (
          <>💰 {t("compare.button", locale, { recipe: recipeName })}</>
        )}
      </button>

      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

      {open && data && (
        <div className="mt-3 space-y-3">
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-3">
            <p className="text-xs font-semibold text-purple-700 mb-2">
              🏠 {t("compare.ownedTitle", locale)}
              {ownedCount > 0 && (
                <span className="ml-2 text-purple-500 font-normal">
                  {t("compare.excludingCount", locale, { n: ownedCount })}
                  <button
                    onClick={() => setOwned(new Set())}
                    className="ml-2 underline hover:text-purple-700"
                  >
                    {t("compare.resetOwned", locale)}
                  </button>
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {requiredIngredients.map((ing) => (
                <button
                  key={ing.ingredient_id}
                  onClick={() => toggleOwned(ing.ingredient_id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    owned.has(ing.ingredient_id)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-purple-700 border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  {owned.has(ing.ingredient_id) ? "✓ " : ""}
                  {ingredientName(ing.name_ja, ing.name_en, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["woolworths", "paknsave", "newworld"] as StoreKey[]).map((store) => {
              const st = adjustedTotals.find((t) => t.store === store);
              if (!st) return null;
              const isCheapest = st.store === cheapest;
              const mapUrl = `https://www.google.com/maps/search/${STORE_MAP_QUERIES[store]}+near+me`;
              return (
                <a
                  key={st.store}
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative rounded-xl border-2 p-3 text-center transition-all cursor-pointer hover:shadow-md block ${
                    isCheapest ? "border-[#4A6741] bg-[#E8F0E5] ring-2 ring-[#4A6741]/20" : STORE_BG_COLORS[st.store]
                  }`}
                >
                  {isCheapest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#4A6741] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      BEST
                    </span>
                  )}
                  <p className={`text-xs font-semibold mb-1 ${STORE_TEXT_COLORS[st.store]}`}>{st.label}</p>
                  <p className={`text-xl font-bold ${isCheapest ? "text-[#4A6741]" : "text-gray-800"}`}>
                    {st.available_count === 0 ? "---" : `$${st.total.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {st.available_count}/{st.available_count + st.missing_count} {t("compare.items", locale)}
                  </p>
                  {st.missing_count > 0 && (
                    <p className="text-xs text-[#C4673A] mt-0.5">{t("compare.unavailable", locale, { n: st.missing_count })}</p>
                  )}
                  <p className="text-xs text-blue-500 mt-1">📍 Find nearby</p>
                </a>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600">{t("compare.perItemTitle", locale)}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {requiredIngredients.map((ing) => {
                const isOwned = owned.has(ing.ingredient_id);
                const storeOrder: StoreKey[] = ["woolworths", "paknsave", "newworld"];
                const prices = storeOrder.map((s) => {
                  const p = ing.stores[s];
                  return p && p.in_stock ? (p.sale_price ?? p.price) : Infinity;
                });
                const minPrice = Math.min(...prices);
                return (
                  <div key={ing.ingredient_id} className={`px-4 py-2 ${isOwned ? "opacity-40" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isOwned ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {isOwned ? "🏠 " : ""}{ingredientName(ing.name_ja, ing.name_en, locale)}
                      </span>
                      <span className="text-xs text-gray-400">{tq(ing.quantity, locale)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {storeOrder.map((store) => {
                        const product = ing.stores[store];
                        const effectivePrice = product?.in_stock ? (product.sale_price ?? product.price) : null;
                        const isLowest = effectivePrice !== null && effectivePrice === minPrice && minPrice < Infinity;
                        return (
                          <div
                            key={store}
                            className={`text-center py-1 px-1 rounded text-xs ${
                              isOwned ? "text-gray-300" : isLowest ? "bg-[#E8F0E5] font-bold text-[#4A6741]" : "text-gray-500"
                            }`}
                          >
                            {product && product.in_stock ? `$${effectivePrice!.toFixed(2)}` : product ? t("compare.soldOut", locale) : "-"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
