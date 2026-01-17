# Vertical Slice: Build → Save → Preview (Web)

## ✅ Complete End-to-End Flow

The complete "Build → Save → Preview" pipeline is now working for web apps.

---

## What's Implemented

### 1. /builder Route with Chat + Preview UI

**Location:** `apps/web/src/pages/Builder.tsx`

**Features:**
- Split-pane layout: Chat (left) + Preview (right)
- Message history with timestamps
- Loading states with animated dots
- Sample prompts for quick start
- Enter-to-send support (Shift+Enter for new line)
- Build button with disabled state during builds

**Components:**
- `Builder.tsx` - Main page component
- `PreviewPane.tsx` - iframe-based preview with refresh
- `LogsDrawer.tsx` - Sliding logs panel at bottom

---

### 2. MAE Orchestration API

**Location:** `apps/web/src/api/mae.ts`

**Flow:**
1. User sends prompt
2. System message defines strict JSON output contract
3. Call Anthropic API (or mock if no key)
4. Parse response with multiple strategies
5. Repair if needed (one retry)
6. Detect JSX corruption and auto-repair
7. Generate preview HTML
8. Return result

**Output Parser (Robust):**
- ✅ Direct JSON parse
- ✅ Extract from markdown code blocks (```json```)
- ✅ Brace matching extraction
- ✅ One repair pass using LLM
- ✅ Validation of MAEOutput structure

**JSX Corruption Detection:**
Patterns detected:
- `href=` without quotes
- `class=` without quotes
- `> ))})` (malformed closures)
- Unquoted prop values

**Auto-repair:**
- Sends corrupted file back to LLM
- Requests clean rewrite using React/TypeScript/Tailwind
- Updates files in output

---

### 3. File Saving with Versioning

**Location:** `apps/web/server/api.ts`

**Process:**
1. Receive MAEOutput from build
2. For each file:
   - Calculate SHA-256 checksum
   - Infer file type from path
   - Upsert to `files` table (insert or update)
   - Version automatically increments via DB
3. Return saved count

**File Type Inference:**
- `.tsx/.jsx` → component/page
- `.css/.scss/.sass/.less` → style
- `.json/.yaml/.config.` → config
- `.ts/.js` → util
- `.png/.jpg/.svg` → asset
- Others → other

**Database:**
- Uses lazy Supabase client (no startup errors)
- RLS enforced
- Full file history via `updated_at` and version

---

### 4. Web Preview Pipeline

**Location:** `apps/web/src/api/mae.ts` → `generatePreviewHTML()`

**Strategy: Fast MVP (Inline Bundling)**

Uses CDN-based approach for instant previews:
- Tailwind CSS via `cdn.tailwindcss.com`
- React 18 via `esm.sh`
- Inline all styles and code
- No build step required

**Preview Bundle Includes:**
- Entry HTML with runtime
- React + ReactDOM from CDN
- App.tsx inlined and transformed
- Tailwind CSS loaded
- All styles inlined

**Scaffolding (Always Ensured):**
- `index.html` - Entry point
- `src/App.tsx` - Main component
- `src/main.tsx` - React mount
- `src/index.css` - Tailwind imports
- `package.json` - Dependencies

**Never relies on App.tsx alone** - always includes full runtime.

---

### 5. API Integration

**Endpoint:** `POST /api/mae/build`

**Request:**
```json
{
  "projectId": "dev-project",
  "prompt": "Build a landing page...",
  "existingFiles": []
}
```

**Response:**
```json
{
  "summary": "Built a landing page with hero and features",
  "files": [
    {
      "path": "src/App.tsx",
      "content": "..."
    }
  ],
  "warnings": [],
  "meta": {},
  "previewHtml": "<!DOCTYPE html>...",
  "savedCount": 4
}
```

**Implementation:**
- Vite middleware plugin
- JSON body parsing
- Error handling
- Async handler support

---

## MAE Output Contract (STRICT)

Every response must follow this schema:

```typescript
{
  summary: string;              // Required: Brief description
  files: Array<{                // Required: At least 1 file
    path: string;
    content: string;
    type?: FileType;
  }>;
  warnings?: string[];          // Optional: Non-critical issues
  meta?: {                      // Optional: Metadata
    model?: string;
    tokens?: number;
    duration_ms?: number;
  };
}
```

**Validation:**
- Check `summary` is string
- Check `files` is non-empty array
- Check each file has `path` and `content`
- Fail fast if invalid

**Repair Process:**
If validation fails:
1. Send raw response back to LLM
2. Ask to extract valid JSON
3. Parse repair attempt
4. If still invalid → throw error

---

## Corruption Detection & Repair

### Detection Patterns

```javascript
/href=(?!["'])/           // href without quotes
/class=(?!["'])/          // class without quotes
/>\s*\)\s*\}\s*\)/        // Malformed closures
/<[a-z]+\s+[^>]*(?:className|href|src)=[^"'][^>\s]*/i
```

### Repair Flow

1. Scan all `.tsx/.jsx` files
2. Test each against patterns
3. If corrupted:
   - Send file to LLM with repair prompt
   - Request clean React/TS/Tailwind rewrite
   - Update in output
4. Add warning if repair fails

### Example Corruption

**Before:**
```jsx
<div class=container href=/home>
  <button onClick={() => console.log('test') )})}>
```

