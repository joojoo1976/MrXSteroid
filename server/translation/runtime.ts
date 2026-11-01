/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/runtime.ts — T2
 *
 *  Runtime translation service. Owns the fail-closed decision sequence for a
 *  single translation request; app/api/translate/route.ts is a thin HTTP shell
 *  over this module.
 *
 *  §35  every failure is an explicit, typed TranslationRuntimeError — the
 *       service NEVER silently degrades to English or to an untranslated string
 *  §23  target availability = application scope ∩ VERIFIED provider capability
 *  §37  sourceLanguage must be present and must be 'en'
 *  §112 this must not become an unrestricted translation proxy
 *
 *  Fail-closed order (each step aborts the request):
 *    1. parse + structural validation      → malformed payload
 *    2. source language                    → missing / not 'en'
 *    3. application-scope target           → unknown / canonical / disabled
 *    4. provider selection                 → no provider configured
 *    5. capability establishment          → vendor query failed or empty
 *    6. verified target intersection       → target not vendor-confirmed
 *    7. security boundary                  → size / quota / origin / rate
 *    8. provider invocation                → mapped provider failure
 *
 *  Steps 1–3 are pure and provider-free, so an unconfigured deployment still
 *  rejects bad input with precise codes rather than a generic 500.
 *
 *  §33 — the returned identity triple (engineVersion, glossaryVersion,
 *  modelIdentifier) is what a caller must fold into its cache key so entries
 *  cannot outlive the configuration that produced them.
 *
 *  §28 — provider credentials are read only inside this module's server-only
 *  dependency graph and are never placed in any response payload.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    TRANSLATION_ENGINE_VERSION,
    TRANSLATION_GLOSSARY_VERSION,
    validateTranslationRequest,
    type TranslationContractErrorCode,
    type TranslationSurface,
} from './contracts';
import { getVerifiedRuntimeTargets } from './languages';
import { glossaryTermsForTarget } from './glossary';
import { protectTranslationValues, validateAndRestoreTranslation } from './placeholders';
import { classifyTranslationRoute, isSurfaceAllowedForRoute } from './policy';
import { verifyTranslationSession } from './session';
import type { TranslationBudgetLimits, TranslationBudgetStore } from './budget';
import type { TranslationRateLimiter } from './rateLimit';
import type { TranslationAuditSink } from './audit';
import { noopTranslationAuditSink, safeTranslationAuditEvent } from './audit';
import type { TranslationCircuitBreakerLike } from './circuitBreaker';
import { TranslationCircuitOpenError } from './circuitBreaker';
import {
    checkCharacterQuota,
    checkOrigin,
    checkRateLimit,
    checkRequestSize,
    isTargetWithinAllowlist,
    TRANSLATION_CHARACTER_QUOTA,
} from './security';
import { TranslationProviderError, type ProviderTranslationOutput, type TranslationProvider } from './provider';

/** §35 — typed runtime failure. `code` is the stable machine-readable reason. */
export type TranslationRuntimeErrorCode =
    | 'INVALID_JSON'
    | 'MISSING_SOURCE_LANGUAGE'
    | 'INVALID_SOURCE_LANGUAGE'
    | 'EMPTY_SOURCE_TEXT'
    | 'BLANK_SOURCE_TEXT'
    | 'SOURCE_TEXT_TOO_LONG'
    | 'BATCH_TOO_LARGE'
    | 'EMPTY_BATCH'
    | 'INVALID_BATCH_IDS'
    | 'UNKNOWN_SURFACE'
    | 'UNKNOWN_LANGUAGE'
    | 'CANONICAL_TARGET_NOT_ALLOWED'
    | 'LANGUAGE_DISABLED'
    | 'NOT_RUNTIME_TRANSLATABLE'
    | 'PROVIDER_UNSUPPORTED'
    | 'PROVIDER_NOT_CONFIGURED'
    | 'PROVIDER_CAPABILITY_UNAVAILABLE'
    | 'EMPTY_REQUEST'
    | 'CHARACTER_QUOTA_EXCEEDED'
    | 'TARGET_QUOTA_EXCEEDED'
    | 'ORIGIN_NOT_ALLOWED'
    | 'RATE_LIMITED'
    | 'UNSUPPORTED_LANGUAGE'
    | 'PROVIDER_ERROR'
    | 'TIMEOUT'
    | 'QUOTA_EXCEEDED'
    | 'TRANSLATION_TOKEN_MISMATCH'
    | 'TRANSLATION_SESSION_REQUIRED'
    | 'TRANSLATION_SESSION_INVALID'
    | 'TRANSLATION_SESSION_EXPIRED'
    | 'TRANSLATION_SESSION_CONTEXT_MISMATCH'
    | 'TRANSLATION_ROUTE_BLOCKED'
    | 'TRANSLATION_BUDGET_EXCEEDED'
    | 'TRANSLATION_PERSISTENT_LIMITER_UNAVAILABLE'
    | 'TRANSLATION_CIRCUIT_OPEN'
    | 'TRANSLATION_STORAGE_UNAVAILABLE';

