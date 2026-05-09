"use client";

import { useState, useEffect } from "react";
import type { AIInsight } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t } from "@/app/lib/i18n";
import { getUserId } from "@/lib/activity";

export function AIInsightsPanel({
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
    
    // fetchの直前に移動、またはPromiseの中で実行
    const fetchData = async () => {
      setLoading(true); // 非同期関数内であれば許容されるケースが多いです
      try {
        const r = await fetch(`/api/recommendations?user_id=${encodeURIComponent(userId)}`);
        const data = await r.json();
        // ...
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
