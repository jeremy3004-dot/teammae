# TeamMAE.ai Setup Guide

Complete setup instructions for TeamMAE.ai with authentication and persistence.

---

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the database schema:
   - Copy contents of `packages/db/supabase/schema.sql` and execute
   - Copy contents of `packages/db/supabase/migrations/001_add_build_fields.sql` and execute

### 3. Configure Environment Variables

Create `.env` in the **project root**:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```bash
# Required for auth + persistence
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional - uses mock builds if not provided
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Find your keys:** Supabase Dashboard → Settings → API

### 4. Verify Setup

Run the verification script:

```bash
./scripts/verify-setup.sh
```

Should show all green checkmarks ✅

### 5. Start Development Server

```bash
pnpm dev
```

This will start:
- All packages in watch mode (types, db, mae-core, build-pipeline)
- Web app on http://localhost:3000

### 6. Test the App

1. Open http://localhost:3000/builder
2. You'll see the magic link sign-in screen
3. Enter your email → click "Send magic link"
4. Check your email → click the link
5. You're in! Start building apps

**See `TESTING_GUIDE.md` for comprehensive testing instructions.**

---

## What You Get

### ✅ Authentication
- Magic link passwordless sign-in
- User profile auto-creation
- User menu with sign-out
- Session management

### ✅ Multi-User Support
- Each user has isolated data (RLS policies)
- Project management (create, switch, list)
- Build history per project
- User-scoped files and builds

### ✅ Persistence
- All builds saved to Supabase
- Generated files stored in database
- Build logs for debugging
- Restore previous builds

### ✅ Graceful Degradation
- Works without Supabase (mock mode)
- Works without Anthropic API (uses mock builds)
- Preview generation never fails
- DB errors don't crash the app

## Folder Structure

```
TeamMAE/
├── apps/
│   └── web/                    # Main web application
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── db/                     # Supabase client + DB operations
│   ├── mae-core/               # MAE output contracts + logging
│   └── build-pipeline/         # Web + Mobile builders
```

## Development Workflow

1. **Make changes** to any package
2. **Watch mode** automatically rebuilds
3. **Web app** hot-reloads with changes
4. **Test** in browser at localhost:3000

## Common Issues

### Missing Supabase credentials

If you see warnings about missing SUPABASE_URL, set up your .env files as described above.

### Build errors

Try cleaning and rebuilding:

```bash
pnpm clean
pnpm install
pnpm build
```

### Type errors

Make sure all packages are built before running the web app:

```bash
pnpm -r build
```

## What's Working

### Core Features (PROMPT 1 + 2)
- ✅ Monorepo structure with pnpm workspaces
- ✅ Complete database schema with RLS
- ✅ TypeScript types for all entities
- ✅ MAE orchestration layer with Anthropic integration
- ✅ Robust JSON parsing with repair passes
- ✅ Web preview bundler (CDN-based, works immediately)
- ✅ Beautiful by default UI (Lovable-style)
- ✅ Multi-file outputs (components, pages, styles)
- ✅ Corruption detection and repair
- ✅ Demo button with automated testing

### Auth & Persistence (PROMPT 3)
- ✅ Magic link passwordless authentication
- ✅ User profile management
- ✅ Project management (create, switch, list)
- ✅ Build persistence with user context
- ✅ File storage in database
- ✅ Build history (last 10 builds per project)
- ✅ Build logs for debugging
- ✅ Row Level Security (RLS) for data isolation
- ✅ Graceful degradation (mock mode)

## Documentation

- `SETUP.md` - This file (setup instructions)
- `TESTING_GUIDE.md` - Comprehensive testing checklist
- `PROMPT3_CHANGES.md` - Technical implementation details
- `CHANGES.md` - Previous iteration changes
- `QUICKSTART.md` - Quick reference guide

## Next Steps

**Optional Enhancements:**
- [ ] File restoration from build history (load actual code)
- [ ] Project settings UI (rename, delete projects)
- [ ] User profile editing (name, avatar upload)
- [ ] Team collaboration (share projects)
- [ ] Usage tracking and limits per user
- [ ] API key management UI
- [ ] Mobile builder implementation
- [ ] Deployment pipelines (Vercel, EAS)

**Production Deployment:**
- [ ] Set up production Supabase project
- [ ] Configure custom email domain
- [ ] Enable email confirmations
- [ ] Set up monitoring and alerts
- [ ] Add rate limiting
- [ ] Configure CDN caching
