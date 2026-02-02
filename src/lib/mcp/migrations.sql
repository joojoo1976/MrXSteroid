-- Migration to enable MCP Knowledge Graph
-- 1. Steroids Knowledge Base
CREATE TABLE public.steroids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    half_life_hours FLOAT,
    detection_time_weeks FLOAT,
    anabolic_rating INT,
    androgenic_rating INT,
    side_effects TEXT [] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Cycles (User Protocols)
CREATE TABLE public.cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    goal TEXT CHECK (
        goal IN ('bulking', 'cutting', 'recomp', 'strength')
    ),
    status TEXT CHECK (
        status IN ('planned', 'active', 'completed', 'abandoned')
    ),
    compounds JSONB DEFAULT '[]'::jsonb,
    -- Array of {steroid_id, dosage}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Health Markers
CREATE TABLE public.health_markers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    marker_name TEXT NOT NULL,
    marker_name_ar TEXT,
    value FLOAT NOT NULL,
    unit TEXT NOT NULL,
    date_measured DATE DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Observations (Memory Log)
CREATE TABLE public.observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sentiment TEXT,
    embedding vector(1536),
    -- Requires pgvector extension
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Graph Edges (Explicit Relationships)
CREATE TABLE public.graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL,
    target_id UUID NOT NULL,
    type TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.steroids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;
-- Policies (Simplified)
CREATE POLICY "Users can view public steroids" ON public.steroids FOR
SELECT USING (true);
CREATE POLICY "Users can view own cycles" ON public.cycles FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cycles" ON public.cycles FOR ALL USING (auth.uid() = user_id);
-- ... similar policies for other tables