/**
 * Design System Loader
 * Parses DESIGN_SYSTEM.md and provides structured rules for MAE
 */

export interface DesignSystemRules {
  principles: string[];
  typography: {
    headings: Record<string, string>;
    body: Record<string, string>;
  };
  spacing: {
    scale: string[];
    sections: Record<string, string>;
  };
  colors: {
    primary: string[];
    neutral: string[];
    semantic: Record<string, string[]>;
  };
  components: {
    cards: string[];
    buttons: Record<string, string>;
    forms: Record<string, string>;
  };
  layout: {
    containers: string[];
    grids: string[];
  };
  templates: {
    landing: string;
    dashboard: string;
    crud: string;
  };
  dos: string[];
  donts: string[];
  qualityGates: {
    structure: string[];
    styling: string[];
    layout: string[];
    accessibility: string[];
    react: string[];
    ux: string[];
  };
}

/**
 * Get design system rules
 * Returns structured design system for MAE prompts
 */
export function getDesignSystemRules(): DesignSystemRules {
  return {
    principles: [
      'Beautiful by Default - Apps look professionally designed without user specifying layout',
      'Accessible First - WCAG AA compliance, semantic HTML, proper ARIA labels',
      'Responsive Always - Mobile-first design, works on all screen sizes',
      'Consistent Spacing - Use 8px grid system (8, 12, 16, 24, 32, 48, 64, 96)',
      'Delightful Interactions - Smooth transitions, hover states, loading states',
      'No Cramped Layouts - Generous whitespace, breathing room',
      'Component Composition - Break down into reusable components',
    ],

    typography: {
      headings: {
        h1: 'text-4xl lg:text-5xl font-bold text-gray-900 leading-tight',
        h2: 'text-2xl lg:text-3xl font-bold text-gray-900',
        h3: 'text-xl lg:text-2xl font-semibold text-gray-900',
        h4: 'text-lg font-semibold text-gray-900',
      },
      body: {
        large: 'text-lg lg:text-xl text-gray-600 leading-relaxed',
        regular: 'text-base text-gray-700 leading-relaxed',
        small: 'text-sm text-gray-500',
        xs: 'text-xs text-gray-500',
      },
    },

    spacing: {
      scale: ['p-2 (8px)', 'p-3 (12px)', 'p-4 (16px)', 'p-6 (24px)', 'p-8 (32px)', 'p-12 (48px)', 'p-16 (64px)', 'p-24 (96px)'],
      sections: {
        small: 'py-12 lg:py-16',
        large: 'py-16 lg:py-24',
        hero: 'py-24 lg:py-32',
      },
    },

    colors: {
      primary: ['bg-blue-600', 'hover:bg-blue-700', 'text-blue-600'],
      neutral: ['bg-white', 'bg-gray-50', 'bg-gray-100', 'text-gray-900', 'text-gray-700', 'text-gray-600', 'text-gray-500'],
      semantic: {
        success: ['bg-green-50', 'text-green-700', 'border-green-200'],
        warning: ['bg-yellow-50', 'text-yellow-700', 'border-yellow-200'],
        error: ['bg-red-50', 'text-red-700', 'border-red-200'],
        info: ['bg-blue-50', 'text-blue-700', 'border-blue-200'],
      },
    },

    components: {
      cards: [
        'bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200',
        'bg-white rounded-2xl shadow-lg border border-gray-100 p-6',
      ],
      buttons: {
        primary: 'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150',
        secondary: 'px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150',
        outline: 'px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-150',
      },
      forms: {
        input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        label: 'block text-sm font-medium text-gray-700 mb-2',
        error: 'mt-1 text-sm text-red-600',
      },
    },

    layout: {
      containers: [
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
      ],
      grids: [
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
      ],
    },

    templates: {
      landing: `Marketing Landing Page:
- Header/Nav (sticky, bg-white, border-b)
- Hero Section (py-20 lg:py-32, gradient background)
- Features Section (py-16 lg:py-24, feature grid)
- CTA Section (py-16 lg:py-24, colored background)
- Footer (bg-gray-900, py-12)`,

      dashboard: `Dashboard App:
- Header (sticky, bg-white, border-b)
- Sidebar navigation (240px width)
- Main content area (grid layout)
- Stats cards at top
- Content cards below`,

      crud: `CRUD/Table App:
- Page header with title
- Actions bar (search, filters, add button)
- Table/Grid in card (rounded-2xl, shadow-sm)
- Empty states
- Loading states`,
    },

    dos: [
      'Use consistent spacing (8px grid)',
      'Add hover states to interactive elements',
      'Include empty states',
      'Use semantic HTML',
      'Add ARIA labels where needed',
      'Make layouts responsive',
      'Use card components for content grouping',
      'Add loading states',
      'Include proper TypeScript types',
      'Break UI into reusable components (2-6 components minimum)',
      'Add transitions for smooth interactions',
      'Use max-width containers for readability',
      'Include clear CTAs',
      'Show user feedback (success/error messages)',
    ],

    donts: [
      'DO NOT use inline styles (use Tailwind classes)',
      'DO NOT create cramped layouts (add spacing!)',
      'DO NOT skip responsive breakpoints',
      'DO NOT use non-semantic div soup',
      'DO NOT forget accessibility (ARIA, keyboard nav)',
      'DO NOT create one giant component (split into smaller pieces)',
      'DO NOT use too many colors (stick to palette)',
      'DO NOT forget empty states',
      'DO NOT skip loading indicators',
      'DO NOT use inconsistent spacing',
      'DO NOT forget hover/active states',
      'DO NOT use poor color contrast',
      'DO NOT skip TypeScript types',
      'DO NOT hardcode sizes (use Tailwind scale)',
    ],

    qualityGates: {
      structure: [
        'Multiple files (minimum: App.tsx + 2 components + CSS)',
        'Proper file organization (components/, pages/, lib/)',
        'No single-file dumps',
      ],
      styling: [
        'Uses Tailwind classes (not inline styles)',
        'Consistent spacing (8px grid)',
        'Responsive breakpoints (sm:, md:, lg:)',
        'Card components with rounded-2xl + shadow',
        'Proper typography scale',
      ],
      layout: [
        'Max-width containers',
        'Sections with proper padding',
        'Grid/flexbox layouts',
        'No cramped spacing',
      ],
      accessibility: [
        'Semantic HTML elements',
        'ARIA labels where needed',
        'Focus states on interactive elements',
        'Proper color contrast',
      ],
      react: [
        'No malformed JSX (href=, class=, "> ))}")',
        'Proper quotes on attributes',
        'Valid React prop names (className not class)',
        'TypeScript types defined',
      ],
      ux: [
        'Loading states for async actions',
        'Empty states with helpful CTAs',
        'Error states with clear messages',
        'Hover states on clickable elements',
        'Smooth transitions',
      ],
    },
  };
}

