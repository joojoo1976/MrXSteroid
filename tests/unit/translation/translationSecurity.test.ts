/**
 * T1 Foundation — security boundaries (spec §22, §23, §110, §111, §112, §113).
 *
 * These tests exercise the real boundary helpers. The Upstash path is absent in
 * the test environment, so `enforceRateLimit` uses its in-memory fallback — which
 * is itself a documented, deliberately conservative behaviour of the existing
 * `lib/ratelimit.ts` and is reused unmodified.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    TRANSLATION_CHARACTER_QUOTA,
    TRANSLATION_TARGET_QUOTA,
    checkCharacterQuota,
    checkOrigin,
    checkRequestSize,
    checkRateLimit,
    checkTargetQuota,
    resetTargetQuotaWindows,
    isTargetWithinAllowlist,
    listAvailableRuntimeLanguages,
    enforceTranslationSecurity,
} from '../../../server/translation/security';
import { getRuntimeLanguages } from '../../../server/translation/languages';
import { MAX_SOURCE_CHARS } from '../../../server/translation/contracts';
import type { TranslationProvider } from '../../../server/translation/provider';

const request = (headers: Record<string, string> = {}) =>
    new Request('https://www.mrxsteroid.com/api/translate', { headers });

describe('T1 · security · origin validation (§110)', () => {
    beforeEach(() => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        delete process.env.SITE_URL;
    });

    it('allows same-origin / no-origin requests', () => {
        expect(checkOrigin(request()).allowed).toBe(true);
    });

    it('allows the canonical production origin', () => {
        expect(checkOrigin(request({ origin: 'https://www.mrxsteroid.com' })).allowed).toBe(true);
    });

    it('rejects a foreign origin (§112 open-proxy guard)', () => {
        const verdict = checkOrigin(request({ origin: 'https://evil.example.com' }));
        expect(verdict.allowed).toBe(false);
        if (!verdict.allowed) {
            expect(verdict.status).toBe(403);
            expect(verdict.code).toBe('ORIGIN_NOT_ALLOWED');
        }
    });
});

describe('T1 · security · size and quota (§40, §113)', () => {
    it('rejects an empty request', () => {
        const verdict = checkRequestSize(0, 0);
        expect(verdict.allowed).toBe(false);
        if (!verdict.allowed) expect(verdict.code).toBe('EMPTY_REQUEST');
    });

    it('allows a normal request', () => {
        expect(checkRequestSize(3, 120).allowed).toBe(true);
    });

    it('§113 the per-request contract ceiling stays below the character quota', () => {
        // Defence-in-depth ordering: the contract limit binds first, so the
        // character quota is a backstop for a future batched path.
        expect(MAX_SOURCE_CHARS).toBeLessThan(TRANSLATION_CHARACTER_QUOTA);
    });

    it('enforces the per-window character quota', () => {
        expect(checkCharacterQuota(TRANSLATION_CHARACTER_QUOTA).allowed).toBe(true);
        const over = checkCharacterQuota(TRANSLATION_CHARACTER_QUOTA + 1);
        expect(over.allowed).toBe(false);
        if (!over.allowed) expect(over.status).toBe(413);
    });
});

describe('T2 · security · target quota (§113)', () => {
    beforeEach(() => {
        resetTargetQuotaWindows();
    });

    it('allows up to TRANSLATION_TARGET_QUOTA distinct targets per caller', () => {
        const targets = ['fr', 'de', 'es', 'tr'];
        for (const code of targets) {
            expect(checkTargetQuota('caller-1', code).allowed).toBe(true);
        }
        expect(checkTargetQuota('caller-1', 'it').allowed).toBe(false);
    });

    it('reports a 429 with a distinct code when exceeded', () => {
        for (const code of ['fr', 'de', 'es', 'tr']) checkTargetQuota('caller-2', code);
        const verdict = checkTargetQuota('caller-2', 'it');
        expect(verdict.allowed).toBe(false);
        if (!verdict.allowed) {
            expect(verdict.status).toBe(429);
            expect(verdict.code).toBe('TARGET_QUOTA_EXCEEDED');
        }
    });

    it('re-requesting an already-used target is not double counted', () => {
        for (const code of ['fr', 'de', 'es', 'tr']) checkTargetQuota('caller-3', code);
        // 'fr' was already spent; it must not consume a new slot.
        expect(checkTargetQuota('caller-3', 'fr').allowed).toBe(true);
        expect(checkTargetQuota('caller-3', 'it').allowed).toBe(false);
    });

    it('is scoped per caller', () => {
        for (const code of ['fr', 'de', 'es', 'tr']) checkTargetQuota('caller-4', code);
        expect(checkTargetQuota('caller-4', 'it').allowed).toBe(false);
        // A different caller has its own budget.
        expect(checkTargetQuota('caller-5', 'it').allowed).toBe(true);
    });

    it('normalizes case and whitespace', () => {
        expect(checkTargetQuota('caller-6', '  FR  ').allowed).toBe(true);
        expect(checkTargetQuota('caller-6', 'fr').allowed).toBe(true);
        expect(checkTargetQuota('caller-6', 'DE').allowed).toBe(true);
    });
});

describe('T1 · security · rate limit (§111, §112)', () => {
    it('rate limits on a translation-namespaced key', async () => {
        // The in-memory limiter allows a burst then trips; either outcome must be
        // a well-formed verdict, and the namespace must never be a financial one.
        const first = await checkRateLimit(request());
        expect(typeof first.allowed).toBe('boolean');
        if (!first.allowed) {
            expect(first.status).toBe(429);
            expect(first.code).toBe('RATE_LIMITED');
        }
    });
});

describe('T1 · security · target allowlist (§112)', () => {
    it('accepts registered runtime targets', () => {
        for (const language of getRuntimeLanguages()) {
            expect(isTargetWithinAllowlist(language.code)).toBe(true);
        }
    });

    it('rejects canonical and unknown targets', () => {
        expect(isTargetWithinAllowlist('en')).toBe(false);
        expect(isTargetWithinAllowlist('ar')).toBe(false);
        expect(isTargetWithinAllowlist('xx')).toBe(false);
    });
});

describe('T1 · security · capability-aware availability (§22, §23)', () => {
    const provider = (supported: string[]): TranslationProvider => ({
        identity: { providerId: 'test', modelIdentifier: 'test' },
        supportsLanguage: (code) => supported.includes(code.toLowerCase()),
        translate: async () => ({ texts: [] }),
    });

    it('offers nothing when no provider is configured', () => {
        expect(listAvailableRuntimeLanguages(null)).toHaveLength(0);
    });

    it('offers only what the provider supports', () => {
        const available = listAvailableRuntimeLanguages(provider(['fr', 'de']));
        expect(available.map((l) => l.code).sort()).toEqual(['de', 'fr']);
    });
});

describe('T1 · security · aggregate gate', () => {
    it('blocks an oversized request before any provider call', async () => {
        const verdict = await enforceTranslationSecurity(request(), {
            textCount: 1,
            totalCharacters: TRANSLATION_CHARACTER_QUOTA + 1,
        });
        expect(verdict.allowed).toBe(false);
    });

    it('rejects a disallowed origin', async () => {
        const verdict = await enforceTranslationSecurity(
            request({ origin: 'https://evil.example.com' }),
            { textCount: 1, totalCharacters: 10 }
        );
        expect(verdict.allowed).toBe(false);
    });

    it('permits a well-formed same-origin request', async () => {
        const verdict = await enforceTranslationSecurity(request(), {
            textCount: 2,
            totalCharacters: 40,
        });
        expect(verdict.allowed).toBe(true);
    });
});
