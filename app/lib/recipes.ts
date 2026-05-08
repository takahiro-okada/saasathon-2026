export interface Ingredient {
  name_ja: string;
  name_en: string;
  nz_product: string;
  quantity: string;
  aisle: string;
  optional: boolean;
}

/** ライブ価格データ付きの食材型 */
export interface LiveProduct {
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  inStock: boolean;
  store: string;
  unitPrice?: string;
}

export type IngredientWithPricing = Ingredient & {
  liveProduct?: LiveProduct;
};

export interface Recipe {
  id: string;
  name_ja: string;
  name_en: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  prep_time: number;
  cook_time: number;
}

/** ライブ価格付きレシピ型 */
export interface RecipeWithPricing extends Omit<Recipe, "ingredients"> {
  ingredients: IngredientWithPricing[];
}

export const recipes: Recipe[] = [
  {
    id: "okonomiyaki",
    name_ja: "お好み焼き",
    name_en: "Okonomiyaki",
    description: "キャベツたっぷりの大阪風お好み焼き。ソースとマヨネーズで仕上げる定番の家庭料理。",
    servings: 2,
    prep_time: 15,
    cook_time: 20,
    ingredients: [
      { name_ja: "小麦粉", name_en: "Plain Flour", nz_product: "Pams Plain Flour 1.5kg", quantity: "150g", aisle: "Baking aisle", optional: false },
      { name_ja: "キャベツ", name_en: "Cabbage", nz_product: "Fresh Cabbage (half head)", quantity: "300g", aisle: "Produce section", optional: false },
      { name_ja: "卵", name_en: "Eggs", nz_product: "Pams Free Range Eggs 6 pack", quantity: "2個", aisle: "Dairy & Eggs", optional: false },
      { name_ja: "豚バラ肉", name_en: "Pork Belly", nz_product: "Pork Belly Slices", quantity: "150g", aisle: "Meat section", optional: false },
      { name_ja: "だし粉", name_en: "Dashi Powder", nz_product: "S&B Dashi No Moto", quantity: "小さじ1", aisle: "Asian aisle", optional: false },
      { name_ja: "お好み焼きソース", name_en: "Okonomiyaki Sauce", nz_product: "Otafuku Okonomiyaki Sauce", quantity: "適量", aisle: "Asian aisle", optional: false },
      { name_ja: "マヨネーズ", name_en: "Japanese Mayonnaise", nz_product: "Kewpie Mayonnaise 500ml", quantity: "適量", aisle: "Asian aisle", optional: false },
      { name_ja: "青のり", name_en: "Dried Seaweed Flakes", nz_product: "Aonori Dried Green Seaweed", quantity: "適量", aisle: "Asian aisle", optional: true },
      { name_ja: "かつお節", name_en: "Dried Bonito Flakes", nz_product: "Ajinomoto Katsuobushi Bonito Flakes", quantity: "適量", aisle: "Asian aisle", optional: true },
    ],
    steps: [
      "キャベツを粗めに千切りにする。",
      "ボウルに小麦粉、だし粉、水150mlを混ぜて生地を作る。",
      "生地にキャベツと溶き卵を加えてさっくり混ぜる。",
      "フライパンに油を熱し、生地を丸く流し入れ、豚バラを上に乗せる。",
      "蓋をして中火で5分焼き、ひっくり返してさらに5分焼く。",
      "焼き上がったらソースとマヨネーズをかける。",
      "お好みで青のりとかつお節を散らして完成。",
    ],
  },
  {
    id: "curry-rice",
    name_ja: "カレーライス",
    name_en: "Japanese Curry Rice",
    description: "市販のルーを使った家庭の定番カレー。じっくり煮込んだコクのある味わい。",
    servings: 4,
    prep_time: 15,
    cook_time: 40,
    ingredients: [
      { name_ja: "カレールー", name_en: "Curry Roux Blocks", nz_product: "S&B Golden Curry Sauce Mix Medium", quantity: "1箱(180g)", aisle: "Asian aisle", optional: false },
      { name_ja: "鶏もも肉", name_en: "Chicken Thighs", nz_product: "Chicken Thigh Fillets (boneless)", quantity: "400g", aisle: "Meat section", optional: false },
      { name_ja: "じゃがいも", name_en: "Potatoes", nz_product: "Agria Potatoes", quantity: "2個", aisle: "Produce section", optional: false },
      { name_ja: "にんじん", name_en: "Carrots", nz_product: "Fresh Carrots", quantity: "1本", aisle: "Produce section", optional: false },
      { name_ja: "玉ねぎ", name_en: "Onion", nz_product: "Brown Onions", quantity: "1個", aisle: "Produce section", optional: false },
      { name_ja: "白米", name_en: "Japanese-style Rice", nz_product: "Koshihikari Japanese Style Rice 2kg", quantity: "2合", aisle: "Asian aisle / Rice aisle", optional: false },
      { name_ja: "サラダ油", name_en: "Vegetable Oil", nz_product: "Pams Canola Oil 2L", quantity: "大さじ1", aisle: "Cooking oils aisle", optional: false },
    ],
    steps: [
      "白米を洗って炊飯器または鍋で炊く。",
      "鶏肉をひと口大に切り、じゃがいも・にんじんは乱切り、玉ねぎはくし形に切る。",
      "鍋に油を熱して玉ねぎを炒め、しんなりしたら鶏肉を加えて表面に焼き色をつける。",
      "じゃがいもとにんじんを加えて2〜3分炒める。",
      "水700mlを加えて中火で煮立てたらアクを取り除く。",
      "弱火にして蓋をして20分煮る。",
      "火を止めてカレールーを割り入れ、溶けたら再び弱火で10分煮る。",
      "ご飯を盛ったお皿にカレーをかけて完成。",
    ],
  },
  {
    id: "teriyaki-chicken",
    name_ja: "照り焼きチキン",
    name_en: "Teriyaki Chicken",
    description: "甘辛タレが絡んだ照り焼きチキン。ご飯が進む定番おかず。",
    servings: 2,
    prep_time: 10,
    cook_time: 15,
    ingredients: [
      { name_ja: "鶏もも肉", name_en: "Chicken Thighs", nz_product: "Chicken Thigh Fillets (boneless)", quantity: "2枚(400g)", aisle: "Meat section", optional: false },
      { name_ja: "醤油", name_en: "Soy Sauce", nz_product: "Kikkoman Soy Sauce 500ml", quantity: "大さじ3", aisle: "Asian aisle", optional: false },
      { name_ja: "みりん", name_en: "Mirin (Sweet Rice Wine)", nz_product: "Kikkoman Manjo Mirin 500ml", quantity: "大さじ3", aisle: "Asian aisle", optional: false },
      { name_ja: "砂糖", name_en: "Sugar", nz_product: "Chelsea White Sugar 1kg", quantity: "大さじ1", aisle: "Baking aisle", optional: false },
      { name_ja: "酒", name_en: "Sake (Rice Wine)", nz_product: "Takara Sake or Dry Sherry", quantity: "大さじ2", aisle: "Asian aisle / Liquor section", optional: false },
      { name_ja: "サラダ油", name_en: "Vegetable Oil", nz_product: "Pams Canola Oil 2L", quantity: "小さじ1", aisle: "Cooking oils aisle", optional: false },
      { name_ja: "白ごま", name_en: "White Sesame Seeds", nz_product: "Ceres Organics Sesame Seeds White 250g", quantity: "適量", aisle: "Health food / Baking aisle", optional: true },
    ],
    steps: [
      "鶏もも肉の厚い部分に切り込みを入れて均一な厚さにする。",
      "醤油・みりん・砂糖・酒を混ぜてタレを作る。",
      "フライパンに油を熱し、鶏肉を皮目を下にして中火で焼く。",
      "3〜4分焼いてきれいな焼き色がついたらひっくり返す。",
      "蓋をして弱火で5分蒸し焼きにする。",
      "タレを回し入れ、強火で絡めながらとろみがつくまで煮詰める。",
      "食べやすい大きさに切り、ごまをかけて完成。",
    ],
  },
  {
    id: "miso-soup",
    name_ja: "味噌汁",
    name_en: "Miso Soup",
    description: "豆腐とわかめの定番味噌汁。毎日の食卓に欠かせない一品。",
    servings: 2,
    prep_time: 5,
    cook_time: 10,
    ingredients: [
      { name_ja: "味噌", name_en: "Miso Paste", nz_product: "Hikari White Miso Paste 500g", quantity: "大さじ2", aisle: "Asian aisle", optional: false },
      { name_ja: "豆腐", name_en: "Firm Tofu", nz_product: "Kintome Firm Tofu 300g", quantity: "150g", aisle: "Asian aisle / Refrigerated", optional: false },
      { name_ja: "わかめ", name_en: "Dried Wakame Seaweed", nz_product: "Wel-Pac Cut Wakame 56g", quantity: "大さじ1(乾燥)", aisle: "Asian aisle", optional: false },
      { name_ja: "だし粉", name_en: "Dashi Powder", nz_product: "S&B Dashi No Moto", quantity: "小さじ1", aisle: "Asian aisle", optional: false },
      { name_ja: "長ねぎ", name_en: "Spring Onion / Green Onion", nz_product: "Fresh Spring Onions (bunch)", quantity: "適量", aisle: "Produce section", optional: true },
    ],
    steps: [
      "わかめを水で戻しておく（5分程度）。",
      "鍋に水400mlとだし粉を入れて中火にかける。",
      "沸騰したら豆腐を1cm角に切って加える。",
      "再沸騰したら火を弱め、戻したわかめを加える。",
      "火を止め、味噌を溶き入れる（沸騰させない）。",
      "お椀に注ぎ、小口切りにしたねぎを散らして完成。",
    ],
  },
  {
    id: "oyakodon",
    name_ja: "親子丼",
    name_en: "Oyakodon",
    description: "鶏肉と卵を甘辛だしで煮てご飯に乗せた丼。ふわとろ卵がポイント。",
    servings: 2,
    prep_time: 10,
    cook_time: 15,
    ingredients: [
      { name_ja: "鶏もも肉", name_en: "Chicken Thighs", nz_product: "Chicken Thigh Fillets (boneless)", quantity: "200g", aisle: "Meat section", optional: false },
      { name_ja: "卵", name_en: "Eggs", nz_product: "Pams Free Range Eggs 6 pack", quantity: "3個", aisle: "Dairy & Eggs", optional: false },
      { name_ja: "玉ねぎ", name_en: "Onion", nz_product: "Brown Onions", quantity: "1/2個", aisle: "Produce section", optional: false },
      { name_ja: "醤油", name_en: "Soy Sauce", nz_product: "Kikkoman Soy Sauce 500ml", quantity: "大さじ2", aisle: "Asian aisle", optional: false },
      { name_ja: "みりん", name_en: "Mirin (Sweet Rice Wine)", nz_product: "Kikkoman Manjo Mirin 500ml", quantity: "大さじ2", aisle: "Asian aisle", optional: false },
      { name_ja: "砂糖", name_en: "Sugar", nz_product: "Chelsea White Sugar 1kg", quantity: "小さじ1", aisle: "Baking aisle", optional: false },
      { name_ja: "だし粉", name_en: "Dashi Powder", nz_product: "S&B Dashi No Moto", quantity: "小さじ1", aisle: "Asian aisle", optional: false },
      { name_ja: "白米", name_en: "Japanese-style Rice", nz_product: "Koshihikari Japanese Style Rice 2kg", quantity: "2合", aisle: "Asian aisle / Rice aisle", optional: false },
      { name_ja: "三つ葉", name_en: "Mitsuba / Parsley", nz_product: "Fresh Flat-leaf Parsley", quantity: "適量", aisle: "Produce section / Herbs", optional: true },
    ],
    steps: [
      "白米を炊いておく。",
      "鶏肉をひと口大に切り、玉ねぎは薄切りにする。",
      "小鍋に水100ml・醤油・みりん・砂糖・だし粉を入れて中火で煮立てる。",
      "玉ねぎを加えて2分煮たら鶏肉を加え、火が通るまで煮る（3〜4分）。",
      "溶き卵を回し入れ、蓋をして弱火で30秒〜1分蒸らす（半熟がベスト）。",
      "どんぶりにご飯を盛り、鶏卵をそっと乗せて完成。",
    ],
  },
  {
    id: "nikujaga",
    name_ja: "肉じゃが",
    name_en: "Nikujaga",
    description: "じゃがいもと牛肉を甘辛く煮た日本の家庭料理の代表格。ほっとする懐かしい味。",
    servings: 4,
    prep_time: 15,
    cook_time: 30,
    ingredients: [
      { name_ja: "牛薄切り肉", name_en: "Beef Slices", nz_product: "Beef Stir Fry Strips or Thin Beef Slices", quantity: "200g", aisle: "Meat section", optional: false },
      { name_ja: "じゃがいも", name_en: "Potatoes", nz_product: "Agria Potatoes", quantity: "3個", aisle: "Produce section", optional: false },
      { name_ja: "玉ねぎ", name_en: "Onion", nz_product: "Brown Onions", quantity: "1個", aisle: "Produce section", optional: false },
      { name_ja: "にんじん", name_en: "Carrots", nz_product: "Fresh Carrots", quantity: "1本", aisle: "Produce section", optional: false },
      { name_ja: "糸こんにゃく", name_en: "Konjac Noodles", nz_product: "Shirataki Konjac Noodles", quantity: "100g", aisle: "Asian aisle", optional: true },
      { name_ja: "醤油", name_en: "Soy Sauce", nz_product: "Kikkoman Soy Sauce 500ml", quantity: "大さじ3", aisle: "Asian aisle", optional: false },
      { name_ja: "みりん", name_en: "Mirin (Sweet Rice Wine)", nz_product: "Kikkoman Manjo Mirin 500ml", quantity: "大さじ3", aisle: "Asian aisle", optional: false },
      { name_ja: "砂糖", name_en: "Sugar", nz_product: "Chelsea White Sugar 1kg", quantity: "大さじ1.5", aisle: "Baking aisle", optional: false },
      { name_ja: "だし粉", name_en: "Dashi Powder", nz_product: "S&B Dashi No Moto", quantity: "小さじ1", aisle: "Asian aisle", optional: false },
      { name_ja: "サラダ油", name_en: "Vegetable Oil", nz_product: "Pams Canola Oil 2L", quantity: "大さじ1", aisle: "Cooking oils aisle", optional: false },
    ],
    steps: [
      "じゃがいもを乱切り、にんじんも乱切り、玉ねぎはくし形に切る。",
      "鍋に油を熱し、牛肉を炒める。色が変わったら野菜を加えてさらに炒める。",
      "水300mlとだし粉を加えて中火で煮立てる。",
      "アクを取り除いたら醤油・みりん・砂糖を加える。",
      "落とし蓋をして弱火で20分煮る。",
      "じゃがいもが柔らかくなったら完成。",
    ],
  },
  {
    id: "karaage",
    name_ja: "唐揚げ",
    name_en: "Karaage Fried Chicken",
    description: "にんにくと醤油で下味をつけたサクサクの揚げ鶏。ビールに合う定番おつまみ。",
    servings: 2,
    prep_time: 20,
    cook_time: 15,
    ingredients: [
      { name_ja: "鶏もも肉", name_en: "Chicken Thighs", nz_product: "Chicken Thigh Fillets (boneless)", quantity: "400g", aisle: "Meat section", optional: false },
      { name_ja: "醤油", name_en: "Soy Sauce", nz_product: "Kikkoman Soy Sauce 500ml", quantity: "大さじ2", aisle: "Asian aisle", optional: false },
      { name_ja: "酒", name_en: "Sake (Rice Wine)", nz_product: "Takara Sake or Dry Sherry", quantity: "大さじ1", aisle: "Asian aisle / Liquor section", optional: false },
      { name_ja: "にんにく", name_en: "Garlic", nz_product: "Fresh Garlic Bulb", quantity: "2かけ", aisle: "Produce section", optional: false },
      { name_ja: "しょうが", name_en: "Fresh Ginger", nz_product: "Fresh Ginger Root", quantity: "1かけ", aisle: "Produce section", optional: false },
      { name_ja: "片栗粉", name_en: "Potato Starch", nz_product: "Gregg's Cornflour or Lotus Potato Starch", quantity: "大さじ4", aisle: "Baking aisle / Asian aisle", optional: false },
      { name_ja: "揚げ油", name_en: "Frying Oil", nz_product: "Pams Canola Oil 2L", quantity: "適量", aisle: "Cooking oils aisle", optional: false },
      { name_ja: "レモン", name_en: "Lemon", nz_product: "Fresh Lemons", quantity: "1/2個", aisle: "Produce section", optional: true },
    ],
    steps: [
      "鶏もも肉をひと口大に切る。",
      "ポリ袋に醤油・酒・すりおろしにんにく・すりおろし生姜を入れ、鶏肉を加えて揉み込む。",
      "15分以上漬け込む（時間があれば30分〜1時間）。",
      "揚げ油を170〜180°Cに熱する。",
      "鶏肉の汁気を切り、片栗粉をまぶす。",
      "揚げ油に入れて3〜4分揚げ、一度取り出して1分休ませる。",
      "再度180°Cで30秒〜1分揚げてカリッとさせる。",
      "皿に盛り、レモンを添えて完成。",
    ],
  },
  {
    id: "ramen",
    name_ja: "ラーメン",
    name_en: "Ramen (Home Style)",
    description: "市販のスープを使った手軽な家庭ラーメン。チャーシューと煮卵でワンランクアップ。",
    servings: 2,
    prep_time: 15,
    cook_time: 20,
    ingredients: [
      { name_ja: "ラーメン麺", name_en: "Ramen Noodles", nz_product: "Myojo Chukazanmai Ramen Noodles or Sun Noodle Ramen", quantity: "2人前", aisle: "Asian aisle", optional: false },
      { name_ja: "鶏ガラスープ素", name_en: "Chicken Stock Powder", nz_product: "Massel Chicken Style Stock Powder", quantity: "小さじ2", aisle: "Soup / Stock aisle", optional: false },
      { name_ja: "醤油", name_en: "Soy Sauce", nz_product: "Kikkoman Soy Sauce 500ml", quantity: "大さじ2", aisle: "Asian aisle", optional: false },
      { name_ja: "にんにく", name_en: "Garlic", nz_product: "Fresh Garlic Bulb", quantity: "1かけ", aisle: "Produce section", optional: false },
      { name_ja: "しょうが", name_en: "Fresh Ginger", nz_product: "Fresh Ginger Root", quantity: "1かけ", aisle: "Produce section", optional: false },
      { name_ja: "豚バラ肉", name_en: "Pork Belly", nz_product: "Pork Belly Slices", quantity: "200g", aisle: "Meat section", optional: false },
      { name_ja: "卵", name_en: "Eggs", nz_product: "Pams Free Range Eggs 6 pack", quantity: "2個", aisle: "Dairy & Eggs", optional: false },
      { name_ja: "長ねぎ", name_en: "Spring Onion", nz_product: "Fresh Spring Onions (bunch)", quantity: "1本", aisle: "Produce section", optional: false },
      { name_ja: "もやし", name_en: "Bean Sprouts", nz_product: "Fresh Bean Sprouts 200g", quantity: "100g", aisle: "Produce section / Asian aisle", optional: true },
      { name_ja: "ごま油", name_en: "Sesame Oil", nz_product: "Kadoya Pure Sesame Oil 163ml", quantity: "小さじ1", aisle: "Asian aisle", optional: true },
      { name_ja: "海苔", name_en: "Nori Seaweed Sheets", nz_product: "Yaki Nori Roasted Seaweed Sheets", quantity: "2枚", aisle: "Asian aisle", optional: true },
    ],
    steps: [
      "豚バラ肉を丸めてタコ糸で縛り、醤油・みりん・酒でチャーシューを作る（フライパンで焼き色をつけてから煮る）。",
      "煮卵を作る：卵を7分茹でて殻を剥き、醤油・みりん・砂糖の漬け液に1時間漬ける。",
      "鍋に水600ml・鶏ガラスープ素・醤油・すりおろしにんにく・すりおろし生姜を入れて中火で煮立てる。",
      "別の鍋でラーメン麺を袋の表示通りに茹でる。",
      "もやしをさっと茹でる。",
      "器にスープを盛り、水気を切った麺を入れる。",
      "チャーシュー・煮卵・もやし・長ねぎ・海苔を乗せ、ごま油を垂らして完成。",
    ],
  },
];

export function searchRecipes(query: string): Recipe[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return recipes.filter(
    (r) =>
      r.name_ja.includes(q) ||
      r.name_en.toLowerCase().includes(q)
  );
}

export function getAllRecipeNames(): { name_ja: string; name_en: string; id: string }[] {
  return recipes.map((r) => ({ id: r.id, name_ja: r.name_ja, name_en: r.name_en }));
}
