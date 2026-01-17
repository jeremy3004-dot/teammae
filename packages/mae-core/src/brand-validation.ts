/**
 * Brand Validation - Hard enforcement of brand compliance
 * Validates generated output matches the active brand profile
 */

import type { MAEOutput } from '@teammae/types';
import { TEAMMAE_BRAND, type BrandProfile } from './brand';

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
 * Returns violations if brand compliance fails
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

    // TeamMAE uses sharp borders (rounded-sm or rounded-md), not rounded-lg/xl/full
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

/**
 * Generate brand fix prompt from violations
 */
export function generateBrandFixPrompt(violations: BrandViolation[], brandProfile: BrandProfile): string {
  if (violations.length === 0) return '';

  let prompt = `CRITICAL: Output violates ${brandProfile.brandName} brand requirements.\n\n`;
  prompt += `BRAND VIOLATIONS:\n`;

  violations.forEach((v, i) => {
    prompt += `${i + 1}. ${v.rule}: ${v.message}\n`;
    prompt += `   Expected: ${v.expected}\n`;
    prompt += `   Actual: ${v.actual}\n\n`;
  });

  prompt += `REQUIRED FIXES:\n`;
  prompt += `1. Use only semantic color tokens (bg-background, bg-card, bg-primary, bg-accent, bg-muted)\n`;
  prompt += `2. Apply monospace font (font-mono class) to all text\n`;
  prompt += `3. Use sharp borders only (rounded-sm max, NO rounded-lg/xl/full)\n`;
  prompt += `4. Ensure dark mode by default (bg-background, text-foreground)\n`;
  prompt += `5. Add className to ALL HTML elements\n\n`;

  prompt += `Return the COMPLETE corrected output with ALL brand violations fixed.\n`;

  return prompt;
}

/**
 * Get brand validation summary
 */
export function getBrandValidationSummary(result: BrandValidationResult): string {
  if (result.valid) {
    return `✅ Brand validation: PASS (${result.brandName} compliant)`;
  }

  return `❌ Brand validation: FAIL (${result.violations.length} violation${result.violations.length > 1 ? 's' : ''})`;
}
