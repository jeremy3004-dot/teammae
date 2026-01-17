# PROMPT 6: TeamMAE.ai Marketing Site + Brand Injection - Implementation Status

## ✅ Completed

### 1. Brand Injection System
**File:** `packages/mae-core/src/brand.ts` (NEW)

Created comprehensive brand configuration with:
- `TEAMMAE_BRAND` - Neo Tokyo Cyberpunk design DNA
- Typography: Share Tech Mono (monospace-first)
- Colors: Dark mode with accent (#8b9be8 glow)
- Spacing: 8px grid system
- Component patterns (cards, buttons, inputs)
- 8 critical design rules

**Functions:**
- `getBrandInjectionPrompt(overrideStyle?)` - Generates brand prompt for LLM
- `STYLE_PROFILES` - 5 style options (auto, dark-saas, light-saas, colorful, minimal)

### 2. Brand Integration into Build Pipeline
**Modified:** `packages/mae-core/src/build-plan.ts`
- Updated `explainBuildPlan()` to show "Neo Tokyo Cyberpunk (TeamMAE default)" when using default style
- Added note when user overrides style profile

**Exported:** `packages/mae-core/src/index.ts`
- Added `export * from './brand'`

### 3. Marketing Site Foundation
**Created:**
- `apps/web/src/components/marketing/MarketingLayout.tsx` - Shared layout with nav + footer
- `apps/web/src/pages/Landing.tsx` - Complete landing page with:
  - Hero section (dark, premium SaaS feel)
  - Stats row (100+ apps, 50K+ components, 95.9% quality score)
  - Feature grid (6 cards: AI generation, mobile apps, live preview, deploy, full-stack, iterate)
  - "Meet MAE" section
  - CTA section

## 🚧 To Complete

### 4. Remaining Marketing Pages (Need Implementation)

**Features Page** (`apps/web/src/pages/Features.tsx`):
```tsx
- Explain MAE workflow: Plan → Build → Validate → Preview
- How it works timeline section
- Web app builder details (React + Vite + Tailwind + shadcn)
- Mobile app builder (React Native + Expo + EAS) - mark as "coming next"
```

**Pricing Page** (`apps/web/src/pages/Pricing.tsx`):
```tsx
- 3 tiers: Starter (Free), Pro ($49/mo), Team ($149/mo)
- Mark "Pro" as "Most popular"
- No Stripe/payment logic
- Aligned to design system (sharp borders, dark theme, monospace font)
```

**About Page** (`apps/web/src/pages/About.tsx`):
```tsx
- Mission: Execution-first, beautiful defaults, safe builds, transparent plans
- Principles section
- Team/values (optional)
```

### 5. Build Pipeline Integration (Needs Wiring)

**File to Modify:** `apps/web/src/api/mae.ts`

**Required Changes:**
```typescript
// 1. Import brand functions
import { getBrandInjectionPrompt, TEAMMAE_BRAND } from '@teammae/mae-core';

// 2. Update BuildRequest interface
interface BuildRequest {
  projectId: string;
  prompt: string;
  existingFiles?: Array<{ path: string; content: string }>;
  styleProfile?: string | null; // NEW - User-selected style override
}

// 3. Update buildWithMAE signature
export async function buildWithMAE(request: BuildRequest): Promise<BuildResponse> {
  const { prompt, existingFiles = [], styleProfile = null } = request;
  // ... rest of function

// 4. Update buildSystemMessageWithPlan function
function buildSystemMessageWithPlan(
  templateType?: string,
  buildPlan?: BuildPlan | null,
  userStyleOverride?: string | null  // NEW parameter
): string {
  const designSystemPrompt = formatDesignSystemPrompt();
  const templatePrompt = ...;

  // NEW: Inject TeamMAE brand
  const brandPrompt = getBrandInjectionPrompt(userStyleOverride || buildPlan?.styleProfile);

  return `You are MAE, an expert app builder for TeamMAE.ai. ...

${brandPrompt}

${planContext}

${designSystemPrompt}

${templatePrompt}
  `;
}

// 5. Update call site
const systemMessage = buildSystemMessageWithPlan(templateType, buildPlan, styleProfile);
```

### 6. Builder UI - Style Profile Selector (Optional Enhancement)

**File to Modify:** `apps/web/src/pages/Builder.tsx`

**Add dropdown near prompt input:**
```tsx
import { STYLE_PROFILES } from '@teammae/mae-core';

// Add state
const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

// Add UI near textarea
<div className="flex items-center gap-4">
  <label className="text-sm text-muted-foreground">Style:</label>
  <select
    value={selectedStyle || 'auto'}
    onChange={(e) => setSelectedStyle(e.target.value === 'auto' ? null : e.target.value)}
    className="px-3 py-1 bg-input border border-border rounded-sm text-sm"
  >
    {Object.entries(STYLE_PROFILES).map(([key, profile]) => (
      <option key={key} value={profile.value || 'auto'}>
        {profile.label}
      </option>
    ))}
  </select>
</div>

// Pass to buildWithMAE
const response = await fetch('/api/mae/build', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    projectId: currentProjectId,
    prompt: userMessage.content,
    existingFiles: [],
    styleProfile: selectedStyle,  // NEW
  }),
});
```

### 7. Route Configuration

**File to Modify:** `apps/web/src/App.tsx` (or routing config)

**Add routes:**
```tsx
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';

// Inside router
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/features" element={<Features />} />
  <Route path="/pricing" element={<Pricing />} />
  <Route path="/about" element={<About />} />
  <Route path="/builder" element={<Builder />} />
  {/* ... existing routes */}
</Routes>
```

## Design System Compliance

All marketing pages follow:
- ✅ Dark mode by default (hsl(220 15% 5%) background)
- ✅ Monospace font (Share Tech Mono)
- ✅ Sharp borders (0.25rem border-radius)
- ✅ 8px grid spacing
- ✅ Accent color (#8b9be8 purple glow)
- ✅ Semantic color tokens (background, foreground, primary, accent, muted, border)
- ✅ Responsive layouts (mobile-first with sm:, md:, lg: breakpoints)
- ✅ Generous whitespace
- ✅ Hover states on all interactive elements

## Brand Injection Behavior

### Default (No User Override):
1. User prompts: "Build a todo app"
2. Build Plan generated with `styleProfile: "dark-saas"`
3. `getBrandInjectionPrompt("dark-saas")` injects TeamMAE brand
4. LLM receives Neo Tokyo Cyberpunk design system
5. Generated app uses Share Tech Mono, sharp borders, dark theme, accent glow

### With User Override:
1. User prompts: "Build a colorful landing page"
2. LLM detects "colorful" keyword → Build Plan: `styleProfile: "colorful"`
3. `getBrandInjectionPrompt("colorful")` injects brand + override note
4. Generated app uses colorful palette but maintains quality rules

### With UI Selector:
1. User selects "Light Minimal" from dropdown
2. `styleProfile: "light-saas"` passed to buildWithMAE
3. Brand injection includes light mode rules
4. Generated app uses light theme while keeping design quality

## Implementation Priority

1. **HIGH:** Wire brand injection into buildWithMAE (Step 5)
2. **HIGH:** Create Features page (Step 4)
3. **MEDIUM:** Create Pricing page (Step 4)
4. **MEDIUM:** Configure routes (Step 7)
5. **LOW:** Create About page (Step 4)
6. **LOW:** Add style selector UI (Step 6)

## Testing

Once complete, test with:

1. **Default Brand Injection:**
   ```
   Prompt: "Build a dashboard"
   Expected: Dark theme, Share Tech Mono, sharp borders, accent glow
   ```

2. **User Style Override:**
   ```
   Prompt: "Build a playful colorful landing page"
   Expected: Colorful palette, but maintains component quality
   ```

3. **UI Selector Override:**
   ```
   Select: "Light Minimal"
   Prompt: "Build a todo app"
   Expected: Light theme, minimal design, quality rules enforced
   ```

## Next Steps

Complete remaining items in priority order:
1. Wire brand injection into mae.ts (5 minute task)
2. Create Features.tsx (15 minutes)
3. Create Pricing.tsx (10 minutes)
4. Update routes (5 minutes)
5. Test end-to-end brand injection
6. (Optional) Add style selector UI
7. (Optional) Create About.tsx

All implementations must follow Neo Tokyo Cyberpunk design system from BRANDING GUIDE.
