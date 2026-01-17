import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Missing Supabase configuration',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
    }

    // Create a fresh Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the auth token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token using v2 pattern
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: userData, error: authError } = await supabaseWithAuth.auth.getUser();

    if (authError || !userData.user) {
      return res.status(401).json({
        error: 'Invalid token',
        authError: authError?.message
      });
    }

    const userId = userData.user.id;

    // Try to list projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      return res.status(500).json({
        error: 'Database query failed',
        message: projectsError.message,
        code: projectsError.code,
        details: projectsError.details,
      });
    }

    return res.status(200).json({
      success: true,
      userId,
      projects: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
