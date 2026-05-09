# ShopMate - 仕様書

## プロジェクト概要

**アプリ名**: ShopMate  
**タグライン**: 「日本の料理を作りたい時、NZのスーパーで何を買えばいいか教えます」  
**目的**: NZで日本料理を作りたいユーザーが、必要な材料のNZでの商品名を即座に知り、最も安いスーパーを選んで買い物できるアプリ  
**対象市場**: NZ在住の日本人・アジア人、日本料理に興味のある非日本人  
**プロジェクトタイプ**: Saasathon 2026 ハッカソン出品  
**開発期間**: 48〜72時間（ハッカソン期間内）  

---

## 解決する課題（Why this app?）

### ユーザーの根本的なペイン
NZに住むアジア人・海外出身者が日本料理を作ろうとしたとき、**材料の英語名（NZでの商品名）がわからない**。

例:
- 「小麦粉」→ NZでは "Plain Flour"？"All Purpose Flour"？どのブランド？
- 「だしの素」→ NZのスーパーに売ってる？何という名前？どの棚？
- 「薄力粉と強力粉の違い」→ NZでは "Plain Flour" と "High Grade Flour"

レシピは知っている。でも**NZのスーパーの棚の前で何を手に取ればいいかわからない**。

### このアプリが提供する価値
1. **材料の翻訳**: 日本語の材料名 → NZスーパーの正確な商品名・ブランド名
2. **レシピ・作り方**: 材料だけでなく、調理手順も表示（NZで手に入る材料での作り方）
3. **最安スーパーの提案**: ユーザーの近くのスーパーから、全材料の合計が最も安い店を計算

---

## 開発フェーズ

### Phase 1: MVP（ハッカソン期間内）
**コア機能**: 料理検索 → 材料リスト（英語商品名付き） → レシピ表示

やること:
- 料理名で検索（日本語 or 英語）
- 必要な材料一覧（日本語名 + NZ英語商品名 + 画像）
- レシピ・作り方の表示
- モックデータまたはAI生成データ

やらないこと:
- リアルタイム価格取得
- 店舗比較
- ユーザー認証

### Phase 2: 価格データ連携（Post-Hackathon）
**追加機能**: Supabase + スクレイピングでリアルタイム価格

やること:
- Pak'nSave / New World / Woolworths の商品価格を日次スクレイピング
- Supabase DBに価格データを蓄積
- 各材料に各店舗の当日価格を表示

### Phase 3: 最安スーパー提案（Full Version）
**追加機能**: 位置情報 + 全材料合計での最安店舗計算

やること:
- ユーザーの位置情報（GPS or 住所入力）から近くの店舗を特定
- 「お好み焼きの材料を全部買うなら、〇〇店が合計$XX.XXで最安」を計算
- 店舗ごとの合計金額比較表示

---

## ユーザーペルソナ & ユースケース

### 主要ユーザー
- **ペルソナA**: NZ在住の日本人（全年齢）。日本の家庭料理が作りたいが、スーパーで何を買えばいいかわからない
- **ペルソナB**: NZ在住のアジア人（中国・韓国・タイ等）。日本料理に興味があるが、材料の英語名がわからない
- **ペルソナC**: 日本料理に興味のあるKiwi（非アジア人）。レシピと一緒に「何を買えばいいか」を知りたい

### 根本的なペイン
- **レシピは知っている。でもNZのスーパーの棚で何を手に取ればいいかわからない**
- 日本語の材料名 → 英語の商品名の変換ができない
- 複数の店をはしごしないと全て揃わない（どこに行けばいいかわからない）
- どの店が一番安いかわからない

### ユースケース（MVPジャーニー）
```
1. 「今日お好み焼き作りたいな」
   ↓
2. ShopMateで「お好み焼き」と検索
   ↓
3. 材料リストが出る（日本語 + NZの英語商品名 + 画像）
   → 「あ、小麦粉はPams Plain Flourっていうのを買えばいいのか」
   ↓
4. 作り方（レシピ）も確認できる
   ↓
5. スーパーに行って、英語商品名を見ながら買い物
```

