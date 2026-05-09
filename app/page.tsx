"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StoreKey, RecipeSuggestion, SearchResponse } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t, recipeName } from "@/app/lib/i18n";
import { STORE_LABELS } from "@/constants/stores";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { logActivity } from "@/lib/activity";
import { WelcomePage } from "@/components/welcome-page";
import { OnboardingOverlay } from "@/components/onboarding-overlay";
import { LanguageToggle } from "@/components/language-toggle";
import { StoreTabs } from "@/components/store-tabs";
import { RecipeResult } from "@/components/recipe-result";

export default function HomePage() {
  // 1. Initial states set to neutral values to match Server-Side Rendering
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreKey>("woolworths");
  const [locale, setLocale] = useState<Locale>("en");
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 2. Handle Hydration: Only check localStorage after the component mounts in the browser
  useEffect(() => {
    setHasMounted(true);
    const isDone = localStorage.getItem("nzrh_onboarding_done");
    if (isDone !== "true") {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setHeaderVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setHeaderVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    [selectedStore, locale]
  );

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };
  const handleSuggestionClick = (name: string) => { setQuery(name); doSearch(name); };
  const handleStoreChange = (store: StoreKey) => {
    setSelectedStore(store);
    logActivity({ action_type: "store_select", store });
    if (searched && query.trim()) doSearch(query, store);
  };
  const clearSearch = () => { setQuery(""); setSearchResult(null); setSearched(false); };

  const handleGetStarted = () => {
    setShowWelcome(false);
    setOnboardingStep(0);
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === null) return;
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingStep(null);
      localStorage.setItem("nzrh_onboarding_done", "true");
    }
  };

  const handleOnboardingSkip = () => {
    setOnboardingStep(null);
    localStorage.setItem("nzrh_onboarding_done", "true");
  };

  // 3. Prevent rendering anything until the client has mounted to avoid UI mismatch
  if (!hasMounted) {
    return <div className="min-h-screen bg-[#F7F3EC]" />; // Return an empty shell with the same background
  }

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <header
        className={`bg-white border-b border-[#EDE8DF] sticky top-0 z-10 shadow-sm transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
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
        <form onSubmit={handleSubmit} className="relative mb-5" data-onboarding="step-1">
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

        <div data-onboarding="step-2">
          <StoreTabs selected={selectedStore} onChange={handleStoreChange} />
        </div>

        {suggestions.length > 0 && (
          <div className="mb-6" data-onboarding="step-3">
            <p className="text-xs text-gray-400 font-medium mb-2">
              {searched ? t("suggestions.label", locale) : t("suggestions.labelInitial", locale)}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(locale === "en" ? s.name_en : s.name_ja)}
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

      {onboardingStep !== null && (
        <OnboardingOverlay
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}