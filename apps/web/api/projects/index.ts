import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract and verify auth token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client inline
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify auth
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = authData.user.id;

    // Handle GET - List all projects for user
    if (req.method === 'GET') {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Projects list error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ projects: projects || [] });
    }

    // Handle POST - Create new project
    if (req.method === 'POST') {
      const { name, description, type, template_id } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Missing required fields: name, type' });
      }

      if (!['web', 'mobile'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be "web" or "mobile"' });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          description,
          type,
          template_id,
          metadata: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Project create error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ project });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/projects] Error:', errorMessage);

    return res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
