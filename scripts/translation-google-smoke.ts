/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  scripts/translation-google-smoke.ts — PRE-PRODUCTION GATE
 *
 *  One authenticated round-trip against the real Google Cloud Translation v3
 *  endpoint, exercising the SAME provider and the SAME runtime engine the
 *  production route uses (app/api/translate/route.ts → runtime.translateRequest
 *  → GoogleAdvancedTranslationProvider). Nothing here is mocked.
 *
 *  ── Credential handling (hard rules) ───────────────────────────────────────
 *  · Credentials are read ONLY from the existing secret mechanism: the
 *    gitignored dotenv files (.env, .env.local) and the ambient process env.
 *  · No credential value is ever printed, logged, returned, or written to disk.
 *    Only a boolean "present", a character LENGTH, and a coarse KIND label
 *    (service-account JSON vs opaque access token) are ever surfaced.
 *  · This script never writes to a source file, so a value cannot be committed
 *    by running it.
 *  · It refuses to run with NODE_ENV=production.
 *
 *  ── What it proves ────────────────────────────────────────────────────────
 *  1. the deployment is configured at all (fail-closed when it is not)
 *  2. the REAL GetSupportedLanguages discovery path works and intersects the
 *     application registry
 *  3. one REAL authenticated translateText call succeeds, and the response maps
 *     to the contract shape (translatedText + the §33 identity triple)
 *  4. a provider-unverified target is REJECTED, not attempted
 *  5. canonical / unknown targets are rejected locally, before any provider call
 *  6. provider failures map onto typed §35 errors, never a 500
 *
 *  ── How to run ────────────────────────────────────────────────────────────
 *      npx vitest run --config vitest.smoke.config.ts
 *
 *  A dedicated config is used so this gate never joins the ordinary unit/UI
 *  suite. Exit code 0 means every check passed; the runner fails the process on
 *  any failed check.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { config as loadEnvFile } from 'dotenv';

import { TRANSLATION_ENGINE_VERSION, TRANSLATION_GLOSSARY_VERSION } from '../server/translation/contracts';
import { getRuntimeLanguages, getVerifiedRuntimeTargets, validateTargetLanguage } from '../server/translation/languages';
import { GoogleAdvancedTranslationProvider, GOOGLE_GENERAL_NMT_MODEL } from '../server/translation/googleProvider';
import { TranslationProviderError, type TranslationProvider } from '../server/translation/provider';
import { TranslationRuntimeError, translateRequest, listSelectableTargets } from '../server/translation/runtime';

/** Names only. The owner populates these; the script never echoes a value. */
export const REQUIRED_SECRET_NAMES = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_TRANSLATION_CREDENTIALS',
    'GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN',
] as const;

export const OPTIONAL_CONFIG_NAMES = [
    'GOOGLE_CLOUD_TRANSLATION_LOCATION',
    'GOOGLE_CLOUD_TRANSLATION_MODEL',
] as const;

/** Env names that MUST stay empty for this gate to be meaningful. */
const PRODUCTION_MARKERS = ['VERCEL_ENV', 'NODE_ENV'] as const;

export type SmokeCheckStatus = 'pass' | 'fail' | 'skip';

export type SmokeCheck = {
    readonly id: string;
    readonly label: string;
    readonly status: SmokeCheckStatus;
    readonly detail: string;
};

export type SecretPresence = {
    readonly name: string;
    readonly required: boolean;
    readonly present: boolean;
    readonly length: number;
    /** Coarse label only — never the value. */
    readonly kind: 'service-account-json' | 'access-token' | 'project-id' | 'none';
};

export type SmokeReport = {
    readonly startedAt: string;
    readonly authenticated: boolean;
    readonly secrets: readonly SecretPresence[];
    /** Real provider capability data, only present when authenticated. */
    readonly capability?: {
        readonly providerVerifiedCount: number;
        readonly verifiedRuntimeTargets: readonly string[];
        readonly registeredButUnverified: readonly string[];
    };
    /** Real response sample, only present when a real call succeeded. */
    readonly translation?: {
        readonly targetLanguage: string;
        readonly sourceText: string;
        readonly translatedText: string;
        readonly identity: {
            readonly engineVersion: string;
            readonly glossaryVersion: string;
            readonly providerId: string;
            readonly modelIdentifier: string;
        };
    };
    readonly checks: readonly SmokeCheck[];
    readonly passed: number;
    readonly failed: number;
    readonly skipped: number;
};

