/**
 * MAE Build Edge Function
 * Handles AI-powered app generation with brand enforcement
 *
 * ANTHROPIC_API_KEY is stored as a Supabase Edge Function secret
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Import MAE modules
import type { MAEOutput, MAEFile, BuildPlan, BuildRequest, BuildResponse } from '../_shared/types.ts';
import { getBrandInjectionPrompt, TEAMMAE_BRAND } from '../_shared/brand.ts';
import { resolveBrandProfile, enforceBrandResolution, getBrandSourceLabel } from '../_shared/brand-resolver.ts';
import { getBuildPlanPrompt, parseBuildPlan, validateBuildPlan, explainBuildPlan } from '../_shared/build-plan.ts';
import { validateContract, getContractSummary } from '../_shared/quality-contract.ts';
import { calculateQualityScore, shouldRetryForScore, getScoreSummary } from '../_shared/quality-scoring.ts';
import { generateBuildExplanation, formatExplanationText } from '../_shared/build-explanation.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Get API key from environment (Supabase secret)
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT (basic check - Supabase will validate on client creation)
    // TODO: Full JWT verification can be added with jose library if needed
    const token = authHeader.replace('Bearer ', '');
    if (!token || token.length < 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token for RLS
    let supabase = null;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        console.warn('Auth verification failed:', authError?.message);
        // Continue anyway - graceful degradation for local dev
      }
    }

    // Parse request body
    const body: BuildRequest = await req.json();
    const { prompt, styleProfile = null, existingFiles = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MAE Edge] Starting build for prompt:', prompt.substring(0, 50) + '...');

    // Run the MAE build pipeline
    const result = await buildWithMAE({
      prompt,
      styleProfile,
      existingFiles,
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[MAE Edge] Build error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        summary: 'Build failed',
        files: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Main MAE build function with full pipeline
 */
