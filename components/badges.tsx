"use client";

import Image from "next/image";
import type { StoreKey } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t } from "@/app/lib/i18n";
import { STORE_LABELS, STORE_BADGE_LOGOS } from "@/constants/stores";

export function PriceBadge({ price, salePrice }: { price: number; salePrice?: number }) {
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

export function StockBadge({ inStock, locale }: { inStock: boolean; locale: Locale }) {
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

export function StoreBadge({ store }: { store: string }) {
  const storeKey = store as StoreKey;
  const logo = STORE_BADGE_LOGOS[storeKey];
  const label = STORE_LABELS[storeKey] ?? store;
  if (!logo) {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-gray-200 text-gray-700">
        {label}
      </span>
    );
  }
  return (
    <Image
      src={logo}
      alt={label}
      width={72}
      height={16}
      className="h-4 w-auto inline-block"
      unoptimized
    />
  );
}
