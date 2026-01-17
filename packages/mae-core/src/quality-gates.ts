/**
 * UI Quality Gates
 * Validates generated output against design system requirements
 * Auto-retries if validation fails
 */

import type { MAEOutput, MAEFile } from '@teammae/types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  category: 'structure' | 'styling' | 'layout' | 'accessibility' | 'react' | 'ux';
  message: string;
  file?: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  category: string;
  message: string;
  file?: string;
}

/**
 * Validate MAE output against quality gates
 */
export function validateOutput(output: MAEOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Run all validation checks
  validateStructure(output, errors, warnings);
  validateStyling(output, errors, warnings);
  validateLayout(output, errors, warnings);
  validateReactQuality(output, errors, warnings);
  validateUX(output, errors, warnings);

  // Calculate score (100 = perfect, 0 = complete failure)
  const score = calculateScore(errors, warnings);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Validate file structure
 */
function validateStructure(
  output: MAEOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const files = output.files;
  const fileCount = files.length;

  // Check minimum files
  if (fileCount < 3) {
    errors.push({
      category: 'structure',
      message: `Too few files (${fileCount}). Expected at least 3 files (App.tsx + 2 components + CSS). This is a single-file dump.`,
      severity: 'critical',
    });
  }

  // Check for component files
  const componentFiles = files.filter(
    f => f.path.startsWith('src/components/') && f.path.endsWith('.tsx')
  );

  if (componentFiles.length < 2) {
    errors.push({
      category: 'structure',
      message: `Insufficient component files (${componentFiles.length}). Expected at least 2 reusable components in src/components/.`,
      severity: 'high',
    });
  }

  // Check for CSS file
  const hasCss = files.some(f => f.path.endsWith('.css'));
  if (!hasCss) {
    warnings.push({
      category: 'structure',
      message: 'No CSS file found. Expected src/index.css with Tailwind directives.',
    });
  }

  // Check for proper organization
  const hasProperStructure = files.some(f => f.path.includes('components/'));
  if (!hasProperStructure) {
    errors.push({
      category: 'structure',
      message: 'No component organization. Files should be organized in src/components/.',
      severity: 'medium',
    });
  }
}

/**
 * Validate styling quality
 */
function validateStyling(
  output: MAEOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const files = output.files.filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'));

  for (const file of files) {
    const content = file.content;

    // Check for inline styles (bad)
    const inlineStyleMatches = content.match(/style=\{\{[^}]+\}\}/g);
    if (inlineStyleMatches && inlineStyleMatches.length > 2) {
      errors.push({
        category: 'styling',
        message: `Excessive inline styles in ${file.path}. Use Tailwind classes instead.`,
        file: file.path,
        severity: 'high',
      });
    }

    // Check for Tailwind usage
    const classNameMatches = content.match(/className="[^"]+"/g);
    if (!classNameMatches || classNameMatches.length < 3) {
      errors.push({
        category: 'styling',
        message: `Insufficient Tailwind usage in ${file.path}. Components appear unstyled.`,
        file: file.path,
        severity: 'critical',
      });
    }

    // Check for responsive classes
    const hasResponsive = /\b(sm:|md:|lg:|xl:)/.test(content);
    if (!hasResponsive && file.path.includes('App.tsx')) {
      warnings.push({
        category: 'styling',
        message: `No responsive breakpoints found in ${file.path}. Add sm:/md:/lg: classes.`,
        file: file.path,
      });
    }

    // Check for proper spacing usage
    const hasSpacing = /\b(p-\d+|py-\d+|px-\d+|space-[xy]-\d+|gap-\d+)/.test(content);
    if (!hasSpacing) {
      warnings.push({
        category: 'styling',
        message: `Limited spacing usage in ${file.path}. Use consistent padding/margin.`,
        file: file.path,
      });
    }

    // Check for card patterns
    if (content.includes('card') || content.includes('Card')) {
      const hasRoundedLarge = content.includes('rounded-2xl') || content.includes('rounded-xl');
      const hasShadow = content.includes('shadow-');
      if (!hasRoundedLarge || !hasShadow) {
        warnings.push({
          category: 'styling',
          message: `Cards in ${file.path} missing standard styling (rounded-2xl + shadow).`,
          file: file.path,
        });
      }
    }
  }
}

