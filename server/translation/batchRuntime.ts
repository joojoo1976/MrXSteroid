import {
    type TranslationSurface,
    type TranslationContractErrorCode,
} from './contracts';
import {
    validateTranslationBatch,
    type TranslationBatchResultItem,
} from './batchContracts';
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
import { checkCharacterQuota, checkOrigin, checkRateLimit, checkRequestSize, isTargetWithinAllowlist } from './security';
import { TranslationProviderError, type ProviderTranslationOutput, type TranslationProvider } from './provider';
import { TranslationRuntimeError, type TranslationIdentity } from './runtime';

const CONTRACT_STATUS: Partial<Record<TranslationContractErrorCode, number>> = {
    SOURCE_TEXT_TOO_LONG: 413,
    BATCH_TOO_LARGE: 413,
    LANGUAGE_DISABLED: 403,
};

const PROVIDER_STATUS: Record<string, number> = {
    NOT_CONFIGURED: 503,
    UNSUPPORTED_LANGUAGE: 400,
    RATE_LIMITED: 429,
    QUOTA_EXCEEDED: 429,
    TIMEOUT: 504,
    PROVIDER_ERROR: 502,
};

export type TranslationBatchSuccess = {
    readonly sourceLanguage: 'en';
    readonly targetLanguage: string;
    readonly surface: TranslationSurface;
    readonly items: readonly TranslationBatchResultItem[];
    readonly identity: TranslationIdentity;
};

export type TranslationBatchRuntimeDeps = {
    readonly request: Request;
    readonly payload: unknown;
    readonly createProvider: () => TranslationProvider | null;
    readonly resolveVerifiedTargets: (provider: TranslationProvider) => Promise<ReadonlySet<string>>;
    readonly clientId: string;
    readonly routePath: string;
    readonly sessionToken?: string;
    readonly sessionSecret?: string;
    readonly budgetStore?: TranslationBudgetStore | null;
    readonly budgetLimits?: TranslationBudgetLimits;
    readonly rateLimiter?: TranslationRateLimiter | null;
    readonly circuitBreaker?: TranslationCircuitBreakerLike;
    readonly audit?: TranslationAuditSink;
};

