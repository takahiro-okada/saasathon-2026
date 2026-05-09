export type Locale = "en" | "ja" | "zh";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ja: "JA",
  zh: "ZH",
};

const translations = {
  // Header
  "header.title": {
    en: "NZ Recipe Helper",
    ja: "NZ Recipe Helper",
    zh: "NZ Recipe Helper",
  },
  "header.subtitle": {
    en: "Find Japanese cooking ingredients at NZ supermarkets",
    ja: "NZスーパーで日本料理の材料を見つけよう",
    zh: "在NZ超市找到日本料理食材",
  },

  // Hero
  "hero.description": {
    en: "Want to cook Japanese food? We'll tell you what to buy at NZ supermarkets",
    ja: "日本の料理を作りたい時、NZのスーパーで何を買えばいいか教えます",
    zh: "想做日本料理？我们告诉你在NZ超市该买什么",
  },

  // Search
  "search.placeholder": {
    en: "Enter a dish name (e.g. Curry Rice)",
    ja: "料理名を入力（例：カレーライス）",
    zh: "输入菜名（例：咖喱饭）",
  },
  "search.button": {
    en: "Search",
    ja: "検索",
    zh: "搜索",
  },
  "search.loading": {
    en: "Searching...",
    ja: "検索中...",
    zh: "搜索中...",
  },
  "search.notFound": {
    en: "No recipes found for \"{query}\".",
    ja: "「{query}」のレシピは見つかりませんでした。",
    zh: "未找到「{query}」的食谱。",
  },
  "search.notFoundHint": {
    en: "Try selecting from the buttons above",
    ja: "上のボタンから選んでみてください",
    zh: "请尝试从上方按钮中选择",
  },
  "search.back": {
    en: "← Back to start",
    ja: "← 最初に戻る",
    zh: "← 返回首页",
  },
  "search.emptyState": {
    en: "Search for a dish or select from the buttons above",
    ja: "作りたい料理を検索するか、上のボタンから選んでください",
    zh: "搜索菜品或从上方按钮中选择",
  },
  "search.loadingPrices": {
    en: "Fetching recipes and {store} prices...",
    ja: "レシピと{store}の価格を取得中...",
    zh: "正在获取食谱和{store}价格...",
  },

  // Suggestions
  "suggestions.label": {
    en: "Other recipes",
    ja: "他のレシピ",
    zh: "其他食谱",
  },
  "suggestions.labelInitial": {
    en: "Choose a recipe",
    ja: "レシピを選ぶ",
    zh: "选择食谱",
  },

  // Recipe
  "recipe.ingredients": {
    en: "Ingredients",
    ja: "材料リスト",
    zh: "食材清单",
  },
  "recipe.checkedCount": {
    en: "{checked}/{total} checked",
    ja: "{checked}/{total} チェック済み",
    zh: "{checked}/{total} 已勾选",
  },
  "recipe.reset": {
    en: "Reset",
    ja: "リセット",
    zh: "重置",
  },
  "recipe.optional": {
    en: "Optional",
    ja: "お好みで",
    zh: "可选",
  },
  "recipe.optionalSection": {
    en: "Optional",
    ja: "お好みで",
    zh: "可选配料",
  },
  "recipe.steps": {
    en: "Steps",
    ja: "作り方",
    zh: "做法",
  },
  "recipe.servings": {
    en: "{n} servings",
    ja: "{n}人前",
    zh: "{n}人份",
  },
  "recipe.prepTime": {
    en: "Prep {n}min",
    ja: "準備 {n}分",
    zh: "准备 {n}分钟",
  },
  "recipe.cookTime": {
    en: "Cook {n}min",
    ja: "調理 {n}分",
    zh: "烹饪 {n}分钟",
  },

  // Ingredient
  "ingredient.noPrice": {
    en: "No price info",
    ja: "価格情報なし",
    zh: "暂无价格",
  },
  "ingredient.loadingPrice": {
    en: "Loading prices...",
    ja: "価格を読み込み中...",
    zh: "正在加载价格...",
  },
  "ingredient.inStock": {
    en: "In Stock",
    ja: "在庫あり",
    zh: "有货",
  },
  "ingredient.outOfStock": {
    en: "Out of Stock",
    ja: "品切れ",
    zh: "缺货",
  },

  // Price compare
  "compare.button": {
    en: "Compare cheapest store for {recipe}",
    ja: "{recipe}の最安スーパーを比較",
    zh: "比较{recipe}最便宜的超市",
  },
  "compare.loading": {
    en: "Fetching prices from 3 stores...",
    ja: "3店舗の価格を取得中...",
    zh: "正在获取3家店铺的价格...",
  },
  "compare.close": {
    en: "Close comparison",
    ja: "価格比較を閉じる",
    zh: "关闭比较",
  },
  "compare.open": {
    en: "Open comparison",
    ja: "価格比較を開く",
    zh: "打开比较",
  },
  "compare.error": {
    en: "Failed to load price comparison. Please try again.",
    ja: "価格比較の取得に失敗しました。もう一度お試しください。",
    zh: "价格比较加载失败，请重试。",
  },
  "compare.ownedTitle": {
    en: "Check ingredients you own (excluded from total)",
    ja: "持っている食材をチェック（合計から除外）",
    zh: "勾选已有食材（从总价中排除）",
  },
  "compare.excludingCount": {
    en: "{n} excluded",
    ja: "{n}品除外中",
    zh: "已排除{n}项",
  },
  "compare.resetOwned": {
    en: "Reset",
    ja: "リセット",
    zh: "重置",
  },
  "compare.perItemTitle": {
    en: "Price comparison by ingredient",
    ja: "材料別 価格比較",
    zh: "各食材价格对比",
  },
  "compare.items": {
    en: "items",
    ja: "品",
    zh: "项",
  },
  "compare.unavailable": {
    en: "{n} unavailable",
    ja: "{n}品 取得不可",
    zh: "{n}项无货",
  },
  "compare.soldOut": {
    en: "N/A",
    ja: "品切",
    zh: "缺货",
  },

  // Nearby stores
  "nearby.button": {
    en: "Find nearest supermarkets",
    ja: "現在地から最寄りのスーパーを探す",
    zh: "查找最近的超市",
  },
  "nearby.title": {
    en: "Nearest supermarkets",
    ja: "最寄りのスーパー",
    zh: "最近的超市",
  },
  "nearby.loading": {
    en: "Getting your location...",
    ja: "位置情報を取得中...",
    zh: "正在获取位置...",
  },
  "nearby.notSupported": {
    en: "Geolocation is not supported",
    ja: "位置情報がサポートされていません",
    zh: "不支持地理定位",
  },
  "nearby.denied": {
    en: "Location access was denied",
    ja: "位置情報の取得が拒否されました",
    zh: "位置访问被拒绝",
  },
  "nearby.error": {
    en: "Failed to fetch store info",
    ja: "店舗情報の取得に失敗しました",
    zh: "获取店铺信息失败",
  },

  // AI Chat
  "chat.title": {
    en: "Recipe Assistant",
    ja: "レシピ相談",
    zh: "食谱助手",
  },
  "chat.subtitle": {
    en: "Get cooking suggestions for NZ",
    ja: "NZで作れる料理を提案します",
    zh: "获取NZ烹饪建议",
  },
  "chat.placeholder": {
    en: "Type a question...",
    ja: "質問を入力...",
    zh: "输入问题...",
  },
  "chat.send": {
    en: "Send",
    ja: "送信",
    zh: "发送",
  },
  "chat.thinking": {
    en: "Thinking...",
    ja: "考え中...",
    zh: "思考中...",
  },
  "chat.examples": {
    en: "For example...",
    ja: "例えば...",
    zh: "例如...",
  },
  "chat.example1": {
    en: "I have eggs and onions. What can I make?",
    ja: "冷蔵庫に卵と玉ねぎがある。何が作れる？",
    zh: "我有鸡蛋和洋葱，能做什么？",
  },
  "chat.example2": {
    en: "Easy Japanese dishes with NZ ingredients?",
    ja: "NZで手に入りやすい日本料理は？",
    zh: "用NZ食材能做什么日本菜？",
  },
  "chat.example3": {
    en: "What's a good secret ingredient for curry?",
    ja: "カレーの隠し味を教えて",
    zh: "咖喱的秘诀调料是什么？",
  },
  "chat.connectionError": {
    en: "Connection error. Please try again.",
    ja: "接続エラーが発生しました。もう一度お試しください。",
    zh: "连接出错，请重试。",
  },

  // AI Insights
  "insights.title": {
    en: "AI Shopping Insights",
    ja: "AIショッピングインサイト",
    zh: "AI购物洞察",
  },
  "insights.subtitle": {
    en: "Personalized tips based on your activity",
    ja: "あなたの使い方に基づくパーソナルなヒント",
    zh: "基于您的使用习惯的个性化建议",
  },
  "insights.loading": {
    en: "Analyzing your shopping patterns...",
    ja: "お買い物パターンを分析中...",
    zh: "正在分析您的购物模式...",
  },
  "insights.error": {
    en: "Could not load insights",
    ja: "インサイトの読み込みに失敗",
    zh: "无法加载洞察",
  },
  "insights.costSaving": {
    en: "Cost Saving",
    ja: "節約ヒント",
    zh: "省钱建议",
  },
  "insights.pattern": {
    en: "Cooking Pattern",
    ja: "料理パターン",
    zh: "烹饪模式",
  },
  "insights.inventory": {
    en: "Smart Inventory",
    ja: "在庫活用",
    zh: "智能库存",
  },
  "insights.tryRecipe": {
    en: "Try this recipe →",
    ja: "このレシピを試す →",
    zh: "试试这个食谱 →",
  },

  // Footer
  "footer.text": {
    en: "NZ Recipe Helper — Pak'nSave / New World / Woolworths",
    ja: "NZ Recipe Helper — Pak'nSave / New World / Woolworths 対応",
    zh: "NZ Recipe Helper — 支持 Pak'nSave / New World / Woolworths",
  },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale, params?: Record<string, string | number>): string {
  const template: string = translations[key]?.[locale] ?? translations[key]?.["en"] ?? key;
  if (!params) return template;
  let result = template;
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{${k}}`, String(v));
  }
  return result;
}

const recipeNamesZh: Record<string, string> = {
  "okonomiyaki": "大阪烧",
  "curry-rice": "咖喱饭",
  "teriyaki-chicken": "照烧鸡肉",
  "miso-soup": "味噌汤",
  "oyakodon": "亲子丼",
  "nikujaga": "土豆炖肉",
  "karaage": "日式炸鸡",
  "ramen": "拉面",
};

const recipeDescriptionsEn: Record<string, string> = {
  "okonomiyaki": "Osaka-style savory pancake loaded with cabbage, topped with sauce and mayo.",
  "curry-rice": "Classic Japanese home-style curry using store-bought roux. Rich and deeply flavored.",
  "teriyaki-chicken": "Sweet and savory glazed chicken — a go-to rice companion.",
  "miso-soup": "Everyday miso soup with tofu and wakame. A staple at every Japanese table.",
  "oyakodon": "Chicken and egg rice bowl simmered in sweet soy broth. Fluffy eggs are key.",
  "nikujaga": "Japanese comfort food — potatoes and beef simmered in sweet soy sauce.",
  "karaage": "Crispy Japanese fried chicken marinated in garlic and soy. Great with beer.",
  "ramen": "Quick home-style ramen using store-bought broth. Level up with chashu and soft-boiled egg.",
};

const recipeDescriptionsZh: Record<string, string> = {
  "okonomiyaki": "日式什锦煎饼，加入卷心菜和你喜欢的配料，淋上特制酱汁。",
  "curry-rice": "日式咖喱饭，浓郁的咖喱酱配上米饭，家庭料理的经典之选。",
  "teriyaki-chicken": "甜咸酱汁的照烧鸡肉，简单又美味的日式料理。",
  "miso-soup": "日本家庭每天都喝的味噌汤，用豆腐和海带做成。",
  "oyakodon": "鸡肉和鸡蛋盖饭，「亲子」的意思是父母和孩子。",
  "nikujaga": "日式土豆炖牛肉，甜咸口味的家庭comfort food。",
  "karaage": "日式炸鸡块，外酥里嫩，是居酒屋的人气菜品。",
  "ramen": "用市售汤底做的家庭拉面，加上叉烧和溏心蛋更美味。",
};

const ingredientNamesZh: Record<string, string> = {
  "ラーメン麺": "拉面面条",
  "鶏ガラスープ素": "鸡骨汤粉",
  "醤油": "酱油",
  "味噌": "味噌",
  "みりん": "味醂",
  "砂糖": "砂糖",
  "塩": "盐",
  "こしょう": "胡椒",
  "ごま油": "芝麻油",
  "サラダ油": "色拉油",
  "にんにく": "大蒜",
  "生姜": "生姜",
  "しょうが": "生姜",
  "長ねぎ": "大葱",
  "玉ねぎ": "洋葱",
  "にんじん": "胡萝卜",
  "じゃがいも": "土豆",
  "キャベツ": "卷心菜",
  "もやし": "豆芽",
  "ほうれん草": "菠菜",
  "豆腐": "豆腐",
  "わかめ": "裙带菜",
  "のり": "海苔",
  "卵": "鸡蛋",
  "鶏もも肉": "鸡腿肉",
  "鶏むね肉": "鸡胸肉",
  "豚バラ肉": "五花肉",
  "牛薄切り肉": "牛肉薄片",
  "チャーシュー": "叉烧",
  "煮卵": "溏心蛋",
  "メンマ": "笋干",
  "小麦粉": "面粉",
  "片栗粉": "淀粉",
  "パン粉": "面包糠",
  "カレールー": "咖喱块",
  "だし": "高汤",
  "酒": "料酒",
  "酢": "醋",
  "マヨネーズ": "蛋黄酱",
  "お好みソース": "大阪烧酱",
  "青のり": "青海苔粉",
  "かつお節": "柴鱼片",
  "紅生姜": "红姜",
  "天かす": "天妇罗碎",
  "三つ葉": "鸭儿芹",
  "大根": "萝卜",
  "こんにゃく": "魔芋",
  "絹さや": "荷兰豆",
  "白ごま": "白芝麻",
  "米": "米饭",
  "糸こんにゃく": "魔芋丝",
  "揚げ油": "炸油",
  "レモン": "柠檬",
  "お好み焼きソース": "大阪烧酱",
  "白米": "白米饭",
  "海苔": "海苔",
  "だし粉": "高汤粉",
};

const quantityTranslations: Record<string, { en: string; zh: string }> = {
  "2人前": { en: "2 servings", zh: "2人份" },
  "1個": { en: "1 piece", zh: "1个" },
  "2個": { en: "2 pieces", zh: "2个" },
  "3個": { en: "3 pieces", zh: "3个" },
  "1/2個": { en: "1/2 piece", zh: "半个" },
  "1本": { en: "1 piece", zh: "1根" },
  "1かけ": { en: "1 clove", zh: "1瓣" },
  "2かけ": { en: "2 cloves", zh: "2瓣" },
  "2枚": { en: "2 slices", zh: "2片" },
  "2枚(400g)": { en: "2 slices (400g)", zh: "2片(400g)" },
  "2合": { en: "2 cups", zh: "2杯" },
  "100g": { en: "100g", zh: "100g" },
  "150g": { en: "150g", zh: "150g" },
  "200g": { en: "200g", zh: "200g" },
  "300g": { en: "300g", zh: "300g" },
  "400g": { en: "400g", zh: "400g" },
  "大さじ1": { en: "1 tbsp", zh: "1大勺" },
  "大さじ1.5": { en: "1.5 tbsp", zh: "1.5大勺" },
  "大さじ1(乾燥)": { en: "1 tbsp (dried)", zh: "1大勺(干)" },
  "大さじ2": { en: "2 tbsp", zh: "2大勺" },
  "大さじ3": { en: "3 tbsp", zh: "3大勺" },
  "大さじ4": { en: "4 tbsp", zh: "4大勺" },
  "小さじ1": { en: "1 tsp", zh: "1小勺" },
  "小さじ2": { en: "2 tsp", zh: "2小勺" },
  "適量": { en: "to taste", zh: "适量" },
  "1箱(180g)": { en: "1 box (180g)", zh: "1盒(180g)" },
};

export function quantity(q: string, locale: Locale): string {
  if (locale === "ja") return q;
  return quantityTranslations[q]?.[locale] ?? q;
}

export function recipeName(nameJa: string, nameEn: string, locale: Locale, recipeId?: string): string {
  if (locale === "ja") return nameJa;
  if (locale === "zh" && recipeId && recipeNamesZh[recipeId]) return recipeNamesZh[recipeId];
  if (locale === "zh") return nameJa;
  return nameEn;
}

export function recipeDescription(description: string, locale: Locale, recipeId?: string): string {
  if (locale === "en" && recipeId && recipeDescriptionsEn[recipeId]) return recipeDescriptionsEn[recipeId];
  if (locale === "zh" && recipeId && recipeDescriptionsZh[recipeId]) return recipeDescriptionsZh[recipeId];
  return description;
}

const substitutions: Record<string, { en: string; ja: string; zh: string }> = {
  "三つ葉": {
    en: "Use parsley or coriander instead",
    ja: "パセリやコリアンダーで代用可",
    zh: "可用欧芹或香菜代替",
  },
  "メンマ": {
    en: "Use canned bamboo shoots instead",
    ja: "水煮たけのこで代用可",
    zh: "可用罐装竹笋代替",
  },
  "糸こんにゃく": {
    en: "Use glass noodles (vermicelli) instead",
    ja: "春雨で代用可",
    zh: "可用粉丝代替",
  },
  "天かす": {
    en: "Crumble tempura bits or skip — still delicious",
    ja: "なくてもOK、砕いたクラッカーで代用可",
    zh: "可省略，或用碎饼干代替",
  },
  "紅生姜": {
    en: "Use pickled ginger (sushi ginger) instead",
    ja: "ガリ（寿司生姜）で代用可",
    zh: "可用寿司姜代替",
  },
  "青のり": {
    en: "Use crushed nori seaweed instead",
    ja: "刻み海苔で代用可",
    zh: "可用碎海苔代替",
  },
  "かつお節": {
    en: "Available in Asian aisle, or skip",
    ja: "アジアン食品コーナーにあることも。なくてもOK",
    zh: "亚洲食品区可能有，也可省略",
  },
  "だし粉": {
    en: "Use chicken stock powder as a substitute",
    ja: "チキンストックパウダーで代用可",
    zh: "可用鸡汤粉代替",
  },
  "お好み焼きソース": {
    en: "Mix BBQ sauce + Worcestershire + ketchup",
    ja: "BBQソース+ウスター+ケチャップで代用可",
    zh: "可用BBQ酱+伍斯特酱+番茄酱调配",
  },
  "みりん": {
    en: "Mix 1 tbsp sugar + 1 tbsp water as substitute",
    ja: "砂糖大さじ1+水大さじ1で代用可",
    zh: "可用1大勺糖+1大勺水代替",
  },
  "片栗粉": {
    en: "Use cornstarch — works the same way",
    ja: "コーンスターチで代用可",
    zh: "可用玉米淀粉代替",
  },
  "酒": {
    en: "Use dry white wine or dry sherry instead",
    ja: "辛口白ワインやドライシェリーで代用可",
    zh: "可用干白葡萄酒代替",
  },
};

export function getSubstitution(nameJa: string, locale: Locale): string | null {
  const sub = substitutions[nameJa];
  if (!sub) return null;
  return sub[locale];
}

export function ingredientName(nameJa: string, nameEn: string, locale: Locale): string {
  if (locale === "ja") return nameJa;
  if (locale === "zh") return ingredientNamesZh[nameJa] ?? nameJa;
  return nameEn;
}
