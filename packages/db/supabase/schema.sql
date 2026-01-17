-- ============================================================================
-- TeamMAE.ai Database Schema (Dependency-Ordered)
-- ============================================================================
-- Storage Strategy:
--   - All file content stored in `files` table (canonical source of truth)
--   - Supabase Storage buckets used for build artifacts, exports, previews
--   - No file content in Storage unless it's a compiled output/artifact
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TEMPLATES (must come before PROJECTS due to FK dependency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('web', 'mobile')),
  preview_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON public.templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.templates(is_public) WHERE is_public = true;

-- ============================================================================
-- PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('web', 'mobile')),
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================================================
-- FILES (canonical source of truth for all project files)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other' CHECK (file_type IN ('component', 'page', 'config', 'asset', 'util', 'style', 'other')),
  size_bytes INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, path)
);

CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON public.files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_updated_at ON public.files(updated_at DESC);

-- ============================================================================
-- BUILDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'success', 'failed', 'cancelled')),
  trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'auto', 'api')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builds_project_id ON public.builds(project_id);
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON public.builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_started_at ON public.builds(started_at DESC);

-- ============================================================================
-- BUILD ARTIFACTS (stored in Supabase Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.build_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('preview_bundle', 'ios_ipa', 'android_apk', 'android_aab', 'source_zip')),
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_build_id ON public.build_artifacts(build_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON public.build_artifacts(artifact_type);

-- ============================================================================
-- BUILD LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.build_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_build_id ON public.build_logs(build_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.build_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.build_logs(level);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'vercel', 'eas', 'supabase')),
  credentials JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_files_updated_at ON public.files;
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own user data" ON public.users;
DROP POLICY IF EXISTS "Users can update own user data" ON public.users;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view files in own projects" ON public.files;
DROP POLICY IF EXISTS "Users can insert files in own projects" ON public.files;
DROP POLICY IF EXISTS "Users can update files in own projects" ON public.files;
DROP POLICY IF EXISTS "Users can delete files in own projects" ON public.files;
DROP POLICY IF EXISTS "Users can view builds for own projects" ON public.builds;
DROP POLICY IF EXISTS "Users can insert builds for own projects" ON public.builds;
DROP POLICY IF EXISTS "Users can update own builds" ON public.builds;
DROP POLICY IF EXISTS "Users can view artifacts for own builds" ON public.build_artifacts;
DROP POLICY IF EXISTS "Users can insert artifacts for own builds" ON public.build_artifacts;
DROP POLICY IF EXISTS "Users can view logs for own builds" ON public.build_logs;
DROP POLICY IF EXISTS "Users can insert logs for own builds" ON public.build_logs;
DROP POLICY IF EXISTS "Anyone can view public templates" ON public.templates;
DROP POLICY IF EXISTS "Users can view own integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON public.integrations;

-- USERS: Users can read/update their own record
CREATE POLICY "Users can view own user data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- PROJECTS: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- FILES: Users can access files for their projects
CREATE POLICY "Users can view files in own projects" ON public.files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files in own projects" ON public.files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in own projects" ON public.files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in own projects" ON public.files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- BUILDS: Users can access builds for their projects
CREATE POLICY "Users can view builds for own projects" ON public.builds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert builds for own projects" ON public.builds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own builds" ON public.builds
  FOR UPDATE USING (auth.uid() = user_id);

-- BUILD_ARTIFACTS: Users can view artifacts for their builds
CREATE POLICY "Users can view artifacts for own builds" ON public.build_artifacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.builds
      WHERE builds.id = build_artifacts.build_id
      AND builds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert artifacts for own builds" ON public.build_artifacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.builds
      WHERE builds.id = build_artifacts.build_id
      AND builds.user_id = auth.uid()
    )
  );

-- BUILD_LOGS: Users can view logs for their builds
CREATE POLICY "Users can view logs for own builds" ON public.build_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.builds
      WHERE builds.id = build_logs.build_id
      AND builds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs for own builds" ON public.build_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.builds
      WHERE builds.id = build_logs.build_id
      AND builds.user_id = auth.uid()
    )
  );

-- TEMPLATES: Everyone can read public templates
CREATE POLICY "Anyone can view public templates" ON public.templates
  FOR SELECT USING (is_public = true);

-- INTEGRATIONS: Users can only access their own integrations
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);
