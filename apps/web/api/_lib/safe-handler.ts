import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Safety wrapper for API handlers
 * Ensures all errors return structured JSON instead of crashing the function
 */
export function safeHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>,
  routeName: string
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error(`[${routeName}] Error:`, {
        message: errorMessage,
        stack: errorStack,
        method: req.method,
        url: req.url,
      });

      // Return structured JSON error instead of crashing
      return res.status(500).json({
        error: errorMessage,
        route: routeName,
        timestamp: new Date().toISOString(),
      });
    }
  };
}
