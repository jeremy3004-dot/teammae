# TeamMAE.ai Quick Start

Get the builder running in under 5 minutes.

---

## Prerequisites

- Node.js 18+
- pnpm 8+

---

## 1. Install Dependencies

```bash
pnpm install
```

---

## 2. Build Packages

```bash
pnpm --filter '@teammae/types' --filter '@teammae/db' --filter '@teammae/mae-core' --filter '@teammae/build-pipeline' build
```

Or use the shorthand:
```bash
./dev.sh
```

---

## 3. Start Dev Server

```bash
pnpm --filter @teammae/web dev
```

**Opens at:** http://localhost:3000

---

## 4. Try the Builder

1. Click **"Builder"** in the top navigation
2. Enter a prompt (or click a sample):
   - "Build a landing page with hero section and features"
   - "Create a todo app with add, delete, and complete tasks"
   - "Build a dashboard with stats cards"
3. Click **"Build"** (or press Enter)
4. Watch the preview render on the right!

---

## Optional: Add Anthropic API Key

Without an API key, MAE uses mock builds (still works great for testing).

To enable real builds:

1. Create `apps/web/.env.local`:
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

2. Restart dev server

Now you get:
- Real Claude-generated code
- Repair passes for errors
- Corruption auto-fixes
- Production-quality output

---

## What You Can Build (Without API Key)

Even in mock mode, you can:
- ✅ Test the full UI
- ✅ See preview rendering
- ✅ View logs drawer
- ✅ Understand the flow
- ✅ Get beautiful sample output

---

## What You Can Build (With API Key)

Anything React + Tailwind:
- Landing pages
- Dashboards
- Todo apps
- Forms
- Navigation menus
- Card layouts
- Galleries
- And more!

---

## Troubleshooting

### Dev server won't start

Make sure packages are built:
```bash
pnpm --filter '@teammae/db' build
```

### Preview is blank

Check logs drawer (click "Show Logs") for errors.

### "Missing Supabase environment variables"

This is just a warning - builder works without Supabase in dev mode. File saving will fail but preview works fine.

To fix (optional):
```bash
# In apps/web/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Architecture Overview

```
User Prompt
    ↓
MAE API (/api/mae/build)
    ↓
Anthropic Claude (or mock)
    ↓
Output Parser (multi-strategy + repair)
    ↓
Corruption Detector (auto-fix JSX issues)
    ↓
File Saver (database with versioning)
    ↓
Preview Generator (CDN-based bundle)
    ↓
iframe Render (instant preview)
```

---

## Key Features

- **Robust Parsing**: 3 strategies + 1 repair pass
- **Auto-Repair**: Detects corrupted JSX and fixes it
- **Instant Preview**: No build step, uses CDN
- **File Versioning**: All files saved with checksums
- **Mock Mode**: Works great without API key
- **Logs Drawer**: Full visibility into build process

---

## Sample Prompts

**Landing Pages:**
- "Build a SaaS landing page with pricing tiers"
- "Create a portfolio site with project gallery"
- "Make a restaurant website with menu and contact form"

**Apps:**
- "Build a weather app with city search"
- "Create a calculator with history"
- "Make a notes app with markdown support"

**Dashboards:**
- "Build an analytics dashboard with charts"
- "Create a social media stats panel"
- "Make a fitness tracker with daily goals"

**Components:**
- "Build a pricing card with 3 tiers"
- "Create a testimonial carousel"
- "Make a feature comparison table"

---

## Next Steps

1. Try building different types of apps
2. Explore the logs drawer to see how it works
3. Check out `VERTICAL_SLICE.md` for technical details
4. Add your Anthropic API key for real builds
5. Set up Supabase for file persistence

---

**Happy Building!** 🚀
