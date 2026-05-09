"use client";

import { useState } from "react";
import type { NearbyStore, StoreKey } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t } from "@/app/lib/i18n";

export function NearbyStoresPanel({ locale }: { locale: Locale }) {
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
