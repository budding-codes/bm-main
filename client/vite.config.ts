import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
      },
    },
  },
});