export function validateBatchResponseMapping(
    requestedIds: readonly string[],
    items: readonly TranslationBatchResultItem[]
): void {
    const requested = new Set(requestedIds);
    const seen = new Set<string>();
    if (requested.size !== requestedIds.length || items.length !== requestedIds.length) {
        throw new TranslationRuntimeError('INVALID_BATCH_IDS', 'The batch response ID count is invalid.', 502);
    }
    for (const item of items) {
        if (!requested.has(item.id) || seen.has(item.id) || typeof item.translatedText !== 'string') {
            throw new TranslationRuntimeError('INVALID_BATCH_IDS', 'The batch response IDs are invalid.', 502);
        }
        seen.add(item.id);
    }
}
export async function translateBatchRequest(deps: TranslationBatchRuntimeDeps): Promise<TranslationBatchSuccess> {
    const contract = validateTranslationBatch(deps.payload);
    if (!contract.ok) {
        throw new TranslationRuntimeError(
            contract.code,
            contract.message,
            CONTRACT_STATUS[contract.code] ?? 400
        );
    }

    const request = contract.value;
    const audit = deps.audit ?? noopTranslationAuditSink;
    const policy = classifyTranslationRoute(deps.routePath);
    const surfaces = new Set(request.items.map((item) => item.surface));
    if (!policy.translatable || surfaces.size !== 1 || !request.items.every((item) => isSurfaceAllowedForRoute(deps.routePath, item.surface))) {
        audit(safeTranslationAuditEvent({ event: 'request_rejected', code: 'TRANSLATION_ROUTE_BLOCKED', routeClass: policy.routeClass }));
        throw new TranslationRuntimeError('TRANSLATION_ROUTE_BLOCKED', 'This route/surface batch is not eligible for runtime translation.', 403);
    }
    const surface = request.items[0].surface;

    if (!deps.sessionToken || !deps.sessionSecret) {
        throw new TranslationRuntimeError('TRANSLATION_SESSION_REQUIRED', 'A translation session is required.', 401);
    }
    const verifiedSession = verifyTranslationSession(deps.sessionToken, deps.sessionSecret);
    if (!verifiedSession.ok) {
        throw new TranslationRuntimeError(
            verifiedSession.code,
            'The translation session is invalid or expired.',
            verifiedSession.code === 'TRANSLATION_SESSION_EXPIRED' ? 401 : 403
        );
    }
    const claims = verifiedSession.claims;
    if (
        claims.sourceLanguage !== request.sourceLanguage ||
        claims.targetLanguage !== request.targetLanguage ||
        claims.routePath !== deps.routePath ||
        claims.routeClass !== policy.routeClass ||
        claims.surface !== surface
    ) {
        throw new TranslationRuntimeError('TRANSLATION_SESSION_CONTEXT_MISMATCH', 'The translation session does not match this batch.', 403);
    }
    if (!deps.budgetStore || !deps.budgetLimits || !deps.rateLimiter || !deps.circuitBreaker) {
        throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation controls are not configured.', 503, true);
    }

    const unique = new Map<string, { sourceText: string; ids: string[] }>();
    for (const item of request.items) {
        const existing = unique.get(item.sourceText);
        if (existing) existing.ids.push(item.id);
        else unique.set(item.sourceText, { sourceText: item.sourceText, ids: [item.id] });
    }
    const units = [...unique.values()].map((unit) => ({
        ...unit,
        protection: protectTranslationValues(unit.sourceText, glossaryTermsForTarget(request.targetLanguage)),
    }));
    const texts = units.map((unit) => unit.protection.protectedText);
    const totalCharacters = request.items.reduce((sum, item) => sum + item.sourceText.length, 0);

    const size = checkRequestSize(texts.length, totalCharacters);
    if (!size.allowed) throw new TranslationRuntimeError(size.code as never, size.message, size.status);
    const quota = checkCharacterQuota(totalCharacters);
    if (!quota.allowed) throw new TranslationRuntimeError(quota.code as never, quota.message, quota.status);
    const origin = checkOrigin(deps.request);
    if (!origin.allowed) throw new TranslationRuntimeError(origin.code as never, origin.message, origin.status);
    try {
        const rate = await checkRateLimit(deps.request, deps.rateLimiter);
        if (!rate.allowed) throw new TranslationRuntimeError(rate.code as never, rate.message, rate.status, true);
    } catch (error) {
        if (error instanceof TranslationRuntimeError) throw error;
        throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is unavailable.', 503, true);
    }

    const provider = deps.createProvider();
    if (!provider) throw new TranslationRuntimeError('PROVIDER_NOT_CONFIGURED', 'No translation provider is configured.', 503);
    let targets: ReadonlySet<string>;
    try { targets = await deps.resolveVerifiedTargets(provider); }
    catch { throw new TranslationRuntimeError('PROVIDER_CAPABILITY_UNAVAILABLE', 'Provider capability could not be established.', 503, true); }
    if (!getVerifiedRuntimeTargets(targets).some((entry) => entry.code === request.targetLanguage) || !isTargetWithinAllowlist(request.targetLanguage)) {
        throw new TranslationRuntimeError('PROVIDER_UNSUPPORTED', 'Target is not provider-verified.', 400);
    }

    let budget;
    try {
        budget = await deps.budgetStore.consume({
            sessionId: claims.sessionId,
            sessionExpiresAt: claims.expiresAt,
            clientId: deps.clientId,
            routePath: deps.routePath,
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
        throw new TranslationRuntimeError(
            budget.scope === 'target' ? 'TARGET_QUOTA_EXCEEDED' : 'TRANSLATION_BUDGET_EXCEEDED',
            'Translation budget exceeded.',
            429
        );
    }

    let output: ProviderTranslationOutput;
    try {
        output = await deps.circuitBreaker.execute(() => provider.translate({
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage,
            texts,
            surface,
        }));
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'TRANSLATION_STORAGE_UNAVAILABLE') {
            throw new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Shared translation storage is unavailable.', 503, true);
        }
        if (error instanceof TranslationCircuitOpenError) {
            throw new TranslationRuntimeError('TRANSLATION_CIRCUIT_OPEN', error.message, 503, true);
        }
        if (error instanceof TranslationProviderError) {
            throw new TranslationRuntimeError(error.code as never, error.message, PROVIDER_STATUS[error.code] ?? 502, error.retryable);
        }
        throw new TranslationRuntimeError('PROVIDER_ERROR', 'The translation provider failed unexpectedly.', 502, true);
    }

    if (output.texts.length !== units.length) {
        throw new TranslationRuntimeError('PROVIDER_ERROR', 'The provider returned an unexpected batch count.', 502);
    }
    const translatedBySource = new Map<string, string>();
    for (let index = 0; index < units.length; index += 1) {
        const translated = output.texts[index];
        if (typeof translated !== 'string') throw new TranslationRuntimeError('PROVIDER_ERROR', 'A batch result is missing.', 502);
        const restored = validateAndRestoreTranslation(translated, units[index].protection);
        if (!restored.ok) throw new TranslationRuntimeError('TRANSLATION_TOKEN_MISMATCH', `Batch token validation failed: ${restored.code}.`, 502);
        translatedBySource.set(units[index].sourceText, restored.text);
    }

    const responseItems = request.items.map((item) => ({
        id: item.id,
        translatedText: translatedBySource.get(item.sourceText)!,
    }));
    validateBatchResponseMapping(request.items.map((item) => item.id), responseItems);
    audit(safeTranslationAuditEvent({ event: 'request_allowed', routeClass: policy.routeClass, surface, targetLanguage: request.targetLanguage, characters: totalCharacters }));
    return {
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        surface,
        items: responseItems,
        identity: {
            engineVersion: request.engineVersion,
            glossaryVersion: request.glossaryVersion,
            providerId: provider.identity.providerId,
            modelIdentifier: provider.identity.modelIdentifier,
        },
    };
}