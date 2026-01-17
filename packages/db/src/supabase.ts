import { createClient } from '@supabase/supabase-js';

// Cached client instance
let _supabase: any = null;

// Get or create the Supabase client
export function getSupabase() {
  if (_supabase) return _supabase;

  // Support both VITE_ prefixed (frontend) and non-prefixed (backend) env vars
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_ prefixed versions)');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

