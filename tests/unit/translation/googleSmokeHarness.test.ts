/**
 * Proves the pre-production smoke HARNESS is correct, without credentials and
 * without a single network call.
 *
 * This matters: the real gate cannot run until the owner supplies a Google
 * credential, so without this test the gate's own logic would ship unverified.
 * Every provider interaction is replaced through the documented injection seam,
 * and the assertions below are about the HARNESS — not about Google's service.
 *
 * The authenticated gate itself is `tests/smoke/translation.google.smoke.test.ts`
 * and is deliberately excluded from the ordinary suite.
 */
import { describe, it, expect, beforeEach } from 'vitest';

import {
    formatSmokeReport,
    runTranslationGoogleSmoke,
    type SmokeCheck,
    type SmokeOptions,
} from '../../../scripts/translation-google-smoke';
import { GoogleAdvancedTranslationProvider, GOOGLE_GENERAL_NMT_MODEL } from '../../../server/translation/googleProvider';
import { TranslationProviderError, type TranslationProvider } from '../../../server/translation/provider';
import { TRANSLATION_ENGINE_VERSION, TRANSLATION_GLOSSARY_VERSION } from '../../../server/translation/contracts';
import { resetTargetQuotaWindows } from '../../../server/translation/security';

const VERIFIED = ['fr', 'de', 'es', 'tr', 'it', 'pt'];

/**
 * Each run gets its own per-IP rate-limit bucket (§111) and a fresh target-quota
 * window (§113), so repeating the harness in one process cannot throttle itself
 * into a false RATE_LIMITED result.
 */
let runCounter = 0;
function nextClientIp(): string {
    runCounter += 1;
    return `203.0.113.${runCounter}`;
}

beforeEach(() => {
    resetTargetQuotaWindows();
});

/**
 * A REAL GoogleAdvancedTranslationProvider whose two network-touching methods
 * are replaced. It must be a genuine instance, because the production
 * `resolveVerifiedTargets` narrows with `instanceof` — a plain object stand-in
 * would be treated as an unknown provider and claim no capability at all.
 * Constructing it performs no I/O, and both overridden methods are the only
 * paths that would reach the network.
 */
function stubProvider(
    translateImpl: (input: { targetLanguage: string; texts: readonly string[] }) => Promise<{ texts: string[] }>,
    verified: ReadonlySet<string> = new Set(VERIFIED)
): GoogleAdvancedTranslationProvider {
    const provider = new GoogleAdvancedTranslationProvider({
        projectId: 'stub-project',
        location: 'global',
        accessToken: 'stub-access-token',
        modelIdentifier: GOOGLE_GENERAL_NMT_MODEL,
    });
    const mutable = provider as {
        translate: (input: { targetLanguage: string; texts: readonly string[] }) => Promise<{ texts: string[] }>;
        discoverSupportedTargets: (force?: boolean) => Promise<ReadonlySet<string>>;
        identity: { providerId: string; modelIdentifier: string };
    };
    mutable.translate = translateImpl;
    mutable.discoverSupportedTargets = async () => verified;
    return provider;
}

/** Replaces the identity a provider reports, to prove the gate notices. */
function withIdentity(
    provider: GoogleAdvancedTranslationProvider,
    identity: { providerId: string; modelIdentifier: string }
): GoogleAdvancedTranslationProvider {
    (provider as { identity: { providerId: string; modelIdentifier: string } }).identity = identity;
    return provider;
}

function faultProvider(code: 'NOT_CONFIGURED' | 'PROVIDER_ERROR'): TranslationProvider {
    return {
        identity: { providerId: 'google-cloud-translation-advanced', modelIdentifier: 'general/nmt' },
        supportsLanguage: () => true,
        translate: async () => {
            throw new TranslationProviderError(code, `simulated ${code}`);
        },
    };
}

async function runWithStub(
    translateImpl: (input: { targetLanguage: string; texts: readonly string[] }) => Promise<{ texts: string[] }>
) {
    return runTranslationGoogleSmoke(stubOptions(translateImpl));
}

function stubOptions(
    translateImpl: (input: { targetLanguage: string; texts: readonly string[] }) => Promise<{ texts: string[] }>,
    verified?: ReadonlySet<string>,
    identity?: { providerId: string; modelIdentifier: string }
): SmokeOptions {
    return {
        createProvider: () => {
            const provider = stubProvider(translateImpl, verified);
            return identity ? withIdentity(provider, identity) : provider;
        },
        createFaultProviders: () => ({
            invalidCredentials: faultProvider('NOT_CONFIGURED'),
            rejectedModel: faultProvider('PROVIDER_ERROR'),
        }),
        clientIp: nextClientIp(),
    };
}

