import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

type StoreKey = "woolworths" | "paknsave" | "newworld";

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const limit = parseInt(searchParams.get("limit") ?? "6");

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const { data: stores } = await supabase
    .from("store_locations")
    .select("id, brand, name, slug, address, lat, lng");

  if (!stores || stores.length === 0) {
    return Response.json({ error: "No stores found" }, { status: 500 });
  }

  const storesWithDistance = stores.map((store) => ({
    ...store,
    distance_km:
      Math.round(
        haversineDistance(lat, lng, store.lat, store.lng) * 10
      ) / 10,
  }));

  storesWithDistance.sort((a, b) => a.distance_km - b.distance_km);

  const nearest = storesWithDistance.slice(0, limit);

  const brandNearest: Record<StoreKey, (typeof nearest)[0] | null> = {
    woolworths: null,
    paknsave: null,
    newworld: null,
  };
  for (const store of storesWithDistance) {
    const brand = store.brand as StoreKey;
    if (!brandNearest[brand]) {
      brandNearest[brand] = store;
    }
    if (
      brandNearest.woolworths &&
      brandNearest.paknsave &&
      brandNearest.newworld
    ) {
      break;
    }
  }

  return Response.json({
    nearest,
    nearest_per_brand: brandNearest,
    user_location: { lat, lng },
  });
}
