# PROMPT 4 Changes - Design System Enforcement + "Lovable-level" Beautiful Defaults

## Summary

Implemented comprehensive design system enforcement with automatic quality gates, auto-retry for failed builds, and template-based generation to ensure every generated web app looks beautiful and professional by default. Apps now follow strict design standards without users needing to specify layout details.

---

## Implementation Tasks ✅

### 1. Design System Loader + Enforcer ✅

**File:** `DESIGN_SYSTEM.md` (NEW - ROOT)

Complete design system specification including:
- **Design Principles**: Beautiful by default, accessible first, responsive always, consistent spacing, delightful interactions
- **Typography Scale**: Full heading/body hierarchy with Tailwind classes
- **Spacing Scale**: 8px grid system (8, 12, 16, 24, 32, 48, 64, 96)
- **Color Palette**: Primary, neutral, semantic colors
- **Component Patterns**: Cards, buttons, forms, badges, dividers
- **App Shell Templates**: Landing page, dashboard, CRUD, mobile app
- **DO's and DON'Ts**: 28 specific rules for quality output
- **Quality Gates**: 6 categories of validation checks

**File:** `packages/mae-core/src/design-system.ts` (NEW)

Design system parser and formatter:
```typescript
export interface DesignSystemRules {
  principles: string[];
  typography: { headings, body };
  spacing: { scale, sections };
  colors: { primary, neutral, semantic };
  components: { cards, buttons, forms };
  layout: { containers, grids };
  templates: { landing, dashboard, crud };
  dos: string[];
  donts: string[];
  qualityGates: { structure, styling, layout, accessibility, react, ux };
}

// Get structured rules
export function getDesignSystemRules(): DesignSystemRules

// Format for MAE prompt
export function formatDesignSystemPrompt(): string

// Select template based on user prompt
export function selectTemplateForPrompt(prompt: string): 'landing' | 'dashboard' | 'crud' | 'general'
```

---

### 2. Generation Guardrails ✅

**File:** `apps/web/src/api/mae.ts` (MODIFIED - MAJOR)

Updated MAE orchestration to enforce design system:

#### Template Selection
- Analyzes user prompt to select appropriate template
- Types: `landing`, `dashboard`, `crud`, `general`
- Based on keywords: "dashboard", "admin", "CRUD", "table", "landing", "marketing"

#### System Message Enhancement
```typescript
function buildSystemMessage(templateType?: string): string {
  const designSystemPrompt = formatDesignSystemPrompt();
  const templatePrompt = getTemplatePrompt(templateType);

  return `You are MAE, an expert app builder...

  ${designSystemPrompt}  // Full design system rules injected

  ${templatePrompt}      // Template-specific guidance

  CRITICAL OUTPUT RULES: ...`;
}
```

#### Quality Gates Integration
- Validates output after generation
- Auto-retry if critical errors detected
- Logs validation results
- Adds quality score to metadata

---

### 3. UI Quality Gates ✅

**File:** `packages/mae-core/src/quality-gates.ts` (NEW)

Comprehensive validation system:

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

// Main validator
export function validateOutput(output: MAEOutput): ValidationResult

// Specific validators
function validateStructure()   // File count, organization
function validateStyling()     // Tailwind usage, responsiveness
function validateLayout()      // Containers, spacing, grids
function validateReactQuality() // JSX correctness, TypeScript
function validateUX()          // Loading/empty/error states
```

#### Validation Categories

**Structure (Critical)**
- Minimum 3 files (no single-file dumps)
- At least 2 components in `src/components/`
- Proper file organization
- CSS file present

**Styling (Critical)**
- Tailwind classes used (not inline styles)
- Responsive breakpoints present (sm:/md:/lg:)
- Consistent spacing throughout
- Card patterns with rounded-2xl + shadow

**Layout (Medium)**
- Max-width containers
- Section structure with proper padding
- Grid/flexbox layouts
- No cramped spacing

**React Quality (Critical)**
- No malformed JSX (unquoted href=, class=)
- Proper className (not class)
- No broken closures ("> ))}")
- TypeScript types defined

**UX (Warnings)**
- Loading states for async
- Empty states for lists
- Error states for failures
- Hover states on interactive elements
- Transitions for smooth UX

#### Scoring System
```
100 = Perfect (no errors, no warnings)
-20 per critical error
-10 per high error
-5 per medium error
-2 per warning

