import type { VercelRequest, VercelResponse } from '@vercel/node';
import { successResponse } from './_lib/response';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TeamMAE API',
  });
}
