import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '@teammae/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Test database connection by querying templates (public table)
    const { data, error } = await getSupabase()
      .from('templates')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        code: error.code,
        details: error.details,
      });
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
