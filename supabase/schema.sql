-- supabase/schema.sql
-- Complete Supabase Schema for Mr. X-Steroid SmartTools Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER TOOL STATES (flexible JSONB storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tool_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id INTEGER NOT NULL,
    inputs JSONB DEFAULT '{}',
    outputs JSONB DEFAULT '{}',
    units VARCHAR(10) DEFAULT 'metric',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_units VARCHAR(10) DEFAULT 'metric',
    default_language VARCHAR(5) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'dark',
    voice_enabled BOOLEAN DEFAULT false,
    ai_suggestions_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool Usage Analytics
CREATE TABLE IF NOT EXISTS tool_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'open', 'calculate', 'save', 'export', 'voice_open'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool Ratings & Feedback
CREATE TABLE IF NOT EXISTS tool_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- User Voice Commands Log
CREATE TABLE IF NOT EXISTS user_voice_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    command_text TEXT NOT NULL,
    intent VARCHAR(100),
    tool_slug VARCHAR(100),
    confidence DECIMAL(3,2),
    executed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI User Behavior Profile
CREATE TABLE IF NOT EXISTS ai_user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_categories INTEGER[] DEFAULT '{}',
    preferred_difficulty VARCHAR(20) DEFAULT 'beginner',
    most_used_tools INTEGER[] DEFAULT '{}',
    preferred_time_of_day VARCHAR(20),
    total_calculations INTEGER DEFAULT 0,
    preferred_units VARCHAR(10) DEFAULT 'metric',
    language VARCHAR(5) DEFAULT 'en',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tool_states_user_id ON user_tool_states(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_states_tool_id ON user_tool_states(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_analytics_tool_id ON tool_usage_analytics(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_analytics_created_at ON tool_usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_tool_usage_analytics_user_id ON tool_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_voice_commands_user_id ON user_voice_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_user_voice_commands_created_at ON user_voice_commands(created_at);

-- Row Level Security (RLS)
ALTER TABLE user_tool_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own tool states"
  ON user_tool_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool states"
  ON user_tool_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool states"
  ON user_tool_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own voice commands"
  ON user_voice_commands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice commands"
  ON user_voice_commands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own AI profile"
  ON ai_user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own AI profile"
  ON ai_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI profile"
  ON ai_user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tool_states_updated_at
    BEFORE UPDATE ON user_tool_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_user_profiles_updated_at
    BEFORE UPDATE ON ai_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();