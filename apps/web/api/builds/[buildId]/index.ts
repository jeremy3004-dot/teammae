import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify auth - pass token directly to getUser
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = authData.user.id;

    // Extract build ID from query
    const { buildId } = req.query;
    const buildIdStr = Array.isArray(buildId) ? buildId[0] : buildId;

    if (!buildIdStr) {
      return res.status(400).json({ error: 'Missing build ID' });
    }

    // Fetch build record
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .select('*')
      .eq('id', buildIdStr)
      .single();

    if (buildError) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Verify user owns this build
    if (build.user_id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch build logs
    const { data: logs, error: logsError } = await supabase
      .from('build_logs')
      .select('*')
      .eq('build_id', buildIdStr)
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('Failed to fetch build logs:', logsError);
    }

    return res.status(200).json({
      build,
      logs: logs || [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/builds/[buildId]] Error:', errorMessage);

    return res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
