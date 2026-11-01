
-- Supabase Schema v6 - 150 Tools - نفس هيكليتك الحالية + تطوير
-- Tailored for E:\MrXSteroid-main

-- Existing tables (from your GitHub) - keep as is
-- profiles, subscriptions, payments, user_history, contact_messages

-- New / Upgraded for 150 Tools

-- 1. user_tool_states - حالة كل أداة من 150 لكل مستخدم
CREATE TABLE IF NOT EXISTS user_tool_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL, -- 'body-fat-calculator', 'neuromuscular-performance', etc.
  tool_number INT NOT NULL CHECK (tool_number >= 1 AND tool_number <= 150),
  category TEXT, -- body-composition, nutrition, training, strength, physique, health
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  language TEXT DEFAULT 'en' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

CREATE INDEX idx_user_tool_states_user_id ON user_tool_states(user_id);
CREATE INDEX idx_user_tool_states_tool_number ON user_tool_states(tool_number);
CREATE INDEX idx_user_tool_states_category ON user_tool_states(category);

-- 2. ai_user_profiles - للـ AI التكيفي لكل 150 أداة
CREATE TABLE IF NOT EXISTS ai_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  adaptive_weights JSONB DEFAULT '{}'::jsonb, -- { "sleepHours": 0.25, ... } تتعلم
  learning_history JSONB DEFAULT '[]'::jsonb, -- [{ tool_id, feedback, useful, date }]
  preferences JSONB DEFAULT '{}'::jsonb,
  goals TEXT[],
  injuries TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. tool_usage_analytics - تتبع استخدام 150 أداة
CREATE TABLE IF NOT EXISTS tool_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tool_id TEXT NOT NULL,
  tool_number INT CHECK (tool_number >= 1 AND tool_number <= 150),
  action TEXT NOT NULL, -- calculate, view, feedback, what-if
  inputs_hash TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_usage_tool_number ON tool_usage_analytics(tool_number);

-- 4. user_body_measurements - history لكل قياسات الجسم (للـ Cross-Tool لكل 150)
CREATE TABLE IF NOT EXISTS user_body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_type TEXT NOT NULL, -- weight, body_fat, muscle_mass, etc.
  value FLOAT NOT NULL,
  unit TEXT NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  source_tool_id TEXT, -- من أي أداة جاء القياس
  source_tool_number INT
);

CREATE INDEX idx_body_measurements_user_type ON user_body_measurements(user_id, measurement_type);

-- 5. user_training_logs - للـ Cross-Tool Training
CREATE TABLE IF NOT EXISTS user_training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  load FLOAT, -- AU
  rpe FLOAT,
  duration INT, -- minutes
  exercises JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. user_health_markers - للـ Health 137-150 - مع تشفير - حساس
CREATE TABLE IF NOT EXISTS user_health_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marker_type TEXT NOT NULL, -- testosterone, estradiol, hematocrit, etc.
  value FLOAT,
  unit TEXT,
  lab_date DATE,
  notes TEXT,
  -- Safety: لا تشخيص طبي، فقط تتبع
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies - كل مستخدم يشوف بياناته فقط
ALTER TABLE user_tool_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tool states" ON user_tool_states FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own AI profile" ON ai_user_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tool_usage_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own analytics" ON tool_usage_analytics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own measurements" ON user_body_measurements FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own training logs" ON user_training_logs FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_health_markers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own health markers" ON user_health_markers FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_tool_states_updated_at BEFORE UPDATE ON user_tool_states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_user_profiles_updated_at BEFORE UPDATE ON ai_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
