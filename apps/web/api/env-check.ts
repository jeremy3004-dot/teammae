import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  return res.status(200).json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasViteSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 20) || 'missing',
    viteSupabaseUrlPrefix: process.env.VITE_SUPABASE_URL?.substring(0, 20) || 'missing',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
