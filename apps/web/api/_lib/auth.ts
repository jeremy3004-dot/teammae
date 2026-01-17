import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// In Vercel serverless functions, use non-VITE_ prefixed env vars
// VITE_ prefix is only for frontend build-time variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

/**
 * Verify JWT and extract user ID from Supabase auth token
 */
export async function verifyAuth(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Create Supabase client with the user's JWT in the Authorization header
  // In Supabase v2, we set the token via headers, then call getUser() without arguments
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }

  return data.user.id;
}

/**
 * Optional auth - returns userId or null without throwing
 */
export async function optionalAuth(req: VercelRequest): Promise<string | null> {
  try {
    return await verifyAuth(req);
  } catch {
    return null;
  }
}