function checkOf(checks: readonly SmokeCheck[], id: string): SmokeCheck {
    const found = checks.find((check) => check.id === id);
    if (!found) throw new Error(`no check recorded with id '${id}'`);
    return found;
}

describe('pre-production gate · harness self-test (no network, no credentials)', () => {
    it('passes every contract check against a well-behaved provider', async () => {
        const report = await runWithStub(async (input) => ({
            texts: input.texts.map(() => 'Bienvenue a bord. Votre plan de coaching est pret.'),
        }));

        const failures = report.checks.filter((check) => check.status === 'fail');
        expect(failures.map((f) => `${f.id}: ${f.detail}`)).toEqual([]);

        expect(checkOf(report.checks, 'capability.discovery').status).toBe('pass');
        expect(checkOf(report.checks, 'capability.intersection').status).toBe('pass');
        expect(checkOf(report.checks, 'capability.route_listing').status).toBe('pass');
        expect(checkOf(report.checks, 'translation.response_mapping').status).toBe('pass');
        expect(checkOf(report.checks, 'translation.identity').status).toBe('pass');
        expect(checkOf(report.checks, 'reject.unverified_target').status).toBe('pass');
        expect(checkOf(report.checks, 'reject.canonical_target').status).toBe('pass');
        expect(checkOf(report.checks, 'reject.unknown_target').status).toBe('pass');
        expect(checkOf(report.checks, 'error.mapping.invalid_credentials').status).toBe('pass');
        expect(checkOf(report.checks, 'error.mapping.rejected_model').status).toBe('pass');
        expect(checkOf(report.checks, 'error.mapping.oversize').status).toBe('pass');
    });

    it('never reports an injected run as authenticated', async () => {
        const report = await runWithStub(async (input) => ({ texts: input.texts.map(() => 'x') }));
        // A stub must not be able to masquerade as vendor evidence.
        expect(report.authenticated).toBe(false);
        expect(checkOf(report.checks, 'preflight.injected').status).toBe('skip');
    });

    it('catches a provider that echoes the source untranslated', async () => {
        const report = await runTranslationGoogleSmoke(stubOptions(async (input) => ({ texts: [...input.texts] })));

        const mapping = checkOf(report.checks, 'translation.response_mapping');
        expect(mapping.status).toBe('fail');
        expect(mapping.detail).toMatch(/untranslated/i);
    });

    it('catches a response carrying HTML entities', async () => {
        const report = await runTranslationGoogleSmoke(
            stubOptions(async (input) => ({ texts: input.texts.map(() => 'Bienvenue &#39;c&#39;est ici') }))
        );

        expect(checkOf(report.checks, 'translation.response_mapping').status).toBe('fail');
    });

    it('catches a wrong identity so a cache cannot be poisoned', async () => {
        const report = await runTranslationGoogleSmoke(
            stubOptions(async (input) => ({ texts: input.texts.map(() => 'Bienvenue a bord.') }), undefined, {
                providerId: 'some-other-provider',
                modelIdentifier: 'v3',
            })
        );

        const identity = checkOf(report.checks, 'translation.identity');
        expect(identity.status).toBe('fail');
        expect(identity.detail).toMatch(/providerId/);
        expect(identity.detail).toMatch(/modelIdentifier/);
    });

    it('catches a provider that verifies nothing, and fails closed', async () => {
        const report = await runTranslationGoogleSmoke(stubOptions(async (input) => ({ texts: input.texts.map(() => 'x') }), new Set()));

        expect(checkOf(report.checks, 'capability.discovery').status).toBe('fail');
        // Nothing may be offered, and no translation may be attempted.
        expect(report.translation).toBeUndefined();
        expect(report.authenticated).toBe(false);
    });

    it('exposes the exact engine and glossary versions the cache key folds in', async () => {
        const report = await runWithStub(async (input) => ({
            texts: input.texts.map(() => 'Bienvenue a bord.'),
        }));
        const identity = report.translation?.identity;
        expect(identity?.engineVersion).toBe(TRANSLATION_ENGINE_VERSION);
        expect(identity?.glossaryVersion).toBe(TRANSLATION_GLOSSARY_VERSION);
    });

    it('renders a report that contains no secret material', async () => {
        const report = await runWithStub(async (input) => ({
            texts: input.texts.map(() => 'Bienvenue a bord.'),
        }));
        const rendered = formatSmokeReport(report);
        // Names and shape labels only.
        expect(rendered).toContain('GOOGLE_CLOUD_PROJECT_ID');
        expect(rendered).not.toMatch(/private_key|BEGIN [A-Z ]*PRIVATE KEY/);
        expect(rendered).not.toMatch(/ya29\./);
    });
});
