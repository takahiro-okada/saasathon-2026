import type { RecipeWithPricing as _RecipeWithPricing } from "@/app/lib/recipes";

export type { Ingredient, LiveProduct, AlternativeProduct, IngredientWithPricing, Recipe, RecipeWithPricing } from "@/app/lib/recipes";
export type { Locale } from "@/app/lib/i18n";

export type StoreKey = "woolworths" | "paknsave" | "newworld";

export interface CrossStoreAlt {
  store: StoreKey;
  product_name: string;
  price: number;
  sale_price: number | null;
}

export interface AIInsight {
  type: "cost_saving" | "pattern" | "inventory";
  title: string;
  description: string;
  savings?: string;
  extra_cost?: string;
  store?: string;
  recipe_id?: string;
}

export interface RecipeSuggestion {
  id: string;
  name_ja: string;
  name_en: string;
}

export interface SearchResponse {
  results?: _RecipeWithPricing[];
  suggestions?: RecipeSuggestion[];
  message?: string;
  store?: StoreKey;
}

export interface StoreTotal {
  store: StoreKey;
  total: number;
  available_count: number;
  missing_count: number;
  label: string;
}

export interface CompareIngredientStore {
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  in_stock: boolean;
  unit_price?: string;
}

export interface CompareIngredient {
  ingredient_id: string;
  name_ja: string;
  name_en: string;
  quantity: string;
  is_optional: boolean;
  stores: Record<StoreKey, CompareIngredientStore | null>;
}

export interface CompareResponse {
  recipe: { name: string };
  ingredients: CompareIngredient[];
  store_totals: StoreTotal[];
  cheapest: StoreKey | null;
}

export interface NearbyStore {
  id: string;
  name: string;
  brand: StoreKey;
  distance_km: number;
  address: string;
}

export interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: "above" | "below";
}
