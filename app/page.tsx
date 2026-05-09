"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { RecipeWithPricing, IngredientWithPricing } from "@/app/lib/recipes";
import { t, LOCALE_LABELS, recipeName, recipeDescription, ingredientName, getSubstitution, quantity as tq, type Locale } from "@/app/lib/i18n";

type StoreKey = "woolworths" | "paknsave" | "newworld";

function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = localStorage.getItem("nzrh_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nzrh_user_id", id);
  }
  return id;
}

function logActivity(data: {
  action_type: string;
  recipe_id?: string;
  store?: string;
  owned_ingredients?: string[];
  cheapest_store?: string;
  total_price?: number;
}) {
  fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: getUserId(), ...data }),
  }).catch(() => {});
}

interface CrossStoreAlt {
  store: StoreKey;
  product_name: string;
  price: number;
  sale_price: number | null;
}

interface AIInsight {
  type: "cost_saving" | "pattern" | "inventory";
  title: string;
  description: string;
  savings?: string;
  extra_cost?: string;
  store?: string;
  recipe_id?: string;
}

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
  recipe: { name: string };
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

// ---- Decorative SVG Components ----

function BlobShape() {
  return (
    <svg
      className="absolute top-0 left-0 w-48 h-48 opacity-80"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EDE8DF"
        d="M44.2,-56.8C56.3,-46.2,64,-30.2,67.1,-13.2C70.2,3.8,68.7,21.7,60.5,35.5C52.3,49.3,37.4,59,20.8,65.1C4.2,71.2,-14.1,73.7,-28.7,67.4C-43.3,61.1,-54.2,46.1,-61.2,29.4C-68.2,12.7,-71.4,-5.7,-66.5,-21.6C-61.7,-37.5,-48.9,-51,-34.4,-60.9C-19.9,-70.8,-3.7,-77.1,10.8,-74.8C25.3,-72.5,32.1,-67.4,44.2,-56.8Z"
        transform="translate(80 80)"
      />
    </svg>
  );
}

function CherryBlossomBranch() {
  return (
    <svg
      className="absolute top-2 left-2 w-44 h-44 opacity-90"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main branch */}
      <path d="M10 170 Q50 120 80 80 Q100 50 120 20" stroke="#8BAF7E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Sub branches */}
      <path d="M60 110 Q75 90 90 75" stroke="#8BAF7E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 140 Q55 125 65 110" stroke="#8BAF7E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Flower 1 */}
      <g transform="translate(120, 20)">
        <circle cx="0" cy="-8" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="7.6" cy="-2.5" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="4.7" cy="7" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="-4.7" cy="7" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="-7.6" cy="-2.5" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="0" cy="0" r="3" fill="#F5E6E6" />
      </g>
      {/* Flower 2 */}
      <g transform="translate(90, 75)">
        <circle cx="0" cy="-7" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="6.7" cy="-2.2" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="4.1" cy="6" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="-4.1" cy="6" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="-6.7" cy="-2.2" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="0" cy="0" r="2.5" fill="#F5E6E6" />
      </g>
      {/* Flower 3 (smaller) */}
      <g transform="translate(65, 110)">
        <circle cx="0" cy="-6" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="5.7" cy="-1.9" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="3.5" cy="5.1" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="-3.5" cy="5.1" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="-5.7" cy="-1.9" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="0" cy="0" r="2" fill="#F5E6E6" />
      </g>
      {/* Fallen petal */}
      <ellipse cx="150" cy="50" rx="5" ry="3" fill="#D4A0A0" opacity="0.5" transform="rotate(-30 150 50)" />
    </svg>
  );
}

