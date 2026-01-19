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
    // Create client with auth headers for RLS to work on subsequent queries
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    console.log('[build] Step 4: Verifying auth');
    // Verify auth - use type assertion to call getUser with token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: authData, error: authError } = await (supabase.auth as any).getUser(token);

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
        // file_type must match DB constraint: 'component', 'page', 'config', 'asset', 'util', 'style', 'other'
        file_type: path.includes('/components/') ? 'component' :
                   path.includes('/pages/') ? 'page' :
                   path.endsWith('.css') ? 'style' :
                   path.endsWith('.json') ? 'config' : 'other',
        size_bytes: content.length,
        checksum: '',
        version: 1,
      })
    );

    console.log('[build] Step 13: Saving files to database:', filesToSave.map(f => f.path));
    console.log('[build] Files to save:', JSON.stringify(filesToSave.map(f => ({ path: f.path, project_id: f.project_id, size: f.size_bytes }))));

    // Use service role key if available to bypass RLS, otherwise use user token
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let dbClient = supabase;

    console.log('[build] Service role key check:', {
      hasKey: !!serviceRoleKey,
      keyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'none',
      keyLength: serviceRoleKey?.length || 0,
    });

    if (serviceRoleKey) {
      console.log('[build] Creating service role client to bypass RLS');
      // Service role key bypasses RLS - must create fresh client with it
      dbClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      console.log('[build] WARNING: No service role key found! RLS will block inserts.');
      console.log('[build] Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables');
    }

    // First, delete existing files for this project
    const { error: deleteError } = await dbClient
      .from('files')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('[build] Failed to delete old files:', deleteError);
      // Continue anyway - might just mean no files existed
    }

    // Then insert the new files
    const { data: savedFiles, error: filesError } = await dbClient
      .from('files')
      .insert(filesToSave)
      .select();

    if (filesError) {
      console.error('[build] Failed to save files:', filesError);
      console.error('[build] Files error details:', JSON.stringify(filesError));
      throw new Error(`Failed to save files: ${filesError.message}`);
    }

    const filesSaved = savedFiles?.length || 0;
    console.log('[build] Step 14: Files saved successfully:', filesSaved);

    if (filesSaved === 0) {
      console.error('[build] CRITICAL: No files were saved! This should not happen.');
      console.error('[build] Insert returned no error but also no rows.');
      console.error('[build] This typically means RLS blocked the insert silently.');
      console.error('[build] Project ID:', projectId);
      console.error('[build] User ID:', userId);

      // Verify the project exists and user owns it
      const { data: verifyProject } = await dbClient
        .from('projects')
        .select('id, user_id')
        .eq('id', projectId)
        .single();

      console.error('[build] Project verification:', verifyProject);

      throw new Error('Files were not saved - RLS may be blocking inserts. Add SUPABASE_SERVICE_ROLE_KEY to environment variables.');
    }

    console.log('[build] Saved file IDs:', savedFiles.map((f: { id: string }) => f.id));

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
      filesSaved: filesSaved,
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
  console.log('[build] Step 10: Starting Claude API call with claude-sonnet-4-20250514');
  const startTime = Date.now();

  const systemPrompt = `You are an expert React code generator. Generate a complete, working React + Tailwind CSS application.

OUTPUT FORMAT - CRITICAL: You MUST use this EXACT format with file markers:

===FILE:src/App.tsx===
import React from 'react';

function App() {
  return (
    <div>Your content here</div>
  );
}

export default App;
===END_FILE===

===FILE:src/index.css===
@tailwind base;
@tailwind components;
@tailwind utilities;
===END_FILE===

REQUIREMENTS:
1. Use React functional components (NO TypeScript types - just plain JavaScript/JSX)
2. Use Tailwind CSS classes for ALL styling
3. Generate COMPLETE, working code - no placeholders or "..."
4. Keep it simple - just src/App.tsx and src/index.css
5. Make sure ALL JSX tags are properly closed
6. Include the default export at the end of App.tsx

IMPORTANT:
- Start each file with ===FILE:path===
- End each file with ===END_FILE===
- Generate complete, runnable code`;

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
          content: `${systemPrompt}\n\nBuild this: ${prompt}`,
        },
      ],
    }),
  });

  console.log(`[build] Step 11: Claude API responded in ${Date.now() - startTime}ms, status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  console.log('[build] Step 12: Parsing Claude response');
  const content = data.content[0].text;

  // Parse the file marker format: ===FILE:path=== ... ===END_FILE===
  const files: Record<string, string> = {};
  const fileRegex = /===FILE:([^=]+)===([\s\S]*?)===END_FILE===/g;

  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    const filePath = match[1].trim();
    const fileContent = match[2].trim();
    files[filePath] = fileContent;
    console.log(`[build] Extracted file: ${filePath} (${fileContent.length} chars)`);
  }

  if (Object.keys(files).length === 0) {
    console.error('[build] No files found in response. Content:', content.substring(0, 500));
    throw new Error('Claude did not return any files in the expected format');
  }

  console.log(`[build] Successfully parsed ${Object.keys(files).length} files`);

  return {
    files,
    entry: 'src/App.tsx',
  };
}
