# TeamMAE Deployment Guide

This document captures the exact configuration that made TeamMAE work on Vercel + Supabase. Use this as a reference for future projects.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Supabase Setup](#supabase-setup)
3. [Vercel Setup](#vercel-setup)
4. [Environment Variables](#environment-variables)
5. [Key Configuration Files](#key-configuration-files)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Project Structure

```
TeamMAE/
├── apps/
│   └── web/                    # Frontend (Vite + React)
│       ├── src/
│       ├── public/
│       │   └── images/         # Static assets like mae-mascot.png
│       ├── vercel.json         # Vercel deployment config
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   ├── db/                     # Database client package
│   ├── mae-core/               # Core AI logic
│   └── types/                  # Shared TypeScript types
├── supabase/
│   └── functions/              # Edge Functions
│       └── mae-build/          # Main API endpoint
│           └── index.ts
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
└── turbo.json                  # Turborepo config
```

---

## Supabase Setup

### 1. Create Project
- Go to https://supabase.com/dashboard
- Create new project
- Note down: Project URL, anon key, service role key

### 2. Database Tables
Required tables (create via SQL Editor):

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('web', 'mobile')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Authentication Setup
- Go to Authentication > Providers
- Enable Email provider
- For email/password auth: Disable "Confirm email" for easier testing (optional)
- Create users manually in Authentication > Users if needed

### 4. Edge Functions

#### Deploy Edge Function
```bash
# Login to Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (CRITICAL - this is how API keys are stored)
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx

# Deploy the function
npx supabase functions deploy mae-build
```

#### Edge Function Location
```
supabase/functions/mae-build/index.ts
```

#### Key Edge Function Code Pattern
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get API key from environment (set via supabase secrets)
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    });

    // Your logic here...

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Vercel Setup

### 1. Connect Repository
- Go to https://vercel.com/new
- Import your GitHub repository
- Select the repository

### 2. Project Settings (CRITICAL)

#### Root Directory
```
apps/web
```
This tells Vercel where your frontend app lives in the monorepo.

#### Framework Preset
```
Vite
```

#### Build & Development Settings
Leave these BLANK in the UI - they're controlled by `vercel.json`

### 3. vercel.json Configuration

Location: `apps/web/vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@teammae/web",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Why This Works:
- `installCommand`: Goes to repo root to install ALL packages (monorepo requirement)
- `buildCommand`: Uses turbo to build dependencies (@teammae/types, @teammae/db) before building web
- `outputDirectory`: Vite outputs to `dist/`
- `framework`: Tells Vercel this is a Vite app
- `rewrites`: SPA fallback - all routes serve index.html (required for React Router)

### 4. Environment Variables in Vercel

Go to Project Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://xxxxx.supabase.co/functions/v1
```

**IMPORTANT**: Vite requires `VITE_` prefix for client-side env vars!

---

## Environment Variables

### Local Development (.env in apps/web/)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://xxxxx.supabase.co/functions/v1
```

### Supabase Edge Functions (via CLI secrets)
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Vercel (via Dashboard)
Same as local .env but set in Vercel Dashboard > Project Settings > Environment Variables

---

## Key Configuration Files

### 1. pnpm-workspace.yaml (repo root)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'supabase/functions'
```

### 2. turbo.json (repo root)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 3. Package.json Scripts (apps/web/)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 4. Vite Config (apps/web/vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:54321/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### 5. Supabase Client (apps/web/src/lib/supabase.ts)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

---

## Common Issues & Solutions

### Issue 1: "cd: apps/web: No such file or directory"
**Cause**: Vercel running commands from wrong directory
**Solution**: Set Root Directory to `apps/web` in Vercel project settings

### Issue 2: "Cannot find module '@teammae/types'"
**Cause**: Package dependencies not built before web app
**Solution**: Use turbo build command:
```json
"buildCommand": "cd ../.. && pnpm turbo build --filter=@teammae/web"
```

### Issue 3: 404 on page refresh (e.g., /landing, /features)
**Cause**: SPA routing not configured
**Solution**: Add rewrites to vercel.json:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

### Issue 4: Edge Function returns "Invalid API Key"
**Cause**: ANTHROPIC_API_KEY not set in Supabase secrets
**Solution**:
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
npx supabase functions deploy mae-build
```

### Issue 5: CORS errors from Edge Function
**Cause**: Missing CORS headers
**Solution**: Add CORS headers to every response:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}

// Include in all responses
return new Response(data, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
```

### Issue 6: "supabase" is undefined
**Cause**: Supabase client created before env vars loaded
**Solution**: Check if configured before using:
```typescript
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
if (!isSupabaseConfigured) return; // graceful fallback
```

### Issue 7: Build takes forever
**Cause**: turbo not caching properly
**Solution**: Ensure turbo.json has correct outputs configuration

---

## Deployment Checklist

### Before First Deploy:
- [ ] Supabase project created
- [ ] Database tables created with RLS policies
- [ ] Auth provider configured
- [ ] Edge function deployed
- [ ] Supabase secrets set (ANTHROPIC_API_KEY)
- [ ] Vercel project created
- [ ] Root directory set to `apps/web`
- [ ] Environment variables set in Vercel
- [ ] vercel.json configured with rewrites

### For Each Deploy:
- [ ] `git push origin main` (triggers Vercel auto-deploy)
- [ ] Check Vercel deployment logs for errors
- [ ] Test auth flow
- [ ] Test API calls to Edge Functions

---

## Quick Reference Commands

```bash
# Install dependencies (from repo root)
pnpm install

# Run locally
pnpm dev

# Build
pnpm build

# Deploy Edge Function
npx supabase functions deploy mae-build

# Set Supabase secrets
npx supabase secrets set KEY=value

# View Supabase secrets
npx supabase secrets list

# View Edge Function logs
npx supabase functions logs mae-build

# Force Vercel redeploy (if needed)
git commit --allow-empty -m "Trigger redeploy" && git push
```

---

## URLs

- **Production**: https://teammae.vercel.app (or your custom domain)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
- **Vercel Dashboard**: https://vercel.com/YOUR_TEAM/teammae
- **Landing Page**: /landing
- **Features**: /features
- **Pricing**: /pricing
- **About**: /about
- **Builder**: /builder (requires auth)
- **Projects**: / (requires auth)

---

*Last updated: January 2026*
*Project: TeamMAE.ai*
