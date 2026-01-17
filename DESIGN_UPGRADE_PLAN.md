# TeamMAE Design Upgrade Plan

## Goal
Transform the current basic TeamMAE site into a beautiful dark-themed design matching the original at mae-ship-it.lovable.app

## Current State
- Landing page exists but uses undefined Tailwind color tokens (colors not rendering)
- Empty Tailwind config (no custom theme)
- Basic light theme on app pages

## Target Design (from mae-ship-it.lovable.app)
- Dark gradient background (#0a0a0f to #1a1a2e)
- Monospace/tech typography (IBM Plex Mono or similar)
- Purple/blue accent colors (#7c3aed, #6366f1)
- MAE robot mascot illustration
- Animated gradient text effects
- Glass-morphism cards with subtle borders
- Professional pricing section
- Team workspaces section

---

## STAGE 1: Foundation (Tailwind Config + CSS Variables)
**Files to modify:**
- `apps/web/tailwind.config.js` - Add dark theme colors
- `apps/web/src/index.css` - Add CSS variables and base dark styles

**Changes:**
1. Define color palette:
   - `background`: #0a0a0f (near black)
   - `foreground`: #f0f0f5 (off-white)
   - `primary`: #7c3aed (purple)
   - `accent`: #6366f1 (indigo)
   - `muted`: #1a1a2e (dark blue-gray)
   - `border`: #2a2a3e (subtle borders)
   - `card`: #12121a (card backgrounds)

2. Add monospace font family (IBM Plex Mono)
3. Set dark background as default

---

## STAGE 2: Landing Page Hero
**Files to modify:**
- `apps/web/src/pages/Landing.tsx`

**Changes:**
1. Add "AI-POWERED APP BUILDER" badge above headline
2. Style headline with gradient text effect (white to purple)
3. Update stats to match (10K+, 50K+, 99.9%)
4. Add subtle grid/dot pattern background
5. Update button styles (white primary, outline secondary)

---

## STAGE 3: Features Section
**Files to modify:**
- `apps/web/src/pages/Landing.tsx`

**Changes:**
1. Redesign feature cards with dark glass effect
2. Add hover glow animations
3. Update icons to match design
4. Grid layout optimization

---

## STAGE 4: Meet MAE Section
**Files to modify:**
- `apps/web/src/pages/Landing.tsx`
- Add MAE mascot image

**Changes:**
1. Add MAE robot illustration (need to get/create asset)
2. Add "AI Powered" badge
3. Style bullet points with purple checkmarks
4. Add "Learn more about MAE" link

---

## STAGE 5: Team Workspaces & Pricing Sections
**Files to modify:**
- `apps/web/src/pages/Landing.tsx`

**Changes:**
1. Add "Team Workspaces" section with features
2. Add "Simple, Transparent Pricing" section
3. Three-tier pricing cards (Free, Pro $49, Team $149)
4. Feature comparison lists

---

## STAGE 6: Navigation & Footer
**Files to modify:**
- `apps/web/src/components/marketing/MarketingLayout.tsx`

**Changes:**
1. Dark navigation with logo
2. Nav links: Features, Pricing, About MAE
3. "Log In" and "Get Started" buttons
4. Footer with links and copyright

---

## STAGE 7: Auth & App Pages
**Files to modify:**
- `apps/web/src/components/AuthGate.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/pages/Builder.tsx`

**Changes:**
1. Dark theme for sign-in page
2. Update app header to dark theme
3. Optional: Dark theme for builder interface

---

## Assets Needed
1. MAE robot mascot PNG/SVG (from original site or recreate)
2. Custom monospace font (IBM Plex Mono from Google Fonts)
3. Background grid/pattern SVG

---

## Implementation Order
1. **Stage 1** first - this will make existing Landing page colors work
2. **Stage 6** next - navigation sets the tone
3. **Stage 2** - hero is most impactful
4. **Stages 3-5** - content sections
5. **Stage 7** - app consistency (optional, lower priority)

---

## Estimated Scope
- Stage 1: ~30 minutes
- Stage 2: ~45 minutes
- Stage 3: ~30 minutes
- Stage 4: ~30 minutes
- Stage 5: ~45 minutes
- Stage 6: ~30 minutes
- Stage 7: ~45 minutes

Total: ~4-5 hours of work

Ready to begin with Stage 1?
