import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

// 接続情報（環境変数優先、フォールバックあり）
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://kxgppfuihoipnaanwube.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Z3BwZnVpaG9pcG5hYW53dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjQwNTMsImV4cCI6MjA5Mzg0MDA1M30.POJRj6s-VjPRfPALpd6P86GHf_zDfYV21ouCJVPAXss";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USER_ID = "demo-user-001";

// ストア選択の分布: paknsave 60%、woolworths 25%、newworld 15%
const STORES = [
  ...Array(12).fill("paknsave"),
  ...Array(5).fill("woolworths"),
  ...Array(3).fill("newworld"),
];

// レシピ分布: curry-rice 8回、ramen 6回、karaage 4回、teriyaki-chicken 3回、その他
const RECIPES = [
  ...Array(8).fill("curry-rice"),
  ...Array(6).fill("ramen"),
  ...Array(4).fill("karaage"),
  ...Array(3).fill("teriyaki-chicken"),
  "gyoza",
  "fried-rice",
  "miso-soup",
  "tonkatsu",
  "okonomiyaki",
];

// よく持っている食材（約70%のレコードに含める）
const COMMON_INGREDIENTS = ["卵", "玉ねぎ", "醤油", "サラダ油"];

// レシピごとの追加食材
const RECIPE_EXTRA_INGREDIENTS = {
  "curry-rice": ["じゃがいも", "にんじん", "カレールー"],
  ramen: ["醤油", "味噌", "チャーシュー"],
  karaage: ["鶏もも肉", "しょうが", "片栗粉"],
  "teriyaki-chicken": ["鶏もも肉", "みりん", "砂糖"],
  gyoza: ["豚ひき肉", "キャベツ", "にら"],
  "fried-rice": ["ごはん", "ハム", "長ねぎ"],
  "miso-soup": ["味噌", "豆腐", "わかめ"],
  tonkatsu: ["豚ロース", "パン粉", "卵"],
  okonomiyaki: ["キャベツ", "小麦粉", "天かす"],
};

// ランダム整数を返す
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 配列からランダムに1つ選ぶ
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 30レコードの分布を組み立てる
// action_type: search(15), store_select(8), compare(5), ingredient_check(2)
function buildRecords() {
  const records = [];

  // アクション種別の枠
  const actionSlots = [
    ...Array(15).fill("search"),
    ...Array(8).fill("store_select"),
    ...Array(5).fill("compare"),
    ...Array(2).fill("ingredient_check"),
  ];

  // レシピプールをシャッフルして割り当てる（30枠分確保）
  const recipesToAssign = [];
  while (recipesToAssign.length < 30) {
    recipesToAssign.push(...RECIPES);
  }
  recipesToAssign.splice(30);
  // Fisher-Yatesシャッフル
  for (let i = recipesToAssign.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [recipesToAssign[i], recipesToAssign[j]] = [
      recipesToAssign[j],
      recipesToAssign[i],
    ];
  }

  for (let i = 0; i < 30; i++) {
    const actionType = actionSlots[i];
    const recipeId = recipesToAssign[i];

    // タイムスタンプ: 過去14日間に分散
    const daysAgo = randInt(0, 13);
    const randomHours = randInt(0, 23);
    const randomMinutes = randInt(0, 59);
    const createdAt = new Date(
      Date.now() -
        daysAgo * 86400000 -
        randomHours * 3600000 -
        randomMinutes * 60000
    ).toISOString();

    // 所持食材: 約70%の確率でCOMMON_INGREDIENTSを含める
    const useCommon = Math.random() < 0.7;
    const baseIngredients = useCommon ? [...COMMON_INGREDIENTS] : [];
    const extras = RECIPE_EXTRA_INGREDIENTS[recipeId] || [];
    // レシピ固有の食材を1〜2個ランダムに追加
    const extraCount = randInt(1, 2);
    const shuffledExtras = [...extras].sort(() => Math.random() - 0.5);
    const ownedIngredients = [
      ...new Set([...baseIngredients, ...shuffledExtras.slice(0, extraCount)]),
    ];

    const record = {
      user_id: USER_ID,
      action_type: actionType,
      recipe_id: recipeId,
      owned_ingredients: ownedIngredients,
      store: null,
      cheapest_store: null,
      total_price: null,
      created_at: createdAt,
    };

    // store_select には store を付与
    if (actionType === "store_select") {
      record.store = pick(STORES);
    }

    // compare には cheapest_store と total_price を付与
    if (actionType === "compare") {
      record.cheapest_store = pick(STORES);
      record.total_price = parseFloat((Math.random() * (25 - 8) + 8).toFixed(2));
    }

    records.push(record);
  }

  // created_at 昇順でソート（古い順）
  records.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return records;
}

async function main() {
  console.log(`[seed-activity] demo-user-001 の既存レコードを削除中...`);

  const { error: deleteError } = await supabase
    .from("user_activity")
    .delete()
    .eq("user_id", USER_ID);

  if (deleteError) {
    if (deleteError.code === "PGRST205") {
      console.error(
        "[seed-activity] エラー: user_activity テーブルが存在しません。",
        "先にマイグレーションを適用してください。"
      );
    } else {
      console.error("[seed-activity] 削除エラー:", deleteError.message);
    }
    process.exit(1);
  }

  console.log("[seed-activity] 削除完了");

  const records = buildRecords();

  console.log(`[seed-activity] ${records.length} 件のレコードを挿入中...`);

  // アクション種別の内訳を表示
  const summary = records.reduce((acc, r) => {
    acc[r.action_type] = (acc[r.action_type] || 0) + 1;
    return acc;
  }, {});
  console.log("[seed-activity] アクション内訳:", summary);

  const { data, error: insertError } = await supabase
    .from("user_activity")
    .insert(records)
    .select();

  if (insertError) {
    console.error("[seed-activity] 挿入エラー:", insertError.message);
    process.exit(1);
  }

  console.log(`[seed-activity] 挿入完了: ${data?.length ?? records.length} 件`);

  // ストア分布のサマリー
  const storeCounts = records
    .filter((r) => r.store)
    .reduce((acc, r) => {
      acc[r.store] = (acc[r.store] || 0) + 1;
      return acc;
    }, {});
  console.log("[seed-activity] store_select のストア分布:", storeCounts);

  // レシピ分布のサマリー（上位5件）
  const recipeCounts = records.reduce((acc, r) => {
    if (r.recipe_id) acc[r.recipe_id] = (acc[r.recipe_id] || 0) + 1;
    return acc;
  }, {});
  const topRecipes = Object.entries(recipeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  console.log("[seed-activity] レシピ出現回数 (上位5件):", Object.fromEntries(topRecipes));

  console.log("[seed-activity] 完了");
}

main();
