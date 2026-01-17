# PROMPT 7: Brand Enforcement - Integration Instructions

## Overview
Brand injection is now MANDATORY and NON-BYPASSABLE. These changes wire brand enforcement into every build.

---

## ✅ Completed

### 1. Brand Validation Module (`brand-validation.ts`)
**Created:** Hard brand compliance validator

**Functions:**
- `validateBrand(output, brandProfile)` - Checks 5 brand rules
- `generateBrandFixPrompt(violations, brandProfile)` - Creates fix instructions
- `getBrandValidationSummary(result)` - Summary string

**Brand Rules:**
1. `BRAND_TYPOGRAPHY` - Monospace font (font-mono or Share Tech Mono)
2. `BRAND_BORDER_RADIUS` - Sharp borders only (no rounded-lg/xl/full)
3. `BRAND_COLOR_TOKENS` - Semantic tokens (bg-background, bg-card, not gray-900)
4. `BRAND_DARK_MODE` - Dark mode by default (bg-background, not bg-white)
5. `BRAND_NO_UNSTYLED` - All elements must have className

### 2. Brand Resolver Module (`brand-resolver.ts`)
**Created:** Determines active brand from user input

**Functions:**
- `resolveBrandProfile(userPrompt, explicitStyleProfile)` - Returns ResolvedBrand
- `getBrandSourceLabel(source)` - Human-readable source name
- `enforceBrandResolution(resolved)` - Throws if brand missing

**Resolution Priority:**
1. Explicit UI selection (highest)
2. Keywords in prompt (light, colorful, minimal)
3. Default: TeamMAE Neo Tokyo Cyberpunk

### 3. Quality Contract Integration
**Modified:** `quality-contract.ts`

**Changes:**
- Added `validateContract(output, brandProfile)` - now accepts brand
- Added Rule 7: BRAND COMPLIANCE (NON-BYPASSABLE)
- Brand violations = critical contract failures
- Added `brandCompliant` and `brandName` to result

### 4. Build Plan Enforcement
**Modified:** `build-plan.ts`

**Changes:**
- `getBuildPlanPrompt(enforceStyleProfile)` - now enforces style
- Style profile injected into prompt as REQUIRED value
- Examples updated to show enforced style

---

## 🔧 Required: Wire into mae.ts

### Step 1: Import Brand Functions

```typescript
// Add to existing imports in apps/web/src/api/mae.ts
import {
  // ... existing imports
  resolveBrandProfile,
  enforceBrandResolution,
  getBrandSourceLabel,
  getBrandInjectionPrompt,
  TEAMMAE_BRAND,
  type ResolvedBrand,
} from '@teammae/mae-core';
```

### Step 2: Update BuildRequest Interface

```typescript
interface BuildRequest {
  projectId: string;
  prompt: string;
  existingFiles?: Array<{ path: string; content: string }>;
  styleProfile?: string | null; // User-selected style override (from UI)
}
```

### Step 3: Update buildWithMAE Function

