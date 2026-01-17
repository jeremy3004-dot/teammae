import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../../_lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '../../_lib/response';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Verify authentication
    const userId = await verifyAuth(req);

    // Create Supabase client inline
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Extract project ID from query
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;

    if (!projectId) {
      return notFoundResponse(res, 'Project');
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
        return notFoundResponse(res, 'Project');
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return unauthorizedResponse(res);
      }

      return successResponse(res, { project });
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
        return notFoundResponse(res, 'Project');
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return unauthorizedResponse(res);
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
      return successResponse(res, { project: updatedProject });
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
        return notFoundResponse(res, 'Project');
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return unauthorizedResponse(res);
      }

      // Delete project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;
      return successResponse(res, { success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return unauthorizedResponse(res);
    }
    console.error('Project API error:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}
