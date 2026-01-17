import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../../_lib/auth';
import { projectsClient } from '../../_lib/db';
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

    // Extract project ID from query
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;

    if (!projectId) {
      return notFoundResponse(res, 'Project');
    }

    if (req.method === 'GET') {
      // Get single project
      const project = await projectsClient.get(projectId);

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
      // Update project
      const project = await projectsClient.get(projectId);

      if (!project) {
        return notFoundResponse(res, 'Project');
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return unauthorizedResponse(res);
      }

      const updates = req.body;
      const updatedProject = await projectsClient.update(projectId, updates);

      return successResponse(res, { project: updatedProject });
    }

    if (req.method === 'DELETE') {
      // Delete project
      const project = await projectsClient.get(projectId);

      if (!project) {
        return notFoundResponse(res, 'Project');
      }

      // Verify ownership
      if (project.user_id !== userId) {
        return unauthorizedResponse(res);
      }

      await projectsClient.delete(projectId);

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
