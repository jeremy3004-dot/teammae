import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../_lib/auth';
import { projectsClient } from '../_lib/db';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  badRequestResponse,
} from '../_lib/response';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Verify authentication
    const userId = await verifyAuth(req);

    if (req.method === 'GET') {
      // List all projects for user
      const projects = await projectsClient.list(userId);
      return successResponse(res, { projects });
    }

    if (req.method === 'POST') {
      // Create new project
      const { name, description, type, template_id } = req.body;

      if (!name || !type) {
        return badRequestResponse(res, 'Missing required fields: name, type');
      }

      if (!['web', 'mobile'].includes(type)) {
        return badRequestResponse(res, 'Invalid type. Must be "web" or "mobile"');
      }

      const project = await projectsClient.create(userId, {
        name,
        description,
        type,
        template_id,
      });

      return successResponse(res, { project }, 201);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return unauthorizedResponse(res);
    }
    console.error('Projects API error:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}
