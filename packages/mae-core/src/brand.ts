/**
 * TeamMAE Brand Configuration
 * Defines default design DNA injected into all generated apps
 */

export interface BrandProfile {
  brandName: string;
  styleProfileDefault: 'dark-saas' | 'light-saas' | 'colorful' | 'minimal';
  typography: {
    fontFamily: string;
    headingScale: Record<string, string>;
    bodyText: string;
    mutedText: string;
  };
  spacing: {
    scale: string[];
    containerPadding: string;
    sectionSpacing: string;
  };
  colors: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    muted: string;
    border: string;
  };
  components: {
    cards: string;
    buttons: {
      primary: string;
      secondary: string;
    };
    inputs: string;
  };
  rules: string[];
}

/**
 * TeamMAE Default Brand Profile (Neo Tokyo Cyberpunk)
 */
export const TEAMMAE_BRAND: BrandProfile = {
  brandName: 'TeamMAE.ai',
  styleProfileDefault: 'dark-saas',

  typography: {
    fontFamily: "'Share Tech Mono', ui-monospace, monospace",
    headingScale: {
      h1: 'text-4xl lg:text-5xl font-bold tracking-tight',
      h2: 'text-2xl lg:text-3xl font-bold tracking-tight',
      h3: 'text-xl lg:text-2xl font-semibold tracking-tight',
      h4: 'text-lg font-semibold',
    },
    bodyText: 'text-base lg:text-lg text-muted-foreground antialiased',
    mutedText: 'text-sm text-muted-foreground',
  },

  spacing: {
    scale: ['8px', '12px', '16px', '24px', '32px', '48px', '64px', '96px'],
    containerPadding: 'px-4 sm:px-6 lg:px-8',
    sectionSpacing: 'py-12 lg:py-16',
  },

  colors: {
    background: 'hsl(220 15% 5%)',
    foreground: 'hsl(0 0% 95%)',
    primary: 'hsl(0 0% 100%)',
    accent: 'hsl(232 50% 70%)',
    muted: 'hsl(220 10% 15%)',
    border: 'hsl(220 10% 18%)',
  },

  components: {
    cards: 'bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
    buttons: {
      primary: 'px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 shadow-sm',
      secondary: 'px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-200',
    },
    inputs: 'w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
  },

  rules: [
    'NEVER output unstyled HTML - all elements must have Tailwind classes',
    'Use monospace font family (Share Tech Mono) for all text',
    'Maintain sharp border-radius (0.25rem default)',
    'Apply generous spacing using 8px grid scale',
    'Include responsive breakpoints (sm:, md:, lg:) for all layouts',
    'Use dark mode by default unless user requests light theme',
    'Add subtle glow effects to accent elements',
    'Ensure all interactive elements have hover states',
  ],
};

/**
 * Generate brand injection prompt for LLM
 */
export function getBrandInjectionPrompt(overrideStyle?: string): string {
  const brand = TEAMMAE_BRAND;
  const effectiveStyle = overrideStyle || brand.styleProfileDefault;

  return `
## BRAND DESIGN SYSTEM (TeamMAE.ai)

**Default Style Profile**: ${effectiveStyle}

### Typography (Neo Tokyo Cyberpunk)
- **Font Family**: ${brand.typography.fontFamily}
- **H1**: ${brand.typography.headingScale.h1}
- **H2**: ${brand.typography.headingScale.h2}
- **H3**: ${brand.typography.headingScale.h3}
- **Body**: ${brand.typography.bodyText}
- **Muted**: ${brand.typography.mutedText}

### Spacing System (8px Grid)
- Scale: ${brand.spacing.scale.join(', ')}
- Container: ${brand.spacing.containerPadding}
- Sections: ${brand.spacing.sectionSpacing}

### Color Tokens
- Background: ${brand.colors.background}
- Foreground: ${brand.colors.foreground}
- Primary: ${brand.colors.primary}
- Accent: ${brand.colors.accent}
- Muted: ${brand.colors.muted}
- Border: ${brand.colors.border}

### Component Patterns
**Cards**: ${brand.components.cards}
**Primary Button**: ${brand.components.buttons.primary}
**Secondary Button**: ${brand.components.buttons.secondary}
**Input**: ${brand.components.inputs}

### Critical Rules
${brand.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

${overrideStyle && overrideStyle !== brand.styleProfileDefault ? `\n**USER OVERRIDE**: Use "${overrideStyle}" style instead of default, but maintain quality rules above.` : ''}
`;
}

/**
 * Available style profiles with descriptions
 */
export const STYLE_PROFILES = {
  'auto': {
    label: 'Auto (TeamMAE Default)',
    description: 'Neo Tokyo Cyberpunk - dark, sharp, monospace',
    value: null,
  },
  'dark-saas': {
    label: 'Dark SaaS',
    description: 'Modern dark theme with premium feel',
    value: 'dark-saas',
  },
  'light-saas': {
    label: 'Light Minimal',
    description: 'Clean light theme with subtle shadows',
    value: 'light-saas',
  },
  'colorful': {
    label: 'Colorful',
    description: 'Vibrant colors and playful gradients',
    value: 'colorful',
  },
  'minimal': {
    label: 'B&W Minimal',
    description: 'Black and white, maximum simplicity',
    value: 'minimal',
  },
} as const;

export type StyleProfileKey = keyof typeof STYLE_PROFILES;
