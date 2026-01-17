/**
 * Build Explanation Generator
 * Produces operational, calm, non-marketing explanations for builds
 */

import type { BuildPlan } from './build-plan';
import type { MAEOutput } from '@teammae/types';
import type { QualityScore } from './quality-scoring';

export interface BuildExplanation {
  summary: string;
  structure: string;
  qualityNotes: string;
  nextSteps?: string;
}

/**
 * Generate calm, operational build explanation
 */
export function generateBuildExplanation(
  buildPlan: BuildPlan,
  output: MAEOutput,
  qualityScore: QualityScore
): BuildExplanation {
  // Summary
  const componentCount = buildPlan.components.length;
  const summary = `Built ${buildPlan.type} application with ${componentCount} components using ${buildPlan.styleProfile.replace('-', ' ')} design system.`;

  // Structure
  const structureLines: string[] = [];
  structureLines.push('Application structure:');
  structureLines.push(`- ${output.files.length} files generated`);
  structureLines.push(`- ${componentCount} React components`);

  if (buildPlan.layout.length > 0) {
    structureLines.push(`- Layout: ${buildPlan.layout.join(' → ')}`);
  }

  if (buildPlan.stateUsage) {
    structureLines.push('- Includes state management');
  }

  if (buildPlan.forms) {
    structureLines.push('- Includes form handling');
  }

  if (buildPlan.backendRequired) {
    structureLines.push('- Configured for API integration');
  }

  const structure = structureLines.join('\n');

  // Quality notes
  const qualityLines: string[] = [];
  qualityLines.push(`Quality score: ${qualityScore.overallScore}/100`);
  qualityLines.push(`- Structure: ${qualityScore.breakdown.structure}/25`);
  qualityLines.push(`- Styling: ${qualityScore.breakdown.styling}/25`);
  qualityLines.push(`- Accessibility: ${qualityScore.breakdown.accessibility}/25`);
  qualityLines.push(`- UX: ${qualityScore.breakdown.ux}/25`);

  const qualityNotes = qualityLines.join('\n');

  // Next steps (if applicable)
  let nextSteps: string | undefined;
  if (qualityScore.overallScore < 80) {
    const suggestions: string[] = [];

    if (qualityScore.breakdown.structure < 20) {
      suggestions.push('Consider refactoring into smaller components');
    }

    if (qualityScore.breakdown.styling < 20) {
      suggestions.push('Add responsive breakpoints and design system compliance');
    }

    if (qualityScore.breakdown.accessibility < 20) {
      suggestions.push('Improve semantic HTML and ARIA attributes');
    }

    if (qualityScore.breakdown.ux < 20) {
      suggestions.push('Add loading states and user feedback');
    }

    if (suggestions.length > 0) {
      nextSteps = 'Suggested improvements:\n' + suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
  }

  return {
    summary,
    structure,
    qualityNotes,
    nextSteps,
  };
}

/**
 * Format explanation as plain text
 */
export function formatExplanationText(explanation: BuildExplanation): string {
  let text = `${explanation.summary}\n\n`;
  text += `${explanation.structure}\n\n`;
  text += `${explanation.qualityNotes}`;

  if (explanation.nextSteps) {
    text += `\n\n${explanation.nextSteps}`;
  }

  return text;
}

/**
 * Format explanation as markdown
 */
export function formatExplanationMarkdown(explanation: BuildExplanation): string {
  let md = `## ${explanation.summary}\n\n`;
  md += `${explanation.structure}\n\n`;
  md += `### Quality Metrics\n\n${explanation.qualityNotes}`;

  if (explanation.nextSteps) {
    md += `\n\n### Next Steps\n\n${explanation.nextSteps}`;
  }

  return md;
}