### ユースケース（Full Versionジャーニー）
```
1. 「今日お好み焼き作りたいな」
   ↓
2. ShopMateで「お好み焼き」と検索
   ↓
3. 材料リスト + 各スーパーの当日価格が出る
   ↓
4. 「全材料合計: Pak'nSave $52.30 / New World $58.40 / Woolworths $55.10」
   → 「Pak'nSaveが一番安いから今日はそっちに行こう」
   ↓
5. チェックリストを持ってスーパーへ
```

---

## 機能要件

### Core Features（必須機能）

#### F1: 料理検索 → 材料リスト
- **概要**: 料理名で検索すると、必要な材料が**NZの英語商品名付き**で表示される
- **入力**: テキスト検索（日本語 or 英語。例: 「お好み焼き」「okonomiyaki」）
- **出力**: 
  - 必要な材料リスト（日本語名 + NZ英語商品名 + 画像）
  - 各材料の必要量
- **実装方式**: 
  - MVP: OpenAI APIで料理名→材料+NZ商品名を生成（プリセット10料理はキャッシュ）
  - Phase 2: Supabase DBの「日本食材 ↔ NZ製品」マッピングテーブルを参照
- **これがアプリの核心**: 「小麦粉」→「Pams Plain Flour」の翻訳がユーザーの最大のペインを解決する

#### F1.5: レシピ・作り方表示
- **概要**: 材料リストに加えて、その料理の作り方（調理手順）も表示する
- **出力**:
  - ステップごとの調理手順（日本語）
  - NZで手に入る材料での作り方（代替材料がある場合はその旨も記載）
- **実装方式**:
  - MVP: OpenAI APIで料理名→レシピ手順を生成
  - 表示位置: 材料リストの下に折りたたみセクション「作り方を見る」
  
#### F2: 材料一覧表示
- **概要**: 各材料をカード形式で表示
- **カード内容**:
  - 日本語の食材名 + 必要量（例: 「小麦粉 200g」）
  - NZ製品名（例: 「Pams Plain Flour 1.5kg」）
  - 製品画像（スーパーのウェブサイトからスクレイプ）
  - 価格（例: $2.99 / 1.5kg）
  - 単価（計算：総価格 ÷ 容量）
  - 在庫状態（「在庫あり」「在庫なし」）
  - ロケーションヒント（「🛒 Baking aisle」「🛒 Asian aisle」など）
  - チェックボックス（買い物リストに追加）

#### F3: 店舗推奨表示
- **概要**: 「どのスーパーで全ての材料が揃うか」を自動判定
- **ロジック**: 
  - 各材料について、複数のスーパー（New World, Pak'nSave, Woolworths）における在庫状態を確認
  - 「全ての材料が在庫ありの店舗」を特定し、バッジで表示
  - 例: 「✅ New Worldで全て揃います」
- **複数店舗対応**: 
  - データキャッシュできれば複数店舗表示（Future）
  - MVP: New Worldに絞ってもOK

#### F4: 買い物リスト作成
- **概要**: 不要な材料をチェックボックスで除外、必要な項目の合計金額を計算
- **機能**:
  - 各材料の左側にチェックボックス
  - チェック状態の材料のみ合計金額に含める
  - 「合計: $67.84」という形式で上部に表示
  - 合計金額はリアルタイムで更新

#### F5: 店舗別価格比較 + 最安スーパー提案（Phase 2-3）
- **概要**: 全材料の合計金額を店舗ごとに計算し、最も安いスーパーを提案する
- **Phase 2（価格表示）**:
  - 各材料に Pak'nSave / New World / Woolworths の当日価格を表示
  - データソース: 日次スクレイピング → Supabase DB
- **Phase 3（最安計算 + 位置情報）**:
  - ユーザーの位置情報（GPS or 住所）から近くの店舗を特定
  - 「お好み焼きの全材料を買うなら、〇〇店が合計$XX.XXで最安」を表示
  - 店舗ごとの合計金額比較テーブル:
    ```
    Pak'nSave Riccarton    $52.30  ← 最安
    Woolworths Moorhouse   $55.10
    New World Ilam         $58.40
    ```
  - 「全材料が揃わない店舗」はその旨を表示（例: 「Pak'nSaveには青のりがありません」）

### UI/UX Features