export class TranslationRuntimeError extends Error {
    readonly code: TranslationRuntimeErrorCode;
    readonly status: number;
    readonly retryable: boolean;

    constructor(code: TranslationRuntimeErrorCode, message: string, status: number, retryable = false) {
        super(message);
        this.name = 'TranslationRuntimeError';
        this.code = code;
        this.status = status;
        this.retryable = retryable;
    }
}

/** §33 — cache identity returned to the caller. */
export type TranslationIdentity = {
    readonly engineVersion: string;
    readonly glossaryVersion: string;
    readonly modelIdentifier: string;
    readonly providerId: string;
};

export type TranslationSuccess = {
    readonly sourceLanguage: 'en';
    readonly targetLanguage: string;
    readonly surface: TranslationSurface;
    readonly translations: readonly string[];
    readonly identity: TranslationIdentity;
};

/** HTTP status for each contract error, so malformed input is never a 500. */
const CONTRACT_STATUS: Record<TranslationContractErrorCode, number> = {
    MISSING_SOURCE_LANGUAGE: 400,
    INVALID_SOURCE_LANGUAGE: 400,
    EMPTY_SOURCE_TEXT: 400,
    BLANK_SOURCE_TEXT: 400,
    SOURCE_TEXT_TOO_LONG: 413,
    BATCH_TOO_LARGE: 413,
    EMPTY_BATCH: 400,
    INVALID_BATCH_IDS: 400,
    UNKNOWN_SURFACE: 400,
    UNKNOWN_LANGUAGE: 400,
    CANONICAL_TARGET_NOT_ALLOWED: 400,
    LANGUAGE_DISABLED: 403,
    NOT_RUNTIME_TRANSLATABLE: 400,
    PROVIDER_UNSUPPORTED: 400,
};

/** §35 — provider error → HTTP status. Retryable faults stay retryable. */
const PROVIDER_STATUS: Record<string, number> = {
    NOT_CONFIGURED: 503,
    UNSUPPORTED_LANGUAGE: 400,
    RATE_LIMITED: 429,
    QUOTA_EXCEEDED: 429,
    TIMEOUT: 504,
    PROVIDER_ERROR: 502,
};

export type TranslationRuntimeDeps = {
    readonly request: Request;
    readonly payload: unknown;
    /**
     * Server-side provider factory. Returns null when the deployment has no
     * usable Google configuration. Injectable so the route stays testable and
     * so credentials are resolved in exactly one place.
     */
    readonly createProvider: () => TranslationProvider | null;
    /**
     * §23 — resolves the vendor's VERIFIED target set. Returning an empty set
     * (or throwing) means capability could not be established, and the request
     * fails closed rather than proceeding on an assumption.
     */
    readonly resolveVerifiedTargets: (provider: TranslationProvider) => Promise<ReadonlySet<string>>;
    /** Stable per-caller id used for quotas and rate limiting. */
    readonly clientId: string;
    /** Server-observed route; never copied from the JSON payload. */
    readonly routePath?: string;
    readonly sessionToken?: string;
    readonly sessionSecret?: string;
    readonly budgetStore?: TranslationBudgetStore | null;
    readonly budgetLimits?: TranslationBudgetLimits;
    readonly rateLimiter?: TranslationRateLimiter | null;
    readonly circuitBreaker?: TranslationCircuitBreakerLike;
    readonly audit?: TranslationAuditSink;
};