class Checks {
    private readonly items: SmokeCheck[] = [];

    record(id: string, label: string, status: SmokeCheckStatus, detail: string): void {
        this.items.push({ id, label, status, detail });
    }

    pass(id: string, label: string, detail: string): void {
        this.record(id, label, 'pass', detail);
    }

    fail(id: string, label: string, detail: string): void {
        this.record(id, label, 'fail', detail);
    }

    skip(id: string, label: string, detail: string): void {
        this.record(id, label, 'skip', detail);
    }

    all(): readonly SmokeCheck[] {
        return this.items;
    }
}

/** Loads the existing dotenv secret mechanism. `.env.local` wins over `.env`. */
function loadLocalEnvironment(): void {
    // dotenv never overwrites an already-set variable, so loading .env first and
    // .env.local second reproduces Next.js precedence.
    for (const file of ['.env', '.env.local']) {
        try {
            loadEnvFile({ path: file, override: false, quiet: true });
        } catch {
            // A missing file is normal; ambient process env is still honoured.
        }
    }
}

/** Classifies a credential WITHOUT revealing it. */
function classify(name: string, value: string | undefined): SecretPresence['kind'] {
    if (!value) return 'none';
    if (name === 'GOOGLE_CLOUD_PROJECT_ID') return 'project-id';
    if (name === 'GOOGLE_CLOUD_TRANSLATION_CREDENTIALS') {
        const trimmed = value.trim();
        if (!trimmed.startsWith('{')) return 'none';
        try {
            const parsed = JSON.parse(trimmed) as { private_key?: unknown; client_email?: unknown };
            return parsed.private_key && parsed.client_email ? 'service-account-json' : 'none';
        } catch {
            return 'none';
        }
    }
    return 'access-token';
}

function readSecretPresence(): SecretPresence[] {
    const names = [...REQUIRED_SECRET_NAMES, ...OPTIONAL_CONFIG_NAMES];
    return names.map((name) => {
        const value = process.env[name];
        return {
            name,
            required: (REQUIRED_SECRET_NAMES as readonly string[]).includes(name),
            present: typeof value === 'string' && value.trim().length > 0,
            length: value ? value.length : 0,
            kind: classify(name, value),
        };
    });
}

/**
 * Mirrors the production wiring in app/api/translate/route.ts exactly: the
 * capability set is resolved by `instanceof`-narrowing to the Google adapter,
 * and an unrecognised provider claims nothing. Deliberately NOT widened onto the
 * TranslationProvider interface, so the §26 boundary stays intact.
 */
async function resolveVerifiedTargets(provider: TranslationProvider): Promise<ReadonlySet<string>> {
    if (provider instanceof GoogleAdvancedTranslationProvider) {
        return provider.discoverSupportedTargets();
    }
    return new Set<string>();
}

/** Runtime deps wired to the real provider, exactly as the route wires them. */
function runtimeDeps(
    payload: unknown,
    createProvider: () => TranslationProvider | null,
    clientIp: string = DEFAULT_SMOKE_CLIENT_IP,
    resolve: (provider: TranslationProvider) => Promise<ReadonlySet<string>> = resolveVerifiedTargets
) {
    return {
        // No Origin header: §110 permits same-origin/SSR/CLI callers.
        request: new Request('https://localhost/api/translate', {
            method: 'POST',
            headers: { 'x-forwarded-for': clientIp },
        }),
        payload,
        createProvider,
        resolveVerifiedTargets: resolve,
        clientId: `translation-google-smoke:${clientIp}`,
    };
}

/** Extracts a typed runtime error code without ever surfacing credential text. */
function codeOf(error: unknown): string {
    if (error instanceof TranslationRuntimeError) return error.code;
    if (error instanceof TranslationProviderError) return error.code;
    return `UNEXPECTED:${error instanceof Error ? error.name : typeof error}`;
}

/** Fixed phrase that must actually change under translation. */
const SMOKE_SOURCE = 'Welcome aboard. Your coaching plan is ready.';

/**
 * Injection seam. The DEFAULT is always the real Google adapter over the real
 * secret mechanism; the overrides exist only so a unit test can prove this
 * harness's own logic is correct WITHOUT credentials and WITHOUT network calls.
 *
 * A run that uses an override is reported as `authenticated: false` and its
 * preflight checks are recorded as `skip`, so an injected run can never be
 * mistaken for evidence about the real vendor.
 */
