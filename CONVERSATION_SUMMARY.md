# TeamMAE Development Summary

## Project Overview
TeamMAE is an AI-powered app builder that generates production-ready React apps with enforced brand compliance (Neo Tokyo Cyberpunk design system).

## Architecture
- **Monorepo**: pnpm workspace with packages (mae-core, types, db) and apps (web)
- **Stack**: React + TypeScript + Vite + Tailwind + Supabase + Anthropic Claude API
- **Brand System**: Non-bypassable brand enforcement with validation and retry loops

---

## Implementation History (Prompts 6-9)

### PROMPT 6: Marketing Site + Brand Injection System
**Created:**
- `packages/mae-core/src/brand.ts` - TEAMMAE_BRAND profile + getBrandInjectionPrompt()
- `packages/mae-core/src/brand-validation.ts` - 5 critical brand rules validation
- `packages/mae-core/src/brand-resolver.ts` - Brand resolution with keyword detection
- Marketing pages (Landing, Features, Pricing, About) - NOT USED, DEPRECATED

**Brand Profile (TeamMAE Neo Tokyo Cyberpunk):**
- Font: Share Tech Mono (monospace)
- Borders: Sharp (0.25rem max, no rounded-lg/xl/full)
- Colors: Dark mode semantic tokens (bg-background, bg-card, not gray-900)
- Style: dark-saas (default), light-saas, colorful, minimal

### PROMPT 7: Brand Enforcement as Non-Optional System Constraint
**Enhanced:**
- `brand-validation.ts` - Hard validator with 5 rules (BRAND_TYPOGRAPHY, BRAND_BORDER_RADIUS, BRAND_COLOR_TOKENS, BRAND_DARK_MODE, BRAND_NO_UNSTYLED)
- `brand-resolver.ts` - resolveBrandProfile() with priority: explicit > keywords > default
- `quality-contract.ts` - Integrated Rule 7: BRAND COMPLIANCE (non-bypassable)
- `build-plan.ts` - Enforces style profile in build plan generation

**Key Functions:**
- `resolveBrandProfile(prompt, styleProfile?)` → ResolvedBrand
- `enforceBrandResolution(resolved)` → throws if missing
- `validateBrand(output, profile)` → BrandValidationResult
- `getBrandInjectionPrompt(styleProfile)` → string (LLM prompt)

### PROMPT 8: Runtime Wiring + UI Visibility
**Modified:** `apps/web/src/api/mae.ts`

**Brand Enforcement Pipeline:**
```
Phase 0: Brand Resolution (BEFORE any LLM calls)
  ↓ resolveBrandProfile(prompt, styleProfile)
  ↓ enforceBrandResolution() - throws if null

Phase 1: Build Plan Generation
  ↓ getBuildPlanPrompt(resolvedBrand.styleProfile)
  ↓ callAnthropic(systemWithBrand, planPrompt) ← BRAND INJECTED
  ↓ buildPlan.styleProfile = enforced

Phase 2: Code Generation
  ↓ buildSystemMessageWithBrand(template, plan, brandPrompt) ← BRAND INJECTED
  ↓ callAnthropic(systemWithBrand, userPrompt) ← BRAND INJECTED
  ↓ Repair loops preserve brand injection

Phase 3: Quality Contract Validation
  ↓ validateContract(output, resolvedBrand.profile) ← BRAND ENFORCED
  ↓ Brand violations = contract failures → retry

Phase 4: Output Metadata
  ↓ brandName, brandSource, styleProfile, brandCompliant, brandViolations
```

**UI Updates:** `apps/web/src/pages/Builder.tsx`
- Logs: "Brand: TeamMAE.ai (TeamMAE Default)", "Style: dark-saas", "Brand compliance: PASSED/FAILED"
- Assistant messages show brand status with ✅/⚠️
- Violations listed when non-compliant

