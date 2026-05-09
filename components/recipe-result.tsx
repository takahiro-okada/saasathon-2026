"use client";

import { useState } from "react";
import type { RecipeWithPricing } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t, recipeName, recipeDescription, quantity as tq } from "@/app/lib/i18n";
import { IngredientCard } from "@/components/ingredient-card";
import { PriceComparePanel } from "@/components/price-compare-panel";

export function RecipeResult({ recipe, loadingPrices, locale }: { recipe: RecipeWithPricing; loadingPrices: boolean; locale: Locale }) {
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