#### F6: 検索バー + サジェストボタン
- **概要**: 上部に検索バー、その下に「よくある料理」のボタンを表示
- **デザイン**: 
  - 検索バー: プレースホルダーテキスト「料理名を入力（例: カレー、お好み焼き）」
  - サジェストボタン: 「お好み焼き」「カレーライス」「照り焼きチキン」など、事前定義したリスト
  - ボタンクリックで即座に検索実行

#### F7: ローディング状態
- **概要**: AIが材料リストを生成している間、ローディング表示
- **表示内容**: 「🤔 材料を分析中...」というスピナー表示

#### F8: エラーハンドリング
- **概要**: 検索結果がない場合、ユーザーフレンドリーなメッセージを表示
- **例**:
  - 「🔍 その料理は見つかりませんでした」
  - 「💡 別の料理を試してみてください」

---

## 非機能要件

### NF1: パフォーマンス
- **検索応答時間**: 3秒以内（AI APIの呼び出しを含む）
- **ページロード**: 2秒以内
- **MVP対策**: 
  - 頻出料理をプリセット化してAI呼び出しを削減
  - 結果をブラウザのlocalStorageでキャッシュ

### NF2: スケーラビリティ
- **同時ユーザー数**: MVP段階では100-200ユーザー想定
- **将来対応**: Supabase Edge Functionsで自動スケール

### NF3: 信頼性・データ鮮度
- **スーパー価格データの更新頻度**: 週1回（MVP）
- **在庫状態の更新頻度**: 日1回（スクレイプのみ、リアルタイムAPIは将来）
- **エラー時の動作**: キャッシュされた古いデータを使用（Stale-While-Revalidate）

### NF4: セキュリティ
- **API認証**: OpenAI APIキー、スーパー各社へのアクセス認証情報はSupabase/.envで管理
- **ユーザーデータ**: 買い物リストはlocalStorage保存（ログイン機能は将来）
- **Rate Limiting**: Supabase Edge Functions内で実装（1ユーザーあたり10リクエスト/分）

### NF5: アクセシビリティ
- **対応言語**: 日本語（メイン）、英語（将来）
- **UI**: Tailwindデフォルトで WCAG 2.1 AA相当
- **画像代替テキスト**: 全ての製品画像にalt属性

---

## 画面仕様（UI）

### Screen 1: 検索ホーム画面
**URL**: `/`  
**レイアウト**:
```
┌────────────────────────────────────────┐
│  ShopMate          🍜          │
├────────────────────────────────────────┤
│                                        │
│  [検索バー]                           │
│  料理名を入力（例: カレー）             │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │  🍙 お好み焼き                     │  │
│ │  🍛 カレーライス                   │  │
│ │  🍗 照り焼きチキン                 │  │
│ │  🍲 味噌汁                         │  │
│ │  🍜 ラーメン                       │  │
│ └──────────────────────────────────┘  │
│                                        │
│ 💡 よくある質問: FAQ へ              │
│                                        │
└────────────────────────────────────────┘
```

### Screen 2: 検索結果画面（材料リスト）
**URL**: `/recipe/[dishName]`  
**レイアウト**:
```
┌────────────────────────────────────────┐
│ ← 戻る  お好み焼き                    │
├────────────────────────────────────────┤
│                                        │
│ ✅ New Worldで全て揃います             │
│ 合計: $67.84                          │
│                                        │
├─ 材料リスト ────────────────────────────┤
│                                        │
│ ☐ 小麦粉 (200g)                      │
│   ├─ Pams Plain Flour 1.5kg        │
│   ├─ [画像]                         │
│   ├─ $2.99 / 1.5kg                  │
│   ├─ $2.00/100g                     │
│   ├─ ✅ 在庫あり                      │
│   └─ 🛒 Baking aisle               │
│                                        │
│ ☐ キャベツ (1/2玉)                    │
│   ├─ Pams Cabbage Fresh          │
│   ├─ [画像]                         │
│   ├─ $3.50 / 1玉                    │
│   ├─ ✅ 在庫あり                      │
│   └─ 🛒 Produce aisle              │
│                                        │
│ ☐ 山芋 (100g)                        │
│   ├─ (代替品) Japanese Root       │
│   ├─ [画像]                         │
│   ├─ $4.99 / 500g                   │
│   ├─ ⚠️ 在庫確認が必要                 │
│   └─ 🛒 Asian aisle                │
│                                        │
│ ☐ ソース (200ml)                      │
│   ├─ 💡 Ozeki Japanese Sauce     │
│   ├─ [画像]                         │
│   ├─ $6.99 / 750ml                  │
│   ├─ ✅ 在庫あり                      │
│   └─ 🛒 Asian aisle                │
│                                        │
├─ アクション ────────────────────────────┤
│                                        │
│ [リストを保存] [メール送信] [ダウンロード] │
│                                        │
└────────────────────────────────────────┘
```

