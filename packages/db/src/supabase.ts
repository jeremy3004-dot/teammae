import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid errors when env vars not set
let _supabase: any = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  // Support both VITE_ prefixed (frontend) and non-prefixed (backend) env vars
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_ prefixed versions)');
  }

  _supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export for compatibility (will throw if not configured)
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabase()[prop];
  },
});