function WavePattern() {
  // Seigaiha (overlapping wave/scale) pattern as SVG
  const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 20 Q10 0 20 20 Q30 0 40 20' fill='none' stroke='%23EDE8DF' stroke-width='1.5'/></svg>`;
  const dataUri = `data:image/svg+xml,${svgString}`;
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-24 opacity-60"
      style={{
        backgroundImage: `url("${dataUri}")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom",
        backgroundSize: "40px 20px",
      }}
    />
  );
}

function BowlIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam lines */}
      <path d="M20 14 Q22 8 20 2" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 12 Q34 6 32 0" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M44 14 Q46 8 44 2" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bowl body */}
      <path d="M8 28 Q8 52 32 52 Q56 52 56 28 Z" fill="#4A6741" opacity="0.15" />
      <path d="M8 28 Q8 52 32 52 Q56 52 56 28" stroke="#4A6741" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Bowl rim */}
      <ellipse cx="32" cy="28" rx="24" ry="6" stroke="#4A6741" strokeWidth="2.5" fill="white" />
      {/* Bowl base */}
      <path d="M22 52 L26 58 L38 58 L42 52" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="26" y1="58" x2="38" y2="58" stroke="#4A6741" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function FernLeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18 Q10 10 10 2" stroke="#4A6741" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14 Q7 11 4 12" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 10 Q13 7 16 8" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 6 Q8 3 6 4" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 16 Q13 13 15 14" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 12 Q8 9 5 9" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ---- Bottom Navigation Icons ----

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
      />
      <path d="M16.5 16.5L21 21" stroke={active ? "#4A6741" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 14 21 12 21Z"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon({ active, badgeCount }: { active: boolean; badgeCount: number }) {
  return (
    <div className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z"
          fill={active ? "#4A6741" : "none"}
          stroke={active ? "#4A6741" : "#9A9A9A"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 6H21" stroke={active ? "#4A6741" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke={active ? "white" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
      {badgeCount >= 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4A6741] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badgeCount}
        </span>
      )}
    </div>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="8"
        r="4"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
      />
      <path
        d="M4 20C4 17.79 7.58 16 12 16C16.42 16 20 17.79 20 20"
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Bottom Navigation Bar ----

function BottomNav({ checkedCount }: { checkedCount: number }) {
  const [activeTab, setActiveTab] = useState<"home" | "search" | "saved" | "list" | "profile">("home");

  const tabs = [
    { id: "home" as const, label: "Home", icon: (active: boolean) => <HomeIcon active={active} /> },
    { id: "search" as const, label: "Search", icon: (active: boolean) => <SearchNavIcon active={active} /> },
    { id: "saved" as const, label: "Saved", icon: (active: boolean) => <HeartIcon active={active} /> },
    { id: "list" as const, label: "My List", icon: (active: boolean) => <CartIcon active={active} badgeCount={checkedCount} /> },
    { id: "profile" as const, label: "Profile", icon: (active: boolean) => <ProfileIcon active={active} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8DF] z-20">
      <div className="max-w-2xl mx-auto flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0"
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium ${isActive ? "text-[#4A6741] font-semibold" : "text-[#9A9A9A]"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---- Welcome Page ----

function WelcomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#F7F3EC] overflow-hidden">
      {/* Decorative blob + cherry blossom top-left */}
      <BlobShape />
      <CherryBlossomBranch />

      {/* Wave pattern bottom */}
      <WavePattern />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Bowl icon + title */}
        <div className="flex flex-col items-center gap-3">
          <BowlIcon />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">NZ Recipe Helper</h1>
            <p className="text-sm text-[#5A5A5A] mt-1">Cook with confidence in New Zealand</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="w-full space-y-3">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="#4A6741" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Find ingredients instantly</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">See what you need for any recipe, in seconds.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M3 6H21" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Know what to buy</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">Clear photos and English names so you can shop with ease.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <FernLeafIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Smart swaps &amp; best prices</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">Get substitutes for hard-to-find items and the cheapest total across NZ supermarkets.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full bg-[#4A6741] hover:bg-[#3D5736] text-white rounded-full py-4 text-lg font-semibold transition-colors shadow-md"
        >
          Get Started
        </button>

        {/* Login link */}
        <p className="text-sm text-[#9A9A9A]">
          Already have an account?{" "}
          <span className="text-[#4A6741] font-medium cursor-pointer hover:underline">Log in</span>
        </p>
      </div>
    </div>
  );
}

// ---- Existing Components ----

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
              ? "bg-[#4A6741] text-white"
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

function StoreBadge({ store }: { store: string }) {
  const storeKey = store as StoreKey;
  const colorClass =
    storeKey === "paknsave"
      ? "bg-[#FFD100] text-gray-900"
      : storeKey === "newworld"
      ? "bg-[#E31837] text-white"
      : "bg-[#007A3D] text-white";
  const label = STORE_LABELS[storeKey] ?? store;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${colorClass}`}>
      {label}
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
                  🏪 {STORE_LABELS[alt.store]}: ${effectivePrice.toFixed(2)}
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
      </div>
    </div>
  );
}

