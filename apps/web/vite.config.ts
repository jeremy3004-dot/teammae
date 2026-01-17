import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API requests to Vercel dev server in local development
    // Run `vercel dev` in parallel with `pnpm dev` for local testing
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Only include packages actually imported by client code
  optimizeDeps: {
    include: ['@teammae/types'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@teammae/],
      transformMixedEsModules: true,
    },
  },
});
