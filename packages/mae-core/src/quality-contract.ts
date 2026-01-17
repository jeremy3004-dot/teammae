/**
 * Quality Contract - Hard Rules
 * Every generated web app MUST satisfy ALL rules
 * If ANY rule fails → build is rejected automatically
 */

import type { MAEOutput } from '@teammae/types';
import { validateBrand } from './brand-validation';
import { TEAMMAE_BRAND, type BrandProfile } from './brand';

export interface ContractViolation {
  rule: string;
  severity: 'critical';
  message: string;
  fix: string;
}

export interface ContractValidationResult {
  valid: boolean;
  violations: ContractViolation[];
  brandCompliant?: boolean;
  brandName?: string;
}

/**
 * Validate output against quality contract
 * Returns violations if any hard rules are broken
 * NOW INCLUDES MANDATORY BRAND VALIDATION
 */
export function validateContract(output: MAEOutput, brandProfile: BrandProfile = TEAMMAE_BRAND): ContractValidationResult {
  const violations: ContractViolation[] = [];

  // Rule 1: At least 3 React components
  const componentFiles = output.files.filter(
    f => (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) && f.path.includes('components/')
  );

  if (componentFiles.length < 2) {
    violations.push({
      rule: 'MINIMUM_COMPONENTS',
      severity: 'critical',
      message: `Only ${componentFiles.length} components found. Required: at least 3 React components in src/components/`,
      fix: 'Break down App.tsx into at least 3 reusable components (e.g., Header, Hero, Footer)',
    });
  }

  // Rule 2: Uses design system (Tailwind classes)
  const allContent = output.files
    .filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))
    .map(f => f.content)
    .join('\n');

  const classNameCount = (allContent.match(/className="/g) || []).length;
  const inlineStyleCount = (allContent.match(/style=\{\{/g) || []).length;

  if (classNameCount < 5) {
    violations.push({
      rule: 'DESIGN_SYSTEM_USAGE',
      severity: 'critical',
      message: 'Insufficient Tailwind usage. Components appear unstyled.',
      fix: 'Use Tailwind utility classes (className="...") for all styling',
    });
  }

  if (inlineStyleCount > classNameCount) {
    violations.push({
      rule: 'NO_INLINE_STYLES',
      severity: 'critical',
      message: 'Excessive inline styles detected. Use Tailwind classes instead.',
      fix: 'Replace all style={{...}} with className="..." using Tailwind utilities',
    });
  }

  // Rule 3: Mobile-first responsive layout
  const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:)/.test(allContent);
  if (!hasResponsiveClasses) {
    violations.push({
      rule: 'RESPONSIVE_LAYOUT',
      severity: 'critical',
      message: 'No responsive breakpoints found. App will not work on mobile.',
      fix: 'Add responsive classes (sm:, md:, lg:) to layout elements',
    });
  }

  // Rule 4: No raw unstyled HTML
  const hasUnstyled = /<(div|p|h1|h2|h3|button|input)(?!\s+className)/.test(allContent);
  if (hasUnstyled) {
    violations.push({
      rule: 'NO_UNSTYLED_HTML',
      severity: 'critical',
      message: 'Raw unstyled HTML elements detected.',
      fix: 'Add className with Tailwind classes to all HTML elements',
    });
  }

  // Rule 5: No single-file apps (unless App.tsx is very small)
  const appFile = output.files.find(f => f.path === 'src/App.tsx');
  if (appFile && appFile.content.length > 1500 && componentFiles.length < 2) {
    violations.push({
      rule: 'NO_SINGLE_FILE_APPS',
      severity: 'critical',
      message: 'Single-file app detected. App.tsx is too large without component breakdown.',
      fix: 'Split App.tsx into smaller components in src/components/',
    });
  }

  // Rule 6: Proper file structure
  const hasAppTsx = output.files.some(f => f.path === 'src/App.tsx');
  const hasCss = output.files.some(f => f.path.endsWith('.css'));

  if (!hasAppTsx) {
    violations.push({
      rule: 'REQUIRED_FILES',
      severity: 'critical',
      message: 'Missing src/App.tsx',
      fix: 'Create src/App.tsx as main app component',
    });
  }

  if (!hasCss) {
    violations.push({
      rule: 'REQUIRED_FILES',
      severity: 'critical',
      message: 'Missing CSS file (src/index.css)',
      fix: 'Create src/index.css with Tailwind directives',
    });
  }

  // Rule 7: BRAND COMPLIANCE (NON-BYPASSABLE)
  const brandValidation = validateBrand(output, brandProfile);
  if (!brandValidation.valid) {
    brandValidation.violations.forEach(bv => {
      violations.push({
        rule: bv.rule,
        severity: 'critical',
        message: `BRAND VIOLATION: ${bv.message}`,
        fix: `Expected: ${bv.expected}. Actual: ${bv.actual}`,
      });
    });
  }

  return {
    valid: violations.length === 0,
    violations,
    brandCompliant: brandValidation.valid,
    brandName: brandProfile.brandName,
  };
}

/**
 * Generate fix prompt from violations
 */
export function generateContractFixPrompt(violations: ContractViolation[]): string {
  if (violations.length === 0) return '';

  let prompt = `The generated output violates quality contract rules. You MUST fix these issues:\n\n`;

  violations.forEach((v, i) => {
    prompt += `${i + 1}. ${v.rule}: ${v.message}\n`;
    prompt += `   FIX: ${v.fix}\n\n`;
  });

  prompt += `CRITICAL: Fix ALL violations and regenerate the COMPLETE output.\n`;
  prompt += `Return the full corrected JSON output with all files.\n`;

  return prompt;
}

/**
 * Get contract summary
 */
export function getContractSummary(result: ContractValidationResult): string {
  if (result.valid) {
    return '✅ Quality contract: PASS (all rules satisfied)';
  }

  return `❌ Quality contract: FAIL (${result.violations.length} violation${result.violations.length > 1 ? 's' : ''})`;
}
