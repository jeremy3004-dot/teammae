import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client inline
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    // Create client with auth headers for RLS to work on subsequent queries
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify auth - pass token directly to getUser for proper TypeScript types
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = authData.user.id;

    // Extract project ID from query
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;

    if (!projectId) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify project exists and user owns it
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get all files for project
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('path', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ files: files || [] });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      // Save/upsert files
      const { files } = req.body;

      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid files array' });
      }

      // Validate file structure
      for (const file of files) {
        if (!file.path || typeof file.path !== 'string') {
          return res.status(400).json({ error: 'Each file must have a path' });
        }
        if (!file.content || typeof file.content !== 'string') {
          return res.status(400).json({ error: 'Each file must have content' });
        }
      }

      // Save files (upsert)
      const filesToSave = files.map((f: any) => ({
        project_id: projectId,
        path: f.path,
        content: f.content,
        file_type: f.file_type || 'other',
        size_bytes: f.content.length,
        checksum: '',
        version: 1,
      }));

      const { data: savedFiles, error } = await supabase
        .from('files')
        .upsert(filesToSave, {
          onConflict: 'project_id,path',
        })
        .select();

      if (error) throw error;
      return res.status(200).json({ files: savedFiles || [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Files API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