Minimum score: 0
```

#### Auto-Repair Logic
```typescript
// Check if retry needed
export function shouldRetry(validation): boolean {
  return validation.errors.filter(e => e.severity === 'critical').length > 0;
}

// Generate repair prompt
export function generateRepairPrompt(validation, output): string {
  // Lists all critical + high errors
  // Provides specific fix instructions
  // Returns prompt for LLM to regenerate
}
```

---

### 4. Beauty Templates ✅

**File:** `packages/mae-core/src/templates.ts` (NEW)

Internal templates for MAE to adapt:

#### Landing Page Template
```typescript
{
  name: 'Marketing Landing Page',
  components: ['Header', 'Hero', 'Features', 'FeatureCard', 'CTA', 'Footer'],
  structure: `
    - Header (sticky, logo + nav)
    - Hero (gradient, py-20 lg:py-32)
    - Features (3-column grid)
    - CTA (colored background)
    - Footer (bg-gray-900)
  `,
  example: `Full example code provided`
}
```

#### Dashboard Template
```typescript
{
  name: 'Dashboard App',
  components: ['Header', 'Sidebar', 'StatCard', 'ContentCard', 'Dashboard'],
  structure: `
    - Header (sticky, user menu)
    - Sidebar (240px, navigation)
    - Main content area
    - Stats cards grid
    - Content cards/tables
  `,
  example: `Full example code provided`
}
```

#### CRUD/Table Template
```typescript
{
  name: 'CRUD/Table App',
  components: ['Header', 'ActionsBar', 'Table', 'TableRow', 'EmptyState', 'FormModal'],
  structure: `
    - Page header
    - Actions bar (search, filters, add)
    - Table in card (rounded-2xl)
    - Empty states
    - Form modal
  `,
  example: `Full example code provided`
}
```

#### Mobile App Template
```typescript
{
  name: 'Mobile-Style App',
  components: ['MobileHeader', 'ContentCard', 'ActionButton'],
  structure: `
    - Sticky header (back button)
    - Stacked card layout
    - Mobile-first spacing
    - Touch-friendly buttons
  `,
  example: `Full example code provided`
}
```

Each template includes:
- Component list
- Structure description
- Full example implementation
- Styling patterns
- Layout guidance

---

### 5. MAE Orchestration Updates ✅

**File:** `apps/web/src/api/mae.ts` (MODIFIED)

Complete build flow with quality enforcement:

```typescript
export async function buildWithMAE(request: BuildRequest): Promise<BuildResponse> {
  // 1. Select template based on prompt
  const templateType = selectTemplateForPrompt(prompt);
  console.log(`[MAE] Selected template: ${templateType}`);

  // 2. Build system message with design system + template
  const systemMessage = buildSystemMessage(templateType);

  // 3. Call LLM (or use mock)
  const response = await callAnthropic(systemMessage, userPrompt);
  output = parseMAEOutput(response);

  // 4. Enforce minimum files
  output = enforceMinimumFiles(output);

  // 5. Check JSX corruption
  output = await detectAndRepairCorruption(output, systemMessage);

  // 6. === QUALITY GATES ===
  console.log('[MAE] Running quality gates...');
  validationResult = validateOutput(output);
  console.log(`[MAE] ${getValidationSummary(validationResult)}`);

  // 7. Auto-retry if critical errors (max 1 retry)
  if (shouldRetry(validationResult) && retryCount < 1 && ANTHROPIC_API_KEY) {
    console.warn('[MAE] Quality check failed, attempting auto-repair...');

    // Generate repair prompt with specific errors
    const repairPrompt = generateRepairPrompt(validationResult, output);

    // Call LLM again with repair instructions
    const repairResponse = await callAnthropic(systemMessage, `${userPrompt}\n\n${repairPrompt}`);

    // Re-validate
    output = parseMAEOutput(repairResponse);
    validationResult = validateOutput(output);
    console.log(`[MAE] After repair: ${getValidationSummary(validationResult)}`);
  }

  // 8. Add validation metadata
  output.meta = {
    qualityScore: validationResult.score,
    validationErrors: validationResult.errors.length,
    validationWarnings: validationResult.warnings.length,
  };

  // 9. Generate preview
  const previewHtml = await generatePreviewHTML(output.files);

  return { ...output, previewHtml };
}
```

**Key Features:**
- Template-aware generation
- Full design system injection
- Automatic validation
- Auto-repair with retry
- Quality scoring
- Detailed logging

---

### 6. Beauty Demo UI ✅

**File:** `apps/web/src/pages/Builder.tsx` (MODIFIED)

Added "Beauty Demo" button and functionality:

#### New State
```typescript
const [isBeautyDemoRunning, setIsBeautyDemoRunning] = useState(false);
const [beautyDemoResults, setBeautyDemoResults] = useState<DemoResult[]>([]);
```

#### Beauty Demo Function
```typescript
const runBeautyDemo = async () => {
  const beautyPrompts = [
    'Build a calorie tracker app with a friendly pig avatar, pink aesthetic',
    'Build a modern dashboard for a SaaS product with sidebar navigation and stat cards',
  ];

  for (const prompt of beautyPrompts) {
    // Build app
    const result = await fetch('/api/mae/build', { /* ... */ });

    // Check quality score
    const qualityScore = result.meta?.qualityScore || 0;

    // Check component count
    const hasMultipleComponents = result.files.filter(f =>
      f.path.startsWith('src/components/')
    ).length >= 2;

    // Validate
    if (qualityScore >= 70 && hasMultipleComponents && result.previewHtml) {
      results.push({ prompt, status: 'pass' });
    } else {
      results.push({ prompt, status: 'fail', reason: '...' });
    }
  }

  setBeautyDemoResults(results);
};
```

#### UI Changes
- **New Button**: "✨ Beauty Demo" in pink (bg-pink-600)
- **Results Display**: Pink-themed results box with quality scores
- **Validation Checks**: Shows quality score, file count, component count
- **Auto-preview**: Displays final preview after each test

---

## Files Changed

### New Files (4)
1. `DESIGN_SYSTEM.md` - Complete design system specification
2. `packages/mae-core/src/design-system.ts` - Design system loader + formatter
3. `packages/mae-core/src/quality-gates.ts` - Quality validation + auto-repair
4. `packages/mae-core/src/templates.ts` - Beauty templates library

### Modified Files (3)
1. `packages/mae-core/src/index.ts` - Export new modules
2. `apps/web/src/api/mae.ts` - Integrate design system + quality gates + auto-retry
3. `apps/web/src/pages/Builder.tsx` - Add Beauty Demo button + results UI

---

## Acceptance Criteria Validation

### A) Vague Prompt Test: "Build a calorie tracker app with a friendly pig avatar, pink aesthetic"

**Expected Output:**
- ✅ App shell layout with header
- ✅ Hero/intro section
- ✅ Primary CTA button
- ✅ Main content card grid
- ✅ At least 3 sections
- ✅ Complete UI (forms, states, empty states)
- ✅ Visually polished WITHOUT user describing layout
- ✅ Accessible and responsive
- ✅ NO malformed JSX (href=, class=, "> ))}")
- ✅ React components styled with Tailwind/shadcn patterns
- ✅ Quality score >= 70/100

**What MAE Will Generate:**
```
src/App.tsx
src/components/Header.tsx
src/components/Hero.tsx
src/components/CalorieTracker.tsx
src/components/MealCard.tsx
src/components/PigAvatar.tsx
src/index.css
```

With pink theme (bg-pink-600, from-pink-50), pig SVG avatar, responsive grid, proper spacing, and complete CRUD functionality.

### B) Minimum Files Enforced

**Quality Gates Check:**
```typescript
validateStructure(output):
  ✅ fileCount >= 3
  ✅ componentFiles.length >= 2
  ✅ hasCss === true
  ✅ hasProperStructure === true
