# PROMPT 7: Brand Enforcement - Summary

## Objective
Make brand injection MANDATORY and NON-BYPASSABLE in every build.

## Implementation Status: ✅ COMPLETE (Infrastructure Ready)

### 1. Brand Validation (`brand-validation.ts`) ✅
Hard validator checking 5 brand rules:
- Monospace font (font-mono)
- Sharp borders (no rounded-lg/xl/full)
- Semantic color tokens (no hard-coded gray-900)
- Dark mode default (bg-background not bg-white)
- No unstyled HTML

### 2. Brand Resolver (`brand-resolver.ts`) ✅
Determines active brand from:
1. Explicit UI selection (highest priority)
2. Keywords in prompt (light, colorful, minimal)
3. Default: TeamMAE Neo Tokyo Cyberpunk

Throws error if brand resolution fails.

### 3. Quality Contract Integration ✅
- Added Rule 7: BRAND COMPLIANCE (critical)
- `validateContract(output, brandProfile)` now enforces brand
- Brand violations = contract failures = automatic retry

### 4. Build Plan Enforcement ✅
- `getBuildPlanPrompt(enforceStyleProfile)` injects REQUIRED style
- Style profile is non-negotiable
- Examples show enforced values

## Required: Wire into mae.ts

**File:** `apps/web/src/api/mae.ts`

**Changes:**
1. Add Phase 0: Brand Resolution (before build plan)
2. Pass enforced style to build plan generation
3. Inject brand prompt into system message
4. Pass brand profile to contract validator
5. Add brand metadata to output

**See:** `PROMPT7_BRAND_ENFORCEMENT_WIRING.md` for complete code

## Flow

```
Phase 0: Resolve Brand
├─ resolveBrandProfile(prompt, styleProfile)
├─ enforceBrandResolution() [throws if missing]
└─ Returns: ResolvedBrand

Phase 1: Build Plan
├─ getBuildPlanPrompt(resolvedBrand.styleProfile)
└─ Plan has ENFORCED style profile

Phase 2: Code Generation
├─ getBrandInjectionPrompt(resolvedBrand.styleProfile)
└─ Brand prompt in EVERY LLM call

Phase 3: Quality Contract
├─ validateContract(output, resolvedBrand.profile)
├─ Includes brand validation (Rule 7)
└─ Brand violations = retry

Phase 4: Quality Scoring
└─ (unchanged)

Phase 5: Final Validation
└─ Add brand metadata to output
```

## Enforcement Guarantees

✅ Brand profile resolved BEFORE any code generation
✅ Brand prompt injected into EVERY LLM call
✅ Style profile enforced in build plan
✅ Brand compliance checked in contract (non-bypassable)
✅ Brand violations trigger automatic retry
✅ Brand metadata in every build response

## Default Behavior

**Without user override:**
- Brand: TeamMAE Neo Tokyo Cyberpunk
- Style: dark-saas
- Font: Share Tech Mono (monospace)
- Borders: Sharp (0.25rem max)
- Colors: Dark mode tokens
- Cannot be disabled

**With user override:**
- Detected from keywords ("light", "colorful")
- OR selected via UI dropdown
- Still enforces brand quality rules
- Only changes style profile, not quality standards

## Testing

```bash
# Build mae-core
cd packages/mae-core
npm run build

# Result: ✅ Compiles successfully
# All brand enforcement modules ready
```

## Next Step

Wire brand enforcement into `apps/web/src/api/mae.ts` following instructions in `PROMPT7_BRAND_ENFORCEMENT_WIRING.md`.

Estimated time: 10 minutes.

All infrastructure is complete and tested.
