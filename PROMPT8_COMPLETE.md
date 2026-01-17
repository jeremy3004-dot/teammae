# PROMPT 8: Brand Enforcement Runtime Wiring - COMPLETE ✅

## What Was Implemented

### 1. Runtime Orchestration (`apps/web/src/api/mae.ts`)

**Phase 0: Brand Resolution (NEW)**
- Brand profile resolved BEFORE any code generation
- `resolveBrandProfile(prompt, styleProfile)` determines active brand
- `enforceBrandResolution()` throws if brand resolution fails
- Priority: Explicit UI > Keywords > Default (TeamMAE)

**Phase 1: Build Plan Generation (UPDATED)**
- Brand prompt injected into build plan LLM call
- Style profile enforced (non-negotiable)
- `getBuildPlanPrompt(resolvedBrand.styleProfile)` enforces style

**Phase 2: Code Generation (UPDATED)**
- Created `buildSystemMessageWithBrand()` function
- Brand prompt MANDATORY in all code generation LLM calls
- Replaces old `buildSystemMessageWithPlan()` function
- Brand injection preserved in all repair loops

**Phase 3: Quality Contract (UPDATED)**
- `validateContract(output, resolvedBrand.profile)` enforces brand
- Rule 7: BRAND COMPLIANCE is non-bypassable
- Brand violations = contract failures → automatic retry
- Logs brand validation results (PASS/FAIL)

**Output Metadata (NEW)**
- `brandName`: "TeamMAE.ai"
- `brandSource`: "default" | "user-explicit" | "user-implicit"
- `styleProfile`: "dark-saas" | "light-saas" | "colorful" | "minimal"
- `brandCompliant`: boolean
- `brandViolations`: string[] (empty if compliant)

### 2. Builder UI Updates (`apps/web/src/pages/Builder.tsx`)

**Brand Status in Logs**
- "Brand: TeamMAE.ai (TeamMAE Default)"
- "Style: dark-saas"
- "Brand compliance: PASSED" or "FAILED"
- Individual violations logged as warnings

**Brand Status in Assistant Messages**
- Shows brand name and source
- Shows style profile
- Shows compliance status with ✅ or ⚠️
- Lists violations if non-compliant

### 3. Documentation

**Created Files:**
- `PROMPT8_STATUS.md` - Complete implementation status and testing guide
- `PROMPT8_COMPLETE.md` - This summary document

**Updated Files:**
- `PROMPT7_SUMMARY.md` - Previously created infrastructure summary
- `PROMPT7_BRAND_ENFORCEMENT_WIRING.md` - Integration instructions

---

## How It Works

### Brand Resolution Flow

```
1. User enters prompt: "Build a todo app"
   ↓
2. Phase 0: resolveBrandProfile(prompt, null)
   ↓
3. No keywords detected → Default brand selected
   ↓
4. resolvedBrand = {
     profile: TEAMMAE_BRAND,
     source: 'default',
     styleProfile: 'dark-saas',
     overrideDetected: false
   }
   ↓
5. enforceBrandResolution(resolvedBrand) ✅
   ↓
6. Phase 1: Build plan generation with brand injection
   ↓
7. Phase 2: Code generation with brand injection
   ↓
8. Phase 3: Validate brand compliance
   ↓
9. If non-compliant → Retry with violations
   ↓
10. Output includes brand metadata
   ↓
11. UI displays brand status
```

### Brand Injection Example

**System Message (Phase 1 & 2):**
```
You are MAE, an expert app builder for TeamMAE.ai...

BRAND DNA: TEAMMAE.AI NEO TOKYO CYBERPUNK
You MUST follow these brand rules for every component:

TYPOGRAPHY (NON-NEGOTIABLE):
- Font: 'Share Tech Mono', ui-monospace, monospace
- All text elements MUST use font-mono class
- Never use font-sans or system fonts
...

[Rest of design system and template prompts]
```

### Brand Validation Example

**Input Code:**
```tsx
<div className="rounded-lg bg-gray-900 p-4">
  <h1 className="font-sans text-2xl">Hello</h1>
</div>
```

**Validation Result:**
```
❌ BRAND VIOLATION: BRAND_BORDER_RADIUS
   Expected: rounded-sm or rounded-md (max 0.25rem)
   Actual: rounded-lg (0.5rem)

❌ BRAND VIOLATION: BRAND_COLOR_TOKENS
   Expected: bg-background, bg-card
   Actual: bg-gray-900 (hard-coded)

❌ BRAND VIOLATION: BRAND_TYPOGRAPHY
   Expected: font-mono
   Actual: font-sans
```

**Contract Fails → Automatic Retry**

---

## Testing

### Manual Testing (Works Now)

