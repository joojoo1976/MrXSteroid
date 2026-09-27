/**
 * Isolated runner for the authenticated Google smoke gate.
 *
 * Deliberately NOT part of `vitest.config.ts`: this gate performs real
 * network calls against a paid vendor API and must never be swept into the
 * ordinary unit/UI suite, where it would run in CI without credentials.
 *
 *   npx vitest run --config vitest.smoke.config.ts
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    test: {
        name: 'translation-smoke',
        environment: 'node',
        include: ['tests/smoke/**/*.test.ts'],
        exclude: ['node_modules', '.next', '_legacy_src'],
        // A real vendor round-trip plus the OAuth exchange is slower than a unit
        // test; the default 5s would abort a legitimate first mint.
        testTimeout: 60_000,
        hookTimeout: 60_000,
    },
});
