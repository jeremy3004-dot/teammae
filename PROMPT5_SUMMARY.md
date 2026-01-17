# PROMPT 5: Output Determinism & Quality Contracts

## What Was Built

MAE now enforces quality through a 5-phase build process with self-repair (up to 2 retries):

1. **Build Plan Generation** - MAE creates structured plan before coding
2. **Code Generation** - Generates code following the plan
3. **Quality Contract** - Validates 6 hard rules (ALL must pass)
4. **Quality Scoring** - Scores 0-100 across 4 dimensions
5. **Final Validation** - Legacy quality gates + preview generation

## New Files

1. **`packages/mae-core/src/build-plan.ts`** - Plan generation & validation
2. **`packages/mae-core/src/quality-contract.ts`** - 6 hard rules validator
3. **`packages/mae-core/src/quality-scoring.ts`** - 0-100 scoring system
4. **`packages/mae-core/src/build-explanation.ts`** - Operational explanations

## Modified Files

1. **`apps/web/src/api/mae.ts`** - Complete rewrite with 5-phase flow
2. **`apps/web/src/pages/Builder.tsx`** - Build plan preview UI
3. **`packages/mae-core/src/index.ts`** - Exported new modules

## Quality Contract (6 Hard Rules)

ALL must pass or build is rejected:

1. **MINIMUM_COMPONENTS** - At least 2 components in `src/components/`
2. **DESIGN_SYSTEM_USAGE** - Minimum 5 Tailwind className uses
3. **RESPONSIVE_LAYOUT** - Has responsive breakpoints (sm:, md:, lg:)
4. **NO_UNSTYLED_HTML** - No raw elements without className
5. **NO_SINGLE_FILE_APPS** - Large App.tsx requires breakdown
6. **REQUIRED_FILES** - Must have App.tsx and CSS file

## Quality Scoring (0-100)

- **Structure (0-25)**: Component count, file organization, file sizes
- **Styling (0-25)**: Tailwind usage, responsive, design patterns
- **Accessibility (0-25)**: Semantic HTML, ARIA, focus states
- **UX (0-25)**: State handling, loading/empty states, transitions

**Threshold:** Score < 80 triggers retry

## Build Plan Example

```json
{
  "type": "web",
  "pages": ["Home"],
  "layout": ["Header", "Hero", "Features", "CTA", "Footer"],
  "components": ["Header.tsx", "Hero.tsx", "FeatureCard.tsx", "Features.tsx", "CTA.tsx", "Footer.tsx"],
  "styleProfile": "light-saas",
  "stateUsage": false,
  "forms": false,
  "backendRequired": false
}
```

## Build Explanation Example

```
Built web application with 6 components using light saas design system.

Application structure:
- 9 files generated
- 6 React components
- Layout: Header → Hero → Features → CTA → Footer

Quality score: 85/100
- Structure: 23/25
- Styling: 22/25
- Accessibility: 20/25
- UX: 20/25
```

## UI Changes

### Build Plan Preview
Shows structured plan in chat before build completes:
- Type, style profile
- Component count
- Layout flow
- Human-readable explanation

### Enhanced Messages
Assistant messages now show:
- Operational build explanation (not marketing)
- Quality score and grade
- Attempt count if retries occurred

## Self-Repair Loop

```
Attempt 1: Generate code
  ├─ Contract validation fails? → Retry with fix prompt (max 2 retries)
  └─ Score < 80? → Retry with improvement prompt (max 2 retries)

Attempt 2: Regenerate with fixes
  ├─ Contract validation fails? → Retry with fix prompt
  └─ Score < 80? → Retry with improvement prompt

Attempt 3: Final attempt
  └─ If still fails: Log violations but continue
```

## Impact

- ✅ **Determinism:** Same prompt → similar structure
- ✅ **Quality enforcement:** Low-quality output blocked
- ✅ **Self-repair:** Automatic fixes (up to 2 retries)
- ✅ **Transparency:** Build plan shown before building
- ✅ **Trust:** Operational tone, quality scores, attempt counts
- ✅ **Infrastructure feel:** Predictable, reliable, calm

## Testing

Try these prompts:

1. `Build a hello world app` - Simple, should pass first try
2. `Build a dashboard with sidebar and stats` - Complex, 6+ components
3. `Build a todo app` - State management + forms

All should:
- Show build plan preview
- Display quality score
- Complete in 1-3 attempts
