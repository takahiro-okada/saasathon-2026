"use client";

import Image from "next/image";
import type { StoreKey } from "@/types";
import { STORE_COLORS, STORE_INACTIVE, STORE_LOGOS, STORE_LABELS } from "@/constants/stores";

export function StoreTabs({
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
          className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center justify-center ${
            selected === store ? STORE_COLORS[store] : STORE_INACTIVE[store]
          }`}
        >
          <Image
            src={STORE_LOGOS[store]}
            alt={STORE_LABELS[store]}
            width={100}
            height={24}
            className={`h-6 w-auto ${selected !== store ? "opacity-70" : ""}`}
            unoptimized
          />
        </button>
      ))}
    </div>
  );
}
