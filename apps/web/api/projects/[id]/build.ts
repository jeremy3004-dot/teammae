import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../../_lib/auth';
import { projectsClient, buildsClient, filesClient } from '../../_lib/db';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
} from '../../_lib/response';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface ClaudeResponse {
  files: Record<string, string>;
  entry?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let buildId: string | null = null;

  try {
    // Verify authentication
    const userId = await verifyAuth(req);

    // Extract project ID from query
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;

    if (!projectId) {
      return notFoundResponse(res, 'Project');
    }

    // Verify project exists and user owns it
    const project = await projectsClient.get(projectId);

    if (!project) {
      return notFoundResponse(res, 'Project');
    }

    if (project.user_id !== userId) {
      return unauthorizedResponse(res);
    }

    // Validate request body
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return badRequestResponse(res, 'Missing or invalid prompt');
    }

    // Create build record first so we can log errors
    const build = await buildsClient.create(projectId, userId, {
      trigger: 'manual',
      prompt,
      summary: prompt.slice(0, 200),
    });
    buildId = build.id;

    if (!ANTHROPIC_API_KEY) {
      const errorMsg = 'ANTHROPIC_API_KEY not configured in Vercel environment variables';
      await buildsClient.addLog(buildId, 'error', errorMsg);
      await buildsClient.updateStatus(buildId, 'failed', errorMsg);
      return errorResponse(res, errorMsg, 500);
    }

    // Update status to building
    await buildsClient.updateStatus(buildId, 'building');
    await buildsClient.addLog(buildId, 'info', 'Starting build process');

    // Step 1: Analyzing prompt
    await buildsClient.addLog(buildId, 'info', 'Analyzing requirements');

    // Step 2: Generating code with Claude
    await buildsClient.addLog(buildId, 'info', 'Generating application code');

    const generatedFiles = await generateCodeWithClaude(prompt);

    // Step 3: Saving files
    await buildsClient.addLog(
      buildId,
      'info',
      `Saving ${Object.keys(generatedFiles.files).length} files`
    );

    const filesToSave = Object.entries(generatedFiles.files).map(
      ([path, content]) => ({
        path,
        content,
      })
    );

    await filesClient.save(projectId, filesToSave);

    // Step 4: Build complete
    await buildsClient.updateStatus(buildId, 'success');
    await buildsClient.addLog(
      buildId,
      'info',
      `Build completed successfully with ${filesToSave.length} files`
    );

    return successResponse(res, {
      buildId,
      projectId,
      filesGenerated: filesToSave.length,
      entryPoint: generatedFiles.entry,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Build API error:', {
      message: errorMessage,
      stack: errorStack,
      buildId,
      hasApiKey: !!ANTHROPIC_API_KEY,
    });

    // Mark build as failed if we have a buildId
    if (buildId) {
      try {
        await buildsClient.updateStatus(buildId, 'failed', errorMessage);
        await buildsClient.addLog(buildId, 'error', `Build failed: ${errorMessage}`);
      } catch (logError) {
        console.error('Failed to log build error:', logError);
      }
    }

    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return unauthorizedResponse(res);
    }

    return errorResponse(res, errorMessage);
  }
}

/**
 * Generate code using Claude API with strict JSON output
 */
async function generateCodeWithClaude(prompt: string): Promise<ClaudeResponse> {
  const systemPrompt = `You are an expert code generator for Vite + React + TypeScript + Tailwind CSS applications.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no explanations.
2. The JSON must have this exact structure:
{
  "files": {
    "path/to/file": "file contents",
    ...
  },
  "entry": "apps/web/src/main.tsx"
}

3. Generate a complete, working Vite + React app with:
   - apps/web/src/main.tsx (entry point)
   - apps/web/src/App.tsx (main component)
   - apps/web/src/index.css (global styles with Tailwind directives)
   - apps/web/index.html (with <div id="root"></div>)
   - Additional components as needed in apps/web/src/components/

4. Use TypeScript (.tsx), React 18, and Tailwind CSS utility classes
5. Make it functional and production-ready
6. Include proper imports and exports
7. Use modern React patterns (hooks, functional components)

REMEMBER: Output ONLY the JSON object. No other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser request: ${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse the JSON response
  try {
    const parsed = JSON.parse(content);

    if (!parsed.files || typeof parsed.files !== 'object') {
      throw new Error('Invalid response structure: missing files object');
    }

    return parsed;
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content);
    throw new Error(
      `Claude returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`
    );
  }
}
