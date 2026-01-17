/**
 * Supabase helper utilities
 */

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return !!(url && key);
}

/**
 * Get current user ID from Supabase session (for server-side)
 */
export async function getCurrentUserId(authHeader?: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { getSupabase } = await import('./index');
    const supabase = getSupabase();

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      return user?.id || null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
}
