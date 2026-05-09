import type { StoreKey } from "@/types";

export const STORE_LABELS: Record<StoreKey, string> = {
  woolworths: "Woolworths",
  paknsave: "Pak'nSave",
  newworld: "New World",
};

export const STORE_COLORS: Record<StoreKey, string> = {
  woolworths: "bg-green-600 text-white border-green-600",
  paknsave: "bg-yellow-400 text-gray-900 border-yellow-400",
  newworld: "bg-red-600 text-white border-red-600",
};

export const STORE_INACTIVE: Record<StoreKey, string> = {
  woolworths: "bg-white text-green-700 border-green-300 hover:bg-green-50",
  paknsave: "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50",
  newworld: "bg-white text-red-700 border-red-300 hover:bg-red-50",
};

export const STORE_BG_COLORS: Record<StoreKey, string> = {
  woolworths: "bg-green-50 border-green-200",
  paknsave: "bg-yellow-50 border-yellow-200",
  newworld: "bg-red-50 border-red-200",
};

export const STORE_TEXT_COLORS: Record<StoreKey, string> = {
  woolworths: "text-green-700",
  paknsave: "text-yellow-700",
  newworld: "text-red-700",
};

export const STORE_LOGOS: Record<StoreKey, string> = {
  woolworths: "/logos/woolworths.svg",
  paknsave: "/logos/paknsave.svg",
  newworld: "/logos/newworld.svg",
};

export const STORE_BADGE_LOGOS: Record<StoreKey, string> = {
  woolworths: "/logos/woolworths-badge.svg",
  paknsave: "/logos/paknsave-badge.svg",
  newworld: "/logos/newworld-badge.svg",
};