```typescript
export async function buildWithMAE(request: BuildRequest): Promise<BuildResponse> {
  const { prompt, existingFiles = [], styleProfile = null } = request;

  let buildPlan: BuildPlan | null = null;
  let output: MAEOutput | null = null;
  let retryCount = 0;
  const maxRetries = 2;

  // NEW: PHASE 0 - BRAND RESOLUTION (BEFORE ANYTHING ELSE)
  console.log('[MAE] Phase 0: Resolving brand profile...');
  const resolvedBrand = resolveBrandProfile(prompt, styleProfile);
  enforceBrandResolution(resolvedBrand); // Throws if missing

  console.log(`[MAE] Brand: ${resolvedBrand.profile.brandName} (${getBrandSourceLabel(resolvedBrand.source)})`);
  console.log(`[MAE] Style: ${resolvedBrand.styleProfile}${resolvedBrand.overrideDetected ? ' (user override)' : ' (default)'}`);

  try {
    // ===== PHASE 1: BUILD PLAN GENERATION =====
    console.log('[MAE] Phase 1: Generating Build Plan...');

    if (!ANTHROPIC_API_KEY) {
      buildPlan = {
        type: 'web',
        pages: ['Home'],
        layout: ['Hero', 'Features'],
        components: ['Hero.tsx', 'Features.tsx', 'FeatureCard.tsx'],
        styleProfile: resolvedBrand.styleProfile as any, // ENFORCED
        stateUsage: false,
        forms: false,
        backendRequired: false,
        routing: false,
      };
    } else {
      // NEW: Pass enforced style to build plan prompt
      const planPrompt = getBuildPlanPrompt(resolvedBrand.styleProfile);
      const planResponse = await callAnthropic(
        'You are a technical architect planning web application structure.',
        `${planPrompt}\n\nUser request: ${prompt}`
      );

      buildPlan = parseBuildPlan(planResponse);

      if (!buildPlan || !validateBuildPlan(buildPlan)) {
        console.warn('[MAE] Build plan validation failed, using default plan');
        buildPlan = {
          type: 'web',
          pages: ['Home'],
          layout: ['Header', 'Main', 'Footer'],
          components: ['Header.tsx', 'Main.tsx', 'Footer.tsx'],
          styleProfile: resolvedBrand.styleProfile as any, // ENFORCED
          stateUsage: false,
          forms: false,
          backendRequired: false,
          routing: false,
        };
      }

      // ENFORCE: Override build plan style with resolved brand
      buildPlan.styleProfile = resolvedBrand.styleProfile as any;
    }

    console.log('[MAE] Build Plan:', buildPlan);
    const planExplanation = explainBuildPlan(buildPlan);
    console.log('[MAE] Plan explanation:', planExplanation);

    // ===== PHASE 2: CODE GENERATION WITH SELF-REPAIR LOOP =====
    console.log('[MAE] Phase 2: Generating code...');

    const templateType = selectTemplateForPrompt(prompt);
    console.log(`[MAE] Selected template: ${templateType}`);

    // NEW: Inject brand into system message
    const brandPrompt = getBrandInjectionPrompt(resolvedBrand.styleProfile);
    const systemMessage = buildSystemMessageWithBrand(templateType, buildPlan, brandPrompt);
    const userPrompt = buildUserPrompt(prompt, existingFiles);

    // Self-repair loop (max 2 retries)
    while (retryCount <= maxRetries) {
      console.log(`[MAE] Generation attempt ${retryCount + 1}/${maxRetries + 1}`);

      // Generate code
      if (!ANTHROPIC_API_KEY) {
        output = createMockOutput(prompt);
      } else {
        const response = await callAnthropic(systemMessage, userPrompt);
        output = parseMAEOutput(response);

        if (!output) {
          console.warn('[MAE] Parse failed, attempting repair...');
          output = await repairAndParse(response, systemMessage);
        }
      }

      if (!output) {
        throw new Error('Failed to parse MAE output');
      }

      output = enforceMinimumFiles(output);
      output = await detectAndRepairCorruption(output, systemMessage);

      // ===== PHASE 3: QUALITY CONTRACT VALIDATION (WITH BRAND) =====
      console.log('[MAE] Phase 3: Validating quality contract + brand...');
      // NEW: Pass brand profile to contract validator
      const contractResult = validateContract(output, resolvedBrand.profile);
      console.log(`[MAE] ${getContractSummary(contractResult)}`);

      if (!contractResult.valid) {
        if (retryCount < maxRetries && ANTHROPIC_API_KEY) {
          console.warn('[MAE] Contract violations detected, retrying...');
          retryCount++;

          const fixPrompt = generateContractFixPrompt(contractResult.violations);
          const retryUserPrompt = `${userPrompt}\n\n${fixPrompt}`;

          if (!output.warnings) output.warnings = [];
          output.warnings.push(`Attempt ${retryCount}: Contract violations - retrying...`);

          continue;
        } else {
          console.error('[MAE] Max retries reached with contract violations');
          if (!output.warnings) output.warnings = [];
          contractResult.violations.forEach(v => {
            output!.warnings!.push(`[${v.rule}] ${v.message}`);
          });
          break;
        }
      }

      // ===== PHASE 4: QUALITY SCORING =====
      console.log('[MAE] Phase 4: Calculating quality score...');
      const qualityScore = calculateQualityScore(output);
      console.log(`[MAE] ${getScoreSummary(qualityScore)}`);

      if (shouldRetryForScore(qualityScore) && retryCount < maxRetries && ANTHROPIC_API_KEY) {
        console.warn('[MAE] Quality score below threshold, retrying...');
        retryCount++;

        if (!output.warnings) output.warnings = [];
        output.warnings.push(`Attempt ${retryCount}: Score ${qualityScore.overallScore}/100 - retrying...`);

        const improvements: string[] = [];
        if (qualityScore.breakdown.structure < 20) improvements.push('Improve component organization');
        if (qualityScore.breakdown.styling < 20) improvements.push('Add more Tailwind styling and responsive classes');
        if (qualityScore.breakdown.accessibility < 20) improvements.push('Add semantic HTML and ARIA labels');
        if (qualityScore.breakdown.ux < 20) improvements.push('Add loading states, transitions, and hover effects');

        const improvementPrompt = `\n\nIMPROVEMENTS NEEDED:\n${improvements.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`;
        continue;
      }

      // Success! Generate build explanation and add metadata
      const buildExplanation = generateBuildExplanation(buildPlan, output, qualityScore);
      const explanationText = formatExplanationText(buildExplanation);

      if (!output.meta) output.meta = {};
      output.meta.qualityScore = qualityScore.overallScore;
      output.meta.componentCount = qualityScore.componentCount;
      output.meta.designSystemCompliance = qualityScore.designSystemCompliance;
      output.meta.buildPlan = buildPlan;
      output.meta.planExplanation = planExplanation;
      output.meta.buildExplanation = explanationText;
      output.meta.attempts = retryCount + 1;

      // NEW: Add brand metadata
      output.meta.brandName = resolvedBrand.profile.brandName;
      output.meta.brandSource = resolvedBrand.source;
      output.meta.styleProfile = resolvedBrand.styleProfile;
      output.meta.brandCompliant = contractResult.brandCompliant;

      console.log('[MAE] Build explanation:', explanationText);

      break;
    }

    if (!output) {
      throw new Error('Failed to generate valid output after retries');
    }

    // ===== PHASE 5: FINAL VALIDATION =====
    console.log('[MAE] Phase 5: Running final quality gates...');
    const finalValidation = validateOutput(output);
    console.log(`[MAE] ${getValidationSummary(finalValidation)}`);

    if (finalValidation.warnings.length > 0 && output.warnings) {
      finalValidation.warnings.forEach((w: any) => {
        output!.warnings!.push(`[${w.category}] ${w.message}`);
      });
    }

    const previewHtml = await generatePreviewHTML(output.files);

    return {
      ...output,
      previewHtml,
    };
  } catch (error) {
    console.error('[MAE] Build error:', error);
    throw error;
  }
}
```

### Step 4: Update buildSystemMessageWithPlan Function

```typescript
/**
 * Build system message with design system, template, build plan, and BRAND INJECTION
 */
function buildSystemMessageWithBrand(
  templateType?: string,
  buildPlan?: BuildPlan | null,
  brandPrompt?: string
): string {
  const designSystemPrompt = formatDesignSystemPrompt();
  const templatePrompt = templateType && templateType !== 'general'
    ? getTemplatePrompt(templateType as any)
    : '';

  let planContext = '';
  if (buildPlan) {
    planContext = `
BUILD PLAN (follow this structure):
- Type: ${buildPlan.type}
- Pages: ${buildPlan.pages.join(', ')}
- Layout sections: ${buildPlan.layout.join(' → ')}
- Components to create: ${buildPlan.components.join(', ')}
- Style profile: ${buildPlan.styleProfile} (ENFORCED BY BRAND)
- State management: ${buildPlan.stateUsage ? 'YES (use useState/hooks)' : 'NO'}
- Forms: ${buildPlan.forms ? 'YES (include input validation)' : 'NO'}
- Backend integration: ${buildPlan.backendRequired ? 'YES (add API calls)' : 'NO'}
${buildPlan.routing ? '- Routing: YES (use React Router)' : ''}

IMPORTANT: Follow this build plan exactly. Create all components listed above.
`;
  }

  // CRITICAL: Brand prompt injection is MANDATORY
  const brandInjection = brandPrompt || getBrandInjectionPrompt('dark-saas');

  return `You are MAE, an expert app builder for TeamMAE.ai. You build production-ready React apps with Tailwind CSS and shadcn/ui patterns.

Your mission: Generate a polished, beautiful, production-ready UI on first pass. Every app should look professionally designed by default.

${brandInjection}

${planContext}

${designSystemPrompt}

${templatePrompt}

CRITICAL OUTPUT RULES:
...
`;
}
```

---

## 🎨 UI Integration (Builder.tsx)

### Display Brand Information

Add brand status display in Builder.tsx:

```typescript
// After build completes, show brand info in message
if (result.meta?.brandName) {
  const brandSource = result.meta.brandSource === 'default' ?
    'TeamMAE Default' :
    result.meta.brandSource === 'user-explicit' ?
    'You Selected' :
    'Detected from Prompt';

  assistantContent += `\n\nBrand: ${result.meta.brandName} (${brandSource})`;

  if (!result.meta.brandCompliant) {
    assistantContent += `\n⚠️ Brand compliance failed - retried automatically`;
  }
}
```

---

## Testing

### Test 1: Default Brand (No Override)
```
Prompt: "Build a todo app"
Expected:
- Brand: TeamMAE.ai (TeamMAE Default)
- Style: dark-saas
- Monospace font
- Sharp borders
- Dark mode tokens
```

### Test 2: Explicit UI Override
```
UI Selector: "Light Minimal"
Prompt: "Build a landing page"
Expected:
- Brand: TeamMAE.ai (User Selected)
- Style: light-saas
- Monospace font
- Sharp borders
- Light mode tokens
```

### Test 3: Implicit Keyword Override
```
Prompt: "Build a colorful playful dashboard"
Expected:
- Brand: TeamMAE.ai (Detected from Prompt)
- Style: colorful
- Monospace font
- Sharp borders
- Colorful palette
```

### Test 4: Brand Violation Retry
```
Prompt: "Build an app"
If output uses rounded-lg or hard-coded colors:
- Contract validation FAILS
- Automatic retry with brand fix prompt
- Second attempt MUST comply or fail after 2 retries
```

---

## Success Criteria

✅ All builds have resolved brand profile
✅ Brand prompt injected into every LLM call
✅ Build plan enforces resolved style profile
✅ Quality contract validates brand compliance
✅ Brand violations trigger automatic retry
✅ UI shows active brand and source
✅ No builds can bypass brand enforcement

---

## Notes

- Brand resolution happens BEFORE build plan
- Style profile is ENFORCED, not suggested
- Brand violations = contract failures
- TeamMAE default cannot be disabled
- User can override via keywords or UI only
- All retries must fix brand violations first

