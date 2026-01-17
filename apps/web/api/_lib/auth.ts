import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

/**
 * Verify JWT and extract user ID from Supabase auth token
 */
export async function verifyAuth(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Create Supabase client to verify the JWT
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.getUser(token);

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
