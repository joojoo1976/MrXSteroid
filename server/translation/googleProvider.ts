/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/googleProvider.ts — T1 Foundation
 *
 *  Google Cloud Translation **Advanced** (spec §27).
 *
 *  §27  Advanced API architecture — NOT the legacy translate.google.com widget
 *  §28  credentials read server-side only, never returned to the browser
 *  §29  no translate.google.com/translate_a/element.js anywhere
 *  §31  configuration is environment-driven
 *  §23  target capability is VERIFIED from the vendor, never assumed
 *  §32  modelIdentifier is exposed for cache identity
 *  §35  every failure path raises TranslationProviderError so the engine can
 *       fail open to English
 *
 *  ── VERIFICATION STATUS (read this before trusting the code below) ──────────
 *  This adapter is written strictly against the published Google Cloud
 *  Translation v3 contract:
 *
 *    • google/cloud/translate/v3/translation_service.proto
 *      (github.com/googleapis/googleapis, v3 GA)
 *    • REST reference: projects.locations.translateText
 *    • REST reference: projects.locations.getSupportedLanguages
 *
 *  NO LIVE AUTHENTICATION WAS PERFORMED. No service-account credential or
 *  access token is available in this environment, so the request construction
 *  below is locked by unit tests against the documented contract but has never
 *  been round-tripped against the real service. Before enabling in production,
 *  run one authenticated smoke translation and confirm the response shape.
 *
 *  ── The v3 wire contract, as implemented ───────────────────────────────────
 *  gRPC-Transcoding path template (from the proto's google.api.http option),
 *  with the proto's resource wildcards written as PROJECT / LOCATION so the
 *  asterisks cannot terminate this comment block:
 *
 *      POST /v3/{parent=projects/PROJECT/locations/LOCATION}:translateText
 *      POST /v3/{parent=projects/PROJECT}:translateText   (additional binding)
 *
 *  `default_host` in the proto is `translate.googleapis.com`, so the base is
 *  https://translate.googleapis.com/v3. `parent` is a PATH segment and is
 *  therefore NOT repeated in the JSON body.
 *
 *  The body uses protobuf-JSON (lowerCamelCase) field names — NOT the
 *  snake_case names used by the Basic v2 API:
 *
 *      contents             required, repeated string
 *      mimeType             optional, defaults to text/html when omitted
 *      sourceLanguageCode   optional
 *      targetLanguageCode   required
 *      model                optional, full resource path
 *
 *  A general (built-in) model is addressed as
 *  `projects/{p}/locations/{l}/models/general/nmt`; `v3` is an API version and
 *  is NOT a valid model identifier.
 *
 *  Response: `{ "translations": [{ "translatedText": string, "model": string }] }`
 *  `translatedText` "might be excluded" on a per-item error, so a missing value
 *  is treated as a provider fault rather than silently becoming an empty string.
 *
 *  Auth: OAuth2 JWT-bearer with the
 *  `https://www.googleapis.com/auth/cloud-platform` scope. The calling identity
 *  additionally needs `cloudtranslate.generalModels.predict`.
 *
 *  ── Correction log (T1 review) ──────────────────────────────────────────────
 *  The first draft of this file was wrong in five ways. All are fixed:
 *    1. endpoint was `translation.googleapis.com/language/translate/v3` (not a
 *       real v3 route) → now the gRPC-transcoding path above;
 *    2. `parent` was sent in the body → it is a path segment;
 *    3. body used v2 snake_case `source_language_code` / `target_language_code`
 *       → now protobuf-JSON `sourceLanguageCode` / `targetLanguageCode`;
 *    4. `model` was built as `.../models/v3`, and `v3` was recorded as the
 *       model identifier → now `.../models/general/nmt`, identity `general/nmt`;
 *    5. `providerSupport` was hardcoded `true` in the registry, i.e. capability
 *       was assumed → capability is now discovered from GetSupportedLanguages.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    TranslationProviderError,
    type ProviderIdentity,
    type ProviderTranslationInput,
    type ProviderTranslationOutput,
    type TranslationProvider,
} from './provider';

