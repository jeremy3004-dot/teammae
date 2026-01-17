-- ============================================================================
-- Backfill public.users for existing auth.users
-- ============================================================================
-- This migration creates public.users rows for any auth.users that don't
-- already have a corresponding row (e.g., users who signed up before the
-- auto-create trigger was added)
-- ============================================================================

INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
