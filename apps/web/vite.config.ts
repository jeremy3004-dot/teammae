import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only include dev server API plugin in dev mode, not during build
    ...(command === 'serve' ? [{
      name: 'mae-api',
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (req.url === '/api/mae/build' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const { maeBuildHandler } = await import('./server/api');
                const parsedBody = JSON.parse(body);
                req.body = parsedBody;

                await maeBuildHandler(req as any, res as any, next);
              } catch (error) {
                console.error('Vite middleware error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'Internal server error',
                  details: error instanceof Error ? error.message : String(error)
                }));
              }
            });
          } else {
            next();
          }
        });
      },
    }] : []),
  ],
  server: {
    port: 3000,
  },
  // Handle workspace CommonJS packages
  optimizeDeps: {
    include: ['@teammae/db', '@teammae/mae-core', '@teammae/types', '@teammae/build-pipeline'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@teammae/],
      transformMixedEsModules: true,
    },
  },
}));