**カラムの説明**:
- **チェックボックス**: 買い物リストに含めるかどうか
- **日本語食材名**: 「小麦粉 (200g)」というフォーマット
- **NZ製品名**: 「Pams Plain Flour 1.5kg」
- **製品画像**: スーパーのサイトからスクレイプした画像（400x300px）
- **価格**: 「$2.99 / 1.5kg」形式
- **単価**: 自動計算「$2.00/100g」
- **在庫状態**: 
  - ✅ 在庫あり（green badge）
  - ⚠️ 在庫確認が必要（yellow badge）
  - ❌ 在庫なし（gray badge）
- **ロケーション**: 「🛒 Baking aisle」など

### Screen 3: 買い物リスト確認画面（オプション）
**URL**: `/recipe/[dishName]/checklist`  
**機能**:
- チェック済みの材料のみを表示
- 合計金額表示
- 「Pdfでダウンロード」「メールで送信」ボタン

---

## データモデル（データベーススキーマ）

### テーブル: `recipes`
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja VARCHAR(255) NOT NULL,           -- 日本語料理名
  name_en VARCHAR(255),                    -- 英語料理名（future）
  description_ja TEXT,                     -- 説明
  description_en TEXT,                     -- 説明（future）
  ingredients JSONB NOT NULL,              -- 材料リスト（JSON配列）
  difficulty VARCHAR(50),                  -- 難易度 (easy/medium/hard)
  prep_time_minutes INT,                   -- 準備時間
  cook_time_minutes INT,                   -- 調理時間
  servings INT,                            -- 人数
  image_url VARCHAR(500),                  -- アイキャッチ画像
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### テーブル: `ingredients`
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja VARCHAR(255) NOT NULL UNIQUE,    -- 日本語食材名
  name_en VARCHAR(255),                    -- 英語食材名
  category VARCHAR(100),                   -- カテゴリ（e.g., 小麦粉, 野菜）
  unit VARCHAR(50),                        -- 単位（g, ml, 玉など）
  typical_quantity DECIMAL(10,2),          -- 一般的な使用量
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### テーブル: `nz_products`
```sql
CREATE TABLE nz_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  store_name VARCHAR(100) NOT NULL,        -- New World / Pak'nSave / Woolworths
  product_name_en VARCHAR(255) NOT NULL,   -- 商品名（英語）
  brand VARCHAR(100),                      -- ブランド名
  price_nzd DECIMAL(10,2),                 -- 価格（NZドル）
  quantity_amount DECIMAL(10,2),           -- 内容量
  quantity_unit VARCHAR(50),                -- 内容単位（kg, ml, etc）
  image_url VARCHAR(500),                  -- 製品画像URL
  aisle_location VARCHAR(255),              -- 売場情報（e.g., "Baking aisle"）
  is_in_stock BOOLEAN,                     -- 在庫状態
  stock_updated_at TIMESTAMP,              -- 在庫確認日時
  product_url VARCHAR(500),                -- スーパーのページリンク
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ingredient_id, store_name, product_name_en)
);
```

### テーブル: `recipe_ingredients` (中間テーブル)
```sql
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,         -- この料理での必要量
  unit VARCHAR(50),                        -- この料理での単位
  notes_ja VARCHAR(255),                   -- メモ（オプション/代替品など）
  PRIMARY KEY (recipe_id, ingredient_id)
);
```

