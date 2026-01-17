import type { VercelRequest, VercelResponse } from '@vercel/node';
import { safeHandler } from './_lib/safe-handler.js';
import { createSupabaseServer } from './_lib/supabase.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract auth token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid authorization header',
      authenticated: false,
    });
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify token with Supabase
  const supabase = createSupabaseServer(token);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      authenticated: false,
      details: error?.message,
    });
  }

  // Return user info
  return res.status(200).json({
    authenticated: true,
    userId: data.user.id,
    email: data.user.email,
    timestamp: new Date().toISOString(),
  });
}

export default safeHandler(handler, '/api/whoami');
