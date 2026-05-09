"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { RecipeWithPricing, IngredientWithPricing } from "@/app/lib/recipes";
import { t, LOCALE_LABELS, recipeName, recipeDescription, ingredientName, quantity as tq, type Locale } from "@/app/lib/i18n";

type StoreKey = "woolworths" | "paknsave" | "newworld";

interface RecipeSuggestion {
  id: string;
  name_ja: string;
  name_en: string;
}

interface SearchResponse {
  results?: RecipeWithPricing[];
  suggestions?: RecipeSuggestion[];
  message?: string;
  store?: StoreKey;
}

interface StoreTotal {
  store: StoreKey;
  total: number;
  available_count: number;
  missing_count: number;
  label: string;
}

interface CompareIngredientStore {
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  in_stock: boolean;
  unit_price?: string;
}

interface CompareIngredient {
  ingredient_id: string;
  name_ja: string;
  name_en: string;
  quantity: string;
  is_optional: boolean;
  stores: Record<StoreKey, CompareIngredientStore | null>;
}

interface CompareResponse {
  recipe: { id: string; name_ja: string; name_en: string; servings: number };
  ingredients: CompareIngredient[];
  store_totals: StoreTotal[];
  cheapest: StoreKey | null;
}

interface NearbyStore {
  id: string;
  name: string;
  brand: StoreKey;
  distance_km: number;
  address: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORE_LABELS: Record<StoreKey, string> = {
  woolworths: "Woolworths",
  paknsave: "Pak'nSave",
  newworld: "New World",
};

const STORE_COLORS: Record<StoreKey, string> = {
  woolworths: "bg-green-600 text-white border-green-600",
  paknsave: "bg-yellow-400 text-gray-900 border-yellow-400",
  newworld: "bg-red-600 text-white border-red-600",
};

const STORE_INACTIVE: Record<StoreKey, string> = {
  woolworths: "bg-white text-green-700 border-green-300 hover:bg-green-50",
  paknsave: "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50",
  newworld: "bg-white text-red-700 border-red-300 hover:bg-red-50",
};

const STORE_BG_COLORS: Record<StoreKey, string> = {
  woolworths: "bg-green-50 border-green-200",
  paknsave: "bg-yellow-50 border-yellow-200",
  newworld: "bg-red-50 border-red-200",
};

const STORE_TEXT_COLORS: Record<StoreKey, string> = {
  woolworths: "text-green-700",
  paknsave: "text-yellow-700",
  newworld: "text-red-700",
};

function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="flex gap-1">
      {(["en", "ja", "zh"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            locale === l
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

function StoreTabs({
  selected,
  onChange,
}: {
  selected: StoreKey;
  onChange: (s: StoreKey) => void;
}) {
  return (
    <div className="flex gap-2 mb-4">
      {(["woolworths", "paknsave", "newworld"] as StoreKey[]).map((store) => (
        <button
          key={store}
          onClick={() => onChange(store)}
          className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            selected === store ? STORE_COLORS[store] : STORE_INACTIVE[store]
          }`}
        >
          {STORE_LABELS[store]}
        </button>
      ))}
    </div>
  );
}

function PriceBadge({ price, salePrice }: { price: number; salePrice?: number }) {
  if (price === 0) return null;
  if (salePrice && salePrice < price) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-red-500 font-bold text-sm">${salePrice.toFixed(2)}</span>
        <span className="text-gray-400 line-through text-xs">${price.toFixed(2)}</span>
        <span className="bg-red-100 text-red-600 text-xs px-1 rounded font-medium">SALE</span>
      </span>
    );
  }
  return <span className="text-green-600 font-bold text-sm">${price.toFixed(2)}</span>;
}

function StockBadge({ inStock, locale }: { inStock: boolean; locale: Locale }) {
  return inStock ? (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      {t("ingredient.inStock", locale)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      {t("ingredient.outOfStock", locale)}
    </span>
  );
}

function IngredientCard({
  ingredient,
  checked,
  onToggle,
  loadingPrices,
  locale,
}: {
  ingredient: IngredientWithPricing;
  checked: boolean;
  onToggle: () => void;
  loadingPrices: boolean;
  locale: Locale;
}) {
  const live = ingredient.liveProduct;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        checked ? "bg-orange-50 border-orange-300 opacity-60" : "bg-white border-gray-200 hover:border-orange-300"
      }`}
      onClick={onToggle}
    >
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
        {loadingPrices ? (
          <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
        ) : live?.imageUrl ? (
          <Image
            src={live.imageUrl}
            alt={live.name}
            width={56}
            height={56}
            className="object-contain w-full h-full"
            unoptimized
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-2xl">🛒</span>
        )}
      </div>
      <div className="mt-0.5 shrink-0">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            checked ? "bg-orange-500 border-orange-500" : "border-gray-300"
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`font-medium text-gray-900 ${checked ? "line-through text-gray-400" : ""}`}>
            {ingredientName(ingredient.name_ja, ingredient.name_en, locale)}
          </span>
          <span className="text-sm text-gray-500">({tq(ingredient.quantity, locale)})</span>
          {ingredient.optional && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{t("recipe.optional", locale)}</span>
          )}
        </div>
        <p className={`text-sm font-semibold text-orange-600 ${checked ? "line-through text-orange-400" : ""}`}>
          {live?.name ?? ingredient.nz_product}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {loadingPrices ? (
            <span className="text-xs text-gray-400 animate-pulse">{t("ingredient.loadingPrice", locale)}</span>
          ) : live ? (
            <>
              <PriceBadge price={live.price} salePrice={live.salePrice} />
              {live.unitPrice && <span className="text-xs text-gray-400">{live.unitPrice}</span>}
              <StockBadge inStock={live.inStock} locale={locale} />
            </>
          ) : (
            <span className="text-xs text-gray-400">{t("ingredient.noPrice", locale)}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">💡 {ingredient.aisle}</p>
      </div>
    </div>
  );
}

function PriceComparePanel({ recipeId, recipeName, locale }: { recipeId: string; recipeName: string; locale: Locale }) {
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
      const res = await fetch(`/api/recipes/compare?recipe_id=${encodeURIComponent(recipeId)}`);
      if (!res.ok) throw new Error();
      const json: CompareResponse = await res.json();
      setData(json);
      setOpen(true);
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
          {/* 持ってる食材チェック */}
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

          {/* 合計金額カード */}
          <div className="grid grid-cols-3 gap-2">
            {adjustedTotals.map((st) => {
              const isCheapest = st.store === cheapest;
              return (
                <div
                  key={st.store}
                  className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                    isCheapest ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : STORE_BG_COLORS[st.store]
                  }`}
                >
                  {isCheapest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      BEST
                    </span>
                  )}
                  <p className={`text-xs font-semibold mb-1 ${STORE_TEXT_COLORS[st.store]}`}>{st.label}</p>
                  <p className={`text-xl font-bold ${isCheapest ? "text-blue-600" : "text-gray-800"}`}>
                    {st.available_count === 0 ? "---" : `$${st.total.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {st.available_count}/{st.available_count + st.missing_count} {t("compare.items", locale)}
                  </p>
                  {st.missing_count > 0 && (
                    <p className="text-xs text-orange-500 mt-0.5">{t("compare.unavailable", locale, { n: st.missing_count })}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 材料別テーブル */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600">{t("compare.perItemTitle", locale)}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {requiredIngredients.map((ing) => {
                const isOwned = owned.has(ing.ingredient_id);
                return (
                  <div key={ing.ingredient_id} className={`px-4 py-2 ${isOwned ? "opacity-40" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isOwned ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {isOwned ? "🏠 " : ""}{ingredientName(ing.name_ja, ing.name_en, locale)}
                      </span>
                      <span className="text-xs text-gray-400">{tq(ing.quantity, locale)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["woolworths", "paknsave", "newworld"] as StoreKey[]).map((store) => {
                        const product = ing.stores[store];
                        const prices = (["woolworths", "paknsave", "newworld"] as StoreKey[]).map((s) => {
                          const p = ing.stores[s];
                          return p && p.in_stock ? (p.sale_price ?? p.price) : Infinity;
                        });
                        const minPrice = Math.min(...prices);
                        const effectivePrice = product?.in_stock ? (product.sale_price ?? product.price) : null;
                        const isLowest = effectivePrice !== null && effectivePrice === minPrice && minPrice < Infinity;
                        return (
                          <div
                            key={store}
                            className={`text-center py-1 px-1 rounded text-xs ${
                              isOwned ? "text-gray-300" : isLowest ? "bg-blue-50 font-bold text-blue-600" : "text-gray-500"
                            }`}
                          >
                            {product && product.in_stock ? `$${(product.sale_price ?? product.price).toFixed(2)}` : product ? t("compare.soldOut", locale) : "-"}
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

function RecipeResult({ recipe, loadingPrices, locale }: { recipe: RecipeWithPricing; loadingPrices: boolean; locale: Locale }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [stepsOpen, setStepsOpen] = useState(false);

  const toggleItem = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = recipe.ingredients.length;

  const dishEmojis: Record<string, string> = {
    okonomiyaki: "🥞", "curry-rice": "🍛", "teriyaki-chicken": "🍗",
    "miso-soup": "🥣", oyakodon: "🍳", nikujaga: "🥘", karaage: "🍗", ramen: "🍜",
  };
  const emoji = dishEmojis[recipe.id] ?? "🍽️";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{recipeName(recipe.name_ja, recipe.name_en, locale, recipe.id)}</h2>
            <p className="text-orange-100 text-sm">{locale === "ja" ? recipe.name_en : recipe.name_ja}</p>
          </div>
        </div>
        <p className="text-orange-50 text-sm mt-2">{recipeDescription(recipe.description, locale, recipe.id)}</p>
        <div className="flex gap-4 mt-3 text-orange-100 text-xs">
          <span>👥 {t("recipe.servings", locale, { n: recipe.servings })}</span>
          <span>⏱️ {t("recipe.prepTime", locale, { n: recipe.prep_time })}</span>
          <span>🔥 {t("recipe.cookTime", locale, { n: recipe.cook_time })}</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">
            {t("recipe.ingredients", locale)}
            <span className="ml-2 text-sm font-normal text-gray-400">({t("recipe.checkedCount", locale, { checked: checkedCount, total: totalCount })})</span>
          </h3>
          {checkedCount > 0 && (
            <button onClick={() => setChecked({})} className="text-xs text-gray-400 hover:text-orange-500 transition-colors">{t("recipe.reset", locale)}</button>
          )}
        </div>
        <div className="space-y-2">
          {recipe.ingredients.filter((i) => !i.optional).map((ingredient, idx) => {
            const originalIdx = recipe.ingredients.indexOf(ingredient);
            return <IngredientCard key={idx} ingredient={ingredient} checked={!!checked[originalIdx]} onToggle={() => toggleItem(originalIdx)} loadingPrices={loadingPrices} locale={locale} />;
          })}
        </div>
        {recipe.ingredients.some((i) => i.optional) && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 font-medium mb-2">{t("recipe.optionalSection", locale)}</p>
            <div className="space-y-2">
              {recipe.ingredients.filter((i) => i.optional).map((ingredient, idx) => {
                const originalIdx = recipe.ingredients.indexOf(ingredient);
                return <IngredientCard key={idx} ingredient={ingredient} checked={!!checked[originalIdx]} onToggle={() => toggleItem(originalIdx)} loadingPrices={loadingPrices} locale={locale} />;
              })}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100">
        <button
          onClick={() => setStepsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-bold text-gray-800">{t("recipe.steps", locale)}</h3>
          <span className="text-gray-400 text-lg">{stepsOpen ? "▲" : "▼"}</span>
        </button>
        {stepsOpen && (
          <div className="px-5 pb-5">
            <ol className="space-y-3">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <div className="px-5 pb-4">
        <PriceComparePanel recipeId={recipe.id} recipeName={recipeName(recipe.name_ja, recipe.name_en, locale, recipe.id)} locale={locale} />
      </div>
    </div>
  );
}

function NearbyStoresPanel({ locale }: { locale: Locale }) {
  const [stores, setStores] = useState<NearbyStore[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError(t("nearby.notSupported", locale));
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/stores/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&limit=6`
          );
          const data = await res.json();
          setStores(data.nearest ?? []);
        } catch {
          setError(t("nearby.error", locale));
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(t("nearby.denied", locale));
        setLoading(false);
      }
    );
  };

  if (!stores && !loading) {
    return (
      <button
        onClick={getLocation}
        className="w-full py-3 px-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
      >
        📍 {t("nearby.button", locale)}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="py-3 text-center text-sm text-gray-400">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mr-2" />
        {t("nearby.loading", locale)}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-xs text-center py-2">{error}</p>;
  }

  const brandColors: Record<StoreKey, string> = {
    woolworths: "border-green-300 bg-green-50",
    paknsave: "border-yellow-300 bg-yellow-50",
    newworld: "border-red-300 bg-red-50",
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600">📍 {t("nearby.title", locale)}</p>
      <div className="grid grid-cols-2 gap-2">
        {(stores ?? []).map((store) => (
          <div
            key={store.id}
            className={`rounded-xl border-2 p-2.5 ${brandColors[store.brand]}`}
          >
            <p className="text-xs font-bold text-gray-800">{store.name}</p>
            <p className="text-xs text-gray-500">{store.address}</p>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              {store.distance_km} km
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIChatPanel({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chat.connectionError", locale) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all z-50"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: "28rem" }}>
      <div className="bg-orange-500 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-bold text-sm">🤖 {t("chat.title", locale)}</p>
          <p className="text-orange-100 text-xs">{t("chat.subtitle", locale)}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white text-xl hover:text-orange-200">✕</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-xs mb-3">{t("chat.examples", locale)}</p>
            {[t("chat.example1", locale), t("chat.example2", locale), t("chat.example3", locale)].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="block w-full text-left text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-1.5 hover:bg-orange-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-400">{t("chat.thinking", locale)}</div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-3 py-2 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder", locale)}
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {t("chat.send", locale)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreKey>("woolworths");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    fetch("/api/recipes/suggestions")
      .then((r) => r.json())
      .then((data) => setSuggestions(data.suggestions ?? []));
  }, []);

  const doSearch = useCallback(
    async (q: string, store: StoreKey = selectedStore) => {
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);
      try {
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(q)}&store=${store}`);
        const data: SearchResponse = await res.json();
        setSearchResult(data);
      } finally {
        setLoading(false);
      }
    },
    [selectedStore]
  );

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };
  const handleSuggestionClick = (name: string) => { setQuery(name); doSearch(name); };
  const handleStoreChange = (store: StoreKey) => {
    setSelectedStore(store);
    if (searched && query.trim()) doSearch(query, store);
  };
  const clearSearch = () => { setQuery(""); setSearchResult(null); setSearched(false); };

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🍱</span>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{t("header.title", locale)}</h1>
            <p className="text-xs text-gray-500">{t("header.subtitle", locale)}</p>
          </div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!searched && (
          <div className="text-center mb-6">
            <p className="text-gray-600 text-base leading-relaxed">
              {t("hero.description", locale)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative mb-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder", locale)}
            className="w-full pl-12 pr-24 py-3.5 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-xl">🔍</span>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            {loading ? t("search.loading", locale) : t("search.button", locale)}
          </button>
        </form>

        <StoreTabs selected={selectedStore} onChange={handleStoreChange} />

        {/* 最寄り店舗 */}
        <div className="mb-5">
          <NearbyStoresPanel locale={locale} />
        </div>

        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-medium mb-2">
              {searched ? t("suggestions.label", locale) : t("suggestions.labelInitial", locale)}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.name_ja)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all shadow-sm"
                >
                  {recipeName(s.name_ja, s.name_en, locale, s.id)}
                </button>
              ))}
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-400 text-sm">{t("search.emptyState", locale)}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 animate-bounce">🍳</div>
            <p className="text-gray-400 text-sm">{t("search.loadingPrices", locale, { store: STORE_LABELS[selectedStore] })}</p>
          </div>
        )}

        {!loading && searched && searchResult && (
          <div>
            {searchResult.results?.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm mb-4">
                <div className="text-4xl mb-3">🤔</div>
                <p className="text-gray-600 font-medium mb-1">
                  {searchResult.message ?? t("search.notFound", locale, { query })}
                </p>
                <p className="text-gray-400 text-sm">{t("search.notFoundHint", locale)}</p>
              </div>
            )}
            {(searchResult.results ?? []).map((recipe) => (
              <div key={recipe.id} className="mb-5">
                <RecipeResult recipe={recipe} loadingPrices={false} locale={locale} />
              </div>
            ))}
            <div className="text-center mt-4">
              <button onClick={clearSearch} className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                {t("search.back", locale)}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        {t("footer.text", locale)}
      </footer>

      <AIChatPanel locale={locale} />
    </div>
  );
}
