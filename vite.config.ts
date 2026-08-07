/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the deployed Vercel serverless functions so the
    // checkout (create-invoice, callback, webhook) works during local dev.
    proxy: {
      '/api': {
        target: 'https://mrxsteroid.vercel.app',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          'charts': ['recharts'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'animations': ['framer-motion'],
          'auth': ['@supabase/supabase-js', 'crypto-js'],
          'payments': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Minification with Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs except error/warn
        drop_console: ['log', 'debug', 'info'],
        drop_debugger: true,
        // Remove pure function calls
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    // Disable source maps for production (smaller bundle)
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
    // Output directory
    outDir: 'dist',
    // Assets directory
    assetsDir: 'assets',
    // CSS code splitting
    cssCodeSplit: true,
    // Asset size limit
    assetsInlineLimit: 4096,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vercel/speed-insights'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
});