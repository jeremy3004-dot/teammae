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

    // Verify auth and get user ID - pass token directly to getUser for proper TypeScript types
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

    if (req.method === 'GET') {
      // Get single project
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ project });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Get project first to verify ownership
      const { data: project, error: getError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (getError) throw getError;

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Update project
      const updates = req.body;
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;
      return res.status(200).json({ project: updatedProject });
    }

    if (req.method === 'DELETE') {
      // Get project first to verify ownership
      const { data: project, error: getError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (getError) throw getError;

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Project API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
