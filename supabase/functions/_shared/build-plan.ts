/**
 * Build Plan Generation (Deno-compatible)
 */

import type { BuildPlan } from './types.ts';

/**
 * Generate build plan prompt for LLM
 */
export function getBuildPlanPrompt(enforceStyleProfile?: string): string {
  const requiredStyle = enforceStyleProfile || 'dark-saas';

  return `
CRITICAL: Before generating any code, you MUST first create a Build Plan.

Respond with ONLY a JSON object in this exact format:

{
  "type": "web",
  "pages": ["Home"],
  "layout": ["Hero", "FeatureGrid", "CTA", "Footer"],
  "components": ["Hero.tsx", "FeatureCard.tsx", "CTA.tsx", "Footer.tsx"],
  "styleProfile": "${requiredStyle}",
  "stateUsage": false,
  "forms": false,
  "backendRequired": false,
  "routing": false
}

RULES:
1. type: Always "web" for web apps
2. pages: List of page names (usually just ["Home"] for single-page apps)
3. layout: Top-level layout sections in order (Hero, Features, Pricing, CTA, Footer, etc.)
4. components: List of component filenames (include .tsx extension)
5. styleProfile: MUST be "${requiredStyle}" (ENFORCED, NON-NEGOTIABLE)
6. stateUsage: true if app needs useState/state management
7. forms: true if app has input forms
8. backendRequired: true if app needs API calls
9. routing: true if multi-page app with React Router

Respond with ONLY the JSON, no explanation, no markdown code blocks.
`;
}

/**
 * Validate build plan structure
 */
export function validateBuildPlan(plan: unknown): plan is BuildPlan {
  if (!plan || typeof plan !== 'object') return false;

  const p = plan as Record<string, unknown>;
  const required = ['type', 'pages', 'layout', 'components', 'styleProfile', 'stateUsage', 'forms', 'backendRequired'];

  for (const field of required) {
    if (!(field in p)) {
      console.error(`Build plan missing required field: ${field}`);
      return false;
    }
  }

  if (p.type !== 'web' && p.type !== 'mobile') {
    console.error(`Invalid type: ${p.type}`);
    return false;
  }

  if (!Array.isArray(p.pages) || p.pages.length === 0) {
    console.error('pages must be a non-empty array');
    return false;
  }

  if (!Array.isArray(p.layout) || p.layout.length === 0) {
    console.error('layout must be a non-empty array');
    return false;
  }

  if (!Array.isArray(p.components) || p.components.length < 2) {
    console.error('components must have at least 2 components');
    return false;
  }

  const validProfiles = ['light-saas', 'dark-saas', 'colorful', 'minimal', 'custom'];
  if (!validProfiles.includes(p.styleProfile as string)) {
    console.error(`Invalid styleProfile: ${p.styleProfile}`);
    return false;
  }

  return true;
}

/**
 * Generate human-readable explanation of build plan
 */
export function explainBuildPlan(plan: BuildPlan): string {
  const componentCount = plan.components.length;
  const hasState = plan.stateUsage ? ' with state management' : '';
  const hasForms = plan.forms ? ' and user input forms' : '';
  const hasBackend = plan.backendRequired ? ' connected to an API' : '';
  const isMultiPage = plan.routing ? ` with ${plan.pages.length} pages` : '';

  const styleLabel = plan.styleProfile === 'dark-saas' ? 'Neo Tokyo Cyberpunk (TeamMAE default)' :
                     plan.styleProfile === 'light-saas' ? 'light minimal' :
                     plan.styleProfile.replace('-', ' ');

  let explanation = `I'll build a ${styleLabel} ${plan.type} app${isMultiPage}${hasState}${hasForms}${hasBackend}.\n\n`;

  explanation += `**Layout Structure:**\n`;
  plan.layout.forEach((section, i) => {
    explanation += `${i + 1}. ${section}\n`;
  });

  explanation += `\n**Components:** ${componentCount} components (${plan.components.slice(0, 3).join(', ')}${componentCount > 3 ? ', ...' : ''})\n`;

  return explanation;
}

/**
 * Parse build plan from LLM response
 */
export function parseBuildPlan(response: string): BuildPlan | null {
  try {
    const parsed = JSON.parse(response);
    if (validateBuildPlan(parsed)) {
      return parsed;
    }
  } catch {
    // Try extracting from markdown
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (validateBuildPlan(parsed)) {
          return parsed;
        }
      } catch {
        // Continue to brace extraction
      }
    }

    // Try finding JSON object
    const braceMatch = response.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        const parsed = JSON.parse(braceMatch[0]);
        if (validateBuildPlan(parsed)) {
          return parsed;
        }
      } catch {
        // Failed all attempts
      }
    }
  }

  return null;
}
