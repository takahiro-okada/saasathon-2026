# Database Export / Import

ShopMate のデータベースを別の Supabase プロジェクトに移行する手順。

## セットアップ手順

### 1. 新しい Supabase プロジェクトを作成
- https://supabase.com でプロジェクトを作成
- Project URL と anon key をメモ

### 2. スキーマ作成
Supabase Dashboard > SQL Editor で以下を **順番に** 実行：

```
001_schema.sql          -- テーブル + RLSポリシー
002_seed_recipes.sql    -- レシピデータ（8件）
003_seed_ingredients.sql -- 食材データ（38件）
004_seed_recipe_ingredients.sql -- レシピ×食材紐付け（66件）
005_seed_store_locations.sql   -- 店舗データ（20店舗）
```

### 3. 商品価格データのインポート（593件）

まずソースDBからJSONをエクスポート：
```bash
node scripts/db-export/006_import_store_products.mjs
```

次にターゲットDBにインポート：
```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_KEY=YOUR_ANON_KEY \
node scripts/db-export/006_import_store_products.mjs import
```

### 4. アプリの .env.local を更新
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 5. Vercel にデプロイする場合
Vercel Dashboard > Settings > Environment Variables に上記2つを設定。

## データ概要

| テーブル | 件数 | 説明 |
|---------|------|------|
| recipes | 8 | 日本料理レシピ |
| ingredients | 38 | 食材マスタ |
| recipe_ingredients | 66 | レシピ×食材紐付け |
| store_locations | 20 | Christchurch 店舗（WW 7, PnS 6, NW 7） |
| store_products | 593 | 店舗×食材の価格データ |