/** §27 — proto `default_host`; the v3 surface hangs off /v3. */
const V3_BASE_URL = 'https://translate.googleapis.com/v3';

/** §27 — OAuth2 token endpoint for the service-account grant. */
const OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/** §27 — scope required for Cloud Translation Advanced. */
const CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

/**
 * §32 — the general (built-in) NMT model. This is a MODEL id, distinct from the
 * `v3` API version. Part of provider/cache identity.
 */
export const GOOGLE_GENERAL_NMT_MODEL = 'general/nmt';

/** §27 — MIME type sent with every request. Plain text units, not HTML documents. */
const REQUEST_MIME_TYPE = 'text/plain';

/**
 * §40 — documented v3 ceilings, asserted before the call so an oversized batch
 * is a clear local contract error rather than an opaque 400 from Google.
 */
export const GOOGLE_MAX_CONTENTS = 1_024;
export const GOOGLE_MAX_CODEPOINTS_PER_CONTENT = 1_024;
export const GOOGLE_MAX_TOTAL_CODEPOINTS = 30_000;

const PROVIDER_ID = 'google-cloud-translation-advanced';

/** §28 — server-side configuration. Never expose any of this to the browser. */
export interface GoogleAdvancedConfig {
    readonly projectId: string;
    /** `global` for non-regionalized calls; a region id for AutoML/glossaries. */
    readonly location: string;
    /** JSON service-account key material. Server-side only. */
    readonly serviceAccountJson?: string;
    /** Pre-minted access token, used instead of the service-account grant. */
    readonly accessToken?: string;
    /** Model id, e.g. 'general/nmt'. Combined with project+location into a resource path. */
    readonly modelIdentifier: string;
}

interface CachedAccessToken {
    token: string;
    expiresAt: number;
}

let cachedToken: CachedAccessToken | null = null;

/** §28 — builds the `parent` resource segment: projects/{p}/locations/{l}. */
export function buildParentResource(config: GoogleAdvancedConfig): string {
    return `projects/${config.projectId}/locations/${config.location}`;
}

/** §28 — builds the full model resource path. Rejects a bare API version. */
export function buildModelResource(config: GoogleAdvancedConfig): string {
    const model = config.modelIdentifier.trim();
    if (!model) {
        throw new TranslationProviderError('NOT_CONFIGURED', 'Google translation model identifier is empty.');
    }
    if (model === 'v3' || model === 'v2' || model === 'basic') {
        throw new TranslationProviderError(
            'NOT_CONFIGURED',
            `Google model identifier '${model}' is an API version, not a model. Use '${GOOGLE_GENERAL_NMT_MODEL}'.`
        );
    }
    return `${buildParentResource(config)}/models/${model}`;
}

/** Protobuf-JSON request body for TranslateTextRequest. */
export interface GoogleTranslateTextBody {
    contents: string[];
    mimeType: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
    model: string;
}

/** §27 — pure request builder, exported so the wire format is unit-testable. */
export function buildTranslateTextRequest(
    config: GoogleAdvancedConfig,
    input: Pick<ProviderTranslationInput, 'sourceLanguage' | 'targetLanguage' | 'texts'>
): { url: string; body: GoogleTranslateTextBody } {
    if (input.texts.length > GOOGLE_MAX_CONTENTS) {
        throw new TranslationProviderError(
            'PROVIDER_ERROR',
            `Google accepts at most ${GOOGLE_MAX_CONTENTS} content strings per call; received ${input.texts.length}.`
        );
    }

    let total = 0;
    for (const text of input.texts) {
        const points = Array.from(text).length;
        if (points > GOOGLE_MAX_CODEPOINTS_PER_CONTENT) {
            throw new TranslationProviderError(
                'PROVIDER_ERROR',
                `Google accepts at most ${GOOGLE_MAX_CODEPOINTS_PER_CONTENT} codepoints per content string.`
            );
        }
        total += points;
    }
    if (total > GOOGLE_MAX_TOTAL_CODEPOINTS) {
        throw new TranslationProviderError(
            'PROVIDER_ERROR',
            `Google recommends at most ${GOOGLE_MAX_TOTAL_CODEPOINTS} codepoints per call; received ${total}.`
        );
    }

    return {
        url: `${V3_BASE_URL}/${buildParentResource(config)}:translateText`,
        body: {
            contents: [...input.texts],
            mimeType: REQUEST_MIME_TYPE,
            sourceLanguageCode: input.sourceLanguage,
            targetLanguageCode: input.targetLanguage,
            model: buildModelResource(config),
        },
    };
}

