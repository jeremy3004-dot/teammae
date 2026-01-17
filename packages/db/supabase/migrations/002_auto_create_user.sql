-- ============================================================================
-- Auto-create public.users row when auth.users row is created
-- ============================================================================
-- This trigger ensures that whenever a user signs up via Supabase Auth,
-- a corresponding row is automatically created in public.users
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also add a policy to allow users to INSERT their own row (for existing users)
DROP POLICY IF EXISTS "Users can insert own user data" ON public.users;
CREATE POLICY "Users can insert own user data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
