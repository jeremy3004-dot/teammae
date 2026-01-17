export default function handler(req: any, res: any) {
  return res.status(200).json({
    ping: 'pong',
    timestamp: new Date().toISOString(),
  });
}
