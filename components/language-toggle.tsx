"use client";

import { LOCALE_LABELS, type Locale } from "@/app/lib/i18n";

export function LanguageToggle({
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
