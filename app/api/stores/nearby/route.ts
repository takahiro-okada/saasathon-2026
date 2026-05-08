import { NextRequest } from "next/server";

type StoreKey = "woolworths" | "paknsave" | "newworld";

interface StoreLocation {
  id: string;
  name: string;
  brand: StoreKey;
  lat: number;
  lng: number;
  address: string;
}

const STORES: StoreLocation[] = [
  // Christchurch Woolworths
  { id: "ww-riccarton", name: "Woolworths Riccarton", brand: "woolworths", lat: -43.5310, lng: 172.5830, address: "129 Riccarton Rd, Riccarton" },
  { id: "ww-moorhouse", name: "Woolworths Moorhouse Ave", brand: "woolworths", lat: -43.5410, lng: 172.6380, address: "Moorhouse Ave, Christchurch" },
  { id: "ww-shirley", name: "Woolworths Shirley", brand: "woolworths", lat: -43.5080, lng: 172.6530, address: "The Palms, Shirley" },
  { id: "ww-bush-inn", name: "Woolworths Bush Inn", brand: "woolworths", lat: -43.5270, lng: 172.5690, address: "Bush Inn Centre, Riccarton" },
  { id: "ww-ferrymead", name: "Woolworths Ferrymead", brand: "woolworths", lat: -43.5580, lng: 172.6920, address: "Ferrymead, Christchurch" },
  // Christchurch Pak'nSave
  { id: "pns-riccarton", name: "PAK'nSAVE Riccarton", brand: "paknsave", lat: -43.5340, lng: 172.5770, address: "Riccarton Rd, Riccarton" },
  { id: "pns-moorhouse", name: "PAK'nSAVE Moorhouse", brand: "paknsave", lat: -43.5430, lng: 172.6230, address: "Moorhouse Ave, Christchurch" },
  { id: "pns-wainoni", name: "PAK'nSAVE Wainoni", brand: "paknsave", lat: -43.5210, lng: 172.6870, address: "Wainoni Rd, Wainoni" },
  { id: "pns-rangiora", name: "PAK'nSAVE Rangiora", brand: "paknsave", lat: -43.3070, lng: 172.5940, address: "High St, Rangiora" },
  // Christchurch New World
  { id: "nw-ilam", name: "New World Ilam", brand: "newworld", lat: -43.5240, lng: 172.5710, address: "Clyde Rd, Ilam" },
  { id: "nw-stanmore", name: "New World Stanmore", brand: "newworld", lat: -43.5220, lng: 172.6590, address: "Stanmore Rd, Linwood" },
  { id: "nw-halswell", name: "New World Halswell", brand: "newworld", lat: -43.5760, lng: 172.5620, address: "Halswell Rd, Halswell" },
  { id: "nw-bishopdale", name: "New World Bishopdale", brand: "newworld", lat: -43.4960, lng: 172.5970, address: "Bishopdale, Christchurch" },
  { id: "nw-ferry-road", name: "New World Ferry Road", brand: "newworld", lat: -43.5450, lng: 172.6680, address: "Ferry Rd, Woolston" },
];

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
  const limit = parseInt(searchParams.get("limit") ?? "3");

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const storesWithDistance = STORES.map((store) => ({
    ...store,
    distance_km: Math.round(haversineDistance(lat, lng, store.lat, store.lng) * 10) / 10,
  }));

  storesWithDistance.sort((a, b) => a.distance_km - b.distance_km);

  const nearest = storesWithDistance.slice(0, limit);

  const brandNearest: Record<StoreKey, typeof nearest[0] | null> = {
    woolworths: null,
    paknsave: null,
    newworld: null,
  };
  for (const store of storesWithDistance) {
    if (!brandNearest[store.brand]) {
      brandNearest[store.brand] = store;
    }
    if (brandNearest.woolworths && brandNearest.paknsave && brandNearest.newworld) {
      break;
    }
  }

  return Response.json({
    nearest,
    nearest_per_brand: brandNearest,
    user_location: { lat, lng },
  });
}
