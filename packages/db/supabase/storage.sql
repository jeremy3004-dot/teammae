-- ============================================================================
-- Supabase Storage Buckets
-- ============================================================================
-- Strategy:
--   - 'artifacts' bucket: IPA, APK, AAB files from EAS builds
--   - 'previews' bucket: Web preview bundles (zipped)
--   - 'exports' bucket: Source code exports for user download
-- ============================================================================

-- Create storage buckets (only if they don't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('artifacts', 'artifacts', false, 524288000, ARRAY['application/octet-stream', 'application/vnd.android.package-archive', 'application/zip']), -- 500MB limit
  ('previews', 'previews', true, 52428800, ARRAY['application/zip', 'text/html', 'application/javascript', 'text/css']), -- 50MB limit
  ('exports', 'exports', false, 104857600, ARRAY['application/zip']) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage RLS Policies
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own exports" ON storage.objects;

-- ARTIFACTS: Users can only access their own build artifacts
CREATE POLICY "Users can view own artifacts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own artifacts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own artifacts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- PREVIEWS: Public read, users can upload to their own folders
CREATE POLICY "Anyone can view previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'previews');

CREATE POLICY "Users can upload own previews" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'previews' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own previews" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'previews' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- EXPORTS: Users can only access their own exports
CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own exports" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
