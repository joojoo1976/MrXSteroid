import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // Server restart trigger: logic.ts refactor
    esbuild: {
        drop: ['console', 'debugger'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor libraries into separate chunks
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-accordion',
                        '@radix-ui/react-toast',
                        '@radix-ui/react-select',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-tooltip',
                    ],
                    'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                    'vendor-charts': ['recharts'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-ai': ['openai', '@google/generative-ai'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
})
