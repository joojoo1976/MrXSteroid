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
                    exclude: [
                        'node_modules',
                        '_legacy_src',
                        '.next',
                        // DOM-dependent suites use the `.dom.test.ts` suffix and are
                        // claimed by the `jsdom` project below. Without this they
                        // would run twice: once here without a DOM, once there.
                        '**/*.dom.test.ts',
                        // The authenticated Google gate makes real, billable calls to
                        // a vendor API and needs a credential. It must never be swept
                        // into the ordinary suite (it would fail in CI with no
                        // secret). Run it explicitly:
                        //   npx vitest run --config vitest.smoke.config.ts
                        'tests/smoke/**',
                        // Handled by the `financial-integration` project below,
                        // which carries a per-suite timeout for the heavy
                        // webhook/ledger suites.
                        'tests/integration/webhook*.test.ts',
                        'tests/integration/captureToLedgerIntegrity.test.ts',
                        'tests/integration/reconciliationRunner.test.ts',
                        'tests/adversarial/**/*.test.ts',
                    ],
                },
            },
            {
                resolve: {
                    alias: {
                        '@': path.resolve(__dirname),
                    },
                },
                test: {
                    name: 'financial-integration',
                    environment: 'node',
                    // These suites drive the real fulfillment orchestration
                    // (webhook -> §6.3 -> ledger -> splits -> entitlement) behind
                    // chain-aware Supabase fakes. Measured wall clock per file is
                    // 9-13s, dominated by the module-graph import that the FIRST
                    // test in each file pays in full. Under parallel load that
                    // single import can exceed the 5s default and the file reports
                    // a spurious "Test timed out" on a test that is not slow.
                    // The budget is scoped to THIS project only — the global
                    // default is deliberately left at 5000ms.
                    testTimeout: 30_000,
                    hookTimeout: 30_000,
                    include: [
                        'tests/integration/webhook*.test.ts',
                        'tests/integration/captureToLedgerIntegrity.test.ts',
                        'tests/integration/reconciliationRunner.test.ts',
                        'tests/adversarial/**/*.test.ts',
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
                        // T3 client integration. DOM-dependent suites are named
                        // `*.dom.test.ts` and claimed here ONLY; the node project
                        // excludes that suffix so they never run without a DOM.
                        'lib/translation/**/*.dom.test.ts',
                        'context/**/*.test.tsx',
                        'shared/ui/**/*.test.tsx',
                    ],
                    exclude: ['node_modules', '_legacy_src', '.next'],
                },
            },
        ],
        exclude: ['node_modules', '_legacy_src', '.next'],
    },
});
