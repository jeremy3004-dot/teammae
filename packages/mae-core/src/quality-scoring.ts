/**
 * Quality Scoring System
 * Scores output 0-100 based on multiple dimensions
 * Score < 80 triggers auto-retry
 */

import type { MAEOutput } from '@teammae/types';

export interface QualityScore {
  componentCount: number;
  designSystemCompliance: boolean;
  layoutDepth: number;
  accessibilityScore: number;
  overallScore: number; // 0-100
  breakdown: {
    structure: number; // 0-25
    styling: number; // 0-25
    accessibility: number; // 0-25
    ux: number; // 0-25
  };
}

/**
 * Calculate comprehensive quality score
 */
export function calculateQualityScore(output: MAEOutput): QualityScore {
  const structure = scoreStructure(output);
  const styling = scoreStyling(output);
  const accessibility = scoreAccessibility(output);
  const ux = scoreUX(output);

  const overallScore = structure + styling + accessibility + ux;

  return {
    componentCount: countComponents(output),
    designSystemCompliance: styling >= 20, // 80% of max styling score
    layoutDepth: calculateLayoutDepth(output),
    accessibilityScore: accessibility,
    overallScore: Math.round(overallScore),
    breakdown: {
      structure,
      styling,
      accessibility,
      ux,
    },
  };
}

/**
 * Score file structure and organization (0-25)
 */
function scoreStructure(output: MAEOutput): number {
  let score = 0;
  const files = output.files;

  // Component count (0-10 points)
  const componentCount = countComponents(output);
  if (componentCount >= 6) score += 10;
  else if (componentCount >= 4) score += 8;
  else if (componentCount >= 3) score += 6;
  else if (componentCount >= 2) score += 4;
  else score += 0;

  // File organization (0-5 points)
  const hasProperStructure = files.some(f => f.path.includes('components/'));
  const hasPages = files.some(f => f.path.includes('pages/'));
  if (hasProperStructure) score += 3;
  if (hasPages) score += 2;

  // Required files (0-5 points)
  const hasApp = files.some(f => f.path === 'src/App.tsx');
  const hasCss = files.some(f => f.path.endsWith('.css'));
  const hasMain = files.some(f => f.path === 'src/main.tsx');
  if (hasApp) score += 2;
  if (hasCss) score += 2;
  if (hasMain) score += 1;

  // File size distribution (0-5 points)
  const avgComponentSize = calculateAvgComponentSize(output);
  if (avgComponentSize > 100 && avgComponentSize < 500) score += 5; // Sweet spot
  else if (avgComponentSize > 50 && avgComponentSize < 800) score += 3;
  else score += 1;

  return Math.min(25, score);
}

/**
 * Score styling quality (0-25)
 */
