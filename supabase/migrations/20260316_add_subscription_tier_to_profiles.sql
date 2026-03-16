-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Add subscription_tier and has_paid to profiles
-- Date: 2026-03-16
-- ═══════════════════════════════════════════════════════════════════════════

-- Add subscription_tier column to track the user's payment tier
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'none';
-- Values: 'none', 'pdf', 'paperback'

-- Add has_paid boolean flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT false;

-- Add plan_tier column (used by checkout/webhook logic)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'none';