export type SmokeOptions = {
    readonly createProvider?: () => GoogleAdvancedTranslationProvider | null;
    /** Providers used to exercise the failure-mapping checks. */
    readonly createFaultProviders?: () => {
        readonly invalidCredentials: TranslationProvider;
        readonly rejectedModel: TranslationProvider;
    };
    /**
     * Caller identity for the per-IP rate limiter (§111). A real run needs 3
     * counted requests, far under the limit of 10, so the default is stable.
     * Overriding it exists so repeated harness self-tests in ONE process do not
     * throttle each other. TEST-NET-3, reserved for documentation.
     */
    readonly clientIp?: string;
};

const REAL_OPTIONS: SmokeOptions = {};
const DEFAULT_SMOKE_CLIENT_IP = '203.0.113.1';

export async function runTranslationGoogleSmoke(options: SmokeOptions = REAL_OPTIONS): Promise<SmokeReport> {
    const checks = new Checks();
    const startedAt = new Date().toISOString();
    const injected = options.createProvider !== undefined;

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        checks.fail(
            'preflight.environment',
            'Refuses to run against a production environment',
            `NODE_ENV/VERCEL_ENV indicates production (${PRODUCTION_MARKERS.join('/')}); this gate is pre-production only.`
        );
        return finalize(startedAt, false, checks, [], undefined, undefined);
    }

    if (!injected) {
        loadLocalEnvironment();
    }

    const secrets = readSecretPresence();

    if (injected) {
        checks.skip(
            'preflight.injected',
            'Preflight is bypassed',
            'An injected provider is in use, so this run proves the harness logic only — not the real vendor.'
        );
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const credentials = process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS;
        const accessToken = process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN;

        if (!projectId) {
            checks.skip('preflight.project_id', 'GOOGLE_CLOUD_PROJECT_ID is present', 'Bypassed (injected run).');
        } else {
            checks.skip('preflight.project_id', 'GOOGLE_CLOUD_PROJECT_ID is present', 'Bypassed (injected run).');
        }
        if (classify('GOOGLE_CLOUD_TRANSLATION_CREDENTIALS', credentials) === 'service-account-json') {
            checks.skip('preflight.credentials', 'A service-account credential is available', 'Bypassed (injected run).');
        } else if (classify('GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN', accessToken) === 'access-token') {
            checks.skip('preflight.credentials', 'An access token is available', 'Bypassed (injected run).');
        } else {
            checks.skip('preflight.credentials', 'A Google credential is available', 'Bypassed (injected run).');
        }

        return runContractChecks(
            checks,
            startedAt,
            requireInjectedProvider(options),
            options,
            secrets
        );
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const credentials = process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS;
    const accessToken = process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN;

    if (!projectId) {
        checks.fail(
            'preflight.project_id',
            'GOOGLE_CLOUD_PROJECT_ID is present',
            'Required. Not found in the process env, .env, or .env.local.'
        );
    } else {
        checks.pass('preflight.project_id', 'GOOGLE_CLOUD_PROJECT_ID is present', 'Present (value not shown).');
    }

    const credentialKind = classify('GOOGLE_CLOUD_TRANSLATION_CREDENTIALS', credentials);
    if (credentialKind === 'service-account-json') {
        checks.pass(
            'preflight.credentials',
            'A service-account credential is available',
            'Parsed OK: JSON with client_email and private_key. JWT-bearer grant will be used (value not shown).'
        );
    } else if (classify('GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN', accessToken) === 'access-token') {
        checks.pass(
            'preflight.credentials',
            'An access token is available',
            'Present (value not shown). The JWT-bearer service-account grant will NOT be exercised.'
        );
    } else {
        checks.fail(
            'preflight.credentials',
            'A Google credential is available',
            'Neither GOOGLE_CLOUD_TRANSLATION_CREDENTIALS (valid service-account JSON) nor GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN is set.'
        );
    }

    // 1 — provider construction (the route's step 4).
    const provider = createRealProvider();
    if (!provider) {
        checks.fail('preflight.provider', 'Provider is constructible from the environment', 'Factory returned null.');
        return finalize(startedAt, false, checks, secrets, undefined, undefined);
    }
    checks.pass(
        'preflight.provider',
        'Provider is constructible from the environment',
        'google-cloud-translation-advanced / general/nmt. Credentials remain server-side.'
    );

    return runContractChecks(checks, startedAt, provider, options, secrets);
}

