const POPULAR_RECIPES = [
  { id: "okonomiyaki", name_ja: "お好み焼き", name_en: "Okonomiyaki" },
  { id: "curry-rice", name_ja: "カレーライス", name_en: "Japanese Curry Rice" },
  { id: "ramen", name_ja: "ラーメン", name_en: "Ramen (Home Style)" },
  { id: "gyoza", name_ja: "餃子", name_en: "Gyoza" },
];

export async function GET() {
  return Response.json({ suggestions: POPULAR_RECIPES });
}
