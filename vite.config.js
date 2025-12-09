import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        // Create dist directory if it doesn't exist
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        // Copy 404.html to dist after build
        copyFileSync('public/404.html', 'dist/404.html');
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: false, // Disable minification temporarily to debug
  },
  optimizeDeps: {
    force: true, // Force re-optimization
  },
  server: {
    fs: {
      strict: true,
    },
  },
});