/**
 * §33/§35/§37/§23 — the single fail-closed entry point.
 */
export async function translateRequest(deps: TranslationRuntimeDeps): Promise<TranslationSuccess> {
    // 1 + 2 + 3 — pure contract gate. No provider is constructed yet, so a
    // misconfigured deployment still answers with precise contract codes.
    const contract = validateTranslationRequest(deps.payload);
    if (!contract.ok) {
        throw new TranslationRuntimeError(
            contract.code,
            contract.message,
            CONTRACT_STATUS[contract.code] ?? 400
        );
    }

    const request = contract.value;
    const audit = deps.audit ?? noopTranslationAuditSink;
    const routePath = deps.routePath ?? new URL(deps.request.url).pathname;
    const policy = classifyTranslationRoute(routePath);
    if (!policy.translatable || !isSurfaceAllowedForRoute(routePath, request.surface)) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: 'TRANSLATION_ROUTE_BLOCKED', routeClass: policy.routeClass, surface: request.surface }));
        throw new TranslationRuntimeError('TRANSLATION_ROUTE_BLOCKED', 'This route is not eligible for runtime translation.', 403);
    }
    if (!deps.sessionToken || !deps.sessionSecret) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: 'TRANSLATION_SESSION_REQUIRED', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage }));
        throw new TranslationRuntimeError('TRANSLATION_SESSION_REQUIRED', 'A translation session is required.', 401);
    }
    const verifiedSession = verifyTranslationSession(deps.sessionToken, deps.sessionSecret);
    if (!verifiedSession.ok) {
        const status = verifiedSession.code === 'TRANSLATION_SESSION_EXPIRED' ? 401 : 403;
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: verifiedSession.code, routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage }));
        throw new TranslationRuntimeError(verifiedSession.code, 'The translation session is invalid or expired.', status);
    }
    const claims = verifiedSession.claims;
    if (
        claims.targetLanguage !== request.targetLanguage ||
        claims.sourceLanguage !== request.sourceLanguage ||
        claims.routePath !== routePath ||
        claims.routeClass !== policy.routeClass ||
        claims.surface !== request.surface
    ) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: 'TRANSLATION_SESSION_CONTEXT_MISMATCH', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage }));
        throw new TranslationRuntimeError('TRANSLATION_SESSION_CONTEXT_MISMATCH', 'The translation session does not match this request.', 403);
    }
    if (!deps.budgetStore || !deps.budgetLimits) {
        throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is not configured.', 503, true);
    }
    if (!deps.rateLimiter) {
        throw new TranslationRuntimeError('TRANSLATION_PERSISTENT_LIMITER_UNAVAILABLE', 'Translation rate limiting is not configured.', 503, true);
    }
    if (!deps.circuitBreaker) {
        throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Distributed translation resilience is not configured.', 503, true);
    }
    const protection = protectTranslationValues(
        request.sourceText,
        glossaryTermsForTarget(request.targetLanguage)
    );
    const texts = [protection.protectedText];
    const totalCharacters = request.sourceText.length;

    // 4 — provider selection.
    const provider = deps.createProvider();
    if (!provider) {
        throw new TranslationRuntimeError(
            'PROVIDER_NOT_CONFIGURED',
            'No translation provider is configured for this deployment.',
            503
        );
    }

    // 5 — capability establishment. A vendor that cannot be queried, or that
    // reports nothing, yields no targets; we never assume support.
    let verifiedTargets: ReadonlySet<string>;
    try {
        verifiedTargets = await deps.resolveVerifiedTargets(provider);
    } catch (error) {
        throw new TranslationRuntimeError(
            'PROVIDER_CAPABILITY_UNAVAILABLE',
            error instanceof Error ? error.message : 'Provider capability could not be established.',
            503,
            true
        );
    }
    if (!verifiedTargets || verifiedTargets.size === 0) {
        throw new TranslationRuntimeError(
            'PROVIDER_CAPABILITY_UNAVAILABLE',
            'The translation provider has not confirmed any supported target language.',
            503,
            true
        );
    }

    // 6 — application scope ∩ verified capability. §112 also re-checks the
    // registry allowlist so no caller input can widen the target set.
    const available = getVerifiedRuntimeTargets(verifiedTargets);
    if (!available.some((language) => language.code === request.targetLanguage)) {
        throw new TranslationRuntimeError(
            'PROVIDER_UNSUPPORTED',
            `Target '${request.targetLanguage}' is not confirmed as provider-supported.`,
            400
        );
    }
    if (!isTargetWithinAllowlist(request.targetLanguage)) {
        throw new TranslationRuntimeError(
            'UNKNOWN_LANGUAGE',
            'Target language is outside the application allowlist.',
            400
        );
    }

    // 7 — security boundary. Reached only for a request that is already
    // contract-valid, so quota spend is bounded rather than sprayed.
    const deny = await enforceBoundary(deps, texts.length, totalCharacters);
    if (deny) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: deny.code, routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
        throw deny;
    }
    let budget;
    try {
        budget = await deps.budgetStore.consume({
            sessionId: claims.sessionId,
            sessionExpiresAt: claims.expiresAt,
            clientId: deps.clientId,
            routePath,
            targetLanguage: request.targetLanguage,
            characters: totalCharacters,
        }, {
            ...deps.budgetLimits,
            maxSessionRequests: Math.min(deps.budgetLimits.maxSessionRequests, claims.maxRequests),
            maxSessionCharacters: Math.min(deps.budgetLimits.maxSessionCharacters, claims.maxCharacters),
        });
    } catch {
        throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is unavailable.', 503, true);
    }
    if (!budget.allowed) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: budget.scope === 'target' ? 'TARGET_QUOTA_EXCEEDED' : 'TRANSLATION_BUDGET_EXCEEDED', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
        if (budget.scope === 'target') {
            throw new TranslationRuntimeError('TARGET_QUOTA_EXCEEDED', 'Translation target-language budget exceeded.', 429);
        }
        throw new TranslationRuntimeError('TRANSLATION_BUDGET_EXCEEDED', 'Translation budget exceeded.', 429);
    }
    // 8 — provider invocation.
    let output: ProviderTranslationOutput;
    try {
        const operation = () => provider.translate({
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage,
            texts,
            surface: request.surface,
        });
        output = await deps.circuitBreaker.execute(operation);
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'TRANSLATION_STORAGE_UNAVAILABLE') {
            audit(safeTranslationAuditEvent({ event: 'request_rejected', code: 'TRANSLATION_STORAGE_UNAVAILABLE', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
            throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is unavailable.', 503, true);
        }
        if (error instanceof TranslationCircuitOpenError) {
            audit(safeTranslationAuditEvent({ event: 'circuit_open', code: 'TRANSLATION_CIRCUIT_OPEN', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
            throw new TranslationRuntimeError('TRANSLATION_CIRCUIT_OPEN', error.message, 503, true);
        }
        if (error instanceof TranslationProviderError) {
            audit(safeTranslationAuditEvent({ event: 'provider_failure', code: error.code, routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
            throw new TranslationRuntimeError(
                error.code as TranslationRuntimeErrorCode,
                error.message,
                PROVIDER_STATUS[error.code] ?? 502,
                error.retryable
            );
        }
        throw new TranslationRuntimeError(
            'PROVIDER_ERROR',
            'The translation provider failed unexpectedly.',
            502,
            true
        );
    }

    if (output.texts.length !== texts.length || typeof output.texts[0] !== 'string') {
        throw new TranslationRuntimeError(
            'PROVIDER_ERROR',
            'The translation provider returned an unexpected translation count.',
            502
        );
    }
    const restored = validateAndRestoreTranslation(output.texts[0], protection);
    if (!restored.ok) {
        throw new TranslationRuntimeError(
            'TRANSLATION_TOKEN_MISMATCH',
            'The translation response did not preserve protected values.',
            502
        );
    }

    audit(safeTranslationAuditEvent({ event: 'request_allowed', routeClass: policy.routeClass, surface: request.surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
    return {
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        surface: request.surface,
        translations: [restored.text],
        identity: {
            engineVersion: request.engineVersion,
            glossaryVersion: request.glossaryVersion,
            modelIdentifier: provider.identity.modelIdentifier,
            providerId: provider.identity.providerId,
        },
    };
}

/** §111/§112/§113 — size, quota, target-count, origin, then rate limit. */
async function enforceBoundary(
    deps: TranslationRuntimeDeps,
    textCount: number,
    totalCharacters: number
): Promise<TranslationRuntimeError | null> {
    const size = checkRequestSize(textCount, totalCharacters);
    if (!size.allowed) return toRuntimeError(size);

    const quota = checkCharacterQuota(totalCharacters);
    if (!quota.allowed) return toRuntimeError(quota);

    const origin = checkOrigin(deps.request);
    if (!origin.allowed) return toRuntimeError(origin);

    let rate;
    try {
        rate = await checkRateLimit(deps.request, deps.rateLimiter);
    } catch {
        return new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is unavailable.', 503, true);
    }
    if (!rate.allowed) return toRuntimeError(rate);

    return null;
}

function toRuntimeError(verdict: {
    allowed: boolean;
    status?: number;
    code?: string;
    message?: string;
}): TranslationRuntimeError | null {
    if (verdict.allowed) return null;
    return new TranslationRuntimeError(
        (verdict.code ?? 'PROVIDER_ERROR') as TranslationRuntimeErrorCode,
        verdict.message ?? 'Request rejected by a security boundary.',
        verdict.status ?? 400,
        verdict.status === 429 || verdict.status === 503
    );
}

/** §22 / §23 — languages the active provider can serve right now. */
/**
 * §22 / §23 — capability-aware language list for the selector.
 *
 * Fails CLOSED with a typed error rather than an empty list. Returning
 * `{ languages: [] }` with a 200 would let a UI render an empty selector with
 * no error while a deployment is simply misconfigured, which is exactly the
 * silent-degradation this service exists to prevent. The two causes stay
 * distinguishable so monitoring can tell a missing configuration from a vendor
 * query that failed.
 */
export async function listSelectableTargets(
    createProvider: () => TranslationProvider | null,
    resolveVerifiedTargets: (provider: TranslationProvider) => Promise<ReadonlySet<string>>
): Promise<readonly { code: string; displayName: string; nativeName: string; rtl: boolean }[]> {
    const provider = createProvider();
    if (!provider) {
        throw new TranslationRuntimeError(
            'PROVIDER_NOT_CONFIGURED',
            'No translation provider is configured for this deployment.',
            503,
            true
        );
    }

    let verifiedTargets: ReadonlySet<string>;
    try {
        verifiedTargets = await resolveVerifiedTargets(provider);
    } catch {
        throw new TranslationRuntimeError(
            'PROVIDER_CAPABILITY_UNAVAILABLE',
            'Language availability could not be established.',
            503,
            true
        );
    }

    // A configured provider that verifies none of our registered targets is a
    // misconfiguration, not an empty product: surface it rather than 200 [].
    const targets = getVerifiedRuntimeTargets(verifiedTargets);
    if (targets.length === 0) {
        throw new TranslationRuntimeError(
            'PROVIDER_CAPABILITY_UNAVAILABLE',
            'The active provider verified none of the registered target languages.',
            503,
            true
        );
    }

    return targets.map(({ code, displayName, nativeName, rtl }) => ({
        code,
        displayName,
        nativeName,
        rtl,
    }));
}

export { TRANSLATION_CHARACTER_QUOTA, TRANSLATION_ENGINE_VERSION, TRANSLATION_GLOSSARY_VERSION };