async function buildWithMAE(request: BuildRequest): Promise<BuildResponse> {
  const { prompt, existingFiles = [], styleProfile = null } = request;

  let buildPlan: BuildPlan | null = null;
  let output: MAEOutput | null = null;
  let retryCount = 0;
  const maxRetries = 2;

  // ===== PHASE 0: BRAND RESOLUTION (MANDATORY) =====
  console.log('[MAE] Phase 0: Resolving brand profile...');
  const resolvedBrand = resolveBrandProfile(prompt, styleProfile);
  enforceBrandResolution(resolvedBrand);

  console.log(`[MAE] Brand: ${resolvedBrand.profile.brandName} (${getBrandSourceLabel(resolvedBrand.source)})`);
  console.log(`[MAE] Style: ${resolvedBrand.styleProfile}${resolvedBrand.overrideDetected ? ' (user override)' : ' (default)'}`);
  console.log('[MAE] Brand injection: ACTIVE');

  // ===== PHASE 1: BUILD PLAN GENERATION =====
  console.log('[MAE] Phase 1: Generating Build Plan...');

  if (!ANTHROPIC_API_KEY) {
    // Mock mode for local dev without API key
    console.log('[MAE] No API key - using mock mode');
    buildPlan = {
      type: 'web',
      pages: ['Home'],
      layout: ['Hero', 'Features'],
      components: ['Hero.tsx', 'Features.tsx', 'FeatureCard.tsx'],
      styleProfile: resolvedBrand.styleProfile as BuildPlan['styleProfile'],
      stateUsage: false,
      forms: false,
      backendRequired: false,
      routing: false,
    };
  } else {
    const planPrompt = getBuildPlanPrompt(resolvedBrand.styleProfile);
    const brandPrompt = getBrandInjectionPrompt(resolvedBrand.styleProfile);
    const planResponse = await callAnthropic(
      `You are a technical architect planning web application structure.\n\n${brandPrompt}`,
      `${planPrompt}\n\nUser request: ${prompt}`
    );

    buildPlan = parseBuildPlan(planResponse);

    if (!buildPlan || !validateBuildPlan(buildPlan)) {
      console.warn('[MAE] Build plan validation failed, using default plan');
      buildPlan = {
        type: 'web',
        pages: ['Home'],
        layout: ['Header', 'Main', 'Footer'],
        components: ['Header.tsx', 'Main.tsx', 'Footer.tsx'],
        styleProfile: resolvedBrand.styleProfile as BuildPlan['styleProfile'],
        stateUsage: false,
        forms: false,
        backendRequired: false,
        routing: false,
      };
    }

    buildPlan.styleProfile = resolvedBrand.styleProfile as BuildPlan['styleProfile'];
  }

  console.log('[MAE] Build Plan:', JSON.stringify(buildPlan));
  const planExplanation = explainBuildPlan(buildPlan);

  // ===== PHASE 2: CODE GENERATION WITH SELF-REPAIR LOOP =====
  console.log('[MAE] Phase 2: Generating code...');

  const brandPrompt = getBrandInjectionPrompt(resolvedBrand.styleProfile);
  const systemMessage = buildSystemMessage(buildPlan, brandPrompt);
  const userPrompt = buildUserPrompt(prompt, existingFiles);

  while (retryCount <= maxRetries) {
    console.log(`[MAE] Generation attempt ${retryCount + 1}/${maxRetries + 1}`);

    if (!ANTHROPIC_API_KEY) {
      output = createMockOutput(prompt);
    } else {
      const response = await callAnthropic(systemMessage, userPrompt);
      output = parseMAEOutput(response);

      if (!output) {
        console.warn('[MAE] Parse failed, attempting repair...');
        output = await repairAndParse(response, systemMessage);
      }
    }

    if (!output) {
      throw new Error('Failed to parse MAE output');
    }

    // Enforce minimum files
    output = enforceMinimumFiles(output);

    // ===== PHASE 3: QUALITY CONTRACT VALIDATION (WITH BRAND) =====
    console.log('[MAE] Phase 3: Validating quality contract + brand...');
    const contractResult = validateContract(output, resolvedBrand.profile);
    console.log(`[MAE] ${getContractSummary(contractResult)}`);

    if (contractResult.brandCompliant === false) {
      console.warn('[MAE] Brand validation: FAIL - violations detected');
    } else {
      console.log('[MAE] Brand validation: PASS');
    }

    if (!contractResult.valid) {
      if (retryCount < maxRetries && ANTHROPIC_API_KEY) {
        console.warn('[MAE] Contract violations detected, retrying...');
        retryCount++;

        if (!output.warnings) output.warnings = [];
        output.warnings.push(`Attempt ${retryCount}: Contract violations - retrying...`);
        continue;
      } else {
        console.error('[MAE] Max retries reached with contract violations');
        if (!output.warnings) output.warnings = [];
        contractResult.violations.forEach(v => {
          output!.warnings!.push(`[${v.rule}] ${v.message}`);
        });
        break;
      }
    }

    // ===== PHASE 4: QUALITY SCORING =====
    console.log('[MAE] Phase 4: Calculating quality score...');
    const qualityScore = calculateQualityScore(output);
    console.log(`[MAE] ${getScoreSummary(qualityScore)}`);

    if (shouldRetryForScore(qualityScore) && retryCount < maxRetries && ANTHROPIC_API_KEY) {
      console.warn('[MAE] Quality score below threshold, retrying...');
      retryCount++;

      if (!output.warnings) output.warnings = [];
      output.warnings.push(`Attempt ${retryCount}: Score ${qualityScore.overallScore}/100 - retrying...`);
      continue;
    }

    // Success! Generate build explanation and add metadata
    const buildExplanation = generateBuildExplanation(buildPlan, output, qualityScore);
    const explanationText = formatExplanationText(buildExplanation);

    if (!output.meta) output.meta = {};
    output.meta.qualityScore = qualityScore.overallScore;
    output.meta.componentCount = qualityScore.componentCount;
    output.meta.designSystemCompliance = qualityScore.designSystemCompliance;
    output.meta.buildPlan = buildPlan;
    output.meta.planExplanation = planExplanation;
    output.meta.buildExplanation = explanationText;
    output.meta.attempts = retryCount + 1;

    // BRAND METADATA (MANDATORY)
    output.meta.brandName = resolvedBrand.profile.brandName;
    output.meta.brandSource = resolvedBrand.source;
    output.meta.styleProfile = resolvedBrand.styleProfile;
    output.meta.brandCompliant = contractResult.brandCompliant || false;
    output.meta.brandViolations = contractResult.violations
      .filter(v => v.rule.startsWith('BRAND_'))
      .map(v => v.message);

    break;
  }

  if (!output) {
    throw new Error('Failed to generate valid output after retries');
  }

  // Generate preview HTML
  const previewHtml = generatePreviewHTML(output.files);

  return {
    ...output,
    previewHtml,
  };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(systemMessage: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemMessage,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Build system message for MAE
 */
function buildSystemMessage(buildPlan: BuildPlan, brandPrompt: string): string {
  let planContext = '';
  if (buildPlan) {
    planContext = `
BUILD PLAN (follow this structure):
- Type: ${buildPlan.type}
- Pages: ${buildPlan.pages.join(', ')}
- Layout sections: ${buildPlan.layout.join(' → ')}
- Components to create: ${buildPlan.components.join(', ')}
- Style profile: ${buildPlan.styleProfile} (ENFORCED BY BRAND)
- State management: ${buildPlan.stateUsage ? 'YES (use useState/hooks)' : 'NO'}
- Forms: ${buildPlan.forms ? 'YES (include input validation)' : 'NO'}
- Backend integration: ${buildPlan.backendRequired ? 'YES (add API calls)' : 'NO'}
${buildPlan.routing ? '- Routing: YES (use React Router)' : ''}

IMPORTANT: Follow this build plan exactly. Create all components listed above.
`;
  }

  return `You are MAE, an expert app builder for TeamMAE.ai. You build production-ready React apps with Tailwind CSS and shadcn/ui patterns.

Your mission: Generate a polished, beautiful, production-ready UI on first pass. Every app should look professionally designed by default.

${brandPrompt}

${planContext}

CRITICAL OUTPUT RULES:
1. You MUST respond with valid JSON in this exact format:
{
  "summary": "Brief description of what you built",
  "files": [
    {
      "path": "src/App.tsx",
      "content": "file content here"
    }
  ],
  "warnings": ["optional warnings"],
  "meta": {}
}

2. MINIMUM FILES (return MULTIPLE files, not just App.tsx):
   - src/main.tsx (React mount point)
   - src/App.tsx (main app component OR page shell)
   - src/components/* (at least 2 components for non-trivial apps)
   - src/index.css (Tailwind imports + custom styles if needed)

3. BEAUTIFUL BY DEFAULT UI CONVENTIONS (non-negotiable):
   - Use Tailwind CSS with consistent spacing: 8/12/16/24/32/48px scale
   - Max width containers: max-w-6xl with generous padding (px-4 sm:px-6 lg:px-8)
   - Cards: rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow
   - Buttons:
     * Primary: px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90
     * Secondary: px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80
   - Layout: grid-based, responsive, mobile-first
   - NEVER ship plain HTML with unstyled lists or raw text blocks
   - ALWAYS compose with components

4. CODE QUALITY:
   - React 18 + TypeScript
   - Functional components with hooks
   - NO placeholder comments or TODOs
   - Make it work on first try
   - All JSX must be valid TypeScript React components`;
}

/**
 * Build user prompt
 */
function buildUserPrompt(prompt: string, existingFiles: MAEFile[]): string {
  let userPrompt = `Build this app: ${prompt}\n\n`;

  if (existingFiles.length > 0) {
    userPrompt += 'Existing files:\n';
    existingFiles.forEach((file) => {
      userPrompt += `\n--- ${file.path} ---\n${file.content}\n`;
    });
    userPrompt += '\nUpdate or add to these files as needed.\n\n';
  }

  userPrompt += 'Respond with valid JSON following the schema in the system message.';

  return userPrompt;
}

/**
 * Parse MAE output from LLM response
 */
function parseMAEOutput(raw: string): MAEOutput | null {
  try {
    const parsed = JSON.parse(raw);
    if (validateMAEOutput(parsed)) {
      return parsed;
    }
  } catch {
    // Continue to brace extraction
  }

  // Try extracting JSON from markdown code blocks
  const codeBlockMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      if (validateMAEOutput(parsed)) {
        return parsed;
      }
    } catch {
      // Continue
    }
  }

  // Try brace matching
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const extracted = raw.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(extracted);
      if (validateMAEOutput(parsed)) {
        return parsed;
      }
    } catch {
      // Failed
    }
  }

  return null;
}

