"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { IngredientWithPricing, CrossStoreAlt, StoreKey } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t, ingredientName, getSubstitution, quantity as tq } from "@/app/lib/i18n";
import { STORE_LABELS } from "@/constants/stores";
import { PriceBadge, StockBadge, StoreBadge } from "@/components/badges";

export function IngredientCard({
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
  const staticSub = getSubstitution(ingredient.name_ja, locale);
  const isOutOfStock = live && !live.inStock;
  const needsAiSub = isOutOfStock && !staticSub;

  const [aiSub, setAiSub] = useState<string | null>(null);
  const [aiSubLoading, setAiSubLoading] = useState(false);
  const aiSubFetched = useRef(false);
  const [crossStore, setCrossStore] = useState<CrossStoreAlt[]>([]);
  const crossStoreFetched = useRef(false);

  useEffect(() => {
    if (!isOutOfStock || crossStoreFetched.current || !ingredient.ingredient_id) return;
    crossStoreFetched.current = true;
    fetch(`/api/ingredients/cross-store?ingredient_id=${encodeURIComponent(ingredient.ingredient_id)}`)
      .then((r) => r.json())
      .then((data) => {
        const alts = (data.alternatives ?? []) as CrossStoreAlt[];
        const otherStore = alts.filter((a) => a.store !== live?.store);
        setCrossStore(otherStore);
      })
      .catch(() => {});
  }, [isOutOfStock, ingredient.ingredient_id, live?.store]);

  useEffect(() => {
    if (!needsAiSub || aiSubFetched.current) return;
    aiSubFetched.current = true;
    setAiSubLoading(true);
    fetch(`/api/substitution?ingredient=${encodeURIComponent(ingredient.name_ja)}&locale=${locale}`)
      .then((r) => r.json())
      .then((data) => { if (data.substitution) setAiSub(data.substitution); })
      .catch(() => {})
      .finally(() => setAiSubLoading(false));
  }, [needsAiSub, ingredient.name_ja, locale]);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        checked ? "bg-[#F0F5EE] border-[#4A6741]/30 opacity-60" : "bg-white border-gray-200 hover:border-[#4A6741]/40"
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
            checked ? "bg-[#4A6741] border-[#4A6741]" : "border-gray-300"
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
        <p className={`text-sm font-semibold text-[#4A6741] ${checked ? "line-through text-[#8BAF7E]" : ""}`}>
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
              {live.store && <StoreBadge store={live.store} />}
            </>
          ) : (
            <span className="text-xs text-gray-400">{t("ingredient.noPrice", locale)}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">💡 {ingredient.aisle}</p>
        {isOutOfStock && crossStore.length > 0 && (
          <div className="mt-1 space-y-1">
            {crossStore.map((alt) => {
              const effectivePrice = alt.sale_price ?? alt.price;
              return (
                <p key={alt.store} className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🏪 {STORE_LABELS[alt.store as StoreKey]}: ${effectivePrice.toFixed(2)}
                  {alt.sale_price && <span className="ml-1 text-red-500 font-medium">SALE</span>}
                  <span className="ml-1 text-emerald-500">({t("ingredient.inStock", locale)})</span>
                </p>
              );
            })}
          </div>
        )}
        {staticSub && (
          <p className={`text-xs mt-1 px-2 py-1 rounded-lg ${
            isOutOfStock
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-sky-50 text-sky-600 border border-sky-200"
          }`}>
            🔄 {staticSub}
          </p>
        )}
        {aiSubLoading && (
          <p className="text-xs mt-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
            🤖 Finding NZ alternative...
          </p>
        )}
        {aiSub && !staticSub && (
          <p className="text-xs mt-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
            🤖 {aiSub}
          </p>
        )}
        {!live && ingredient.alternatives && ingredient.alternatives.length > 0 && (
          <div className="mt-2 ml-2 border-l-2 border-emerald-300 pl-3 space-y-1.5">
            <p className="text-xs font-semibold text-emerald-700">
              ↳ Alternative
            </p>
            {ingredient.alternatives.map((alt, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                {alt.liveProduct?.imageUrl ? (
                  <Image
                    src={alt.liveProduct.imageUrl}
                    alt={alt.liveProduct.name ?? alt.name}
                    width={40}
                    height={40}
                    className="object-contain rounded shrink-0"
                    unoptimized
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span className="text-lg shrink-0">🔄</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-800">{alt.liveProduct?.name ?? alt.name}</p>
                  {alt.liveProduct && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <PriceBadge price={alt.liveProduct.price} salePrice={alt.liveProduct.salePrice} />
                      {alt.liveProduct.unitPrice && <span className="text-xs text-gray-400">{alt.liveProduct.unitPrice}</span>}
                      <StockBadge inStock={alt.liveProduct.inStock} locale={locale} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
