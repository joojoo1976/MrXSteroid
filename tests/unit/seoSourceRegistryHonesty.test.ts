/**
 * tests/unit/seoSourceRegistryHonesty.test.ts
 * T8 — Source Health must be derived from the registry, never asserted.
 *
 * The admin dashboard used to hardcode
 *   google_search_console = 95 / Verified
 *   semrush / ahrefs       = 85 / Verified
 * with no adapter credential and no live request behind either number. This
 * suite locks the replacement in place: nothing may report VERIFIED or
 * CONNECTED unless a real execution was recorded, and every credentialed
 * provider must state the exact dependency that is missing.
 */
import { describe, it, expect } from 'vitest';

import {
    sourceRegistry,
    getSourceHealthSummary,
} from '../../server/seo/sources/registry';

describe('T8 · the registry never overstates its own health', () => {
    const health = sourceRegistry.getSourceHealth();

    it('exposes at least the known providers', () => {
        expect(health.length).toBeGreaterThan(0);
        const providers = health.map((s) => s.provider);
        expect(providers).toEqual(expect.arrayContaining(['google_search_console']));
    });

    it('reports ZERO verified and ZERO connected sources', () => {
        // This is the assertion that would have failed against the old
        // hardcoded dashboard. Nothing has completed a live request from this
        // codebase, so nothing may claim otherwise.
        const summary = getSourceHealthSummary();
        expect(summary.VERIFIED).toBe(0);
        expect(summary.CONNECTED).toBe(0);
        expect(sourceRegistry.getRuntimeExecutableSources()).toHaveLength(0);
    });

    it('uses only the seven permitted statuses', () => {
        const allowed = new Set([
            'PLANNED',
            'IMPLEMENTED',
            'CONFIGURED',
            'CONNECTED',
            'VERIFIED',
            'FAILED',
            'DISABLED',
        ]);
        for (const s of health) {
            expect(allowed.has(s.status)).toBe(true);
        }
    });

    it('states an exact reason for every credentialed provider that cannot run', () => {
        for (const s of health) {
            if (s.auth_required && !s.auth_present) {
                // A blocked source must say WHY, in words — never a number and
                // never a vague "not ready".
                expect(typeof s.blocked_reason).toBe('string');
                expect((s.blocked_reason ?? '').length).toBeGreaterThan(10);
            }
        }
    });

    it('keeps paid providers DISABLED rather than pretending they exist', () => {
        for (const p of ['ahrefs', 'semrush', 'similarweb']) {
            const info = sourceRegistry.getSourceStatusInfo(p);
            if (!info) continue; // not registered is also acceptable
            expect(info.status).toBe('DISABLED');
            expect(info.blocked_reason).toBeTruthy();
        }
    });

    it('never attaches a fabricated confidence or quality score', () => {
        for (const s of health) {
            const row = s as unknown as Record<string, unknown>;
            expect(row['confidence']).toBeUndefined();
            expect(row['quality']).toBeUndefined();
            expect(row['reliability']).toBeUndefined();
            expect(row['score']).toBeUndefined();
        }
    });

    it('returns copies so a caller cannot mutate registry state', () => {
        const a = sourceRegistry.getSourceHealth();
        const b = sourceRegistry.getSourceHealth();
        expect(a).not.toBe(b);
        a[0].status = 'VERIFIED';
        expect(sourceRegistry.getSourceHealth()[0].status).not.toBe('VERIFIED');
    });

    it('declares a config origin for every registered source', () => {
        // Every source must say where it comes from, so an operator can find
        // the implementation. Where no implementation exists, the config says
        // so explicitly rather than being silently empty.
        for (const s of health) {
            expect(s.provider.length).toBeGreaterThan(0);
            const config = (s.config ?? {}) as Record<string, unknown>;
            const origin = config['origin'] ?? config['adapter_file'];
            if (origin === undefined) {
                // No implementation yet: the entry must still carry SOME
                // declared config so the dashboard can render a reason.
                expect(Object.keys(config).length).toBeGreaterThan(0);
            } else {
                expect(typeof origin).toBe('string');
            }
        }
    });
});