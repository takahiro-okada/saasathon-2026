const POPULAR_RECIPES = [
  { id: "okonomiyaki", name_ja: "お好み焼き", name_en: "Okonomiyaki", name_zh: "大阪烧" },
  { id: "curry-rice", name_ja: "カレーライス", name_en: "Japanese Curry Rice", name_zh: "日式咖喱饭" },
  { id: "ramen", name_ja: "ラーメン", name_en: "Ramen (Home Style)", name_zh: "拉面" },
  { id: "gyoza", name_ja: "餃子", name_en: "Gyoza", name_zh: "煎饺" },
];

export async function GET() {
  return Response.json({ suggestions: POPULAR_RECIPES });
}