### テーブル: `shopping_lists` (Future - ユーザーログイン実装後)
```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipe_id UUID REFERENCES recipes(id),
  name VARCHAR(255),
  items JSONB,                             -- チェック済み材料とNZ製品情報
  total_price_nzd DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API設計

### エンドポイント一覧

#### 1. GET `/api/recipes/search`
**目的**: 料理名で検索し、材料リストと対応するNZ製品を取得  
**リクエスト**:
```json
{
  "query": "お好み焼き",
  "store": "new-world"  // optional, default: new-world
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "recipe": {
    "id": "uuid-xxx",
    "name_ja": "お好み焼き",
    "description_ja": "日本の家庭料理...",
    "ingredients": [
      {
        "ingredient_id": "uuid-a",
        "name_ja": "小麦粉",
        "quantity": 200,
        "unit": "g",
        "nz_products": [
          {
            "product_id": "uuid-p1",
            "product_name": "Pams Plain Flour 1.5kg",
            "price_nzd": 2.99,
            "quantity_total": 1.5,
            "quantity_unit": "kg",
            "unit_price": 1.99,  // $2.99/1.5kg × 200g換算
            "image_url": "https://...",
            "aisle": "Baking aisle",
            "in_stock": true,
            "store_name": "new-world",
            "product_url": "https://..."
          }
        ],
        "recommended_product_id": "uuid-p1"
      }
    ],
    "store_coverage": {
      "new-world": {
        "all_available": true,
        "total_cost": 67.84
      }
    }
  }
}
```

**エラーレスポンス** (400/404):
```json
{
  "success": false,
  "error": "料理が見つかりません",
  "suggestions": ["カレーライス", "照り焼きチキン"]
}
```

#### 2. GET `/api/recipes/suggestions`
**目的**: ホーム画面に表示するサジェスト料理一覧を取得  
**リクエスト**: なし  
**レスポンス** (200 OK):
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "uuid-1",
      "name_ja": "お好み焼き",
      "emoji": "🍙"
    },
    {
      "id": "uuid-2",
      "name_ja": "カレーライス",
      "emoji": "🍛"
    }
  ]
}
```

#### 3. POST `/api/recipes/analyze` (Internal)
**目的**: AI (OpenAI) を使用して料理名から材料リストを抽出  
**Note**: フロントエンドからは呼び出さない。バックエンド内部で実行  
**Request** (from backend only):
```json
{
  "dish_name": "お好み焼き"
}
```

**Response**:
```json
{
  "dish_name": "お好み焼き",
  "ingredients": [
    { "name": "小麦粉", "quantity": 200, "unit": "g" },
    { "name": "キャベツ", "quantity": 300, "unit": "g" }
  ]
}
```

#### 4. GET `/api/products/search`
**目的**: 日本の食材名でNZ製品を検索  
**リクエスト**:
```json
{
  "ingredient_ja": "小麦粉",
  "store": "new-world"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "ingredient": "小麦粉",
  "products": [
    {
      "product_id": "uuid",
      "name": "Pams Plain Flour 1.5kg",
      "brand": "Pams",
      "price": 2.99,
      "quantity": 1.5,
      "unit": "kg",
      "image_url": "...",
      "aisle": "Baking aisle",
      "in_stock": true,
      "store": "new-world"
    }
  ]
}
```

---

## API Client ライブラリ（TypeScript）

### `lib/api-client.ts`
```typescript
// レシピ検索
export async function searchRecipe(dishName: string, store: string = 'new-world') {
  const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(dishName)}&store=${store}`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

