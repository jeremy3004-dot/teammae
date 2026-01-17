import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './_lib/auth';
import { getSupabase } from '@teammae/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const userId = await verifyAuth(req);

    // Check if user exists in public.users
    const { data: publicUser, error: publicUserError } = await getSupabase()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Check if user exists in auth.users
    const { data: authSession } = await getSupabase().auth.getSession();

    // Try to list projects
    const { data: projects, error: projectsError } = await getSupabase()
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    return res.status(200).json({
      userId,
      publicUser: publicUser || null,
      publicUserError: publicUserError?.message || null,
      authSession: authSession?.session?.user?.email || null,
      projects: projects || [],
      projectsError: projectsError?.message || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
