-- user_activity: tracks user behavior for AI recommendations
CREATE TABLE user_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('search', 'store_select', 'ingredient_check', 'compare')),
  recipe_id text,
  store text,
  owned_ingredients jsonb DEFAULT '[]',
  cheapest_store text,
  total_price numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read own data" ON user_activity FOR SELECT USING (true);