function PriceComparePanel({ recipeId, recipeName, locale, ingredients: recipeIngredients }: { recipeId: string; recipeName: string; locale: Locale; ingredients: IngredientWithPricing[] }) {
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
                              isOwned ? "text-gray-300" : isLowest ? "bg-[#E8F0E5] font-bold text-[#4A6741]" : "text-gray-500"
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
      <div className="bg-gradient-to-r from-[#4A6741] to-[#5A7A4F] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{recipeName(recipe.name_ja, recipe.name_en, locale, recipe.id)}</h2>
            <p className="text-[#c8dbbf] text-sm">{locale === "ja" ? recipe.name_en : recipe.name_ja}</p>
          </div>
        </div>
        <p className="text-[#d8eacf] text-sm mt-2">{recipeDescription(recipe.description, locale, recipe.id)}</p>
        <div className="flex gap-4 mt-3 text-[#c8dbbf] text-xs">
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
            <button onClick={() => setChecked({})} className="text-xs text-gray-400 hover:text-[#4A6741] transition-colors">{t("recipe.reset", locale)}</button>
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
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#E8F0E5] text-[#4A6741] text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <div className="px-5 pb-4">
        <PriceComparePanel recipeId={recipe.id} recipeName={recipeName(recipe.name_ja, recipe.name_en, locale, recipe.id)} locale={locale} ingredients={recipe.ingredients} />
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

function AIChatPanel({ locale, showWelcome }: { locale: Locale; showWelcome: boolean }) {
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

  // Hide chat button on welcome page
  if (showWelcome) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#4A6741] hover:bg-[#3D5736] text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all z-50"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: "28rem" }}>
      <div className="bg-gradient-to-r from-[#4A6741] to-[#5A7A4F] px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-bold text-sm">🤖 {t("chat.title", locale)}</p>
          <p className="text-[#c8dbbf] text-xs">{t("chat.subtitle", locale)}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white text-xl hover:text-[#c8dbbf]">✕</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-xs mb-3">{t("chat.examples", locale)}</p>
            {[t("chat.example1", locale), t("chat.example2", locale), t("chat.example3", locale)].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="block w-full text-left text-xs text-[#4A6741] bg-[#E8F0E5] rounded-lg px-3 py-2 mb-1.5 hover:bg-[#d8eacf] transition-colors"
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
                msg.role === "user" ? "bg-[#4A6741] text-white" : "bg-gray-100 text-gray-800"
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
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4A6741]/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#4A6741] hover:bg-[#3D5736] disabled:bg-[#8BAF7E] text-white text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {t("chat.send", locale)}
          </button>
        </form>
      </div>
    </div>
  );
}

function AIInsightsPanel({
  locale,
  onRecipeClick,
}: {
  locale: Locale;
  onRecipeClick: (recipeId: string) => void;
}) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const userId = getUserId();
    setLoading(true);
    fetch(`/api/recommendations?user_id=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.insights?.length) setInsights(data.insights);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });
  }, [loaded]);

  if (loading) {
    return (
      <div className="mb-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-4 text-center">
        <span className="animate-spin inline-block w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />
        <span className="text-sm text-indigo-600">{t("insights.loading", locale)}</span>
      </div>
    );
  }

  if (!insights.length) return null;

  const typeConfig: Record<string, { icon: string; color: string; bg: string; border: string; labelKey: "insights.costSaving" | "insights.pattern" | "insights.inventory" }> = {
    cost_saving: { icon: "💰", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", labelKey: "insights.costSaving" },
    pattern: { icon: "📊", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", labelKey: "insights.pattern" },
    inventory: { icon: "🏠", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", labelKey: "insights.inventory" },
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <div>
          <h2 className="text-sm font-bold text-gray-800">{t("insights.title", locale)}</h2>
          <p className="text-xs text-gray-400">{t("insights.subtitle", locale)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type] ?? typeConfig.pattern;
          return (
            <div key={i} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {t(cfg.labelKey, locale)}
                    </span>
                    {insight.savings && (
                      <span className="text-xs font-bold text-green-600">Save {insight.savings}</span>
                    )}
                    {insight.extra_cost && (
                      <span className="text-xs font-bold text-purple-600">+{insight.extra_cost}</span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${cfg.color}`}>{insight.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{insight.description}</p>
                  {insight.recipe_id && (
                    <button
                      onClick={() => onRecipeClick(insight.recipe_id!)}
                      className={`mt-1.5 text-xs font-semibold ${cfg.color} hover:underline`}
                    >
                      {t("insights.tryRecipe", locale)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreKey>("woolworths");
  const [locale, setLocale] = useState<Locale>("en");
  const [checkedIngredientCount, setCheckedIngredientCount] = useState(0);

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
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(q)}&store=${store}&locale=${locale}`);
        const data: SearchResponse = await res.json();
        setSearchResult(data);
        if (data.results?.length) {
          logActivity({ action_type: "search", recipe_id: data.results[0].id, store });
        }
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
    logActivity({ action_type: "store_select", store });
    if (searched && query.trim()) doSearch(query, store);
  };
  const handleInsightRecipeClick = (recipeId: string) => {
    const nameMap: Record<string, string> = {
      "curry-rice": "カレーライス", "ramen": "ラーメン", "karaage": "唐揚げ",
      "teriyaki-chicken": "照り焼きチキン", "okonomiyaki": "お好み焼き",
      "miso-soup": "味噌汁", "nikujaga": "肉じゃが", "oyakodon": "親子丼",
    };
    const q = nameMap[recipeId] ?? recipeId;
    setQuery(q);
    doSearch(q);
  };
  const clearSearch = () => { setQuery(""); setSearchResult(null); setSearched(false); };

  // Count total checked ingredients across all displayed recipes
  useEffect(() => {
    // We track this at the page level by reading from search results
    // For now, use 0 as default — actual count is managed inside RecipeResult
    setCheckedIngredientCount(0);
  }, [searchResult]);

  if (showWelcome) {
    return <WelcomePage onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <header className="bg-white border-b border-[#EDE8DF] sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🍱</span>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{t("header.title", locale)}</h1>
            <p className="text-xs text-gray-500">{t("header.subtitle", locale)}</p>
          </div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
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
            className="w-full pl-12 pr-24 py-3.5 rounded-full border-2 border-[#4A6741]/20 focus:border-[#4A6741] focus:outline-none bg-white text-gray-800 placeholder-gray-400 text-base shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6741] text-xl">🔍</span>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#4A6741] hover:bg-[#3D5736] disabled:bg-[#8BAF7E] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            {loading ? t("search.loading", locale) : t("search.button", locale)}
          </button>
        </form>

        <StoreTabs selected={selectedStore} onChange={handleStoreChange} />

        {/* 最寄り店舗 */}
        <div className="mb-5">
          <NearbyStoresPanel locale={locale} />
        </div>

        {!searched && (
          <AIInsightsPanel locale={locale} onRecipeClick={handleInsightRecipeClick} />
        )}

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
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border-2 border-[#4A6741]/20 text-[#4A6741] hover:bg-[#4A6741] hover:border-[#4A6741] hover:text-white transition-all shadow-sm"
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
              <button onClick={clearSearch} className="text-sm text-gray-400 hover:text-[#4A6741] transition-colors">
                {t("search.back", locale)}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 pb-24 text-xs text-gray-400">
        {t("footer.text", locale)}
      </footer>

      <BottomNav checkedCount={checkedIngredientCount} />
      <AIChatPanel locale={locale} showWelcome={showWelcome} />
    </div>
  );
}