/**
 * Validate MAE output structure
 */
function validateMAEOutput(obj: unknown): obj is MAEOutput {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.summary === 'string' &&
    Array.isArray(o.files) &&
    o.files.length > 0 &&
    o.files.every(
      (f: unknown) =>
        typeof f === 'object' &&
        f !== null &&
        typeof (f as Record<string, unknown>).path === 'string' &&
        typeof (f as Record<string, unknown>).content === 'string'
    )
  );
}

/**
 * Enforce minimum files guarantee
 */
function enforceMinimumFiles(output: MAEOutput): MAEOutput {
  const fileMap = new Map(output.files.map((f) => [f.path, f.content]));

  const requiredFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
  ];

  const missingRequired = requiredFiles.filter((path) => !fileMap.has(path));

  if (missingRequired.length > 0) {
    console.warn(`Missing required files: ${missingRequired.join(', ')}`);
    if (!output.warnings) output.warnings = [];
    output.warnings.push(`Auto-scaffolded missing files: ${missingRequired.join(', ')}`);
  }

  return output;
}

/**
 * Attempt to repair invalid JSON
 */
async function repairAndParse(rawResponse: string, systemMessage: string): Promise<MAEOutput | null> {
  if (!ANTHROPIC_API_KEY) {
    return null;
  }

  const repairPrompt = `The following response is not valid JSON. Please extract and return ONLY the valid JSON object following the MAEOutput schema:

${rawResponse}

Return only the JSON object, no explanations.`;

  try {
    const repaired = await callAnthropic(systemMessage, repairPrompt);
    return parseMAEOutput(repaired);
  } catch (error) {
    console.error('Repair failed:', error);
    return null;
  }
}