```bash
# Start dev server
npm run dev

# Test 1: Default brand
Prompt: "Build a todo app"
Expected: TeamMAE.ai (TeamMAE Default), dark-saas, monospace font

# Test 2: Keyword override
Prompt: "Build a light minimal dashboard"
Expected: TeamMAE.ai (Detected from Prompt), light-saas, monospace font

# Test 3: Check logs
Click "Show Logs" button
Expected: Brand resolution logs, compliance status
```

### UI Verification

1. **Chat Message Shows:**
   ```
   Brand: TeamMAE.ai (TeamMAE Default)
   Style: dark-saas
   ✅ Brand compliance: PASSED

   Quality Score: 85/100
   ```

2. **Logs Show:**
   ```
   [INFO] Brand: TeamMAE.ai (TeamMAE Default)
   [INFO] Style: dark-saas
   [INFO] Brand compliance: PASSED
   [INFO] Build Plan: 3 components planned
   [INFO] Received 7 files
   [INFO] Preview generated successfully
   ```

### Automated Testing (TODO)

See `PROMPT8_STATUS.md` for regression test requirements.

---

## Files Modified

| File | Changes | Lines Changed |
|------|---------|---------------|
| `apps/web/src/api/mae.ts` | Phase 0-3 brand wiring, buildSystemMessageWithBrand() | ~100 lines |
| `apps/web/src/pages/Builder.tsx` | Brand status logging and UI display | ~40 lines |

---

## Enforcement Guarantees

✅ **Non-Bypassable:** Brand resolution happens before ANY code generation
✅ **Mandatory Injection:** Brand prompt in EVERY LLM call (plan + codegen + repair)
✅ **Hard Validation:** Brand compliance is Rule 7 in quality contract
✅ **Automatic Retry:** Brand violations trigger retry with fix instructions
✅ **Full Visibility:** UI shows brand status, source, and violations
✅ **Metadata Tracking:** Every build includes complete brand information

---

## Default Behavior

**Without User Override:**
- Brand: TeamMAE.ai
- Theme: Neo Tokyo Cyberpunk
- Style: dark-saas
- Font: Share Tech Mono (monospace)
- Borders: Sharp (0.25rem max)
- Colors: Dark mode semantic tokens
- Compliance: Enforced by contract

**With User Override:**
- Detected from keywords: "light", "colorful", "minimal"
- OR selected via UI (when implemented)
- Still enforces brand quality rules
- Only changes style profile, not quality standards

---

## Success Metrics

✅ TypeScript compiles without errors
✅ Brand resolution integrated into build pipeline
✅ Brand injection in all LLM calls
✅ Brand validation in quality contract
✅ Brand metadata in all outputs
✅ UI displays brand information
✅ Logs show brand status

⚠️ Automated tests not yet implemented (next step)

---

## Next Steps

1. **Create Regression Tests**
   - File: `apps/web/src/api/__tests__/mae.test.ts`
   - Test preview sanitizer
   - Test brand validation
   - Test end-to-end with mocked LLM

2. **Add UI Brand Selector**
   - Dropdown in Builder UI
   - Options: Auto, Dark (TeamMAE), Light, Colorful, Minimal
   - Pass selected style to buildWithMAE()

3. **Performance Testing**
   - Verify brand resolution overhead is negligible
   - Ensure retry loop terminates (max 2 retries)

---

## Architecture Notes

**Why Phase 0?**
- Brand must be resolved BEFORE build plan generation
- Build plan depends on style profile (dark vs light)
- Ensures brand consistency from start to finish

**Why Inject in EVERY LLM Call?**
- Build plan generation needs brand context
- Code generation needs brand rules
- Repair loops must preserve brand requirements
- Prevents drift between plan and implementation

**Why Hard Validation?**
- LLMs can ignore soft suggestions
- Contract failures force retry
- Guarantees brand compliance or explicit failure

**Why Metadata?**
- UI visibility for debugging
- Analytics for brand override usage
- Audit trail for compliance

---

## Known Limitations

1. **No UI Selector Yet**
   - Users can only override via keywords
   - Explicit UI selection will be added in future

2. **No Brand Customization**
   - Only TeamMAE brand available
   - Multi-brand support not yet implemented

3. **No Regression Tests**
   - Manual testing only
   - Automated tests required for CI/CD

4. **Preview Not Blocked**
   - Non-compliant builds still render
   - Should we block preview if brandCompliant === false?

---

## Questions for User

1. Should non-compliant builds block preview rendering?
2. Should we add explicit UI brand selector now?
3. Should we implement regression tests before moving forward?
4. Should brand violations fail the build or just warn?

---

## Completion Checklist

✅ Phase 0: Brand Resolution
✅ Phase 1: Brand Injection in Build Plan
✅ Phase 2: Brand Injection in Code Generation
✅ Phase 3: Brand Validation in Contract
✅ Brand Metadata in Output
✅ Builder UI Brand Display
✅ Logs Show Brand Status
✅ Documentation Complete
⚠️ Regression Tests (TODO)

**Status:** Runtime wiring COMPLETE, tests pending