**After Repair:**
```jsx
<div className="container">
  <button onClick={() => console.log('test')}>
```

---

## Preview Generation

### HTML Bundle Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamMAE App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>/* Inlined CSS */</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React, { useState } from 'https://esm.sh/react@18.2.0';
      import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';

      /* App.tsx content inlined here */

      ReactDOM.createRoot(document.getElementById('root')).render(
        React.createElement(React.StrictMode, null, React.createElement(App))
      );
    </script>
  </body>
</html>
```

### Benefits

✅ No build step required
✅ Instant preview
✅ Works in iframe sandbox
✅ Full React + Tailwind support
✅ Hot-swappable (just update HTML)

### Limitations

⚠️ No multi-file component splitting (yet)
⚠️ Limited to CDN-available packages
⚠️ No TypeScript checking in preview

---

## User Experience Flow

1. **User enters prompt:**
   "Build a landing page with hero section and features"

2. **MAE builds:**
   - Shows loading animation
   - Calls API endpoint
   - Generates files

3. **Parser validates:**
   - Tries JSON parse
   - Falls back to extraction
   - Repairs if needed

4. **Corruption check:**
   - Scans for malformed JSX
   - Auto-repairs if found
   - Adds warnings

5. **Files saved:**
   - Upserted to database
   - Checksums calculated
   - Versions tracked

6. **Preview generated:**
   - HTML bundle created
   - Injected into iframe
   - Rendered immediately

7. **User sees:**
   - Working app in right pane
   - Success message in chat
   - Logs in drawer (optional)

---

## API Key Configuration

### With Anthropic API Key

Set in `apps/web/.env.local`:
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Enables:**
- Real Claude builds
- Repair passes
- Corruption fixes
- Production-quality output

### Without API Key (Mock Mode)

**Behavior:**
- Uses mock output generator
- Returns sample landing page
- Shows warning message
- Preview still works

**Mock Output:**
- Gradient background
- Centered card
- Feature grid
- Tailwind styling
- Displays original prompt

---

## Files Created

### UI Components
- `apps/web/src/pages/Builder.tsx` (main page)
- `apps/web/src/components/PreviewPane.tsx`
- `apps/web/src/components/LogsDrawer.tsx`

### API Layer
- `apps/web/src/api/mae.ts` (orchestration + parsing)
- `apps/web/server/api.ts` (HTTP handler)

### Config
- `apps/web/vite.config.ts` (API middleware plugin)
- `apps/web/.env.example`

### Updated
- `apps/web/src/App.tsx` (routing)
- `apps/web/src/main.tsx` (React Router)
- `packages/db/src/index.ts` (lazy Supabase client)

---

## Running the Builder

### 1. Start Dev Server

```bash
pnpm dev
```

Opens at http://localhost:3000

### 2. Navigate to Builder

Click "Builder" in top nav or go to http://localhost:3000/builder

### 3. Enter Prompt

Try:
- "Build a landing page with hero section and features"
- "Create a todo app with add, delete, and complete tasks"
- "Build a dashboard with stats cards and a chart"

### 4. Watch It Build

- Loading animation appears
- MAE generates files
- Preview renders on right
- Message shows in chat

### 5. Check Logs (Optional)

Click "Show Logs" to see:
- Build started
- Files received
- Warnings (if any)
- Preview generated

---

## Error Handling

### Invalid JSON
- Tries multiple parse strategies
- One repair pass with LLM
- Clear error message if all fail

### Corrupted JSX
- Auto-detects patterns
- Auto-repairs with LLM
- Adds warning to output

### API Errors
- Caught and logged
- Shown in chat
- Logs drawer shows details

### Missing Files
- Runtime files always scaffolded
- Default generators ensure completeness
- Preview never shows raw JSX

### Network Issues
- Timeout handling
- Retry logic (built into repair)
- User-friendly error messages

---

## Validation Rules

### MAEOutput Schema

```typescript
interface MAEOutput {
  summary: string;              // Required, non-empty
  files: MAEFile[];             // Required, length > 0
  warnings?: string[];          // Optional
  meta?: Record<string, any>;   // Optional
}

interface MAEFile {
  path: string;                 // Required, valid relative path
  content: string;              // Required (can be empty)
  type?: FileType;              // Optional, inferred if missing
}
```

### File Validation

- Path must be relative
- No `..` in paths
- No leading `/`
- Content must be string
- Type inferred from extension

### Preview Validation

- Must have HTML content
- Must include root div
- Must include scripts
- Sandbox attributes enforced

---

## Next Steps (Out of Scope)

Future enhancements could include:

- Multi-file component support in preview
- Real Vite bundling for complex apps
- File explorer sidebar
- Code editor integration
- Version history UI
- Collaboration features
- Template gallery
- Export to GitHub
- Deploy to Vercel

---

## Success Criteria Met ✅

✅ **/builder route working** - Split pane, chat, preview
✅ **MAE prompt builds simple app** - Orchestration complete
✅ **Preview renders correctly** - Inline bundling works
✅ **Logs visible in UI** - Drawer component functional
✅ **Robust parser** - Multiple strategies + repair
✅ **Scaffold missing files** - Runtime always complete
✅ **Fix ugly/raw text** - Corruption detection + repair
✅ **File saving with versioning** - Database integration
✅ **Output contract strict** - Validation enforced

---

**Status: COMPLETE** 🎉

The vertical slice is fully implemented and ready to demo!