### PROMPT 9: Regression Tests
**Created:**
- `apps/web/vitest.config.ts` - Test configuration
- `apps/web/src/api/preview-sanitizer.ts` - Extracted sanitizer function
- `apps/web/src/api/__tests__/preview-sanitizer.test.ts` - 8 tests
- `apps/web/src/api/__tests__/brand-validation.test.ts` - 8 tests
- `apps/web/src/api/__tests__/mae-pipeline.test.ts` - 19 tests

**Test Coverage:**
- Preview corruption detection (href=, class=, >))})
- Brand validation (5 rules, thresholds, violations)
- Pipeline integration (resolution, injection, contract, metadata)

**Results:** 35/35 tests passing in ~170ms

---

## Critical Files

### Core Brand System
| File | Purpose |
|------|---------|
| `packages/mae-core/src/brand.ts` | TEAMMAE_BRAND profile + getBrandInjectionPrompt() |
| `packages/mae-core/src/brand-validation.ts` | validateBrand() with 5 rules |
| `packages/mae-core/src/brand-resolver.ts` | resolveBrandProfile() + enforceBrandResolution() |
| `packages/mae-core/src/quality-contract.ts` | Rule 7: BRAND COMPLIANCE integration |
| `packages/mae-core/src/build-plan.ts` | Style profile enforcement |

### Runtime Implementation
| File | Purpose |
|------|---------|
| `apps/web/src/api/mae.ts` | Main orchestration with Phase 0-4 brand enforcement |
| `apps/web/src/pages/Builder.tsx` | UI with brand status display |
| `apps/web/src/api/preview-sanitizer.ts` | HTML corruption detection |

### Tests
| File | Tests | Purpose |
|------|-------|---------|
| `preview-sanitizer.test.ts` | 8 | Corruption pattern detection |
| `brand-validation.test.ts` | 8 | Brand rule validation |
| `mae-pipeline.test.ts` | 19 | End-to-end integration |

---

## Brand Validation Rules

### 1. BRAND_TYPOGRAPHY
**Requirement:** Monospace font (font-mono or Share Tech Mono)
**Violation:** Using font-sans or system fonts
**Threshold:** No monospace font detected

### 2. BRAND_BORDER_RADIUS
**Requirement:** Sharp borders (rounded-sm or rounded-md, max 0.25rem)
**Violation:** rounded-lg, rounded-xl, rounded-full
**Threshold:** Any large rounded border

### 3. BRAND_COLOR_TOKENS
**Requirement:** Semantic tokens (bg-background, bg-card, bg-primary)
**Violation:** Hard-coded colors (bg-gray-900, text-blue-600)
**Threshold:** >3 hard-coded color instances

### 4. BRAND_DARK_MODE
**Requirement:** Dark mode by default (bg-background, text-foreground)
**Violation:** Light mode (bg-white AND text-black together)
**Threshold:** Both bg-white and text-black present

### 5. BRAND_NO_UNSTYLED
**Requirement:** All elements must have className
**Violation:** `<div>`, `<p>`, `<h1>` without className
**Threshold:** Any unstyled element

---

## Brand Resolution Logic

```typescript
// Priority order
1. Explicit UI selection (styleProfile parameter)
   → source: 'user-explicit', overrideDetected: true

2. Keyword detection in prompt
   - "light", "bright" → light-saas
   - "colorful", "vibrant" → colorful
   - "minimal", "clean" → minimal
   → source: 'user-implicit', overrideDetected: true

3. Default
   → source: 'default', styleProfile: 'dark-saas', overrideDetected: false
```

**Example:**
```typescript
resolveBrandProfile("Build a light theme app", null)
// → { profile: TEAMMAE_BRAND, source: 'user-implicit', styleProfile: 'light-saas', overrideDetected: true }

resolveBrandProfile("Build a todo app", "colorful")
// → { profile: TEAMMAE_BRAND, source: 'user-explicit', styleProfile: 'colorful', overrideDetected: true }

resolveBrandProfile("Build a dashboard", null)
// → { profile: TEAMMAE_BRAND, source: 'default', styleProfile: 'dark-saas', overrideDetected: false }
```

---

## Build Output Metadata

