import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../../_lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
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

    // Verify project exists and user owns it
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    if (!project) {
      return notFoundResponse(res, 'Project');
    }

    if (project.user_id !== userId) {
      return unauthorizedResponse(res);
    }

    if (req.method === 'GET') {
      // Get all files for project
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('path', { ascending: true });

      if (error) throw error;
      return successResponse(res, { files: files || [] });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      // Save/upsert files
      const { files } = req.body;

      if (!Array.isArray(files) || files.length === 0) {
        return badRequestResponse(res, 'Missing or invalid files array');
      }

      // Validate file structure
      for (const file of files) {
        if (!file.path || typeof file.path !== 'string') {
          return badRequestResponse(res, 'Each file must have a path');
        }
        if (!file.content || typeof file.content !== 'string') {
          return badRequestResponse(res, 'Each file must have content');
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
      return successResponse(res, { files: savedFiles || [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return unauthorizedResponse(res);
    }
    console.error('Files API error:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}
