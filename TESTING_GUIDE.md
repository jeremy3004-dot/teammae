# TeamMAE.ai Testing Guide - Auth + Persistence

This guide walks through testing the complete authentication and persistence implementation (PROMPT 3).

---

## A. Supabase Configuration ✅

### Step 1: Create .env file

```bash
# In the project root
cp .env.example .env
```

### Step 2: Fill in your Supabase credentials

Open `.env` and add your values:

```bash
# Required for auth + persistence
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional - uses mock builds if not provided
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Click on Settings (gear icon) → API
3. Copy `Project URL` → `VITE_SUPABASE_URL`
4. Copy `anon/public` key → `VITE_SUPABASE_ANON_KEY`

### Step 3: Verify configuration

```bash
# Check .env exists and has both keys
cat .env | grep VITE_SUPABASE
```

You should see both lines filled in (not the example values).

---

## B. Apply Database Migration ✅

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the migration

Copy the contents of `packages/db/supabase/migrations/001_add_build_fields.sql`:

```sql
-- Add prompt and summary fields to builds table
ALTER TABLE public.builds
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add index for searching builds by prompt
CREATE INDEX IF NOT EXISTS idx_builds_prompt
ON public.builds USING gin(to_tsvector('english', prompt));
```

Paste into the SQL editor and click **Run**.

### Step 3: Verify migration succeeded

Run this query to confirm the new columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'builds'
  AND column_name IN ('prompt', 'summary');
```

You should see 2 rows returned.

### Step 4: Verify base schema exists

Run this query to confirm all required tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'projects', 'files', 'builds', 'build_logs')
ORDER BY table_name;
```

You should see all 5 tables.

**If tables are missing:**
Run the complete schema from `packages/db/supabase/schema.sql` in the SQL editor.

---

## C. Auth Flow Testing ✅

### Step 1: Start the dev server

```bash
pnpm dev
```

Wait for the server to start (should show "Local: http://localhost:3000").

### Step 2: Open the app

Navigate to: http://localhost:3000/builder

**Expected behavior:**
- ✅ Should redirect to auth screen (not see the builder immediately)
- ✅ Should see "TeamMAE.ai" logo and "AI-Powered App Builder" subtitle
- ✅ Should see email input form with "Send magic link" button

**If you see the builder directly:**
- Supabase is not configured (check .env file)
- App is running in mock mode

### Step 3: Send magic link

1. Enter your email address (use a real email you have access to)
2. Click "Send magic link"
3. Should see loading state: "Sending..."
4. Should then see confirmation screen:
   - Green checkmark icon
   - "Check your email"
   - Shows your email address
   - "Click the link in the email to sign in"

**If you get an error:**
- Check browser console for error details
- Verify Supabase URL and key are correct in .env
- Verify email auth is enabled in Supabase dashboard (Authentication → Providers → Email)

### Step 4: Check your email

1. Open your email inbox
2. Look for email from Supabase (might be in spam)
3. Subject should be "Confirm your signup" or "Magic Link"
4. Click the magic link in the email

**Expected behavior:**
- ✅ Should redirect back to http://localhost:3000/builder
- ✅ Should now see the builder interface (no longer on auth screen)
- ✅ Should see user menu in top-right corner with your email's first letter as avatar

### Step 5: Verify user menu

1. Click on the avatar/user menu in top-right corner
2. Should see dropdown with:
   - Your email address
   - "Sign out" button

### Step 6: Test sign out

1. Click "Sign out"
2. Should be redirected back to auth screen
3. Should see email input form again

### Step 7: Sign back in

1. Click the magic link in your email again (or request a new one)
2. Should be signed back in and see the builder

**Auth flow complete!** ✅

---

## D. Persistence Testing ✅

Now let's verify that builds, projects, and files are being saved to Supabase.

### Step 1: Verify project auto-creation

With the app open and signed in:

1. Open Supabase dashboard → Table Editor → `projects` table
2. You should see at least one project:
   - `user_id` matches your auth user ID
   - `name` is "My First Project"
   - `type` is "web"

**Expected behavior:**
- ✅ Project was automatically created when you first signed in
- ✅ Project is linked to your user ID

### Step 2: Check project selector in UI

Look at the top of the left panel in the builder:

1. Should see a dropdown showing "Current Project"
2. Should display "My First Project" (or the name of your most recent project)
3. Click the dropdown - should show:
   - "New Project" button at the top
   - List of your projects below

### Step 3: Build an app

In the chat input at the bottom:

1. Enter a prompt: **"Build a landing page with hero section and features"**
2. Click "Build" button
3. Wait for the build to complete

**Expected behavior:**
- ✅ Should see "MAE is building..." loading state
- ✅ Should receive assistant response with build summary
- ✅ Should see preview on the right side
- ✅ Build should complete successfully

### Step 4: Verify build record in database

1. Open Supabase dashboard → Table Editor → `builds` table
2. Refresh the table
3. You should see a new build record:
   - `project_id` matches your project
   - `user_id` matches your user
   - `prompt` contains your prompt text
   - `status` is "success"
   - `started_at` and `completed_at` are set

**Run this query to check:**
```sql
SELECT id, prompt, status, started_at
FROM builds
ORDER BY started_at DESC
LIMIT 5;
```

### Step 5: Verify files were saved

1. Open Supabase dashboard → Table Editor → `files` table
2. Refresh the table
3. You should see multiple file records:
   - `project_id` matches your project
   - `path` shows file paths like "src/App.tsx", "src/components/Hero.tsx", etc.
   - `content` contains the actual file code
   - `checksum` is a SHA-256 hash

**Run this query to count files:**
```sql
SELECT COUNT(*) as file_count
FROM files
WHERE project_id = (
  SELECT id FROM projects
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1
);
```

Should return at least 3-4 files.

### Step 6: Verify build logs

1. Open Supabase dashboard → Table Editor → `build_logs` table
2. Refresh the table
3. You should see log entries:
   - `build_id` matches your build
   - `level` is "info" or "error"
   - `message` shows build progress like "Starting MAE build", "Saving X files", "Build completed successfully"

**Run this query:**
```sql
SELECT level, message, timestamp
FROM build_logs
WHERE build_id = (
  SELECT id FROM builds
  ORDER BY started_at DESC
  LIMIT 1
)
ORDER BY timestamp ASC;
```

### Step 7: Check build history UI

Look at the bottom of the left panel (above the input area):

1. Should see "Build History" section
2. Should show your recent build with:
   - Your prompt text
   - Timestamp
   - Green "success" badge
3. Should be clickable

### Step 8: Test build restoration

1. Make another build with a different prompt: **"Build a todo app with add and delete"**
2. Wait for it to complete
3. Now you should see 2 builds in the history
4. Click on the first build in the history

**Expected behavior:**
- ✅ Chat messages should update to show the old build's prompt and response
- ✅ Should load the build details from the database

### Step 9: Test with multiple builds

Make 3-5 more builds with different prompts. For each build:

**Verify in UI:**
- ✅ Build appears in history immediately after completion
- ✅ History shows newest builds first
- ✅ Each build shows correct prompt and status
- ✅ Can click to restore any build

**Verify in database:**
```sql
-- Should show last 10 builds
SELECT prompt, status, started_at
FROM builds
WHERE user_id = auth.uid()
ORDER BY started_at DESC
LIMIT 10;
```

### Step 10: Test project creation

1. Click the project selector dropdown at the top
2. Click "New Project"
3. Enter name: "Test Project 2"
4. Click OK/Submit

**Expected behavior:**
- ✅ New project created in database
- ✅ Project selector updates to show "Test Project 2"
- ✅ Build history is now empty (different project)

**Verify in database:**
```sql
SELECT name, type, created_at
FROM projects
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