/**
 * Validate layout quality
 */
function validateLayout(
  output: MAEOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const appFile = output.files.find(f => f.path === 'src/App.tsx');
  if (!appFile) return;

  const content = appFile.content;

  // Check for max-width container
  const hasContainer = /max-w-\[?\d*[a-z]+\]?/.test(content);
  if (!hasContainer) {
    warnings.push({
      category: 'layout',
      message: 'No max-width container found in App.tsx. Content may be too wide on large screens.',
      file: 'src/App.tsx',
    });
  }

  // Check for section structure
  const hasSections = content.includes('<section') || content.includes('Section');
  if (!hasSections && content.length > 500) {
    warnings.push({
      category: 'layout',
      message: 'No semantic sections found. Use <section> tags to organize content.',
      file: 'src/App.tsx',
    });
  }

  // Check for grid/flex layouts
  const hasGrid = /\b(grid|flex)\b/.test(content);
  if (!hasGrid) {
    warnings.push({
      category: 'layout',
      message: 'No grid or flexbox layouts detected. Content may not be well-organized.',
      file: 'src/App.tsx',
    });
  }

  // Check for cramped spacing (all components combined)
  const allContent = output.files.filter(f => f.path.endsWith('.tsx')).map(f => f.content).join('\n');
  const spacingCount = (allContent.match(/\b(p-|py-|px-|space-|gap-)/g) || []).length;
  const componentCount = allContent.split('function ').length - 1;

  if (spacingCount < componentCount * 2) {
    errors.push({
      category: 'layout',
      message: 'Insufficient spacing throughout the app. Layouts appear cramped.',
      severity: 'medium',
    });
  }
}

/**
 * Validate React code quality
 */
