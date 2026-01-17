import type { MAEOutput, MAEFile } from '@teammae/types';
import {
  explainBuildPlan,
  validateContract,
  calculateQualityScore,
  generateBuildExplanation,
  formatExplanationText,
  resolveBrandProfile,
  enforceBrandResolution,
  getBrandSourceLabel,
  type BuildPlan,
} from '@teammae/mae-core';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * MAE Orchestration Layer
 *
 * PRODUCTION MODE: Calls Supabase Edge Function (ANTHROPIC_API_KEY is server-side only)
 * LOCAL DEV MODE: Falls back to local mock if Edge Function unavailable
 */

// Get Supabase URL for Edge Function calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

interface BuildRequest {
  projectId: string;
  prompt: string;
  existingFiles?: Array<{ path: string; content: string }>;
  styleProfile?: string | null;
}

interface BuildResponse extends MAEOutput {
  previewHtml?: string;
}

/**
 * Main MAE build endpoint
 * Calls Supabase Edge Function for production builds
 */
export async function buildWithMAE(request: BuildRequest): Promise<BuildResponse> {
  const { prompt, existingFiles = [], styleProfile = null } = request;

  // Try Edge Function first (production path)
  if (isSupabaseConfigured && SUPABASE_URL) {
    try {
      console.log('[MAE] Calling Edge Function at:', `${SUPABASE_URL}/functions/v1/mae-build`);

      // Get auth token
      let accessToken = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || '';
      }

      if (!accessToken) {
        console.warn('[MAE] No auth token - Edge Function may reject request');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/mae-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt,
          styleProfile,
          existingFiles,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MAE] Edge Function error:', response.status, errorText);

        // If Edge Function fails, fall through to local mock
        if (response.status === 401) {
          console.warn('[MAE] Auth failed - falling back to local mock');
        } else {
          throw new Error(`Edge Function error: ${response.status} - ${errorText}`);
        }
      } else {
        const result = await response.json();
        console.log('[MAE] Edge Function success');
        return result;
      }
    } catch (error) {
      console.error('[MAE] Edge Function call failed:', error);
      // Fall through to local mock mode
    }
  }

  // LOCAL DEV FALLBACK: Use mock output when Edge Function unavailable
  console.log('[MAE] Using local mock mode (Edge Function unavailable)');
  return buildWithLocalMock(request);
}

/**
 * Local mock build for development without Edge Function
 */
async function buildWithLocalMock(request: BuildRequest): Promise<BuildResponse> {
  const { prompt, styleProfile = null } = request;

  // ===== PHASE 0: BRAND RESOLUTION (MANDATORY) =====
  console.log('[MAE Local] Phase 0: Resolving brand profile...');
  const resolvedBrand = resolveBrandProfile(prompt, styleProfile);
  enforceBrandResolution(resolvedBrand);

  console.log(`[MAE Local] Brand: ${resolvedBrand.profile.brandName} (${getBrandSourceLabel(resolvedBrand.source)})`);
  console.log(`[MAE Local] Style: ${resolvedBrand.styleProfile}${resolvedBrand.overrideDetected ? ' (user override)' : ' (default)'}`);

  // Create mock build plan
  const buildPlan: BuildPlan = {
    type: 'web',
    pages: ['Home'],
    layout: ['Hero', 'Features'],
    components: ['Hero.tsx', 'Features.tsx', 'FeatureCard.tsx'],
    styleProfile: resolvedBrand.styleProfile as any,
    stateUsage: false,
    forms: false,
    backendRequired: false,
    routing: false,
  };

  const planExplanation = explainBuildPlan(buildPlan);

  // Create mock output
  const output = createMockOutput(prompt);

  // Calculate quality score
  const qualityScore = calculateQualityScore(output);

  // Validate contract (for metadata)
  const contractResult = validateContract(output, resolvedBrand.profile);

  // Build explanation
  const buildExplanation = generateBuildExplanation(buildPlan, output, qualityScore);
  const explanationText = formatExplanationText(buildExplanation);

  // Add metadata
  if (!output.meta) output.meta = {};
  output.meta.qualityScore = qualityScore.overallScore;
  output.meta.componentCount = qualityScore.componentCount;
  output.meta.designSystemCompliance = qualityScore.designSystemCompliance;
  output.meta.buildPlan = buildPlan;
  output.meta.planExplanation = planExplanation;
  output.meta.buildExplanation = explanationText;
  output.meta.attempts = 1;

  // BRAND METADATA (MANDATORY)
  output.meta.brandName = resolvedBrand.profile.brandName;
  output.meta.brandSource = resolvedBrand.source;
  output.meta.styleProfile = resolvedBrand.styleProfile;
  output.meta.brandCompliant = contractResult.brandCompliant || false;
  output.meta.brandViolations = contractResult.violations
    .filter(v => v.rule.startsWith('BRAND_'))
    .map(v => v.message);

  // Generate preview HTML
  const previewHtml = await generatePreviewHTML(output.files);

  return {
    ...output,
    previewHtml,
  };
}

/**
 * Generate preview HTML from files
 */
async function generatePreviewHTML(files: MAEFile[]): Promise<string> {
  const fileMap = new Map(files.map((f) => [f.path, f.content]));

  // Ensure required files exist
  ensureRequiredFiles(fileMap);

  // Collect all component files
  const componentFiles: string[] = [];
  for (const [path, content] of fileMap.entries()) {
    if (path.startsWith('src/components/') || path.startsWith('src/pages/')) {
      componentFiles.push(content);
    }
  }

  // Get main files
  const appTsx = fileMap.get('src/App.tsx') || '<div>No App.tsx found</div>';
  const indexCss = fileMap.get('src/index.css') || generateDefaultIndexCSS();

  // Inline all components and App
  const allCode = [
    ...componentFiles.map((c) => c.replace(/export default /g, 'const Component = ')),
    appTsx.replace(/export default App;?/g, '').replace(/export default /g, 'const App = '),
  ].join('\n\n');

  // Simple bundling: inline everything
  const bundledHtml = `
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

  return bundledHtml;
}

/**
 * Ensure required files exist in file map
 */
function ensureRequiredFiles(fileMap: Map<string, string>): void {
  if (!fileMap.has('src/App.tsx')) {
    fileMap.set('src/App.tsx', generateDefaultAppTsx());
  }

  if (!fileMap.has('src/index.css')) {
    fileMap.set('src/index.css', generateDefaultIndexCSS());
  }

  if (!fileMap.has('src/main.tsx')) {
    fileMap.set('src/main.tsx', generateDefaultMainTsx());
  }

  if (!fileMap.has('index.html')) {
    fileMap.set('index.html', generateDefaultIndexHTML());
  }

  if (!fileMap.has('package.json')) {
    fileMap.set('package.json', generateDefaultPackageJson());
  }
}

/**
 * Default file generators
 */
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

function generateDefaultMainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}

function generateDefaultIndexCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
}

function generateDefaultIndexHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamMAE App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function generateDefaultPackageJson(): string {
  return JSON.stringify(
    {
      name: 'teammae-app',
      version: '0.0.1',
      type: 'module',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.2.0',
        typescript: '^5.3.0',
        vite: '^5.0.0',
        tailwindcss: '^3.4.0',
      },
    },
    null,
    2
  );
}

/**
 * Create mock output for local dev
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
          This is a mock build. Deploy Edge Function and configure ANTHROPIC_API_KEY for real builds.
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
    warnings: ['Using local mock - deploy Edge Function for real AI builds'],
  };
}
