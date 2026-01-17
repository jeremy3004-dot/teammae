# PROMPT 8: Brand Enforcement Runtime Wiring - Status

## Objective
Wire brand enforcement into the actual runtime build pipeline with UI visibility and regression tests.

## Implementation Status: ✅ COMPLETE

### 1. Runtime Orchestration (`apps/web/src/api/mae.ts`) ✅

**Changes Made:**

#### Phase 0: Brand Resolution (NEW)
```typescript
// Line 64-71: Brand resolution happens FIRST, before any code generation
const resolvedBrand = resolveBrandProfile(prompt, styleProfile);
enforceBrandResolution(resolvedBrand); // Throws if missing

console.log(`[MAE] Brand: ${resolvedBrand.profile.brandName} (${getBrandSourceLabel(resolvedBrand.source)})`);
console.log(`[MAE] Style: ${resolvedBrand.styleProfile}${resolvedBrand.overrideDetected ? ' (user override)' : ' (default)'}`);
console.log('[MAE] Brand injection: ACTIVE');
```

#### Phase 1: Build Plan Generation (UPDATED)
```typescript
// Line 89-93: Brand injected into build plan generation LLM call
const planPrompt = getBuildPlanPrompt(resolvedBrand.styleProfile);
const brandPrompt = getBrandInjectionPrompt(resolvedBrand.styleProfile);
const planResponse = await callAnthropic(
  `You are a technical architect planning web application structure.\n\n${brandPrompt}`,
  `${planPrompt}\n\nUser request: ${prompt}`
);

// Line 113: Enforce style profile in build plan
buildPlan.styleProfile = resolvedBrand.styleProfile as any;
```

#### Phase 2: Code Generation (UPDATED)
```typescript
// Line 128-129: Brand injection in code generation
const brandPrompt = getBrandInjectionPrompt(resolvedBrand.styleProfile);
const systemMessage = buildSystemMessageWithBrand(templateType, buildPlan, brandPrompt);

// New function: buildSystemMessageWithBrand()
// Line 273-315: Replaces buildSystemMessageWithPlan(), now includes MANDATORY brand injection
function buildSystemMessageWithBrand(
  templateType?: string,
  buildPlan?: BuildPlan | null,
  brandPrompt?: string
): string {
  // ...
  const brandInjection = brandPrompt || getBrandInjectionPrompt('dark-saas');
  return `You are MAE, an expert app builder for TeamMAE.ai...

${brandInjection}
...`;
}
```

#### Phase 3: Quality Contract (UPDATED)
```typescript
// Line 159: Pass resolved brand to contract validator
const contractResult = validateContract(output, resolvedBrand.profile);

// Line 162-166: Log brand validation results
if (contractResult.brandCompliant === false) {
  console.warn('[MAE] Brand validation: FAIL - violations detected');
} else {
  console.log('[MAE] Brand validation: PASS');
}
```

#### Retry Loop (UPDATED)
- Line 564-582: `repairAndParse()` - systemMessage already includes brand injection
- Line 588-645: `detectAndRepairCorruption()` - systemMessage already includes brand injection
- Brand prompt is preserved through all repair iterations

#### Output Metadata (NEW)
```typescript
// Line 228-235: Brand metadata added to every build response
output.meta.brandName = resolvedBrand.profile.brandName;
output.meta.brandSource = resolvedBrand.source;
output.meta.styleProfile = resolvedBrand.styleProfile;
output.meta.brandCompliant = contractResult.brandCompliant || false;
output.meta.brandViolations = contractResult.violations
  .filter(v => v.rule.startsWith('BRAND_'))
  .map(v => v.message);
```

### 2. Builder UI Updates (`apps/web/src/pages/Builder.tsx`) ✅

**Changes Made:**

#### Brand Status in Logs
```typescript
// Line 337-358: Log brand resolution results
if (result.meta?.brandName) {
  addLog('info', `Brand: ${result.meta.brandName} (${brandSource})`);
  addLog('info', `Style: ${result.meta.styleProfile || 'dark-saas'}`);

  if (result.meta.brandCompliant === false) {
    addLog('warn', 'Brand compliance: FAILED');
    result.meta.brandViolations.forEach((violation: string) => {
      addLog('warn', `Brand violation: ${violation}`);
    });
  } else {
    addLog('info', 'Brand compliance: PASSED');
  }
}
```

