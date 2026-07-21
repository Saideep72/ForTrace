-- =====================================================================
-- FortTrace Migration: Add Expert_Engineer to users_role_check constraint
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================================

-- Step 1: Drop the existing role check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Re-add the constraint with Expert_Engineer included
ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
    role IN (
        'Plant_Manager',
        'Maintenance_Engineer',
        'Safety_Officer',
        'Field_Technician',
        'Quality_Engineer',
        'Auditor',
        'Expert_Engineer',
        'Admin'
    )
);

-- Step 3: Create the Expert_Engineer demo account in public.users
-- (The Supabase Auth user is already created via admin API - we just need the profile row)
-- If the Auth user was already created above, insert its profile:
INSERT INTO public.users (user_id, email, full_name, role, plant_access, area_access, is_active)
SELECT 
    id,
    'expert@forttrace.com',
    'Senior Expert Engineer',
    'Expert_Engineer',
    '{}',
    '{}',
    true
FROM auth.users
WHERE email = 'expert@forttrace.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'Expert_Engineer';

-- Verify
SELECT user_id, email, full_name, role FROM public.users WHERE email = 'expert@forttrace.com';
