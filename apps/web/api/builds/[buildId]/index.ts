import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../../_lib/auth';
import { buildsClient } from '../../_lib/db';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const userId = await verifyAuth(req);

    // Extract build ID from query
    const { buildId } = req.query;
    const id = Array.isArray(buildId) ? buildId[0] : buildId;

    if (!id) {
      return notFoundResponse(res, 'Build');
    }

    // Get build
    const build = await buildsClient.get(id);

    if (!build) {
      return notFoundResponse(res, 'Build');
    }

    // Verify ownership
    if (build.user_id !== userId) {
      return unauthorizedResponse(res);
    }

    // Get logs
    const logs = await buildsClient.getLogs(id);

    return successResponse(res, {
      build,
      logs,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return unauthorizedResponse(res);
    }
    console.error('Build status API error:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}