Should show both "My First Project" and "Test Project 2".

### Step 11: Test project switching

1. Make a build in "Test Project 2"
2. Switch back to "My First Project" via dropdown
3. Build history should show your old builds
4. Make a new build
5. Switch to "Test Project 2" again
6. Should only see the one build you made there

**Expected behavior:**
- ✅ Build history is project-specific
- ✅ Files are saved to correct project
- ✅ Each project maintains its own build history

---

## E. RLS Policy Testing ✅

Row Level Security ensures users can only see their own data.

### Test 1: Create second user account

1. Sign out from current session
2. Sign in with a different email address
3. Should auto-create "My First Project" for this new user
4. Make a build in this new account

### Test 2: Verify data isolation

**In Supabase SQL Editor, run as admin:**

```sql
-- Should show 2 users
SELECT id, email FROM auth.users;

-- Each user should have their own projects
SELECT user_id, name FROM projects;

-- Each user should only see their own builds
SELECT user_id, prompt FROM builds;
```

### Test 3: Verify RLS prevents cross-user access

Try to query another user's data:

```sql
-- This should return EMPTY even though data exists
-- (because RLS filters out other users' data)
SELECT * FROM projects WHERE user_id != auth.uid();
```

Should return 0 rows (RLS is working).

**RLS is working correctly if:**
- ✅ Users can see their own data
- ✅ Users cannot see other users' data
- ✅ API requests only return user's own records

---

## F. Mock Mode Testing ✅

Verify the app works without Supabase configured.

### Step 1: Disable Supabase

1. Stop the dev server (Ctrl+C)
2. Rename or remove `.env` file temporarily:
   ```bash
   mv .env .env.backup
   ```