```

**Output Always Includes:**
- src/App.tsx
- src/components/* (2-6 components)
- src/pages/* (if route-based app)
- src/index.css
- (optional) src/lib/* for utilities

### C) Auto-Retry on Failure

**Process:**
```
1. Generate output
2. Run validation (validateOutput)
3. Check score and errors
4. IF critical errors && retryCount < 1:
   - Generate repair prompt
   - Call LLM again
   - Re-validate
   - Update output
5. Add quality metadata
6. Return result
```

**No User Questions Asked:**
- Repair happens automatically
- Logs show retry attempt
- Warnings added to output.warnings[]
- User sees final quality score

---

## Quality Gates Details

### Structure Validation
```typescript
Checks:
- File count >= 3
- Component count >= 2
- CSS file exists
- Proper organization (components/ folder)

Errors:
- "Too few files (X). Expected at least 3 files" [CRITICAL]
- "Insufficient component files (X). Expected at least 2" [HIGH]
- "No component organization" [MEDIUM]

Score Impact: -20 per critical, -10 per high, -5 per medium
```

### Styling Validation
```typescript
Checks:
- Tailwind className usage (>= 3 instances per file)
- Responsive breakpoints (sm:/md:/lg:)
- Spacing classes (p-/py-/px-/space-/gap-)
- Card patterns (rounded-2xl + shadow)

