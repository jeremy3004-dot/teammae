/**
 * Build Plan Generation
 * MAE generates a plan before building to ensure deterministic output
 */

export interface BuildPlan {
  type: 'web' | 'mobile';
  pages: string[];
  layout: string[];
  components: string[];
  styleProfile: 'light-saas' | 'dark-saas' | 'colorful' | 'minimal' | 'custom';
  stateUsage: boolean;
  forms: boolean;
  backendRequired: boolean;
  dataFlow?: string;
  routing?: boolean;
}

export interface BuildPlanRequest {
  prompt: string;
  targetPlatform: 'web' | 'mobile';
}

/**
 * Generate build plan prompt for LLM
 * enforceStyleProfile is the REQUIRED style from brand resolution
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

EXAMPLES:

User: "Build a landing page"
{
  "type": "web",
  "pages": ["Home"],
  "layout": ["Header", "Hero", "Features", "CTA", "Footer"],
  "components": ["Header.tsx", "Hero.tsx", "FeatureCard.tsx", "Features.tsx", "CTA.tsx", "Footer.tsx"],
  "styleProfile": "light-saas",
  "stateUsage": false,
  "forms": false,
  "backendRequired": false,
  "routing": false
}

User: "Build a todo app"
{
  "type": "web",
  "pages": ["Home"],
  "layout": ["Header", "TodoList", "AddTodo"],
  "components": ["Header.tsx", "TodoList.tsx", "TodoItem.tsx", "AddTodo.tsx"],
  "styleProfile": "light-saas",
  "stateUsage": true,
  "forms": true,
  "backendRequired": false,
  "routing": false
}

User: "Build a dark mode dashboard"
{
  "type": "web",
  "pages": ["Dashboard"],
  "layout": ["Sidebar", "Header", "StatsGrid", "ChartsSection"],
  "components": ["Sidebar.tsx", "Header.tsx", "StatCard.tsx", "Chart.tsx"],
  "styleProfile": "dark-saas",
  "stateUsage": true,
  "forms": false,
  "backendRequired": true,
  "routing": false
}

Respond with ONLY the JSON, no explanation, no markdown code blocks.
`;
}

/**
 * Validate build plan structure
 */
export function validateBuildPlan(plan: any): plan is BuildPlan {
  if (!plan || typeof plan !== 'object') return false;

  const required = ['type', 'pages', 'layout', 'components', 'styleProfile', 'stateUsage', 'forms', 'backendRequired'];

  for (const field of required) {
    if (!(field in plan)) {
      console.error(`Build plan missing required field: ${field}`);
      return false;
    }
  }

  if (plan.type !== 'web' && plan.type !== 'mobile') {
    console.error(`Invalid type: ${plan.type}`);
    return false;
  }

  if (!Array.isArray(plan.pages) || plan.pages.length === 0) {
    console.error('pages must be a non-empty array');
    return false;
  }

  if (!Array.isArray(plan.layout) || plan.layout.length === 0) {
    console.error('layout must be a non-empty array');
    return false;
  }

  if (!Array.isArray(plan.components) || plan.components.length < 2) {
    console.error('components must have at least 2 components');
    return false;
  }

  const validProfiles = ['light-saas', 'dark-saas', 'colorful', 'minimal', 'custom'];
  if (!validProfiles.includes(plan.styleProfile)) {
    console.error(`Invalid styleProfile: ${plan.styleProfile}`);
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

  // Format style profile name
  const styleLabel = plan.styleProfile === 'dark-saas' ? 'Neo Tokyo Cyberpunk (TeamMAE default)' :
                     plan.styleProfile === 'light-saas' ? 'light minimal' :
                     plan.styleProfile.replace('-', ' ');

  let explanation = `I'll build a ${styleLabel} ${plan.type} app${isMultiPage}${hasState}${hasForms}${hasBackend}.\n\n`;

  explanation += `**Layout Structure:**\n`;
  plan.layout.forEach((section, i) => {
    explanation += `${i + 1}. ${section}\n`;
  });

  explanation += `\n**Components:** ${componentCount} components (${plan.components.slice(0, 3).join(', ')}${componentCount > 3 ? ', ...' : ''})\n`;

  // Add style customization note
  if (plan.styleProfile !== 'dark-saas') {
    explanation += `\n**Note:** Using custom style profile. To use TeamMAE default, request "Neo Tokyo" or "dark cyberpunk" style.\n`;
  }

  return explanation;
}

/**
 * Parse build plan from LLM response
 */
export function parseBuildPlan(response: string): BuildPlan | null {
  try {
    // Try direct parse
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