3. Restart dev server:
   ```bash
   pnpm dev
   ```

### Step 2: Verify mock mode behavior

1. Open http://localhost:3000/builder
2. Should **NOT** see auth screen
3. Should go directly to builder interface
4. Project selector should show "Mock Mode (No Database)"

### Step 3: Test builds in mock mode

1. Make a build with any prompt
2. Build should complete successfully
3. Preview should work
4. Files are **not** saved to database

**Expected behavior:**
- ✅ App works without authentication
- ✅ Builds complete successfully
- ✅ Preview generation works
- ✅ No database saves (graceful degradation)
- ✅ No errors in console

### Step 4: Restore Supabase

```bash
mv .env.backup .env
# Restart server to reload env vars
```

---

## G. Error Handling Testing ✅

### Test 1: Invalid Supabase credentials

1. Edit `.env` and change `VITE_SUPABASE_ANON_KEY` to "invalid-key"
2. Restart server
3. Try to sign in

**Expected behavior:**
- ✅ Should show error message
- ✅ App should not crash
- ✅ Should log error to console

### Test 2: Network error during build

1. Sign in successfully
2. Start a build
3. Immediately disconnect from internet (or disable Supabase project)

**Expected behavior:**
- ✅ Build may fail with error
- ✅ Preview generation should still attempt to work
- ✅ Error message shown to user
- ✅ App remains functional

### Test 3: Database save failure

Simulate by revoking user's insert permission temporarily in Supabase.

**Expected behavior:**
- ✅ Build completes
- ✅ Preview works
- ✅ Error logged but doesn't crash app
- ✅ User sees warning about save failure

---

## Summary Checklist

### ✅ Supabase Configuration
- [ ] `.env` file created with valid credentials
- [ ] Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` present

### ✅ Database Migration
- [ ] `001_add_build_fields.sql` applied in Supabase
- [ ] `prompt` and `summary` columns exist on `builds` table
- [ ] All base tables exist (users, projects, files, builds, build_logs)

### ✅ Auth Flow
- [ ] Auth screen shows on first visit
- [ ] Magic link email sends successfully
- [ ] Magic link sign-in works
- [ ] User menu appears after sign-in
- [ ] Sign-out works
- [ ] User profile auto-created in `users` table

### ✅ Persistence
- [ ] Project auto-created on first sign-in
- [ ] Build records saved to `builds` table
- [ ] Files saved to `files` table
- [ ] Build logs saved to `build_logs` table
- [ ] Build history UI shows last 10 builds
- [ ] Build restoration works (click old build)

### ✅ Project Management
- [ ] Project selector shows current project
- [ ] Can create new project
- [ ] Can switch between projects
- [ ] Build history is project-specific

### ✅ RLS Security
- [ ] Users can only see their own data
- [ ] Cross-user queries return empty results

### ✅ Mock Mode
- [ ] App works without `.env` file
- [ ] No auth required in mock mode
- [ ] Builds work but don't save
- [ ] No crashes or errors

---

## Troubleshooting

### Issue: "Missing Supabase environment variables" error

**Solution:**
- Verify `.env` file exists in project root
- Check that keys are prefixed with `VITE_` (not just `SUPABASE_`)
- Restart dev server after editing `.env`

### Issue: Magic link email not arriving

**Solutions:**
- Check spam folder
- Verify email auth enabled in Supabase dashboard
- Try different email provider (sometimes corporate emails block)
- Check Supabase dashboard → Authentication → Logs for errors

### Issue: "Failed to save files" in logs

**Solutions:**
- Verify migration was applied (`prompt` and `summary` columns exist)
- Check RLS policies are active on all tables
- Verify user has insert permissions

### Issue: Build history empty after build

**Solutions:**
- Check browser console for errors
- Verify `builds` table has new row in Supabase
- Check that `user_id` matches in both `projects` and `builds` tables
- Refresh build history (click refresh button)

### Issue: Preview not working

**Solutions:**
- Check browser console for errors
- Verify React CDN URLs are accessible
- Check that `previewHtml` is being generated (check network tab)
- Preview should work even if DB save fails

---

## Next Steps After Testing

Once all tests pass:

1. **Production deployment:**
   - Set up production Supabase project
   - Add production env vars to hosting platform
   - Enable email confirmations in production

2. **Optional enhancements:**
   - Add file restoration from build history
   - Add project settings (rename, delete)
   - Add usage tracking per user
   - Add team collaboration features

3. **Monitor:**
   - Check Supabase logs for errors
   - Monitor build success rates
   - Track user sign-ups and activity

---

**Testing complete!** 🎉

If all checklist items are ✅, the auth and persistence implementation is working correctly.