// サジェスト料理一覧
export async function getRecipeSuggestions() {
  const response = await fetch('/api/recipes/suggestions');
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

// NZ製品検索
export async function searchProducts(ingredientJa: string, store: string = 'new-world') {
  const response = await fetch(`/api/products/search?ingredient_ja=${encodeURIComponent(ingredientJa)}&store=${store}`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}
```

---

## 技術スタック

| 層 | 技術 | 理由 |
|---|---|---|
| **フロントエンド** | Next.js 16 + React 19 | ハッカソン標準。サーバーサイド統合が容易 |
| **スタイル** | Tailwind CSS 4 | ユーティリティベース。高速開発 |
| **言語** | TypeScript | 型安全。バグ削減 |
| **バックエンド** | Next.js API Routes + Supabase Edge Functions | サーバーレス。スケーラビリティ |
| **データベース** | Supabase (PostgreSQL) | リレーショナルデータに最適。無料枠でMVP対応 |
| **AI統合** | OpenAI API (GPT-4) | 料理名→材料抽出の精度が高い |
| **データ取得** | Web Scraping (Cheerio / Puppeteer) | NZスーパーの価格・在庫情報取得 |
| **キャッシング** | Supabase キャッシュ + Browser localStorage | レスポンス時間短縮 |
| **認証** | Supabase Auth (Future) | MVP段階では不要。買い物リストはlocalStorage |

---

## 実装アーキテクチャ

### フロントエンド流れ
```
1. ユーザーが「お好み焼き」と入力
2. クライアント → `/api/recipes/search?query=お好み焼き`
3. Next.js API Route がリクエスト受け取る
   ↓
4. 「お好み焼き」がrecipesテーブルに存在するか確認
   - YES → recipe_id を取得。recipe_ingredients + nz_products をJOIN
   - NO → OpenAI API に「お好み焼きの材料」を問い合わせ（キャッシュ考慮）
   ↓
5. 材料リストと各NZ製品情報をJSONで返却
   ↓
6. フロントエンドが画面をレンダリング
```

### バックエンド実装スタック
```
app/
├── api/
│   ├── recipes/
│   │   ├── search.ts          # 料理検索 + 材料リスト取得
│   │   └── suggestions.ts     # サジェスト料理一覧
│   └── products/
│       └── search.ts          # NZ製品検索
├── (main)/
│   ├── page.tsx               # ホーム画面
│   ├── recipe/
│   │   └── [dishName]/
│   │       └── page.tsx       # 材料リスト画面
│   └── layout.tsx
├── components/
│   ├── SearchBar.tsx
│   ├── RecipeCard.tsx
│   ├── IngredientCard.tsx
│   ├── ShoppingList.tsx
│   └── LoadingSpinner.tsx
└── lib/
    ├── api-client.ts          # API通信
    ├── supabase.ts            # Supabaseクライアント
    ├── openai.ts              # OpenAI統合
    ├── scraper.ts             # Web scraping
    └── utils.ts               # ユーティリティ
```

---

## MVP スコープ vs 将来機能

### Phase 1: MVP（ハッカソン期間内）
✅ 検索ホーム画面（日本語 / 英語入力対応）  
✅ 料理検索 → 材料リスト（日本語名 + **NZ英語商品名** + 画像）  
✅ レシピ・作り方表示（折りたたみセクション）  
✅ サジェストボタン（5〜10の人気料理）  
✅ 買い物リストチェックボックス  
✅ モバイル対応UI（Tailwind）  
✅ 基本的なエラーハンドリング  
❌ 価格データなし（商品名と画像のみ）  
❌ 店舗比較なし  

### Phase 2: 価格データ連携（Post-Hackathon）
🔄 Supabase DB構築  
🔄 Pak'nSave / New World / Woolworths の日次スクレイピング  
🔄 各材料に当日価格を表示  
🔄 在庫状態の表示  

### Phase 3: 最安スーパー提案（Full Version）
🔄 ユーザー位置情報 → 近くの店舗特定  
🔄 全材料合計で最安スーパーを計算・提案  
🔄 店舗ごとの合計金額比較テーブル  
🔄 「この店舗には〇〇がありません」の表示  

### Future（さらに先）
🔄 ユーザーログイン（Supabase Auth）  
🔄 買い物リストの保存・共有  
🔄 PDF / メール送信  
🔄 ユーザーお気に入り料理  
🔄 栄養価情報表示  
🔄 アレルギー対応フィルター  
🔄 コミュニティ機能（レシピ投稿・レーティング）  
🔄 多言語対応（中国語・韓国語等）  

---

## 成功指標（KPI）

### ハッカソン出品基準
- ✅ アプリが正常に起動する
- ✅ 1つ以上の料理で材料リストが表示される
- ✅ NZ製品と価格が表示される
- ✅ 買い物リスト機能が動作する
- ✅ モバイル画面で見れる

### Post-Launch KPI（参考）
- **検索成功率**: 入力された料理の60%以上が結果を返す
- **ユーザー保持率**: 7日保持率 30%以上
- **平均セッション時間**: 3分以上
- **再訪問率**: 週1回以上 25%以上

---

## リスク & 緩和策

| リスク | 確率 | 影響 | 緩和策 |
|-------|-----|------|-------|
| スーパーのスクレイピング失敗 | 高 | MVP不可 | 事前にプロダクト手動収集。API取得は将来 |
| OpenAI API コスト超過 | 中 | コスト | 10料理をプリセット化。呼び出しキャッシュ |
| Supabase 無料枠制限 | 低 | パフォーマンス | Edge Functionsは低速実行で対応 |
| UI複雑化 | 中 | 開発遅延 | コンポーネント単純化。Tailwindテンプレート活用 |
| データ品質（NZ製品の正確性） | 中 | ユーザー不信 | QAで5料理以上手動検証。ユーザーフィードバック機構 |

---

## 開発スケジュール（ハッカソン）

### Day 1（12時間）
- 09:00 - 11:00: 企画・Figmaプロトタイプ確認・DB設計
- 11:00 - 14:00: Next.js + Tailwind プロジェクト初期化
- 14:00 - 15:00: 昼食
- 15:00 - 18:00: API Routes 実装（/api/recipes/search）
- 18:00 - 19:00: 晩食
- 19:00 - 21:00: フロントエンド（ホーム画面 + 結果画面）実装

### Day 2（12時間）
- 09:00 - 12:00: Supabase テーブル作成 + ダミーデータ投入
- 12:00 - 13:00: 昼食
- 13:00 - 16:00: OpenAI 統合 + スクレイピング実装
- 16:00 - 17:00: 買い物リスト機能実装
- 17:00 - 18:00: 晩食
- 18:00 - 20:00: UI調整 + モバイル対応
- 20:00 - 21:00: テスト + バグ修正

### Day 3（8時間） — プレゼン前
- 09:00 - 10:00: 最終デバッグ + デプロイ
- 10:00 - 11:00: デモ用データ用意（3〜5料理確実に動く）
- 11:00 - 12:00: プレゼン資料作成
- 13:00: プレゼン本番

---

## 受け入れ基準

### Feature Completion
- [ ] 検索バーが入力を受け付ける
- [ ] サジェストボタン「お好み焼き」「カレーライス」をクリックすると結果が表示される
- [ ] 結果画面で、材料のカード（画像・価格・在庫）が表示される
- [ ] チェックボックスで合計金額がリアルタイムで更新される
- [ ] 「New Worldで全て揃います」というバッジが表示される

### Quality
- [ ] エラーメッセージが表示される（料理が見つからない場合）
- [ ] ローディング表示が3秒以内に完了する
- [ ] Tailwindで自動的にモバイル対応している（375px～のレスポンシブ）
- [ ] 本番環境で公開可能な状態（プライベートキー漏洩なし）

---

## ドキュメント参考リンク

| ドキュメント | 場所 | 説明 |
|-----------|------|------|
| Figmaプロトタイプ | [link] | UIレイアウト・デザイン |
| DB図 | `docs/DATABASE_SCHEMA.md` | 詳細なER図 |
| API仕様 | `docs/API_DESIGN.md` | OpenAPI 3.0形式 |
| 開発計画 | `docs/DEVELOPMENT_PLAN.md` | ガント図・タスク一覧 |
| アーキテクチャ | `docs/ARCHITECTURE.md` | システム全体図 |

---

## 用語集

| 用語 | 定義 |
|------|------|
| **NZ製品** | New World等のNZスーパーで購入可能な商品 |
| **材料マッピング** | 日本の食材名とNZ製品を対応付けるデータ |
| **在庫状態** | スーパーのウェブサイトから取得した在庫情報（当日〜前日時点） |
| **単価** | 商品の総価格を内容量で割った価格（e.g., $2.99 / 1.5kg → $2.00/1kg） |
| **サジェスト** | ホーム画面に表示される「よくある料理」ボタン |
| **Edge Functions** | Supabaseのサーバーレス関数（スクレイピングなど重い処理向け） |

---

**最終更新**: 2026-05-08  
**バージョン**: 1.0  
**ステータス**: Hackathon MVP設計完了
