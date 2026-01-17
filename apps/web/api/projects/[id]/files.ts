import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../../_lib/auth';
import { projectsClient, filesClient } from '../../_lib/db';
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

    if (req.method === 'GET') {
      // Get all files for project
      const files = await filesClient.list(projectId);
      return successResponse(res, { files });
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

      const savedFiles = await filesClient.save(projectId, files);

      return successResponse(res, { files: savedFiles });
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
