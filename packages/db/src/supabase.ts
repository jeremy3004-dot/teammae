import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid errors when env vars not set
let _supabase: any = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
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
