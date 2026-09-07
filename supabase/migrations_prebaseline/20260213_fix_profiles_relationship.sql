-- Fix profiles table structure and relationships
-- Ensure the profiles table has the correct relationship with auth.users

-- First, ensure the foreign key constraint exists
DO $$
BEGIN
    -- Check if the foreign key constraint exists, if not create it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure the trigger exists to create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'user_name',
        'user' -- default role
    );
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    -- Drop trigger if exists to recreate it
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create the trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;

-- Ensure RLS policies are properly set
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    -- Create new policies
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END $$;

-- Ensure the necessary indexes exist
DO $$
BEGIN
    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_id_idx') THEN
        CREATE INDEX profiles_id_idx ON public.profiles (id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_email_idx') THEN
        CREATE INDEX profiles_email_idx ON public.profiles (email);
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Update existing profiles to ensure they have proper roles
UPDATE public.profiles 
SET role = COALESCE(role, 'user')
WHERE role IS NULL;

UPDATE public.profiles 
SET subscription_status = COALESCE(subscription_status, 'inactive')
WHERE subscription_status IS NULL;