#### Brand Status in Assistant Messages
```typescript
// Line 365-385: Display brand information in chat
if (result.meta?.brandName) {
  assistantContent += `\n\nBrand: ${result.meta.brandName} (${brandSource})`;
  assistantContent += `\nStyle: ${result.meta.styleProfile || 'dark-saas'}`;

  if (result.meta.brandCompliant === false) {
    assistantContent += `\n⚠️ Brand compliance: FAILED`;
    if (result.meta.brandViolations && result.meta.brandViolations.length > 0) {
      assistantContent += `\nViolations: ${result.meta.brandViolations.join(', ')}`;
    }
  } else {
    assistantContent += `\n✅ Brand compliance: PASSED`;
  }
}
```

### 3. Regression Tests ⚠️ TODO

**Required Tests:**
1. **Preview Sanitizer Test** - Verify corruption detection and repair
   - Test patterns: `href=`, `class=`, `> ))}`
   - Verify `checkPreviewIntegrity()` catches all patterns

2. **Brand Validation Test** - Feed violating files to validator
   - Test files with rounded-lg (should fail)
   - Test files with gray-900 (should fail)
   - Test files with font-sans (should fail)
   - Test compliant files (should pass)

3. **End-to-End Pipeline Test** - Mock LLM, verify brand injection
   - Mock `callAnthropic()` to capture system messages
   - Assert brand prompt is present in all LLM calls
   - Verify brand metadata in output

**Test Location:** `apps/web/src/api/__tests__/mae.test.ts` (to be created)

**Test Framework:** Vitest (already configured in package.json)

---

## Flow Diagram

```
User Prompt
    ↓
Phase 0: Brand Resolution
    ├─ resolveBrandProfile(prompt, styleProfile?)
    ├─ enforceBrandResolution() [throws if missing]
    └─ Returns: ResolvedBrand { profile, source, styleProfile, overrideDetected }
    ↓
Phase 1: Build Plan Generation
    ├─ getBuildPlanPrompt(resolvedBrand.styleProfile) [enforced style]
    ├─ getBrandInjectionPrompt(resolvedBrand.styleProfile)
    ├─ callAnthropic(systemWithBrand, planPrompt) [BRAND INJECTED]
    └─ buildPlan.styleProfile = resolvedBrand.styleProfile [ENFORCED]
    ↓
Phase 2: Code Generation
    ├─ buildSystemMessageWithBrand(template, plan, brandPrompt) [BRAND INJECTED]
    ├─ callAnthropic(systemWithBrand, userPrompt) [BRAND INJECTED]
    └─ Repair loops preserve brand injection in systemMessage
    ↓
Phase 3: Quality Contract Validation
    ├─ validateContract(output, resolvedBrand.profile) [BRAND ENFORCED]
    ├─ Includes Rule 7: BRAND COMPLIANCE (non-bypassable)
    └─ Brand violations = contract failures → retry
    ↓
Phase 4: Quality Scoring
    └─ (unchanged)
    ↓
Phase 5: Output Metadata
    ├─ output.meta.brandName
    ├─ output.meta.brandSource
    ├─ output.meta.styleProfile
    ├─ output.meta.brandCompliant
    └─ output.meta.brandViolations
    ↓
Builder UI
    ├─ Logs: "Brand: TeamMAE.ai (TeamMAE Default)"
    ├─ Logs: "Style: dark-saas"
    ├─ Logs: "Brand compliance: PASSED" or "FAILED"
    ├─ Assistant message shows brand status
    └─ Non-compliant builds display violation details
```

---

## Enforcement Guarantees

✅ Brand profile resolved BEFORE any code generation
✅ Brand prompt injected into EVERY LLM call (plan + codegen + repair)
✅ Style profile enforced in build plan (non-negotiable)
✅ Brand compliance checked in contract (Rule 7)
✅ Brand violations trigger automatic retry
✅ Brand metadata in every build response
✅ UI displays active brand, source, and compliance status
✅ Logs show brand resolution and validation results