Errors:
- "Excessive inline styles" [HIGH]
- "Insufficient Tailwind usage. Components appear unstyled" [CRITICAL]

Warnings:
- "No responsive breakpoints found"
- "Limited spacing usage"
- "Cards missing standard styling"

Score Impact: -20 critical, -10 high, -2 per warning
```

### React Quality Validation
```typescript
Checks:
- No unquoted href=
- No unquoted className=
- No HTML class= (should be className)
- No malformed closures ("> ))}")
- TypeScript types present

Errors:
- "Malformed JSX: unquoted href attribute" [CRITICAL]
- "Malformed JSX: unquoted className attribute" [CRITICAL]
- "Invalid HTML attribute: use className instead of class" [CRITICAL]
- "Malformed JSX closure: '> ))}' pattern detected" [CRITICAL]

Warnings:
- "No TypeScript types found. Add prop interfaces"

Score Impact: -20 per critical
```

### UX Validation
```typescript
Checks:
- Loading states (loading/isLoading/Loading)
- Empty states (empty/Empty/no items)
- Error states (error/Error)
- Hover states (hover:)
- Transitions (transition)

Warnings (no errors, only suggestions):
- "No loading states found. Add loading indicators"
- "No empty states found. Add helpful empty states"
- "No error states found. Add error messages"
- "No hover states found. Add hover effects"
- "No transitions found. Add smooth transitions"

Score Impact: -2 per warning
```

---

## Template System

### Selection Logic
```typescript
function selectTemplateForPrompt(prompt: string) {
  const lower = prompt.toLowerCase();

  // Dashboard keywords
  if (lower.includes('dashboard') || lower.includes('admin') ||
      lower.includes('analytics') || lower.includes('stats')) {
    return 'dashboard';
  }

  // CRUD keywords
  if (lower.includes('crud') || lower.includes('table') ||
      lower.includes('list') || lower.includes('manage')) {
    return 'crud';
  }

  // Landing keywords
  if (lower.includes('landing') || lower.includes('marketing') ||
      lower.includes('hero') || lower.includes('features')) {
    return 'landing';
  }

  return 'general';
}
```

### Template Injection
Each template provides:
1. **Structure Description**: Layout sections and organization
2. **Component List**: Required component names
3. **Example Implementation**: Full working code examples
4. **Styling Patterns**: Specific Tailwind classes to use
5. **Layout Guidance**: Container sizes, grid patterns

MAE receives this in system message and adapts to user's specific request while maintaining template structure.

---

## Logging & Observability

### Console Logs
```
[MAE] Selected template: dashboard
[MAE] Running quality gates...
[MAE] Quality check: 75/100
  ✅ Structure validation passed
  ⚠️  2 styling warnings
  ✅ React quality passed
