-- Migration: Real-time Delegate Sync Structure
-- Date: 2026-02-11

-- 1. Add role to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'delegate', 'admin'));

-- 2. Create delegates table
CREATE TABLE IF NOT EXISTS public.delegates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'busy')),
    vehicle_type TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create realtime_locations table
CREATE TABLE IF NOT EXISTS public.realtime_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegate_id UUID REFERENCES public.delegates(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    -- Optional: index for performance on frequent updates
    CONSTRAINT fk_delegate_location 
        FOREIGN KEY (delegate_id) 
        REFERENCES public.delegates(id)
);

-- 4. Create delivery_assignments table
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    delegate_id UUID REFERENCES public.delegates(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'assigned' CHECK (
        status IN (
            'assigned',
            'picked_up',
            'on_the_way',
            'delivered',
            'failed'
        )
    ),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT fk_order_assignment 
        FOREIGN KEY (order_id) 
        REFERENCES public.orders(id),
    CONSTRAINT fk_delegate_assignment 
        FOREIGN KEY (delegate_id) 
        REFERENCES public.delegates(id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Delegates can read/write their own status
CREATE POLICY "Delegates can manage their own status" ON public.delegates FOR ALL USING (auth.uid() = id);

-- Admins can manage all delegates
CREATE POLICY "Admins can manage all delegates" ON public.delegates FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);

-- Anyone (auth) can view active delegates? Maybe only admins.
CREATE POLICY "Admins can view all delegate locations" ON public.realtime_locations FOR
    SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );

-- Delegates can insert their own locations
CREATE POLICY "Delegates can insert their own location" ON public.realtime_locations FOR
    INSERT WITH CHECK (auth.uid() = delegate_id);

-- Allow delegates to update their own locations
CREATE POLICY "Delegates can update their own location" ON public.realtime_locations FOR
    UPDATE USING (auth.uid() = delegate_id);

-- Allow delegates to delete their own locations
CREATE POLICY "Delegates can delete their own location" ON public.realtime_locations FOR
    DELETE USING (auth.uid() = delegate_id);

-- Assignments: Admins manage all, Delegates view their own
CREATE POLICY "Admins can manage all assignments" ON public.delivery_assignments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);

CREATE POLICY "Delegates can view/update their own assignments" ON public.delivery_assignments FOR ALL USING (delegate_id = auth.uid());

-- 7. Enable Realtime for these tables
-- Run this in Supabase SQL editor as it requires SUPERUSER or special permissions
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.delegates;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_locations;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_assignments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; -- Sync order status too

COMMENT ON TABLE public.delegates IS 'Stores information about delivery representatives.';
COMMENT ON TABLE public.realtime_locations IS 'Stores historical and current location snapshots of delegates.';
COMMENT ON TABLE public.delivery_assignments IS 'Links orders to delegates and tracks delivery progress.';