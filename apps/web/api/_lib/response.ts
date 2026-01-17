import type { VercelResponse } from '@vercel/node';

export function successResponse(res: VercelResponse, data: any, status = 200) {
  return res.status(status).json(data);
}

export function errorResponse(
  res: VercelResponse,
  message: string,
  status = 500
) {
  return res.status(status).json({ error: message });
}

export function unauthorizedResponse(res: VercelResponse) {
  return errorResponse(res, 'Unauthorized', 401);
}

export function notFoundResponse(res: VercelResponse, resource = 'Resource') {
  return errorResponse(res, `${resource} not found`, 404);
}

export function badRequestResponse(res: VercelResponse, message: string) {
  return errorResponse(res, message, 400);
}