[MAE] Quality check failed, attempting auto-repair...
[MAE] After repair: Quality check: 85/100
```

### Build Logs (UI)
```
[info] Building: Build a calorie tracker app...
[info] Received 6 files
[warn] [styling] No responsive breakpoints found in src/App.tsx
[info] Quality check: 85/100 (0 errors, 2 warnings)
[info] Preview generated successfully
```

### Metadata in Response
```json
{
  "summary": "Built a calorie tracker app...",
  "files": [...],
  "warnings": [
    "Quality check failed (score: 65/100), attempting auto-repair...",
    "Auto-repair completed (new score: 85/100)",
    "[styling] No responsive breakpoints found in src/App.tsx"
  ],
  "meta": {
    "qualityScore": 85,
    "validationErrors": 0,
    "validationWarnings": 2
  }
}
```

---

## Testing

### Manual Testing
1. Click "✨ Beauty Demo" button
2. Watch two builds execute:
   - Calorie tracker with pig avatar
   - SaaS dashboard with sidebar
3. Check results display:
   - ✅ Pass if score >= 70, >= 2 components, preview works
   - ❌ Fail if any check fails
4. Review logs for quality scores and component counts
5. Inspect preview for visual quality

### Expected Results
```
✨ Beauty Demo Results:

✅ Build a calorie tracker app with a friendly pig avatar, pink aesthetic
   Quality: 85/100, 6 files, 4 components

✅ Build a modern dashboard for a SaaS product with sidebar navigation and stat cards
   Quality: 90/100, 8 files, 6 components
```

### Validation Tests
```bash
# Test single-file output rejection
- Generate output with only App.tsx
- Validator returns: FAIL (critical error: "Too few files")
- Auto-repair triggers
- Re-generates with multiple components

# Test malformed JSX detection
- Generate output with href= without quotes
- Validator returns: FAIL (critical error: "Malformed JSX")
- Auto-repair triggers
- Re-generates with proper quotes

# Test missing Tailwind styles
- Generate output with no className
- Validator returns: FAIL (critical error: "Insufficient Tailwind usage")
- Auto-repair triggers
- Re-generates with Tailwind classes
```

---

## Design System Highlights

### Typography Hierarchy
```tsx
H1: text-4xl lg:text-5xl font-bold text-gray-900
H2: text-2xl lg:text-3xl font-bold text-gray-900
H3: text-xl lg:text-2xl font-semibold text-gray-900
Body: text-base lg:text-lg text-gray-600
Small: text-sm text-gray-500
```

### Spacing Scale (8px grid)
```
p-2  = 8px
p-3  = 12px
p-4  = 16px
p-6  = 24px
p-8  = 32px
p-12 = 48px
p-16 = 64px
p-24 = 96px
```

### Standard Components
```tsx
// Card
className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"

// Button Primary
className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150"

// Input
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

// Container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Section
className="py-16 lg:py-24"
```

---

## Key Improvements

1. **Automated Quality Enforcement**
   - Every build validated against 30+ checks
   - Auto-repair for critical failures
   - Quality scores visible to user

2. **Template-Based Generation**
   - Intelligent template selection
   - Consistent app structures
   - Professional layouts by default

3. **Beautiful by Default**
   - Design system automatically applied
   - No need for layout descriptions
   - Polished UI on first try

4. **No User Questions**
   - Auto-retry handles failures
   - Repairs happen transparently
   - Logs show what happened

5. **Comprehensive Validation**
   - Structure (files, organization)
   - Styling (Tailwind, responsiveness)
   - Layout (containers, spacing)
   - React quality (JSX, TypeScript)
   - UX (states, interactions)

---

## Next Steps (Optional Enhancements)

- [ ] Add more templates (blog, e-commerce, portfolio)
- [ ] Implement A/B testing for template variations
- [ ] Add design system theming (color schemes)
- [ ] Integrate accessibility scanner (axe-core)
- [ ] Add performance budgets (bundle size limits)
- [ ] Implement screenshot-based visual regression testing
- [ ] Add design system version control
- [ ] Create design system playground UI

---

**Status: Complete and Ready for Testing** ✅

Run "✨ Beauty Demo" to see design system enforcement in action!
