import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['lib/**/*.test.ts', 'hooks/**/*.test.ts', 'features/**/*.test.ts', 'shared/**/*.test.ts'],
        exclude: ['node_modules', '_legacy_src', 'api', '.next'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
});