Every build includes:
```typescript
{
  summary: string,
  files: MAEFile[],
  warnings?: string[],
  meta: {
    // Quality metrics
    qualityScore: number,
    componentCount: number,
    designSystemCompliance: number,
    attempts: number,

    // Build plan
    buildPlan: BuildPlan,
    planExplanation: string,
    buildExplanation: string,

    // Brand metadata (MANDATORY)
    brandName: 'TeamMAE.ai',
    brandSource: 'default' | 'user-explicit' | 'user-implicit',
    styleProfile: 'dark-saas' | 'light-saas' | 'colorful' | 'minimal',
    brandCompliant: boolean,
    brandViolations: string[]  // Empty if compliant
  }
}
```

---

## Key Design Decisions

### Why Phase 0 Brand Resolution?
Brand must be resolved BEFORE build plan generation because:
- Build plan depends on style profile (dark vs light)
- Ensures brand consistency from start to finish
- Non-bypassable enforcement

### Why Inject in EVERY LLM Call?
- Build plan generation needs brand context
- Code generation needs brand rules
- Repair loops must preserve brand requirements
- Prevents drift between plan and implementation

### Why Hard Validation?
- LLMs can ignore soft suggestions
- Contract failures force retry (max 2 retries)
- Guarantees brand compliance or explicit failure

### Why Metadata?
- UI visibility for debugging
- Analytics for brand override usage
- Audit trail for compliance

---

## Testing Strategy

### Preview Sanitizer (Detector, Not Fixer)
```typescript
sanitizePreviewHtml(html) → { ok: boolean, html: string, violations: string[] }
```
- Detects corruption patterns
- Returns violations for upstream repair
- Does NOT modify HTML

### Brand Validation (Unit Tests)
- Feed known violating code
- Assert specific violations returned
- Test threshold logic (e.g., 4+ colors = violation)

### Pipeline Integration (No Mocking)
- Test actual brand resolution logic
- Verify injection prompt content
- Check metadata structure
- Faster, simpler, more maintainable than mocked LLM tests

---

## Environment Setup

### Required Environment Variables
```bash
# apps/web/.env.local
VITE_ANTHROPIC_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Run Commands
```bash
# Development
pnpm dev              # Start all apps
pnpm web              # Start web app only

# Testing
pnpm test             # Run all tests (from apps/web)
pnpm test:watch       # Watch mode
pnpm test:ui          # UI mode

# Build
pnpm build            # Build all packages
npx tsc --noEmit      # Type check without build
```

---

## Current State

✅ **Working:**
- Brand enforcement pipeline (Phase 0-4)
- Quality contract with Rule 7
- UI displays brand status
- 35/35 tests passing
- TypeScript compiles cleanly

⚠️ **Known Limitations:**
1. No UI brand selector yet (keyword detection only)
2. Only TeamMAE brand available (no multi-brand support)
3. Preview renders even if non-compliant (logs violations but doesn't block)

📋 **Potential Next Steps:**
1. Add UI brand selector dropdown
2. Deploy to Vercel + Supabase Edge Functions
3. Add more brand profiles
4. Implement multi-brand support
5. Block preview rendering if brandCompliant === false

---

## Common Operations

### Add New Corruption Pattern
```typescript
// apps/web/src/api/preview-sanitizer.ts
{
  regex: /your-pattern-here/,
  message: 'Detected your corruption type'
}

// Add test in preview-sanitizer.test.ts
it('should detect new pattern', () => {
  const badHtml = '<div attribute=unquoted>...</div>';
  const result = sanitizePreviewHtml(badHtml);
  expect(result.ok).toBe(false);
});
```

### Add New Brand Rule
```typescript
// packages/mae-core/src/brand-validation.ts
// Rule 6: Your new rule
if (violationCondition) {
  violations.push({
    rule: 'BRAND_YOUR_RULE',
    severity: 'critical',
    message: 'Violation description',
    expected: 'Expected value',
    actual: 'Actual value'
  });
}

