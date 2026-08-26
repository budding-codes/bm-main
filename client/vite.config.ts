import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React-bound packages must share the vendor-react chunk to avoid a
            // circular dependency with vendor-editor (e.g. use-sync-external-store
            // calling useState before vendor-react has finished initializing).
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('use-sync-external-store')
            ) {
              return 'vendor-react';
            }
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'vendor-editor';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
          }
        },
      },
    },
    target: 'es2020',
    cssMinify: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error:
                    'API server is not running. Start it from the server folder: npm run dev',
                  code: 'BACKEND_UNAVAILABLE'
                })
              );
            }
          });
        }
      },
      '/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    proxy: {
      '/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
