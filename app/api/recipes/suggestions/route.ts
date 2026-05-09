const POPULAR_RECIPES = [
  { id: "okonomiyaki", name_ja: "お好み焼き", name_en: "Okonomiyaki" },
  { id: "curry-rice", name_ja: "カレーライス", name_en: "Japanese Curry Rice" },
  { id: "ramen", name_ja: "ラーメン", name_en: "Ramen (Home Style)" },
  { id: "miso-soup", name_ja: "味噌汁", name_en: "Miso Soup" },
  { id: "karaage", name_ja: "唐揚げ", name_en: "Karaage Fried Chicken" },
  { id: "teriyaki-chicken", name_ja: "照り焼きチキン", name_en: "Teriyaki Chicken" },
  { id: "nikujaga", name_ja: "肉じゃが", name_en: "Nikujaga" },
  { id: "oyakodon", name_ja: "親子丼", name_en: "Oyakodon" },
  { id: "gyoza", name_ja: "餃子", name_en: "Gyoza" },
  { id: "tonkatsu", name_ja: "とんかつ", name_en: "Tonkatsu" },
  { id: "takoyaki", name_ja: "たこ焼き", name_en: "Takoyaki" },
  { id: "udon", name_ja: "うどん", name_en: "Udon Noodles" },
];

export async function GET() {
  return Response.json({ suggestions: POPULAR_RECIPES });
}
