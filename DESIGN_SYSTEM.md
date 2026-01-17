# TeamMAE.ai Design System

**Mission**: Every generated app should look beautiful, polished, and production-ready by default.

---

## Design Principles

1. **Beautiful by Default**: Apps should look professionally designed without user needing to specify layout
2. **Accessible First**: WCAG AA compliance, semantic HTML, proper ARIA labels
3. **Responsive Always**: Mobile-first design, works on all screen sizes
4. **Consistent Spacing**: Use 8px grid system (8, 12, 16, 24, 32, 48, 64, 96)
5. **Delightful Interactions**: Smooth transitions, hover states, loading states
6. **No Cramped Layouts**: Generous whitespace, breathing room
7. **Component Composition**: Break down into reusable components
8. **Type Safety**: TypeScript everywhere, proper prop types

---

## Typography Scale

### Font Families
- **Sans**: `font-sans` (system font stack)
- **Mono**: `font-mono` (for code)

### Headings
```tsx
// H1 - Page titles
className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"

// H2 - Section titles
className="text-2xl lg:text-3xl font-bold text-gray-900"

// H3 - Subsection titles
className="text-xl lg:text-2xl font-semibold text-gray-900"

// H4 - Card/Component titles
className="text-lg font-semibold text-gray-900"
```

### Body Text
```tsx
// Large body (hero, intro)
className="text-lg lg:text-xl text-gray-600 leading-relaxed"

// Regular body
className="text-base text-gray-700 leading-relaxed"

// Small text (captions, meta)
className="text-sm text-gray-500"

// Extra small (labels, timestamps)
className="text-xs text-gray-500"
```

### Muted Text
```tsx
className="text-gray-600" // Secondary info
className="text-gray-500" // Tertiary info
className="text-gray-400" // Disabled/placeholder
```

---

## Spacing Scale (8px grid)

### Padding/Margin Values
- `p-2` = 8px
- `p-3` = 12px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `p-12` = 48px
- `p-16` = 64px
- `p-24` = 96px

### Vertical Rhythm
```tsx
// Section spacing
className="py-12 lg:py-16" // Small sections
className="py-16 lg:py-24" // Large sections
className="py-24 lg:py-32" // Hero sections

// Component spacing
className="space-y-4" // Tight (cards, form fields)
className="space-y-6" // Medium (sections within page)
className="space-y-8" // Loose (major sections)
```

---

## Layout Containers

### Max Width Containers
```tsx
// Standard content
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Narrow content (articles, forms)
className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"

// Wide content (dashboards)
className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
```

### Sections
```tsx
// Page section with padding + container
<section className="py-16 lg:py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* content */}
  </div>
</section>
```

---

## Color Palette

### Primary Colors (Interactive)
```tsx
// Buttons, links, primary actions
bg-blue-600 hover:bg-blue-700
text-blue-600 hover:text-blue-700

// Accents
bg-indigo-600 hover:bg-indigo-700
bg-purple-600 hover:bg-purple-700
```

### Neutral Grays
```tsx
bg-white       // Cards, surfaces
bg-gray-50     // Page background, subtle fill
bg-gray-100    // Hover states, borders
bg-gray-200    // Dividers
text-gray-900  // Primary text
text-gray-700  // Body text
text-gray-600  // Secondary text
text-gray-500  // Muted text
text-gray-400  // Disabled text
```

### Semantic Colors
```tsx
// Success
bg-green-50 text-green-700 border-green-200

// Warning
bg-yellow-50 text-yellow-700 border-yellow-200

// Error
bg-red-50 text-red-700 border-red-200

// Info
bg-blue-50 text-blue-700 border-blue-200
```

---

## Component Patterns

### Cards
```tsx
// Standard card
className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"

// Elevated card
className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"

// Interactive card (clickable)
className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
```

### Buttons

#### Primary
```tsx
className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm hover:shadow-md"
```

#### Secondary
```tsx
className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors duration-150"
```

#### Outline
```tsx
className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-150"
```

#### Destructive
```tsx
className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-colors duration-150"
```

#### Icon Button
```tsx
className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
```

### Form Inputs
```tsx
// Text input
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-150"

// Textarea
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow duration-150"

// Select
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"

// Label
className="block text-sm font-medium text-gray-700 mb-2"

// Helper text
className="mt-1 text-sm text-gray-500"

// Error message
className="mt-1 text-sm text-red-600"
```

### Badges/Tags
```tsx
// Default badge
className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"

// Status badges
className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700" // Success
className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700" // Warning
className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700" // Error
```

### Dividers
```tsx
// Horizontal divider
className="border-t border-gray-200 my-6"

// Vertical divider
className="border-l border-gray-200 h-full mx-4"
```

---

## Grid Systems

### Feature Grids
```tsx
// 3-column grid (responsive)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"

// 4-column grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

// 2-column grid
className="grid grid-cols-1 md:grid-cols-2 gap-8"
```

### Dashboard Grids
```tsx
// Stats grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// Content grid (sidebar + main)
className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8"
```

---

## App Shell Templates

### Marketing Landing Page
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header/Nav */}
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Logo + Nav */}
    </div>
  </header>

  {/* Hero Section */}
  <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Hero content */}
    </div>
  </section>

  {/* Features Section */}
  <section className="py-16 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Feature grid */}
    </div>
  </section>

  {/* CTA Section */}
  <section className="py-16 lg:py-24 bg-blue-600">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
      {/* CTA */}
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Footer content */}
    </div>
  </footer>
