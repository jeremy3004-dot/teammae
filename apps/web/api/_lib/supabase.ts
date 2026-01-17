import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase helper for API routes
 * Creates client inline at request time to avoid module-level initialization issues
 */
export function createSupabaseServer(authToken?: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // If auth token provided, inject it into headers
  if (authToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