function requireInjectedProvider(options: SmokeOptions): GoogleAdvancedTranslationProvider {
    const factory = options.createProvider;
    if (!factory) throw new Error('createProvider was not supplied.');
    const provider = factory();
    if (!provider) throw new Error('The injected createProvider returned null.');
    return provider;
}

/** Everything after provider construction, shared by real and injected runs. */
async function runContractChecks(
    checks: Checks,
    startedAt: string,
    provider: GoogleAdvancedTranslationProvider,
    options: SmokeOptions,
    secrets: readonly SecretPresence[]
): Promise<SmokeReport> {
    const credentials = process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS;
    const injected = options.createProvider !== undefined;
    const clientIp = options.clientIp ?? DEFAULT_SMOKE_CLIENT_IP;

    // 2 — REAL capability discovery.
    let providerVerified: ReadonlySet<string>;
    try {
        providerVerified = await provider.discoverSupportedTargets(true);
    } catch (error) {
        checks.fail('capability.discovery', 'Real GetSupportedLanguages call succeeds', codeOf(error));
        return finalize(startedAt, false, checks, secrets, undefined, undefined);
    }

    if (providerVerified.size === 0) {
        checks.fail(
            'capability.discovery',
            'Real GetSupportedLanguages call succeeds',
            'Returned zero verified targets (fail-closed).'
        );
        return finalize(startedAt, false, checks, secrets, undefined, undefined);
    }
    checks.pass(
        'capability.discovery',
        'Real GetSupportedLanguages call succeeds',
        `Google reported ${providerVerified.size} supportTarget languages.`
    );

    const selectable = getVerifiedRuntimeTargets(providerVerified);
    const verifiedCodes = selectable.map((language) => language.code);
    const registeredCodes = getRuntimeLanguages().map((language) => language.code);
    const registeredButUnverified = registeredCodes.filter((code) => !verifiedCodes.includes(code));

    if (selectable.length === 0) {
        checks.fail(
            'capability.intersection',
            'Registry ∩ verified capability is non-empty',
            'Google verified none of the six registered runtime targets.'
        );
        return finalize(
            startedAt,
            false,
            checks,
            secrets,
            { providerVerifiedCount: providerVerified.size, verifiedRuntimeTargets: [], registeredButUnverified },
            undefined
        );
    }
    checks.pass(
        'capability.intersection',
        'Registry ∩ verified capability is non-empty',
        `Selectable: ${verifiedCodes.join(', ')}. Registered but unverified: ${
            registeredButUnverified.length ? registeredButUnverified.join(', ') : 'none'
        }.`
    );

    const capability = {
        providerVerifiedCount: providerVerified.size,
        verifiedRuntimeTargets: verifiedCodes,
        registeredButUnverified,
    };

    // 3 — the real route-facing GET path.
    try {
        const listed = await listSelectableTargets(
            () => provider,
            (candidate) => resolveVerifiedTargets(candidate)
        );
        const bad = listed.filter((entry) => !isRuntimeCode(entry.code));
        if (bad.length > 0) {
            checks.fail('capability.route_listing', 'listSelectableTargets exposes only runtime codes', bad.map((b) => b.code).join(','));
        } else {
            checks.pass(
                'capability.route_listing',
                'listSelectableTargets exposes only runtime codes',
                `${listed.length} targets: ${listed.map((entry) => entry.code).join(', ')} (no en/ar).`
            );
        }
    } catch (error) {
        checks.fail('capability.route_listing', 'listSelectableTargets exposes only runtime codes', codeOf(error));
    }

    // 4 — ONE REAL authenticated translation through the production engine.
    const target = verifiedCodes[0];
    let translationSample: SmokeReport['translation'];

    try {
        const success = await translateRequest(
            runtimeDeps(
                {
                    sourceLanguage: 'en',
                    targetLanguage: target,
                    sourceText: SMOKE_SOURCE,
                    surface: 'hero',
                },
                () => provider,
                clientIp
            )
        );
        const translatedText = success.translations[0] ?? '';
        translationSample = {
            targetLanguage: success.targetLanguage,
            sourceText: SMOKE_SOURCE,
            translatedText,
            identity: success.identity,
        };

        const shapeProblems: string[] = [];
        if (success.translations.length !== 1) shapeProblems.push(`expected 1 translation, got ${success.translations.length}`);
        if (translatedText.trim().length === 0) shapeProblems.push('translatedText was empty');
        if (translatedText === SMOKE_SOURCE) shapeProblems.push('translatedText was returned untranslated');
        // Google HTML-escapes some payloads; with text/plain it must not.
        if (/&#\d+;|&[a-z]+;/.test(translatedText)) shapeProblems.push('translatedText contains HTML entities');
        if (shapeProblems.length > 0) {
            checks.fail('translation.response_mapping', 'Real translateText maps onto the contract shape', shapeProblems.join('; '));
        } else {
            checks.pass(
                'translation.response_mapping',
                'Real translateText maps onto the contract shape',
                `translations[0] is a non-empty string and differs from the source.`
            );
        }

        const identity = success.identity;
        const identityProblems: string[] = [];
        if (identity.providerId !== 'google-cloud-translation-advanced') identityProblems.push('providerId mismatch');
        if (identity.modelIdentifier !== GOOGLE_GENERAL_NMT_MODEL) identityProblems.push('modelIdentifier is not general/nmt');
        if (identity.engineVersion !== TRANSLATION_ENGINE_VERSION) identityProblems.push('engineVersion mismatch');
        if (identity.glossaryVersion !== TRANSLATION_GLOSSARY_VERSION) identityProblems.push('glossaryVersion mismatch');
        if (identityProblems.length > 0) {
            checks.fail('translation.identity', 'The §33 identity triple is correct for cache keying', identityProblems.join('; '));
        } else {
            checks.pass(
                'translation.identity',
                'The §33 identity triple is correct for cache keying',
                `${identity.engineVersion} / ${identity.glossaryVersion} / ${identity.providerId} / ${identity.modelIdentifier}`
            );
        }
    } catch (error) {
        checks.fail('translation.response_mapping', 'One real authenticated translation succeeds', codeOf(error));
    }

    // 5 — a PROVIDER-UNVERIFIED target must be rejected, not attempted.
    // Uses real capability data: the target is removed from the verified set,
    // so this exercises the §23 intersection rather than a stubbed response.
    const toHide = verifiedCodes.length > 1 ? verifiedCodes[verifiedCodes.length - 1] : verifiedCodes[0];
    const narrowed = new Set<string>(verifiedCodes.filter((code) => code !== toHide));
    const narrowedProvider: TranslationProvider = {
        identity: provider.identity,
        supportsLanguage: (code) => narrowed.has(code.toLowerCase().trim()),
        translate: () => {
            throw new Error('translate() must not be reached for an unverified target');
        },
    };
    const useNarrowed = () => Promise.resolve(narrowed);

    if (narrowed.size === 0) {
        checks.skip(
            'reject.unverified_target',
            'A provider-unverified target is rejected before any provider call',
            'Only one target is verified, so there is no second target to withhold.'
        );
    } else {
        try {
            await translateRequest(
                runtimeDeps(
                    { sourceLanguage: 'en', targetLanguage: toHide, sourceText: SMOKE_SOURCE, surface: 'hero' },
                    () => narrowedProvider,
                    clientIp,
                    useNarrowed
                )
            );
            checks.fail(
                'reject.unverified_target',
                'A provider-unverified target is rejected before any provider call',
                `Request for '${toHide}' was accepted; it must be refused.`
            );
        } catch (error) {
            const code = codeOf(error);
            if (code === 'PROVIDER_UNSUPPORTED') {
                checks.pass(
                    'reject.unverified_target',
                    'A provider-unverified target is rejected before any provider call',
                    `'${toHide}' → PROVIDER_UNSUPPORTED (400), with no provider invocation.`
                );
            } else {
                checks.fail(
                    'reject.unverified_target',
                    'A provider-unverified target is rejected before any provider call',
                    `'${toHide}' produced ${code}, expected PROVIDER_UNSUPPORTED.`
                );
            }
        }
    }

    // 6 — canonical and unknown targets rejected locally (no provider call).
    for (const [id, code, expected] of [
        ['reject.canonical_target', 'ar', 'CANONICAL_TARGET_NOT_ALLOWED'],
        ['reject.canonical_source_target', 'en', 'CANONICAL_TARGET_NOT_ALLOWED'],
        ['reject.unknown_target', 'xx', 'UNKNOWN_LANGUAGE'],
    ] as const) {
        const validation = validateTargetLanguage(code, narrowed);
        if (validation.valid) {
            checks.fail(id, `Target '${code}' is rejected by the registry`, 'validateTargetLanguage accepted it.');
            continue;
        }
        try {
            await translateRequest(
                runtimeDeps(
                    { sourceLanguage: 'en', targetLanguage: code, sourceText: SMOKE_SOURCE, surface: 'hero' },
                    () => narrowedProvider,
                    clientIp,
                    useNarrowed
                )
            );
            checks.fail(id, `Target '${code}' is rejected by the registry`, 'The runtime accepted the request.');
        } catch (error) {
            const actual = codeOf(error);
            if (actual === expected) {
                checks.pass(
                    id,
                    `Target '${code}' is rejected locally as ${expected}`,
                    `Rejected with ${actual} (no provider call). Registry reason: ${validation.reason}.`
                );
            } else {
                checks.fail(
                    id,
                    `Target '${code}' is rejected locally as ${expected}`,
                    `Got ${actual}, expected ${expected}.`
                );
            }
        }
    }

    // 7 — provider failure mapping. Each case uses a deliberately invalid
    // input so no quota is consumed and no customer text leaves the process.
    const faultProviders = options.createFaultProviders
        ? options.createFaultProviders()
        : {
              invalidCredentials: new GoogleAdvancedTranslationProvider({
                  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ?? 'unset',
                  location: process.env.GOOGLE_CLOUD_TRANSLATION_LOCATION ?? 'global',
                  accessToken: 'deliberately-invalid-access-token-for-smoke-test',
                  modelIdentifier: GOOGLE_GENERAL_NMT_MODEL,
              }),
              rejectedModel: new GoogleAdvancedTranslationProvider({
                  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ?? 'unset',
                  location: process.env.GOOGLE_CLOUD_TRANSLATION_LOCATION ?? 'global',
                  accessToken: process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN,
                  serviceAccountJson: credentials,
                  modelIdentifier: 'definitely-not-a-real-model-id',
              }),
          };

    await expectProviderMapping(
        checks,
        'error.mapping.invalid_credentials',
        'Invalid credentials map to NOT_CONFIGURED (503), never a 500',
        faultProviders.invalidCredentials,
        verifiedCodes[0],
        clientIp
    );

    await expectProviderMapping(
        checks,
        'error.mapping.rejected_model',
        'A provider-rejected request maps to a typed PROVIDER_ERROR, never a 500',
        faultProviders.rejectedModel,
        verifiedCodes[0],
        clientIp
    );

    // 8 — local size ceiling: rejected before any network call.
    try {
        await translateRequest(
            runtimeDeps(
                {
                    sourceLanguage: 'en',
                    targetLanguage: target,
                    sourceText: 'a'.repeat(2_000),
                    surface: 'hero',
                },
                () => provider,
                clientIp
            )
        );
        checks.fail('error.mapping.oversize', 'An over-length source is rejected locally', 'The request was accepted.');
    } catch (error) {
        const code = codeOf(error);
        if (code === 'SOURCE_TEXT_TOO_LONG') {
            checks.pass(
                'error.mapping.oversize',
                'An over-length source is rejected locally',
                '2000 chars > 1024 → SOURCE_TEXT_TOO_LONG (413) before any provider call.'
            );
        } else {
            checks.fail('error.mapping.oversize', 'An over-length source is rejected locally', `Got ${code}.`);
        }
    }

    // An injected run is harness verification only, never vendor evidence.
    return finalize(startedAt, !injected, checks, secrets, capability, translationSample);
}

function isRuntimeCode(code: string): boolean {
    return getRuntimeLanguages().some((language) => language.code === code);
}

/** Runs the real engine with a misconfigured provider and asserts the mapping. */
async function expectProviderMapping(
    checks: Checks,
    id: string,
    label: string,
    provider: TranslationProvider,
    target: string,
    clientIp: string = DEFAULT_SMOKE_CLIENT_IP
): Promise<void> {
    // Capability must be established for the request to reach step 8. Force the
    // provider to accept the target so the failure under test is the provider
    // call itself, not the capability gate.
    const permissive: TranslationProvider = {
        identity: provider.identity,
        supportsLanguage: () => true,
        translate: (input) => provider.translate(input),
    };
    const usePermissive = () => Promise.resolve(new Set([target]));

    try {
        await translateRequest(
            runtimeDeps(
                { sourceLanguage: 'en', targetLanguage: target, sourceText: SMOKE_SOURCE, surface: 'hero' },
                () => permissive,
                clientIp,
                usePermissive
            )
        );
        checks.fail(id, label, 'Expected a typed failure, but the call succeeded.');
    } catch (error) {
        if (error instanceof TranslationRuntimeError) {
            const typed = error.code !== 'PROVIDER_ERROR' || error.status === 502;
            if (typed && error.status >= 400 && error.status < 600) {
                checks.pass(
                    id,
                    label,
                    `Mapped to ${error.code} (HTTP ${error.status}, retryable=${error.retryable}).`
                );
                return;
            }
            checks.fail(id, label, `Unexpected mapping ${error.code} / HTTP ${error.status}.`);
            return;
        }
        checks.fail(id, label, `Untyped failure escaped the engine: ${codeOf(error)}.`);
    }
}

function createRealProvider(): GoogleAdvancedTranslationProvider | null {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_TRANSLATION_LOCATION ?? 'global';
    const serviceAccountJson = process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS;
    const accessToken = process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN;
    const modelIdentifier = process.env.GOOGLE_CLOUD_TRANSLATION_MODEL ?? GOOGLE_GENERAL_NMT_MODEL;

    if (!projectId || (!serviceAccountJson && !accessToken)) return null;

    return new GoogleAdvancedTranslationProvider({
        projectId,
        location,
        serviceAccountJson,
        accessToken,
        modelIdentifier,
    });
}

function finalize(
    startedAt: string,
    authenticated: boolean,
    checks: Checks,
    secrets: readonly SecretPresence[],
    capability: SmokeReport['capability'],
    translation: SmokeReport['translation']
): SmokeReport {
    const items = checks.all();
    return {
        startedAt,
        authenticated,
        secrets,
        capability,
        translation,
        checks: items,
        passed: items.filter((check) => check.status === 'pass').length,
        failed: items.filter((check) => check.status === 'fail').length,
        skipped: items.filter((check) => check.status === 'skip').length,
    };
}

/** Renders a report that is safe to paste into a ticket: no secret values. */
export function formatSmokeReport(report: SmokeReport): string {
    const lines: string[] = [];
    lines.push('══════════════════════════════════════════════════════════════');
    lines.push(' Google Cloud Translation v3 — authenticated pre-production gate');
    lines.push('══════════════════════════════════════════════════════════════');
    lines.push(`Started:  ${report.startedAt}`);
    lines.push(`Authenticated round-trip: ${report.authenticated ? 'YES' : 'NO'}`);
    lines.push('');
    lines.push('Secret presence (names + shape only, NEVER values):');
    for (const secret of report.secrets) {
        lines.push(
            `  ${secret.present ? 'present' : 'ABSENT '}  ${secret.name.padEnd(40)} ${
                secret.present ? `len=${secret.length} kind=${secret.kind}` : ''
            }${secret.required ? '' : '  (optional)'}`
        );
    }
    lines.push('');
    if (report.capability) {
        lines.push('Capability discovery (real):');
        lines.push(`  provider-verified targets: ${report.capability.providerVerifiedCount}`);
        lines.push(`  selectable (registry ∩ verified): ${report.capability.verifiedRuntimeTargets.join(', ') || 'none'}`);
        lines.push(
            `  registered but unverified: ${report.capability.registeredButUnverified.join(', ') || 'none'}`
        );
        lines.push('');
    }
    if (report.translation) {
        lines.push('Real translation response:');
        lines.push(`  ${report.translation.targetLanguage}: "${report.translation.sourceText}"`);
        lines.push(`  ->  "${report.translation.translatedText}"`);
        lines.push(
            `  identity: ${report.translation.identity.engineVersion} / ${report.translation.identity.glossaryVersion} / ${report.translation.identity.providerId} / ${report.translation.identity.modelIdentifier}`
        );
        lines.push('');
    }
    lines.push('Checks:');
    for (const check of report.checks) {
        const mark = check.status === 'pass' ? 'PASS' : check.status === 'fail' ? 'FAIL' : 'SKIP';
        lines.push(`  [${mark}] ${check.label}`);
        lines.push(`         ${check.detail}`);
    }
    lines.push('');
    lines.push(`Result: ${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped`);
    lines.push('══════════════════════════════════════════════════════════════');
    return lines.join('\n');
}