/**
 * Format design system rules as prompt text
 */
export function formatDesignSystemPrompt(): string {
  const rules = getDesignSystemRules();

  return `
## DESIGN SYSTEM REQUIREMENTS

### Design Principles
${rules.principles.map(p => `- ${p}`).join('\n')}

### Typography Scale
Headings:
${Object.entries(rules.typography.headings).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

Body text:
${Object.entries(rules.typography.body).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

### Spacing (8px grid)
${rules.spacing.scale.join(', ')}

Section spacing:
${Object.entries(rules.spacing.sections).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

### Component Patterns
Cards: ${rules.components.cards[0]}
Primary Button: ${rules.components.buttons.primary}
Input: ${rules.components.forms.input}

### Layout
Container: ${rules.layout.containers[0]}
Feature Grid: ${rules.layout.grids[0]}

### CRITICAL RULES (MUST FOLLOW)
DO:
${rules.dos.map(d => `✅ ${d}`).join('\n')}

DON'T:
${rules.donts.map(d => `❌ ${d}`).join('\n')}

### App Shell Templates
Choose the appropriate template based on the user's request:

1. ${rules.templates.landing}

2. ${rules.templates.dashboard}

3. ${rules.templates.crud}
`;
}

/**
 * Get template based on prompt analysis
 */
export function selectTemplateForPrompt(prompt: string): 'landing' | 'dashboard' | 'crud' | 'general' {
  const lower = prompt.toLowerCase();

  // Dashboard indicators
  if (
    lower.includes('dashboard') ||
    lower.includes('admin') ||
    lower.includes('analytics') ||
    lower.includes('stats') ||
    lower.includes('sidebar')
  ) {
    return 'dashboard';
  }

  // CRUD/Table indicators
  if (
    lower.includes('crud') ||
    lower.includes('table') ||
    lower.includes('list') ||
    lower.includes('manage') ||
    lower.includes('inventory') ||
    lower.includes('database')
  ) {
    return 'crud';
  }

  // Landing page indicators
  if (
    lower.includes('landing') ||
    lower.includes('marketing') ||
    lower.includes('homepage') ||
    lower.includes('hero') ||
    lower.includes('features')
  ) {
    return 'landing';
  }

  // Default to general (can adapt to any)
  return 'general';
}