// Add test in brand-validation.test.ts
it('should fail when violating new rule', () => {
  const output = { /* violating code */ };
  const result = validateBrand(output, TEAMMAE_BRAND);
  expect(result.violations.some(v => v.rule === 'BRAND_YOUR_RULE')).toBe(true);
});
```

### Debug Brand Enforcement
```typescript
// Check console logs during build:
// [MAE] Phase 0: Resolving brand profile...
// [MAE] Brand: TeamMAE.ai (TeamMAE Default)
// [MAE] Style: dark-saas (default)
// [MAE] Brand injection: ACTIVE
// [MAE] Brand validation: PASS/FAIL

// Check UI logs drawer:
// Brand: TeamMAE.ai (TeamMAE Default)
// Style: dark-saas
// Brand compliance: PASSED
```

---

## File Structure

```
TeamMAE/
├── packages/
│   ├── mae-core/src/
│   │   ├── brand.ts                    # TEAMMAE_BRAND + getBrandInjectionPrompt()
│   │   ├── brand-validation.ts         # validateBrand() with 5 rules
│   │   ├── brand-resolver.ts           # resolveBrandProfile() + enforcement
│   │   ├── quality-contract.ts         # Rule 7 integration
│   │   └── build-plan.ts              # Style profile enforcement
│   ├── types/src/
│   │   └── index.ts                   # MAEOutput, MAEFile, BuildPlan interfaces
│   └── db/src/
│       └── index.ts                   # Supabase client (not configured)
├── apps/web/src/
│   ├── api/
│   │   ├── mae.ts                     # Main orchestration (Phase 0-4)
│   │   ├── preview-sanitizer.ts       # Corruption detection
│   │   └── __tests__/
│   │       ├── preview-sanitizer.test.ts   # 8 tests
│   │       ├── brand-validation.test.ts    # 8 tests
│   │       └── mae-pipeline.test.ts        # 19 tests
│   ├── pages/
│   │   └── Builder.tsx                # UI with brand status
│   └── components/
│       ├── PreviewPane.tsx
│       ├── LogsDrawer.tsx
│       └── ...
├── PROMPT6_IMPLEMENTATION_STATUS.md   # Initial brand system
├── PROMPT7_SUMMARY.md                 # Brand enforcement
├── PROMPT7_BRAND_ENFORCEMENT_WIRING.md
├── PROMPT8_STATUS.md                  # Runtime wiring
├── PROMPT8_COMPLETE.md
└── PROMPT9_STATUS.md                  # Regression tests
```

---

## Quick Reference

### Brand Injection Prompt Structure
```
## BRAND DESIGN SYSTEM (TeamMAE.ai)

### Typography (Neo Tokyo Cyberpunk)
- Font Family: 'Share Tech Mono', ui-monospace, monospace
- NEVER use font-sans or system fonts
- ALWAYS use font-mono class

### Spacing System (8px Grid)
- Sharp borders: rounded-sm or rounded (0.25rem max)
- NEVER use rounded-lg, rounded-xl, or rounded-full

### Color Tokens
- Use semantic tokens: bg-background, bg-card, bg-primary
- NEVER hard-code colors: bg-gray-900, text-blue-600

### Critical Rules
1. NEVER output unstyled HTML
2. Use monospace font family
3. Maintain sharp border-radius
4. Use dark mode by default (unless light requested)
5. All elements must have Tailwind classes
```

### Validation Thresholds
- **Color tokens:** >3 hard-coded colors = violation
- **Dark mode:** bg-white AND text-black = violation
- **Unstyled:** ANY element without className = violation
- **Typography:** NO monospace font = violation
- **Borders:** ANY rounded-lg/xl/full = violation

---

## Status Documentation Files

All implementation details preserved in:
- `PROMPT6_IMPLEMENTATION_STATUS.md`
- `PROMPT7_SUMMARY.md`
- `PROMPT7_BRAND_ENFORCEMENT_WIRING.md`
- `PROMPT8_STATUS.md`
- `PROMPT8_COMPLETE.md`
- `PROMPT9_STATUS.md`
- `CONVERSATION_SUMMARY.md` (this file)