</div>
```

### Dashboard App
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Logo + Nav + User menu */}
    </div>
  </header>

  {/* Main Layout */}
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar */}
      <aside>
        <nav className="space-y-1">
          {/* Nav items */}
        </nav>
      </aside>

      {/* Main Content */}
      <main>
        {/* Page content */}
      </main>
    </div>
  </div>
</div>
```

### CRUD/Table App
```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Items</h1>
      <p className="mt-2 text-gray-600">Manage your items</p>
    </div>

    {/* Actions Bar */}
    <div className="mb-6 flex items-center justify-between">
      <div>{/* Search/filters */}</div>
      <button>{/* Add new */}</button>
    </div>

    {/* Table/Grid */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table content */}
    </div>
  </div>
</div>
```

---

## Animation & Transitions

### Standard Transitions
```tsx
// Hover/active states
className="transition-colors duration-150"
className="transition-all duration-200"
className="transition-shadow duration-200"

// Fade in
className="animate-fade-in"

// Slide in
className="animate-slide-up"
```

### Loading States
```tsx
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />

// Pulse (skeleton)
className="animate-pulse bg-gray-200 rounded"
```

---

## Accessibility Requirements

### Semantic HTML
- Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- Use `<button>` for clickable actions, not `<div>`
- Use `<a>` for navigation, with `href`

### ARIA Labels
```tsx
// Buttons without text
<button aria-label="Close menu">
  <XIcon />
</button>

// Form inputs
<input aria-describedby="email-help" />
<p id="email-help">We'll never share your email</p>

// Loading states
<div role="status" aria-live="polite">
  Loading...
</div>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus states: `focus:ring-2 focus:ring-blue-500 focus:outline-none`
- Logical tab order

### Color Contrast
- Text on white: minimum `text-gray-700` (WCAG AA)
- White text needs dark background: `bg-gray-900`, `bg-blue-600`
- Never use `text-gray-400` on `bg-white` for body text

---

## State Management Patterns

### Empty States
```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
  <p className="text-gray-600 mb-6">Get started by creating your first item</p>
  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
    Create Item
  </button>
</div>
```

### Error States
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-red-900">Error</h4>
      <p className="text-sm text-red-700 mt-1">Something went wrong</p>
    </div>
  </div>
</div>
```

### Success States
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-green-900">Success</h4>
      <p className="text-sm text-green-700 mt-1">Action completed</p>
    </div>
  </div>
</div>
```

---

## DO's and DON'Ts

### ✅ DO
- Use consistent spacing (8px grid)
- Add hover states to interactive elements
- Include empty states
- Use semantic HTML
- Add ARIA labels where needed
- Make layouts responsive
- Use card components for content grouping
- Add loading states
- Include proper TypeScript types
- Break UI into reusable components
- Add transitions for smooth interactions
- Use max-width containers for readability
- Include clear CTAs
- Show user feedback (success/error messages)

### ❌ DON'T
- Use inline styles (use Tailwind classes)
- Create cramped layouts (add spacing!)
- Skip responsive breakpoints
- Use non-semantic div soup
- Forget accessibility (ARIA, keyboard nav)
- Create one giant component (split into smaller pieces)
- Use too many colors (stick to palette)
- Forget empty states
- Skip loading indicators
- Use inconsistent spacing
- Forget hover/active states
- Use poor color contrast
- Skip TypeScript types
- Hardcode sizes (use Tailwind scale)
- Create multi-page apps without routing

---

## File Structure Requirements

### Minimum Files (Always Generate)
```
src/
├── App.tsx              # Main app component
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind
├── components/          # Reusable components (2-6 minimum)
│   ├── Header.tsx
│   ├── Hero.tsx
│   └── FeatureCard.tsx
└── pages/               # Page components (if multi-page)
    └── Index.tsx
```

### Optional But Recommended
```
src/
├── lib/                 # Utilities
│   └── utils.ts
├── components/ui/       # shadcn-style UI components
│   ├── Button.tsx
│   └── Card.tsx
└── types/               # TypeScript types
    └── index.ts
```

### Component Composition Example
```tsx
// ❌ BAD: Everything in App.tsx
function App() {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
}

// ✅ GOOD: Composed from components
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
```

---

## Quality Gates

Generated apps MUST pass these checks:

### Structure
- [ ] Multiple files (minimum: App.tsx + 2 components + CSS)
- [ ] Proper file organization (components/, pages/, lib/)
- [ ] No single-file dumps

### Styling
- [ ] Uses Tailwind classes (not inline styles)
- [ ] Consistent spacing (8px grid)
- [ ] Responsive breakpoints (sm:, md:, lg:)
- [ ] Card components with rounded-2xl + shadow
- [ ] Proper typography scale

### Layout
- [ ] Max-width containers
- [ ] Sections with proper padding
- [ ] Grid/flexbox layouts
- [ ] No cramped spacing

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Focus states on interactive elements
- [ ] Proper color contrast

### React Quality
- [ ] No malformed JSX (href=, class=, "> ))}")
- [ ] Proper quotes on attributes
- [ ] Valid React prop names (className not class)
- [ ] TypeScript types defined

### User Experience
- [ ] Loading states for async actions
- [ ] Empty states with helpful CTAs
- [ ] Error states with clear messages
- [ ] Hover states on clickable elements
- [ ] Smooth transitions

---

**Last Updated**: PROMPT 4 - Design System Enforcement
