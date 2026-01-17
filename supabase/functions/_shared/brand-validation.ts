/**
 * Brand Validation (Deno-compatible)
 * Hard enforcement of brand compliance
 */

import type { MAEOutput } from './types.ts';
import { TEAMMAE_BRAND, type BrandProfile } from './brand.ts';

export interface BrandViolation {
  rule: string;
  severity: 'critical';
  message: string;
  expected: string;
  actual: string;
}

export interface BrandValidationResult {
  valid: boolean;
  brandName: string;
  violations: BrandViolation[];
}

/**
 * Validate output against active brand profile
 */
export function validateBrand(output: MAEOutput, brandProfile: BrandProfile = TEAMMAE_BRAND): BrandValidationResult {
  const violations: BrandViolation[] = [];

  const allContent = output.files
    .filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))
    .map(f => f.content)
    .join('\n');

  // Rule 1: Monospace font family (TeamMAE brand)
  if (brandProfile.brandName === 'TeamMAE.ai') {
    const hasMonoFont = allContent.includes('font-mono') ||
                        allContent.includes('Share Tech Mono') ||
                        allContent.includes('ui-monospace');

    if (!hasMonoFont) {
      violations.push({
        rule: 'BRAND_TYPOGRAPHY',
        severity: 'critical',
        message: 'Missing monospace font family required by TeamMAE brand',
        expected: "font-mono or 'Share Tech Mono'",
        actual: 'No monospace font detected',
      });
    }
  }

  // Rule 2: Sharp border radius (0.25rem for TeamMAE)
  if (brandProfile.brandName === 'TeamMAE.ai') {
    const hasRoundedLg = allContent.includes('rounded-lg') || allContent.includes('rounded-xl');
    const hasRoundedFull = allContent.includes('rounded-full');

    if (hasRoundedLg || hasRoundedFull) {
      violations.push({
        rule: 'BRAND_BORDER_RADIUS',
        severity: 'critical',
        message: 'Border radius violates TeamMAE sharp design (max rounded-sm)',
        expected: 'rounded-sm or rounded (0.25rem)',
        actual: 'rounded-lg, rounded-xl, or rounded-full detected',
      });
    }
  }

  // Rule 3: Semantic color tokens (no hard-coded colors)
  const hardcodedColors = allContent.match(/bg-(gray|blue|red|green|purple|pink|indigo)-\d00/g);
  if (hardcodedColors && hardcodedColors.length > 3) {
    violations.push({
      rule: 'BRAND_COLOR_TOKENS',
      severity: 'critical',
      message: 'Using hard-coded color classes instead of semantic tokens',
      expected: 'bg-background, bg-card, bg-primary, bg-accent, bg-muted',
      actual: `Hard-coded: ${hardcodedColors.slice(0, 3).join(', ')}...`,
    });
  }

  // Rule 4: Dark mode by default (for TeamMAE)
  if (brandProfile.styleProfileDefault === 'dark-saas') {
    const hasLightColors = allContent.includes('bg-white') &&
                           allContent.includes('text-black');
    const hasDarkTokens = allContent.includes('bg-background') ||
                          allContent.includes('bg-card');

    if (hasLightColors && !hasDarkTokens) {
      violations.push({
        rule: 'BRAND_DARK_MODE',
        severity: 'critical',
        message: 'Output uses light mode but brand requires dark mode default',
        expected: 'bg-background, text-foreground (dark mode tokens)',
        actual: 'bg-white, text-black (light mode)',
      });
    }
  }

  // Rule 5: No unstyled elements (brand requirement)
  const unstyledElements = allContent.match(/<(div|p|h1|h2|h3|button|input|section)(?!\s+className)/g);
  if (unstyledElements && unstyledElements.length > 0) {
    violations.push({
      rule: 'BRAND_NO_UNSTYLED',
      severity: 'critical',
      message: 'Unstyled HTML elements violate brand design system',
      expected: 'All elements styled with className',
      actual: `${unstyledElements.length} unstyled elements found`,
    });
  }

  return {
    valid: violations.length === 0,
    brandName: brandProfile.brandName,
    violations,
  };
}