function scoreStyling(output: MAEOutput): number {
  let score = 0;
  const allContent = output.files
    .filter(f => f.path.endsWith('.tsx'))
    .map(f => f.content)
    .join('\n');

  // Tailwind usage (0-8 points)
  const classNameCount = (allContent.match(/className="/g) || []).length;
  if (classNameCount >= 30) score += 8;
  else if (classNameCount >= 20) score += 6;
  else if (classNameCount >= 10) score += 4;
  else if (classNameCount >= 5) score += 2;

  // Responsive classes (0-5 points)
  const responsiveMatches = allContent.match(/\b(sm:|md:|lg:|xl:|2xl:)/g) || [];
  if (responsiveMatches.length >= 10) score += 5;
  else if (responsiveMatches.length >= 5) score += 3;
  else if (responsiveMatches.length >= 2) score += 1;

  // Design system patterns (0-7 points)
  const hasCards = /rounded-(2xl|xl|lg)/.test(allContent) && /shadow-/.test(allContent);
  const hasButtons = /bg-(blue|indigo|purple)-\d00/.test(allContent) && /hover:bg-/.test(allContent);
  const hasSpacing = /\b(p-|py-|px-|space-|gap-)\d+/.test(allContent);
  if (hasCards) score += 3;
  if (hasButtons) score += 2;
  if (hasSpacing) score += 2;

  // No inline styles penalty (0-5 points)
  const inlineStyleCount = (allContent.match(/style=\{\{/g) || []).length;
  if (inlineStyleCount === 0) score += 5;
  else if (inlineStyleCount < 3) score += 2;

  return Math.min(25, score);
}

/**
 * Score accessibility (0-25)
 */
function scoreAccessibility(output: MAEOutput): number {
  let score = 0;
  const allContent = output.files
    .filter(f => f.path.endsWith('.tsx'))
    .map(f => f.content)
    .join('\n');

  // Semantic HTML (0-8 points)
  const hasHeader = /<header/.test(allContent);
  const hasMain = /<main/.test(allContent);
  const hasNav = /<nav/.test(allContent);
  const hasSection = /<section/.test(allContent);
  if (hasHeader) score += 2;
  if (hasMain) score += 2;
  if (hasNav) score += 2;
  if (hasSection) score += 2;

  // ARIA labels (0-5 points)
  const ariaCount = (allContent.match(/aria-/g) || []).length;
  if (ariaCount >= 5) score += 5;
  else if (ariaCount >= 3) score += 3;
  else if (ariaCount >= 1) score += 1;

  // Focus states (0-5 points)
  const hasFocusStates = /focus:(ring|outline|border)/.test(allContent);
  if (hasFocusStates) score += 5;

  // Proper button usage (0-4 points)
  const buttonCount = (allContent.match(/<button/g) || []).length;
  const divClickCount = (allContent.match(/onClick.*<div/g) || []).length;
  if (buttonCount > 0 && divClickCount === 0) score += 4;
  else if (buttonCount > divClickCount) score += 2;

  // Alt text on images (0-3 points)
  const imgCount = (allContent.match(/<img/g) || []).length;
  const altCount = (allContent.match(/alt="/g) || []).length;
  if (imgCount === 0 || imgCount === altCount) score += 3;
  else if (altCount > 0) score += 1;

  return Math.min(25, score);
}

/**
 * Score UX quality (0-25)
 */
function scoreUX(output: MAEOutput): number {
  let score = 0;
  const allContent = output.files
    .filter(f => f.path.endsWith('.tsx'))
    .map(f => f.content)
    .join('\n');

  // State handling (0-5 points)
  const hasState = /useState|useReducer/.test(allContent);
  const hasStateUpdates = /set[A-Z]\w+/.test(allContent);
  if (hasState && hasStateUpdates) score += 5;
  else if (hasState) score += 2;

  // Loading states (0-5 points)
  const hasLoading = /loading|isLoading|Loading/.test(allContent);
  if (hasLoading) score += 5;

  // Empty states (0-5 points)
  const hasEmptyState = /empty|Empty|no items|No items/.test(allContent);
  if (hasEmptyState) score += 5;

  // Transitions (0-5 points)
  const hasTransitions = /transition/.test(allContent);
  if (hasTransitions) score += 5;

  // Hover states (0-5 points)
  const hoverCount = (allContent.match(/hover:/g) || []).length;
  if (hoverCount >= 5) score += 5;
  else if (hoverCount >= 3) score += 3;
  else if (hoverCount >= 1) score += 1;

  return Math.min(25, score);
}

/**
 * Count components
 */
function countComponents(output: MAEOutput): number {
  return output.files.filter(
    f => (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) &&
         (f.path.includes('components/') || f.path.includes('pages/'))
  ).length;
}

/**
 * Calculate layout depth
 */
function calculateLayoutDepth(output: MAEOutput): number {
  const appFile = output.files.find(f => f.path === 'src/App.tsx');
  if (!appFile) return 0;

  // Count nesting levels in JSX
  const maxDepth = appFile.content.split('\n').reduce((max, line) => {
    const depth = (line.match(/^\s+</g) || [''])[0].length / 2;
    return Math.max(max, depth);
  }, 0);

  return Math.min(maxDepth, 10);
}

/**
 * Calculate average component size
 */
function calculateAvgComponentSize(output: MAEOutput): number {
  const components = output.files.filter(
    f => f.path.includes('components/') && f.path.endsWith('.tsx')
  );

  if (components.length === 0) return 0;

  const totalLines = components.reduce(
    (sum, f) => sum + f.content.split('\n').length,
    0
  );

  return Math.round(totalLines / components.length);
}

/**
 * Check if score passes threshold
 */
export function shouldRetryForScore(score: QualityScore): boolean {
  return score.overallScore < 80;
}

/**
 * Generate human-readable score summary
 */
export function getScoreSummary(score: QualityScore): string {
  const grade =
    score.overallScore >= 90 ? 'A' :
    score.overallScore >= 80 ? 'B' :
    score.overallScore >= 70 ? 'C' :
    score.overallScore >= 60 ? 'D' : 'F';

  let summary = `Quality Score: ${score.overallScore}/100 (Grade ${grade})\n`;
  summary += `├─ Structure: ${score.breakdown.structure}/25\n`;
  summary += `├─ Styling: ${score.breakdown.styling}/25\n`;
  summary += `├─ Accessibility: ${score.breakdown.accessibility}/25\n`;
  summary += `└─ UX: ${score.breakdown.ux}/25\n`;
  summary += `\nComponents: ${score.componentCount}, Layout Depth: ${score.layoutDepth}`;

  return summary;
}
