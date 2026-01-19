import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract auth token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        authenticated: false,
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client inline
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Missing Supabase configuration',
        authenticated: false,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify token with Supabase - pass token directly to getUser
    const { data, error } = await supabase.auth.getUser(token);

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/whoami] Error:', errorMessage);

    return res.status(500).json({
      error: errorMessage,
      authenticated: false,
      timestamp: new Date().toISOString(),
    });
  }
}