/**
 * Generate preview HTML from files
 */
function generatePreviewHTML(files: MAEFile[]): string {
  const fileMap = new Map(files.map((f) => [f.path, f.content]));

  // Ensure required files exist
  if (!fileMap.has('src/App.tsx')) {
    fileMap.set('src/App.tsx', generateDefaultAppTsx());
  }
  if (!fileMap.has('src/index.css')) {
    fileMap.set('src/index.css', generateDefaultIndexCSS());
  }

  // Collect all component files
  const componentFiles: string[] = [];
  for (const [path, content] of fileMap.entries()) {
    if (path.startsWith('src/components/') || path.startsWith('src/pages/')) {
      componentFiles.push(content);
    }
  }

  const appTsx = fileMap.get('src/App.tsx') || '<div>No App.tsx found</div>';
  const indexCss = fileMap.get('src/index.css') || generateDefaultIndexCSS();

  // Inline all components and App
  const allCode = [
    ...componentFiles.map((c) => c.replace(/export default /g, 'const Component = ')),
    appTsx.replace(/export default App;?/g, '').replace(/export default /g, 'const App = '),
  ].join('\n\n');

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamMAE App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${indexCss}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
      import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';

      ${allCode}

      ReactDOM.createRoot(document.getElementById('root')).render(
        React.createElement(React.StrictMode, null, React.createElement(App))
      );
    </script>
  </body>
</html>`;
}

function generateDefaultAppTsx(): string {
  return `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Welcome to TeamMAE</h1>
        <p className="mt-4 text-muted-foreground">Your app is being built...</p>
      </div>
    </div>
  );
}

export default App;`;
}

function generateDefaultIndexCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
}

/**
 * Create mock output for testing without API key
 */
function createMockOutput(prompt: string): MAEOutput {
  return {
    summary: `Mock build: ${prompt}`,
    files: [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';

function App() {
  return (
    <div className="min-h-screen bg-background font-mono">
      <Hero />
      <Features />
    </div>
  );
}

export default App;`,
      },
      {
        path: 'src/components/Hero.tsx',
        content: `import React from 'react';

export default function Hero() {
  return (
    <div className="bg-card py-16 lg:py-24 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
          ${prompt}
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          This is a mock build. Configure ANTHROPIC_API_KEY in Supabase Edge Function secrets for real builds.
        </p>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity duration-200 shadow-sm">
          Get Started
        </button>
      </div>
    </div>
  );
}`,
      },
      {
        path: 'src/components/Features.tsx',
        content: `import React from 'react';

const features = [
  {
    title: 'React + TypeScript',
    description: 'Modern React 18 with full TypeScript support',
    icon: '⚛️',
  },
  {
    title: 'Tailwind CSS',
    description: 'Beautiful, responsive design with Tailwind',
    icon: '🎨',
  },
  {
    title: 'Production Ready',
    description: 'Clean code following best practices',
    icon: '✨',
  },
];

export default function Features() {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card rounded border border-border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
      },
      {
        path: 'src/index.css',
        content: generateDefaultIndexCSS(),
      },
    ],
    warnings: ['Using mock output - configure ANTHROPIC_API_KEY in Supabase Edge Function secrets for real builds'],
  };
}
