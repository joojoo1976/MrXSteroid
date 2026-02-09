-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  📊 MR. X STEROID - USER HISTORY & CALCULATIONS                          ║
-- ║  Stores calculation results and tool inputs for persistence               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tool_type TEXT NOT NULL,
    -- 'master', 'macro', 'bodyfat', etc.
    inputs JSONB NOT NULL,
    -- Store all input fields
    results JSONB NOT NULL,
    -- Store all calculated outputs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Helpful for quick stats
    goal TEXT,
    intensity_factor FLOAT,
    -- Metadata for localization/context
    currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(2) DEFAULT 'en'
);
-- Enable RLS
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only see their own history
CREATE POLICY "Users can manage own history" ON public.user_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Indexes
CREATE INDEX idx_user_history_user_id ON public.user_history(user_id);
CREATE INDEX idx_user_history_tool_type ON public.user_history(tool_type);
CREATE INDEX idx_user_history_created_at ON public.user_history(created_at DESC);
-- Grant permissions
GRANT ALL ON public.user_history TO authenticated;
GRANT ALL ON public.user_history TO service_role;