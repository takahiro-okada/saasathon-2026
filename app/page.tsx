"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { RecipeWithPricing, IngredientWithPricing } from "@/app/lib/recipes";

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
  woolworths:
    "bg-white text-green-700 border-green-300 hover:bg-green-50",
  paknsave:
    "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50",
  newworld: "bg-white text-red-700 border-red-300 hover:bg-red-50",
};

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
            selected === store
              ? STORE_COLORS[store]
              : STORE_INACTIVE[store]
          }`}
        >
          {STORE_LABELS[store]}
        </button>
      ))}
    </div>
  );
}

function PriceBadge({
  price,
  salePrice,
}: {
  price: number;
  salePrice?: number;
}) {
  if (price === 0) return null;

  if (salePrice && salePrice < price) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-red-500 font-bold text-sm">
          ${salePrice.toFixed(2)}
        </span>
        <span className="text-gray-400 line-through text-xs">
          ${price.toFixed(2)}
        </span>
        <span className="bg-red-100 text-red-600 text-xs px-1 rounded font-medium">
          SALE
        </span>
      </span>
    );
  }

  return (
    <span className="text-green-600 font-bold text-sm">${price.toFixed(2)}</span>
  );
}

function StockBadge({ inStock }: { inStock: boolean }) {
  return inStock ? (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      In Stock
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Out of Stock
    </span>
  );
}

function IngredientCard({
  ingredient,
  checked,
  onToggle,
  loadingPrices,
}: {
  ingredient: IngredientWithPricing;
  checked: boolean;
  onToggle: () => void;
  loadingPrices: boolean;
}) {
  const live = ingredient.liveProduct;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        checked
          ? "bg-orange-50 border-orange-300 opacity-60"
          : "bg-white border-gray-200 hover:border-orange-300"
      }`}
      onClick={onToggle}
    >
      {/* 商品画像 */}
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
              // 画像読み込み失敗時はプレースホルダーに差し替え
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-2xl">🛒</span>
        )}
      </div>

      {/* チェックボックス */}
      <div className="mt-0.5 shrink-0">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            checked
              ? "bg-orange-500 border-orange-500"
              : "border-gray-300"
          }`}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={`font-medium text-gray-900 ${
              checked ? "line-through text-gray-400" : ""
            }`}
          >
            {ingredient.name_ja}
          </span>
          <span className="text-sm text-gray-500">({ingredient.quantity})</span>
          {ingredient.optional && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              Optional
            </span>
          )}
        </div>

        <p
          className={`text-sm font-semibold text-orange-600 ${
            checked ? "line-through text-orange-400" : ""
          }`}
        >
          {live?.name ?? ingredient.nz_product}
        </p>

        {/* 価格・在庫情報 */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {loadingPrices ? (
            <span className="text-xs text-gray-400 animate-pulse">
              価格を読み込み中...
            </span>
          ) : live ? (
            <>
              <PriceBadge price={live.price} salePrice={live.salePrice} />
              {live.unitPrice && (
                <span className="text-xs text-gray-400">{live.unitPrice}</span>
              )}
              <StockBadge inStock={live.inStock} />
            </>
          ) : (
            <span className="text-xs text-gray-400">価格情報なし</span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-0.5">💡 {ingredient.aisle}</p>
      </div>
    </div>
  );
}

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

function PriceComparePanel({
  recipeId,
  recipeName,
}: {
  recipeId: string;
  recipeName: string;
}) {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    if (data) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/recipes/compare?recipe_id=${encodeURIComponent(recipeId)}`
      );
      if (!res.ok) throw new Error("比較データの取得に失敗しました");
      const json: CompareResponse = await res.json();
      setData(json);
      setOpen(true);
    } catch {
      setError("価格比較の取得に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const cheapest = data?.cheapest;

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
            3店舗の価格を取得中...
          </>
        ) : open ? (
          "▲ 価格比較を閉じる"
        ) : data ? (
          "▼ 価格比較を開く"
        ) : (
          <>💰 {recipeName}の最安スーパーを比較</>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}

      {open && data && (
        <div className="mt-3 space-y-3 animate-in fade-in">
          {/* 合計金額カード */}
          <div className="grid grid-cols-3 gap-2">
            {data.store_totals.map((st) => {
              const isCheapest = st.store === cheapest;
              return (
                <div
                  key={st.store}
                  className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                    isCheapest
                      ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                      : STORE_BG_COLORS[st.store]
                  }`}
                >
                  {isCheapest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      BEST
                    </span>
                  )}
                  <p
                    className={`text-xs font-semibold mb-1 ${STORE_TEXT_COLORS[st.store]}`}
                  >
                    {st.label}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      isCheapest ? "text-blue-600" : "text-gray-800"
                    }`}
                  >
                    {st.available_count === 0
                      ? "---"
                      : `$${st.total.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {st.available_count}/{st.available_count + st.missing_count}{" "}
                    品取得
                  </p>
                  {st.missing_count > 0 && (
                    <p className="text-xs text-orange-500 mt-0.5">
                      {st.missing_count}品 取得不可
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 材料別の詳細テーブル */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600">
                材料別 価格比較
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {data.ingredients
                .filter((i) => !i.is_optional)
                .map((ing) => (
                  <div key={ing.ingredient_id} className="px-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {ing.name_ja}
                      </span>
                      <span className="text-xs text-gray-400">
                        {ing.quantity}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["woolworths", "paknsave", "newworld"] as StoreKey[]).map(
                        (store) => {
                          const product = ing.stores[store];
                          const prices = (
                            ["woolworths", "paknsave", "newworld"] as StoreKey[]
                          )
                            .map((s) => {
                              const p = ing.stores[s];
                              return p && p.in_stock
                                ? p.sale_price ?? p.price
                                : Infinity;
                            });
                          const minPrice = Math.min(...prices);
                          const effectivePrice = product?.in_stock
                            ? (product.sale_price ?? product.price)
                            : null;
                          const isLowest =
                            effectivePrice !== null &&
                            effectivePrice === minPrice &&
                            minPrice < Infinity;

                          return (
                            <div
                              key={store}
                              className={`text-center py-1 px-1 rounded text-xs ${
                                isLowest
                                  ? "bg-blue-50 font-bold text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {product && product.in_stock
                                ? `$${(product.sale_price ?? product.price).toFixed(2)}`
                                : product
                                  ? "品切"
                                  : "-"}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeResult({
  recipe,
  loadingPrices,
}: {
  recipe: RecipeWithPricing;
  loadingPrices: boolean;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [stepsOpen, setStepsOpen] = useState(false);

  const toggleItem = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = recipe.ingredients.length;

  const dishEmojis: Record<string, string> = {
    okonomiyaki: "🥞",
    "curry-rice": "🍛",
    "teriyaki-chicken": "🍗",
    "miso-soup": "🥣",
    oyakodon: "🍳",
    nikujaga: "🥘",
    karaage: "🍗",
    ramen: "🍜",
  };
  const emoji = dishEmojis[recipe.id] ?? "🍽️";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* レシピヘッダー */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{recipe.name_ja}</h2>
            <p className="text-orange-100 text-sm">{recipe.name_en}</p>
          </div>
        </div>
        <p className="text-orange-50 text-sm mt-2">{recipe.description}</p>
        <div className="flex gap-4 mt-3 text-orange-100 text-xs">
          <span>👥 {recipe.servings}人前</span>
          <span>⏱️ 準備 {recipe.prep_time}分</span>
          <span>🔥 調理 {recipe.cook_time}分</span>
        </div>
      </div>

      {/* 材料リスト */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">
            材料リスト
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({checkedCount}/{totalCount} チェック済み)
            </span>
          </h3>
          {checkedCount > 0 && (
            <button
              onClick={() => setChecked({})}
              className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
            >
              リセット
            </button>
          )}
        </div>

        {/* 必須食材 */}
        <div className="space-y-2">
          {recipe.ingredients
            .filter((i) => !i.optional)
            .map((ingredient, idx) => {
              const originalIdx = recipe.ingredients.indexOf(ingredient);
              return (
                <IngredientCard
                  key={idx}
                  ingredient={ingredient}
                  checked={!!checked[originalIdx]}
                  onToggle={() => toggleItem(originalIdx)}
                  loadingPrices={loadingPrices}
                />
              );
            })}
        </div>

        {/* オプション食材 */}
        {recipe.ingredients.some((i) => i.optional) && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 font-medium mb-2">お好みで</p>
            <div className="space-y-2">
              {recipe.ingredients
                .filter((i) => i.optional)
                .map((ingredient, idx) => {
                  const originalIdx = recipe.ingredients.indexOf(ingredient);
                  return (
                    <IngredientCard
                      key={idx}
                      ingredient={ingredient}
                      checked={!!checked[originalIdx]}
                      onToggle={() => toggleItem(originalIdx)}
                      loadingPrices={loadingPrices}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 作り方（折りたたみ） */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setStepsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-bold text-gray-800">作り方</h3>
          <span className="text-gray-400 text-lg">{stepsOpen ? "▲" : "▼"}</span>
        </button>

        {stepsOpen && (
          <div className="px-5 pb-5">
            <ol className="space-y-3">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* 価格比較パネル */}
      <div className="px-5 pb-4">
        <PriceComparePanel recipeId={recipe.id} recipeName={recipe.name_ja} />
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
        const res = await fetch(
          `/api/recipes/search?q=${encodeURIComponent(q)}&store=${store}`
        );
        const data: SearchResponse = await res.json();
        setSearchResult(data);
      } finally {
        setLoading(false);
      }
    },
    [selectedStore]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    doSearch(name);
  };

  const handleStoreChange = (store: StoreKey) => {
    setSelectedStore(store);
    // 検索済みの場合は即再取得
    if (searched && query.trim()) {
      doSearch(query, store);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResult(null);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🍱</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              NZ Recipe Helper
            </h1>
            <p className="text-xs text-gray-500">
              NZスーパーで日本料理の材料を見つけよう
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* ヒーローセクション */}
        {!searched && (
          <div className="text-center mb-6">
            <p className="text-gray-600 text-base leading-relaxed">
              日本の料理を作りたい時、NZのスーパーで何を買えばいいか教えます
            </p>
          </div>
        )}

        {/* 検索バー */}
        <form onSubmit={handleSubmit} className="relative mb-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="料理名を入力（例：カレーライス）"
            className="w-full pl-12 pr-24 py-3.5 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-xl">
            🔍
          </span>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </form>

        {/* ストアセレクタ */}
        <StoreTabs selected={selectedStore} onChange={handleStoreChange} />

        {/* サジェストピル */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-medium mb-2">
              {searched ? "他のレシピ" : "レシピを選ぶ"}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.name_ja)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all shadow-sm"
                >
                  {s.name_ja}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 空状態 */}
        {!searched && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-400 text-sm">
              作りたい料理を検索するか、上のボタンから選んでください
            </p>
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 animate-bounce">🍳</div>
            <p className="text-gray-400 text-sm">
              レシピと{STORE_LABELS[selectedStore]}の価格を取得中...
            </p>
          </div>
        )}

        {/* 検索結果 */}
        {!loading && searched && searchResult && (
          <div>
            {/* 結果なし */}
            {searchResult.results?.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm mb-4">
                <div className="text-4xl mb-3">🤔</div>
                <p className="text-gray-600 font-medium mb-1">
                  {searchResult.message ?? "レシピが見つかりませんでした"}
                </p>
                <p className="text-gray-400 text-sm">
                  上のボタンから選んでみてください
                </p>
              </div>
            )}

            {/* レシピ一覧 */}
            {(searchResult.results ?? []).map((recipe) => (
              <div key={recipe.id} className="mb-5">
                <RecipeResult recipe={recipe} loadingPrices={false} />
              </div>
            ))}

            {/* 戻るボタン */}
            <div className="text-center mt-4">
              <button
                onClick={clearSearch}
                className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
              >
                ← 最初に戻る
              </button>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-6 text-xs text-gray-400">
        NZ Recipe Helper — Pak&apos;nSave / New World / Woolworths 対応
      </footer>
    </div>
  );
}
