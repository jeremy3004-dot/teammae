import { createClient } from '@supabase/supabase-js';

export default function handler(req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  return res.status(200).json({
    test: 'supabase-import-works',
    hasClient: !!supabase,
    timestamp: new Date().toISOString(),
  });
}
