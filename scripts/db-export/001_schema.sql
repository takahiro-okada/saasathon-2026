-- ShopMate - Full Schema + RLS Policies
-- Run this on a fresh Supabase project to recreate the database

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR PRIMARY KEY,
  name_ja VARCHAR NOT NULL,
  name_en VARCHAR NOT NULL,
  description TEXT,
  servings INTEGER DEFAULT 2,
  prep_time INTEGER,
  cook_time INTEGER,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja VARCHAR NOT NULL,
  name_en VARCHAR NOT NULL,
  search_query VARCHAR NOT NULL,
  category VARCHAR,
  aisle VARCHAR,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity VARCHAR NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS store_locations (
  id TEXT PRIMARY KEY,
  brand VARCHAR NOT NULL CHECK (brand IN ('woolworths', 'paknsave', 'newworld')),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  address VARCHAR,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  foodstuffs_store_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  store VARCHAR NOT NULL CHECK (store IN ('woolworths', 'paknsave', 'newworld')),
  product_name VARCHAR NOT NULL,
  brand VARCHAR,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  image_url VARCHAR,
  in_stock BOOLEAN DEFAULT true,
  size VARCHAR,
  unit_price VARCHAR,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  store_location_id TEXT REFERENCES store_locations(id)
);

-- ============================================================
-- 2. RLS POLICIES
-- ============================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read recipe_ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Public read store_products" ON store_products FOR SELECT USING (true);
CREATE POLICY "Allow insert store_products" ON store_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON store_locations FOR SELECT USING (true);

-- Allow service role / anon to insert/update/delete for batch scripts
CREATE POLICY "Allow all store_products" ON store_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all store_locations" ON store_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all recipe_ingredients" ON recipe_ingredients FOR ALL USING (true) WITH CHECK (true);
