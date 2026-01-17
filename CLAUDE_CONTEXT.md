# TeamMAE - Claude Context Document

Use this document to quickly onboard a new Claude chat session to continue development on TeamMAE.

---

## Quick Start Prompt

Copy and paste this to start a new chat:

```
I'm working on TeamMAE, an AI-powered app builder. Read the context document at /Users/curry/Desktop/TeamMAE/CLAUDE_CONTEXT.md to understand the project, then let me know you're ready to continue.
```

---

## Project Overview

**TeamMAE** is an AI-powered application builder where users describe what they want to build and MAE (Master AI Engineer) creates it for them. Think of it like Lovable/v0 - users type a prompt, and the AI generates a complete application.

### Tech Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **Monorepo**: pnpm workspaces + Turborepo
- **AI**: Anthropic Claude API (via Supabase Edge Functions)

### Live URLs
- **Production**: https://teammae.vercel.app
- **Landing Page**: /landing
- **App Home**: / (requires auth)
- **Builder**: /builder (requires auth)
- **Projects**: /projects (requires auth)

---

## Project Structure

```
TeamMAE/
├── apps/
│   └── web/                    # Frontend (Vite + React)
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   │   ├── AuthGate.tsx
│       │   │   ├── UserMenu.tsx
│       │   │   ├── ProjectManager.tsx
│       │   │   ├── PreviewPane.tsx
│       │   │   ├── LogsDrawer.tsx
│       │   │   └── marketing/
│       │   │       └── MarketingLayout.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx        # Main home with centered input
│       │   │   ├── Builder.tsx     # Chat + Preview builder
│       │   │   ├── Landing.tsx     # Marketing landing page
│       │   │   ├── Features.tsx
│       │   │   ├── Pricing.tsx
│       │   │   └── About.tsx
│       │   ├── lib/
│       │   │   └── supabase.ts     # Supabase client
│       │   ├── App.tsx             # Main app with routing
│       │   ├── main.tsx
│       │   └── index.css           # Global styles + animations
│       ├── public/
│       │   └── images/
│       │       └── mae-mascot.png  # MAE mascot image
│       ├── vercel.json             # Vercel config
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   ├── db/                     # Database client package
│   ├── mae-core/               # Core AI logic
│   ├── types/                  # Shared TypeScript types
│   └── build-pipeline/         # Build pipeline logic
├── supabase/
│   └── functions/              # Edge Functions
│       └── mae-build/          # Main build API endpoint
│           └── index.ts
├── DEPLOYMENT_GUIDE.md         # Full deployment documentation
├── CLAUDE_CONTEXT.md           # This file
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Key Files to Know

### Frontend Entry Points
- `apps/web/src/App.tsx` - Main routing, auth gates, layouts
- `apps/web/src/pages/Home.tsx` - Centered MAE mascot + input + projects
- `apps/web/src/pages/Builder.tsx` - Chat (left) + Preview (right) layout
- `apps/web/src/index.css` - Global styles, CSS variables, animations

### Authentication
- `apps/web/src/components/AuthGate.tsx` - Wraps authenticated routes
- `apps/web/src/components/UserMenu.tsx` - User dropdown menu
- `apps/web/src/lib/supabase.ts` - Supabase client initialization

### API/Backend
- `supabase/functions/mae-build/index.ts` - Main build endpoint
- Uses `ANTHROPIC_API_KEY` from Supabase secrets

---

## Design System

### Color Palette (Dark Theme)
```css
--background: #0a0a0f      /* Darkest - page bg */
--card: #12121a            /* Card backgrounds */
--card-hover: #1a1a24      /* Hover states */
--border: #2a2a3e          /* Borders */
--accent: #6366f1          /* Primary accent (indigo) */
--primary: #7c3aed         /* Secondary accent (purple) */
--foreground: #f0f0f5      /* Primary text */
--muted: #a0a0b0           /* Secondary text */
--muted-darker: #666       /* Tertiary text */
```

### Typography
- Font: IBM Plex Mono (monospace)
- Headings: `font-mono font-semibold uppercase tracking-wider`
- Body: Regular weight, normal tracking

### Animations (defined in index.css)
- `animate-fade-in-up` / `animate-fade-in-down` - Entry animations
- `animate-float` - Floating effect for mascot
- `animate-pulse-glow` - Glow effect
- `delay-100` through `delay-500` - Staggered delays

---

## Current App Flow

### Public Pages (no auth)
1. `/landing` - Marketing landing page with hero, features, pricing
2. `/features` - Features detail page
3. `/pricing` - Pricing page
4. `/about` - About page

### Authenticated Pages
1. `/` (Home) - Centered layout with:
   - MAE mascot with status indicator
   - "MAE" title + "Master AI Engineer" subtitle
   - Large textarea input with "Build" button
   - "Your Projects" grid below

2. `/builder` - Split-pane layout:
   - **Left**: Chat with MAE (avatar, messages, input)
   - **Right**: Preview pane (build steps during build, preview after)

3. `/projects` - Full project list with file viewer

### Build Flow
1. User enters prompt on Home page → clicks "Build"
2. Navigates to `/builder` with prompt in state
3. Builder auto-submits the prompt
4. Shows build steps in preview pane (Analyzing, Generating, Styling, Compiling)
5. Calls `/api/mae/build` Edge Function
6. Displays result in preview pane

---

## Common Commands

```bash
# Install dependencies
pnpm install

# Run locally
pnpm dev

# Build
pnpm build

# Deploy Edge Function
npx supabase functions deploy mae-build

# Set Supabase secrets
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx

# View Edge Function logs
npx supabase functions logs mae-build
```

---

## Environment Variables

### Local Development (`apps/web/.env`)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://xxxxx.supabase.co/functions/v1
```

### Vercel (Dashboard > Environment Variables)
Same as above - must have `VITE_` prefix for client-side access.

### Supabase Edge Functions (via CLI)
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## Database Schema

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

-- RLS enabled on both tables
-- Policies: users can only access their own data
```

---

## Recent Changes (January 2026)

1. **New Home Page** - Centered MAE mascot with input, project list below
2. **Redesigned Builder** - Chat on left with MAE avatar, preview on right
3. **Build Step Indicator** - Shows progress during builds (Analyzing → Generating → Styling → Compiling)
4. **Dark Theme** - Consistent dark theme across all authenticated pages
5. **Animations** - Fade in, float, pulse glow effects on landing page
6. **Email/Password Auth** - Changed from magic link to email/password

---

## Known Issues / TODO

1. ProjectManager uses stubbed clients (not connected to real Supabase queries)
2. Home page project list needs real Supabase integration
3. `/templates` route doesn't exist yet (linked from Home)
4. Build API needs actual Claude integration in Edge Function

---

## Deployment

### Vercel Settings
- **Root Directory**: `apps/web`
- **Framework**: Vite
- **Build Command**: (controlled by vercel.json)
- **Output Directory**: `dist`

### vercel.json
```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@teammae/web",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Push to Deploy
```bash
git add -A && git commit -m "message" && git push origin main
```
Vercel auto-deploys on push to main.

---

## Reference Documents

- `/Users/curry/Desktop/TeamMAE/DEPLOYMENT_GUIDE.md` - Full deployment guide with troubleshooting
- `/Users/curry/Desktop/TeamMAE/CLAUDE_CONTEXT.md` - This file

---

*Last updated: January 2026*