function validateReactQuality(
  output: MAEOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const files = output.files.filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'));

  for (const file of files) {
    const content = file.content;

    // Check for malformed JSX - unquoted href
    if (/href=(?!["'])[^\s>]+/.test(content)) {
      errors.push({
        category: 'react',
        message: `Malformed JSX in ${file.path}: unquoted href attribute. This will break rendering.`,
        file: file.path,
        severity: 'critical',
      });
    }

    // Check for unquoted className
    if (/className=(?!["'])[^\s>]+/.test(content)) {
      errors.push({
        category: 'react',
        message: `Malformed JSX in ${file.path}: unquoted className attribute. This will break rendering.`,
        file: file.path,
        severity: 'critical',
      });
    }

    // Check for HTML class instead of className
    if (/\bclass=["']/.test(content) && !content.includes('className')) {
      errors.push({
        category: 'react',
        message: `Invalid HTML attribute in ${file.path}: use className instead of class in React.`,
        file: file.path,
        severity: 'critical',
      });
    }

    // Check for malformed closures "> ))}"
    if (/>\s*\)\s*\}\s*\)/.test(content)) {
      errors.push({
        category: 'react',
        message: `Malformed JSX closure in ${file.path}: "> ))}" pattern detected. Fix JSX structure.`,
        file: file.path,
        severity: 'critical',
      });
    }

    // Check for TypeScript types
    if (file.path.endsWith('.tsx')) {
      const hasTypes = /:\s*(string|number|boolean|any|\w+\[\]|React\.\w+)/.test(content);
      const hasInterface = /interface\s+\w+/.test(content);
      const hasType = /type\s+\w+/.test(content);

      if (!hasTypes && !hasInterface && !hasType && content.includes('function')) {
        warnings.push({
          category: 'react',
          message: `No TypeScript types found in ${file.path}. Add prop interfaces.`,
          file: file.path,
        });
      }
    }
  }
}

/**
 * Validate UX quality
 */
function validateUX(
  output: MAEOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const allContent = output.files.filter(f => f.path.endsWith('.tsx')).map(f => f.content).join('\n');

  // Check for loading states
  const hasLoadingState = /loading|isLoading|Loading/.test(allContent);
  if (!hasLoadingState && allContent.includes('fetch')) {
    warnings.push({
      category: 'ux',
      message: 'No loading states found. Add loading indicators for async operations.',
    });
  }

  // Check for empty states
  const hasEmptyState = /empty|Empty|no items|No items/.test(allContent);
  if (!hasEmptyState && (allContent.includes('map') || allContent.includes('list'))) {
    warnings.push({
      category: 'ux',
      message: 'No empty states found. Add helpful empty states when lists are empty.',
    });
  }

  // Check for error states
  const hasErrorState = /error|Error/.test(allContent);
  if (!hasErrorState && allContent.includes('catch')) {
    warnings.push({
      category: 'ux',
      message: 'No error states found. Add error messages for failed operations.',
    });
  }

  // Check for hover states
  const hasHoverStates = /hover:/.test(allContent);
  if (!hasHoverStates) {
    warnings.push({
      category: 'ux',
      message: 'No hover states found. Add hover effects to interactive elements.',
    });
  }

  // Check for transitions
  const hasTransitions = /transition/.test(allContent);
  if (!hasTransitions) {
    warnings.push({
      category: 'ux',
      message: 'No transitions found. Add smooth transitions for better UX.',
    });
  }
}

/**
 * Calculate quality score
 */
function calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
  let score = 100;

  // Deduct points for errors
  for (const error of errors) {
    switch (error.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
    }
  }

  // Deduct points for warnings (less severe)
  score -= warnings.length * 2;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate repair prompt from validation errors
 */
export function generateRepairPrompt(validation: ValidationResult, originalOutput: MAEOutput): string {
  const { errors, warnings } = validation;

  if (errors.length === 0) {
    return ''; // No repairs needed
  }

  const criticalErrors = errors.filter(e => e.severity === 'critical');
  const highErrors = errors.filter(e => e.severity === 'high');

  let prompt = `The generated output has quality issues that must be fixed:\n\n`;

  if (criticalErrors.length > 0) {
    prompt += `CRITICAL ERRORS (must fix):\n`;
    criticalErrors.forEach((e, i) => {
      prompt += `${i + 1}. [${e.category}] ${e.message}\n`;
      if (e.file) prompt += `   File: ${e.file}\n`;
    });
    prompt += `\n`;
  }

  if (highErrors.length > 0) {
    prompt += `HIGH PRIORITY ERRORS:\n`;
    highErrors.forEach((e, i) => {
      prompt += `${i + 1}. [${e.category}] ${e.message}\n`;
      if (e.file) prompt += `   File: ${e.file}\n`;
    });
    prompt += `\n`;
  }

  prompt += `REQUIRED FIXES:\n`;
  prompt += `1. Fix all malformed JSX (ensure all attributes are properly quoted)\n`;
  prompt += `2. Add missing components (minimum 2 components in src/components/)\n`;
  prompt += `3. Add proper Tailwind styling (use className with Tailwind classes)\n`;
  prompt += `4. Ensure responsive design (add sm:/md:/lg: breakpoints)\n`;
  prompt += `5. Add proper spacing (use p-, py-, px-, space-, gap- classes)\n`;
  prompt += `\n`;

  prompt += `Return the COMPLETE corrected output in the same JSON format with ALL files.`;

  return prompt;
}

/**
 * Check if output should be retried
 */
export function shouldRetry(validation: ValidationResult): boolean {
  // Retry if there are critical errors
  const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
  return criticalErrors.length > 0;
}

/**
 * Get human-readable validation summary
 */
export function getValidationSummary(validation: ValidationResult): string {
  const { valid, errors, warnings, score } = validation;

  if (valid && warnings.length === 0) {
    return `✅ Quality check passed (score: ${score}/100)`;
  }

  const criticalCount = errors.filter(e => e.severity === 'critical').length;
  const highCount = errors.filter(e => e.severity === 'high').length;
  const mediumCount = errors.filter(e => e.severity === 'medium').length;

  let summary = `Quality check: ${score}/100\n`;

  if (criticalCount > 0) {
    summary += `❌ ${criticalCount} critical error${criticalCount > 1 ? 's' : ''}\n`;
  }
  if (highCount > 0) {
    summary += `⚠️  ${highCount} high priority error${highCount > 1 ? 's' : ''}\n`;
  }
  if (mediumCount > 0) {
    summary += `⚠️  ${mediumCount} medium error${mediumCount > 1 ? 's' : ''}\n`;
  }
  if (warnings.length > 0) {
    summary += `💡 ${warnings.length} warning${warnings.length > 1 ? 's' : ''}\n`;
  }

  return summary.trim();
}
