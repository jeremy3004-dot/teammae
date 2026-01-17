import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
    console.log('[build] Step 1: Checking auth header');
    // Verify authentication
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    console.log('[build] Step 2: Checking Supabase config');
    // Create Supabase client inline
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    console.log('[build] Step 3: Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    console.log('[build] Step 4: Verifying auth');
    // Verify auth
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = authData.user.id;
    console.log('[build] Step 5: Auth verified, userId:', userId);

    // Extract project ID from query
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;

    if (!projectId) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[build] Step 6: Fetching project:', projectId);
    // Verify project exists and user owns it
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw new Error(projectError.message || 'Failed to fetch project');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[build] Step 7: Project verified, checking prompt');
    // Validate request body
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' });
    }

    console.log('[build] Step 8: Creating build record');
    // Create build record
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .insert({
        project_id: projectId,
        user_id: userId,
        status: 'building',
        trigger: 'manual',
        // Note: 'summary' column may not exist yet - run migration 001_add_build_fields.sql
      })
      .select()
      .single();

    if (buildError) throw new Error(buildError.message || 'Failed to create build record');
    console.log('[build] Step 9: Build record created:', build.id);
    buildId = build.id;

    // Add initial log
    await supabase.from('build_logs').insert({
      build_id: buildId,
      level: 'info',
      message: 'Starting build process',
    });

    if (!ANTHROPIC_API_KEY) {
      const errorMsg = 'ANTHROPIC_API_KEY not configured in Vercel environment variables';
      await supabase.from('build_logs').insert({
        build_id: buildId,
        level: 'error',
        message: errorMsg,
      });
      await supabase.from('builds').update({
        status: 'failed',
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
      }).eq('id', buildId);
      return res.status(500).json({ error: errorMsg });
    }

    // Update status to building
    await supabase.from('build_logs').insert({
      build_id: buildId,
      level: 'info',
      message: 'Analyzing requirements',
    });

    // Generate code with Claude
    await supabase.from('build_logs').insert({
      build_id: buildId,
      level: 'info',
      message: 'Generating application code',
    });

    const generatedFiles = await generateCodeWithClaude(prompt);

    // Save files
    await supabase.from('build_logs').insert({
      build_id: buildId,
      level: 'info',
      message: `Saving ${Object.keys(generatedFiles.files).length} files`,
    });

    const filesToSave = Object.entries(generatedFiles.files).map(
      ([path, content]) => ({
        project_id: projectId,
        path,
        content,
        file_type: path.endsWith('.tsx') || path.endsWith('.ts') ? 'typescript' :
                   path.endsWith('.css') ? 'css' :
                   path.endsWith('.html') ? 'html' : 'other',
        size_bytes: content.length,
        checksum: '',
        version: 1,
      })
    );

    await supabase.from('files').upsert(filesToSave, {
      onConflict: 'project_id,path',
    });

    // Mark build as complete
    await supabase.from('builds').update({
      status: 'success',
      completed_at: new Date().toISOString(),
    }).eq('id', buildId);

    await supabase.from('build_logs').insert({
      build_id: buildId,
      level: 'info',
      message: `Build completed successfully with ${filesToSave.length} files`,
    });

    return res.status(200).json({
      buildId,
      projectId,
      filesGenerated: filesToSave.length,
      entryPoint: generatedFiles.entry,
    });
  } catch (error) {
    // Handle both Error instances and Supabase-style error objects
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    } else {
      errorMessage = String(error) || 'Unknown error';
    }
    const errorStack = error instanceof Error ? error.stack : JSON.stringify(error);

    console.error('Build API error:', {
      message: errorMessage,
      stack: errorStack,
      buildId,
      hasApiKey: !!ANTHROPIC_API_KEY,
      errorType: typeof error,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
    });

    // Mark build as failed if we have a buildId
    if (buildId) {
      try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          await supabase.from('builds').update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          }).eq('id', buildId);

          await supabase.from('build_logs').insert({
            build_id: buildId,
            level: 'error',
            message: `Build failed: ${errorMessage}`,
          });
        }
      } catch (logError) {
        console.error('Failed to log build error:', logError);
      }
    }

    return res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
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
      model: 'claude-sonnet-4-20250514',
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