/** §23 — pure request builder for the capability-discovery call. */
export function buildSupportedLanguagesRequest(config: GoogleAdvancedConfig): {
    url: string;
    method: 'GET';
} {
    return {
        url: `${V3_BASE_URL}/${buildParentResource(config)}/supportedLanguages`,
        method: 'GET',
    };
}

/** Mints (and short-lived-caches) an OAuth2 access token. Never logged. */
async function resolveAccessToken(config: GoogleAdvancedConfig): Promise<string> {
    if (config.accessToken) return config.accessToken;

    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60_000) {
        return cachedToken.token;
    }

    if (!config.serviceAccountJson) {
        throw new TranslationProviderError(
            'NOT_CONFIGURED',
            'Google Cloud Translation credentials are not configured (service account or access token required).'
        );
    }

    let key: { client_email?: string; private_key?: string };
    try {
        key = JSON.parse(config.serviceAccountJson) as { client_email?: string; private_key?: string };
    } catch {
        // §28 — the parse error must not echo the credential material.
        throw new TranslationProviderError('NOT_CONFIGURED', 'Google service-account JSON is malformed.');
    }

    if (!key.client_email || !key.private_key) {
        throw new TranslationProviderError('NOT_CONFIGURED', 'Google service-account JSON is missing required fields.');
    }

    const assertion = await buildJwtAssertion(key.client_email, key.private_key);

    const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });

    if (!response.ok) {
        throw new TranslationProviderError('PROVIDER_ERROR', `Google OAuth token exchange failed (${response.status}).`, response.status >= 500);
    }

    const payload = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!payload.access_token) {
        throw new TranslationProviderError('PROVIDER_ERROR', 'Google OAuth response contained no access token.');
    }

    cachedToken = {
        token: payload.access_token,
        expiresAt: now + (payload.expires_in ?? 3600) * 1000,
    };
    return cachedToken.token;
}

