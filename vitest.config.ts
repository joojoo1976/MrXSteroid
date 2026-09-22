import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    test: {
        // Layer-5 UI tests run in a dedicated jsdom project so the node
        // project never touches `window` (docs/tool-stack.md, known gap #1).
        projects: [
            {
                resolve: {
                    alias: {
                        '@': path.resolve(__dirname),
                    },
                },
                test: {
                    name: 'node',
                    environment: 'node',
                    include: [
                        'lib/**/*.test.ts',
                        'hooks/**/*.test.ts',
                        'features/**/*.test.ts',
                        'shared/**/*.test.ts',
                        'app/**/*.test.ts',
                        'server/**/*.test.ts',
                        'tests/**/*.test.ts',
                    ],
                    exclude: ['node_modules', '_legacy_src', '.next'],
                },
            },
            {
                resolve: {
                    alias: {
                        '@': path.resolve(__dirname),
                    },
                },
                esbuild: {
                    // tsconfig uses `jsx: preserve` for Next.js; tests need the
                    // automatic runtime so JSX compiles without `React` global.
                    jsx: 'automatic',
                },
                test: {
                    name: 'jsdom',
                    environment: 'jsdom',
                    // `vitest.setup.ts` touches `window`; it must run in this
                    // project ONLY, never in the node project.
                    setupFiles: ['./vitest.setup.ts'],
                    include: [
                        'components/**/*.test.tsx',
                        'components/**/*.test.ts',
                    ],
                    exclude: ['node_modules', '_legacy_src', '.next'],
                },
            },
        ],
        exclude: ['node_modules', '_legacy_src', '.next'],
    },
});
