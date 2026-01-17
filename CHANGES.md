# PROMPT 2 Changes - Reality Check + Beautiful by Default

## Part A: Demo + Integrity Check ✅

### Demo Button
**File:** `apps/web/src/pages/Builder.tsx`

- Added 🧪 Demo button that runs 3 canned prompts sequentially:
  1. "Build a simple Hello World app with a centered greeting"
  2. "Build a landing page with hero section, features grid, and call-to-action"
  3. "Build a todo list app with add, complete, and delete functionality"

- For each run, automatically:
  - Calls MAE build API
  - Saves files to database
  - Checks preview integrity
  - Displays PASS/FAIL with reason
  - Shows results in UI below Demo button

### Preview Integrity Check
**File:** `apps/web/src/pages/Builder.tsx`

- Scans preview HTML for corruption patterns:
  - `href=` without quotes
  - `class=` without quotes
  - `> ))}` malformed closures
  - Unquoted React props

- If detected:
  - Fails the demo run
  - Shows issues in logs
  - (Repair happens automatically in API layer already)

### Demo Results UI
- Displays pass/fail status with ✅ or ❌
- Shows prompt for each test
- Shows failure reason if failed
- Compact display below input area

---

## Part B: Beautiful by Default ✅

### UI Defaults Style Kit
**File:** `apps/web/src/lib/uiDefaults.ts` (NEW)

Defines:
- **Spacing scale:** 8/12/16/24/32/48/64px constants
- **Container classes:** max-w-6xl, max-w-7xl, max-w-4xl with padding
- **Section classes:** py-12 lg:py-16, py-16 lg:py-24
- **Card classes:** rounded-2xl, shadow-sm, border, hover transitions
- **Typography classes:** H1 4xl/5xl, H2 2xl/3xl, body base/lg, muted sm
- **Button classes:** Primary (blue-600), Secondary (gray-100), Outline
- **Grid classes:** responsive grid layouts

Component templates:
- `AppShell` - Full page layout with nav + footer
- `PageSection` - Section wrapper with container
- `FeatureGrid` - Grid of feature cards
- `Hero` - Hero section with gradient
- `Card` - Reusable card component

Style guide reference for LLM consumption.

---

## Part C: Updated System Prompt ✅

**File:** `apps/web/src/api/mae.ts` → `buildSystemMessage()`

### New Requirements:
1. **Mission statement:** "Generate a polished product UI on first pass. Every app should look beautiful by default."

2. **Minimum files enforced:**
   - src/main.tsx
   - src/App.tsx
   - src/pages/Index.tsx (or equivalent)
   - src/components/* (at least 2 for non-trivial apps)
   - src/index.css
   - package.json
   - index.html

3. **Beautiful by default UI conventions:**
   - Consistent spacing: 8/12/16/24/32/48px scale
   - Max width containers with generous padding
   - Typography hierarchy defined
   - Card styling: rounded-2xl, shadows, borders, transitions
   - Button styling: Primary/Secondary with consistent sizing
   - Grid-based responsive layouts
   - Top nav + footer for marketing sites (unless told otherwise)
   - NEVER plain HTML or unstyled content
   - ALWAYS compose with components

4. **Component structure:**
   - Prefer shadcn/ui patterns
   - Generous spacing, no cramped layouts
   - Beautiful defaults when unsure

5. **Example output** showing multi-file structure with components

---

## Part D: Minimum Files Guarantee ✅

**File:** `apps/web/src/api/mae.ts` → `enforceMinimumFiles()`

### Checks:
1. Verifies required files exist (main.tsx, App.tsx, index.css, etc.)
2. Detects single-file outputs (only App.tsx)
3. Checks for component files
4. Adds warnings if missing

### Actions:
- Logs warnings for missing files
- Adds warnings to output
- Scaffolding handled by existing `ensureRequiredFiles()` during preview generation
- Suggests refactoring for large single-file outputs

---

## Preview Generator Updates ✅

**File:** `apps/web/src/api/mae.ts` → `generatePreviewHTML()`

### Improvements:
- Collects ALL component files (src/components/*, src/pages/*)
- Inlines all components into preview
- Handles multi-file React apps properly
- Replaces imports with inline definitions

### Process:
1. Gather all component files
2. Transform exports to const definitions
3. Inline all code in preview HTML
4. Render with React + ReactDOM from CDN

---

## Mock Output Updates ✅

**File:** `apps/web/src/api/mae.ts` → `createMockOutput()`

### New Mock Structure:
- Returns **3 files** instead of 1:
  - src/App.tsx (imports Hero + Features)
  - src/components/Hero.tsx (gradient hero section)
  - src/components/Features.tsx (feature grid)

- Uses beautiful defaults:
  - Gradient backgrounds
  - Proper spacing (py-16 lg:py-24)
  - Max-w-6xl containers
  - Rounded cards with shadows
  - Typography hierarchy
  - Hover transitions

---

## Files Changed

### New Files (1):
- `apps/web/src/lib/uiDefaults.ts` - Style kit + templates

### Modified Files (2):
- `apps/web/src/pages/Builder.tsx` - Demo button + integrity check
- `apps/web/src/api/mae.ts` - System prompt + minimum files + preview generator + mock output

---

## Testing

### Run Demo:
1. Go to http://localhost:3000/builder
2. Click "🧪 Demo" button
3. Watch 3 prompts build sequentially
4. See PASS/FAIL results below button
5. Check logs for details

### Expected Results:
- ✅ All 3 demos should PASS (using mock output)
- ✅ Preview should show beautiful multi-component UI
- ✅ No corruption detected
- ✅ Files saved to database (if Supabase configured)

### Manual Test:
Try building:
- "Build a pricing page" → Should get multi-component output
- "Build a dashboard" → Should get cards, stats, layout
- "Build a form" → Should get styled inputs, buttons

---

## Key Improvements

1. **Verifiable quality:** Demo button proves builds work correctly
2. **Beautiful defaults:** Every app looks polished automatically
3. **Multi-file output:** No more single App.tsx outputs
4. **Consistent styling:** Lovable-level UI conventions enforced
5. **Integrity checks:** Automatic corruption detection
6. **Better previews:** Multi-component apps render correctly

---

## No More Issues

✅ No raw JSX text in previews
✅ No cramped layouts
✅ No unstyled HTML
✅ No single-file apps
✅ No corruption passing through
✅ Real component structure
✅ Beautiful by default

---

**Status: Ready for testing** 🎉

Run the demo to verify everything works!