/** Builds the RS256 JWT assertion for the service-account grant. */
async function buildJwtAssertion(clientEmail: string, privateKeyPem: string): Promise<string> {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: clientEmail,
        scope: CLOUD_PLATFORM_SCOPE,
        aud: OAUTH_TOKEN_ENDPOINT,
        iat: now,
        exp: now + 3600,
    };

    const encode = (value: unknown) =>
        Buffer.from(JSON.stringify(value))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

    const signingInput = `${encode(header)}.${encode(claim)}`;

    // Node's crypto is server-only; this module must never be bundled for the browser.
    const { createSign } = await import('node:crypto');
    const signer = createSign('RSA-SHA256');
    signer.update(signingInput);
    const signature = signer
        .sign(privateKeyPem)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${signingInput}.${signature}`;
}

/** Maps an HTTP status onto a typed, §35-compatible provider error. */
function errorForStatus(status: number, context: string): TranslationProviderError {
    if (status === 400) {
        return new TranslationProviderError('PROVIDER_ERROR', `${context} rejected the request (400 INVALID_ARGUMENT).`);
    }
    if (status === 401) {
        return new TranslationProviderError('NOT_CONFIGURED', `${context} rejected the credentials (401).`);
    }
    if (status === 403) {
        return new TranslationProviderError(
            'QUOTA_EXCEEDED',
            `${context} denied the request (403). Check cloudtranslate.generalModels.predict.`
        );
    }
    if (status === 429) {
        return new TranslationProviderError('RATE_LIMITED', `${context} rate limit reached.`, true);
    }
    return new TranslationProviderError('PROVIDER_ERROR', `${context} returned ${status}.`, status >= 500);
}

export class GoogleAdvancedTranslationProvider implements TranslationProvider {
    readonly identity: ProviderIdentity = {
        providerId: PROVIDER_ID,
        modelIdentifier: GOOGLE_GENERAL_NMT_MODEL,
    };

    /** §23 — ONLY what the vendor has confirmed. Absent discovery ⇒ empty. */
    private verifiedTargets: ReadonlySet<string> | null = null;

    private discovery: Promise<ReadonlySet<string>> | null = null;

    constructor(private readonly config: GoogleAdvancedConfig) {}

    /**
     * §23 — capability check against VERIFIED vendor data.
     *
     * Fails closed: until GetSupportedLanguages has succeeded, this returns
     * false, so the UI offers no runtime language and the engine fails open to
     * English rather than calling a target Google would reject.
     */
    supportsLanguage(targetLanguage: string): boolean {
        return this.verifiedTargets?.has(targetLanguage.toLowerCase().trim()) ?? false;
    }

    /**
     * §23 — discovers vendor capability. Idempotent and de-duplicated; caches
     * for the process lifetime. Never throws: a discovery failure leaves the
     * provider reporting no targets.
     */
    async discoverSupportedTargets(force = false): Promise<ReadonlySet<string>> {
        if (!force && this.verifiedTargets) return this.verifiedTargets;
        if (!force && this.discovery) return this.discovery;

        this.discovery = (async () => {
            const token = await resolveAccessToken(this.config);
            const { url, method } = buildSupportedLanguagesRequest(this.config);
            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            }).catch((error: unknown) => {
                throw new TranslationProviderError(
                    'TIMEOUT',
                    `Google supportedLanguages request failed: ${error instanceof Error ? error.message : 'network error'}`,
                    true
                );
            });

            if (!response.ok) throw errorForStatus(response.status, 'Google supportedLanguages');

            const payload = (await response.json()) as {
                languages?: { languageCode?: string; supportTarget?: boolean }[];
            };

            const targets = new Set<string>();
            for (const entry of payload.languages ?? []) {
                if (entry.supportTarget && entry.languageCode) {
                    targets.add(entry.languageCode.toLowerCase().trim());
                }
            }
            this.verifiedTargets = targets;
            return targets;
        })();

        try {
            return await this.discovery;
        } catch {
            this.discovery = null;
            return new Set<string>();
        }
    }

    async translate(input: ProviderTranslationInput): Promise<ProviderTranslationOutput> {
        if (input.texts.length === 0) {
            return { texts: [] };
        }
        if (!this.supportsLanguage(input.targetLanguage)) {
            throw new TranslationProviderError(
                'UNSUPPORTED_LANGUAGE',
                `Google provider has not verified target '${input.targetLanguage}'.`
            );
        }

        const token = await resolveAccessToken(this.config);
        const { url, body } = buildTranslateTextRequest(this.config, input);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'x-goog-user-project': this.config.projectId,
            },
            body: JSON.stringify(body),
        }).catch((error: unknown) => {
            // Network-level failure → retryable, engine fails open to English (§35).
            throw new TranslationProviderError(
                'TIMEOUT',
                `Google provider request failed: ${error instanceof Error ? error.message : 'network error'}`,
                true
            );
        });

        if (!response.ok) throw errorForStatus(response.status, 'Google translateText');

        const payload = (await response.json()) as {
            translations?: { translatedText?: string }[];
        };

        const translations = payload.translations ?? [];
        if (translations.length !== input.texts.length) {
            // §35 — a shape mismatch must not be silently accepted; fail open.
            throw new TranslationProviderError('PROVIDER_ERROR', 'Google provider returned an unexpected translation count.');
        }

        // `translatedText` "might be excluded" when an individual item errors.
        const texts = translations.map((entry) => {
            if (typeof entry.translatedText !== 'string') {
                throw new TranslationProviderError(
                    'PROVIDER_ERROR',
                    'Google provider omitted translatedText for an item.'
                );
            }
            return entry.translatedText;
        });

        return { texts };
    }
}

/** §31 — environment-driven construction. Returns null when unconfigured. */
export function createGoogleProviderFromEnv(): GoogleAdvancedTranslationProvider | null {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID ?? '';
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
