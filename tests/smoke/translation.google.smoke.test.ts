/**
 * Executable form of the authenticated Google smoke gate.
 *
 * The gate logic lives in `scripts/translation-google-smoke.ts` so it is covered
 * by the project typecheck; this file only runs it and turns the report into a
 * pass/fail so the process exit code is meaningful.
 *
 * Run with:
 *   npx vitest run --config vitest.smoke.config.ts
 *
 * Without credentials this FAILS by design. An unconfigured provider cannot
 * prove anything about the real contract, and a silently "passing" gate would be
 * the exact silent-degradation §35 exists to prevent.
 */
import { describe, it } from 'vitest';
import { formatSmokeReport, runTranslationGoogleSmoke } from '../../scripts/translation-google-smoke';

describe('pre-production gate · authenticated Google Cloud Translation v3', () => {
    it('completes every real-contract check', async () => {
        const report = await runTranslationGoogleSmoke();
        // Printed in full: the report contains no secret values by construction.
        console.log(`\n${formatSmokeReport(report)}\n`);

        const failed = report.checks.filter((check) => check.status === 'fail');
        if (failed.length > 0) {
            throw new Error(
                `Smoke gate failed (${failed.length}):\n` +
                    failed.map((check) => `  - ${check.label}: ${check.detail}`).join('\n')
            );
        }
    }, 60_000);
});
