import { safeHandler } from './_lib/safe-handler.js';

async function handler(req: any, res: any) {
  return res.status(200).json({
    test: 'safe-handler-works',
    timestamp: new Date().toISOString(),
  });
}

export default safeHandler(handler, '/api/test-safe-handler');