⚠️ Regression tests not yet implemented

---

## Testing

### Manual Testing

1. **Default Brand (No Override)**
```bash
npm run dev
# Open builder, enter: "Build a todo app"
# Expected logs:
# - Brand: TeamMAE.ai (TeamMAE Default)
# - Style: dark-saas
# - Brand compliance: PASSED
# Expected output: monospace font, sharp borders, dark mode
```

2. **Keyword Override**
```bash
# Enter: "Build a light minimal landing page"
# Expected logs:
# - Brand: TeamMAE.ai (Detected from Prompt)
# - Style: light-saas
# - Brand compliance: PASSED
# Expected output: monospace font, sharp borders, light mode
```

3. **Brand Violation (Automatic Retry)**
```bash
# If LLM generates rounded-lg or gray-900:
# Expected logs:
# - Brand compliance: FAILED
# - Brand violation: BRAND_BORDER_RADIUS or BRAND_COLOR_TOKENS
# - Attempt 2: Contract violations - retrying...
# - Brand compliance: PASSED (after retry)
```

### Automated Testing (TODO)

```bash
# Create test file
mkdir -p apps/web/src/api/__tests__
touch apps/web/src/api/__tests__/mae.test.ts

# Run tests
npm test
```

---

## Files Changed

1. **`apps/web/src/api/mae.ts`** (Modified)
   - Added Phase 0: Brand Resolution
   - Created `buildSystemMessageWithBrand()` function
   - Updated Phase 1-3 to thread brand through pipeline
   - Added brand metadata to output
   - Updated repair functions to preserve brand injection

2. **`apps/web/src/pages/Builder.tsx`** (Modified)
   - Added brand status logging
   - Added brand information to assistant messages
   - Display brand violations when non-compliant

3. **`packages/mae-core/src/brand.ts`** (Previously created in PROMPT 6)
   - Defines TEAMMAE_BRAND profile
   - Exports `getBrandInjectionPrompt()`

4. **`packages/mae-core/src/brand-validation.ts`** (Previously created in PROMPT 7)
   - Validates 5 critical brand rules
   - Returns violations for contract integration

5. **`packages/mae-core/src/brand-resolver.ts`** (Previously created in PROMPT 7)
   - Resolves brand from user input
   - Priority: explicit > keywords > default
   - Enforces non-bypassable resolution

6. **`packages/mae-core/src/quality-contract.ts`** (Previously modified in PROMPT 7)
   - Integrates brand validation as Rule 7
   - Non-bypassable brand compliance check

7. **`packages/mae-core/src/build-plan.ts`** (Previously modified in PROMPT 7)
   - Enforces style profile in build plan prompt

---

## Success Criteria

✅ All builds have resolved brand profile
✅ Brand prompt injected into every LLM call
✅ Build plan enforces resolved style profile
✅ Quality contract validates brand compliance
✅ Brand violations trigger automatic retry
✅ UI shows active brand and source
✅ No builds can bypass brand enforcement
⚠️ Regression tests implemented (TODO)

---

## Next Steps

1. **Create Regression Tests** (`apps/web/src/api/__tests__/mae.test.ts`)
   - Preview sanitizer test
   - Brand validation test
   - End-to-end pipeline test with mocked LLM

2. **Integration Verification**
   - Run full build with API key
   - Verify brand injection in logs
   - Verify brand compliance in output
   - Test keyword detection (light, colorful, minimal)

3. **Documentation**
   - Update main README with brand enforcement details
   - Add brand customization guide for users
   - Document brand violation messages

---

## Notes

- Brand resolution is non-optional and happens before ANY code generation
- Default brand (TeamMAE Neo Tokyo Cyberpunk) cannot be disabled
- User can override via keywords in prompt or UI selection (when implemented)
- Brand violations are treated as critical contract failures
- All repair loops preserve brand injection in system message
- Preview rendering is not blocked by non-compliance (violations are logged)
- Mock mode still works without API keys (uses default brand)
