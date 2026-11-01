/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  app/api/translate/route.ts — T2
 *
 *  HTTP boundary for runtime translation. This is a thin shell: every
 *  decision lives in server/translation/runtime.ts, and every security
 *  primitive lives in server/translation/security.ts. Neither is duplicated
 *  here.
 *
 *  POST /api/translate
 *    → translate public English content into a registered, provider-verified
 *      target language.
 *
 *  GET /api/translate
 *    → the languages the active provider can serve right now (§22, §23).
 *
 *  ── Fail-closed contract (spec §35, §37, §112) ─────────────────────────────
 *  A 200 is returned only when every gate passed:
 *    · payload is well-formed JSON matching the request contract
 *    · sourceLanguage is PRESENT and is exactly 'en'
 *    · targetLanguage is in application scope (not canonical, not unknown)
 *    · the provider is configured
 *    · the provider CONFIRMED the target (never assumed)
 *    · size / character / target / origin / rate boundaries all pass
 *    · the provider returned a well-formed result
 *  Any other outcome is a typed error with an explicit code. The route never
 *  falls back to English, never echoes untranslated text as if it were a
 *  translation, and never widens the allowed target set from caller input.
 *
 *  ── Credential isolation (§28, §116) ───────────────────────────────────────
 *  Credentials are read only inside server/translation/googleProvider.ts via
 *  createGoogleProviderFromEnv(), which is invoked from the nodejs runtime
 *  below. No credential, token or project id appears in any response body, and
 *  the edge runtime is never used for this route.
 *
 *  ── Not production-enabled ─────────────────────────────────────────────────
 *  With no GOOGLE_CLOUD_* configuration this route returns 503
 *  PROVIDER_NOT_CONFIGURED. It cannot translate anything until a deployment
 *  supplies credentials, and the Google adapter is still NOT live-authenticated
 *  (§27) — see server/translation/googleProvider.ts.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { clientIp } from '../../../lib/ratelimit';
import {
    GoogleAdvancedTranslationProvider,
    createGoogleProviderFromEnv,
} from '../../../server/translation/googleProvider';
import type { TranslationProvider } from '../../../server/translation/provider';
import { classifyTranslationRoute, resolveRequestRoutePath } from '../../../server/translation/policy';
import { checkOrigin } from '../../../server/translation/security';
import { issueTranslationSession } from '../../../server/translation/session';
import { createTranslationBudgetStore, type TranslationBudgetLimits } from '../../../server/translation/budget';
import { createTranslationRateLimiter, type TranslationRateLimiter } from '../../../server/translation/rateLimit';
import { createDistributedTranslationCircuitBreaker } from '../../../server/translation/circuitBreaker';
import { loadTranslationConfig, TranslationConfigError, type TranslationConfig } from '../../../server/translation/config';
import { safeTranslationAuditEvent, type TranslationAuditSink } from '../../../server/translation/audit';
import { isRuntimeTranslatable } from '../../../server/translation/languages';
import {
    TranslationRuntimeError,
    listSelectableTargets,
    translateRequest,
} from '../../../server/translation/runtime';
import { translateBatchRequest } from '../../../server/translation/batchRuntime';

/** nodejs is required: the Google adapter uses node:crypto for the JWT grant. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = {
    'Cache-Control': 'no-store',
} as const;
const translationAuditSink: TranslationAuditSink = (event) => {
    console.info(safeTranslationAuditEvent(event));
};

function productionSecurityConfig(): TranslationConfig {
    return loadTranslationConfig(process.env, { requireProductionInfrastructure: true });
}

function budgetStore(config: TranslationConfig) {
    return createTranslationBudgetStore(config);
}

function rateLimiter(config: TranslationConfig): TranslationRateLimiter | null {
    return createTranslationRateLimiter(config);
}

function budgetLimits(config: TranslationConfig): TranslationBudgetLimits {
    return {
        maxSessionRequests: config.sessionMaxRequests,
        maxSessionCharacters: config.sessionMaxCharacters,
        maxRouteCharacters: config.routeBudgetCharacters,
        maxDailyCharacters: config.dailyBudgetCharacters,
        maxGlobalDailyCharacters: config.globalDailyBudgetCharacters,
        maxTargetsPerDay: config.maxTargetsPerDay,
    };
}

function circuitBreaker(config: TranslationConfig) {
    return createDistributedTranslationCircuitBreaker({
        upstashUrl: config.upstashUrl,
        upstashToken: config.upstashToken,
        failureThreshold: config.circuitFailureThreshold,
        openDurationMs: config.circuitOpenMs,
        redisTimeoutMs: config.redisTimeoutMs,
    });
}

function translationSecurityInfrastructure(config: TranslationConfig) {
    const budget = budgetStore(config);
    const rate = rateLimiter(config);
    const circuit = circuitBreaker(config);
    if (!budget || !rate || !circuit) {
        throw new TranslationRuntimeError(
            'TRANSLATION_PERSISTENT_LIMITER_UNAVAILABLE',
            'Translation security infrastructure is not configured.',
            503,
            true
        );
    }
    return { budget, rate, circuit };
}
/** Server-only credential resolution. Never returns credential material. */
function createProvider(): TranslationProvider | null {
    return createGoogleProviderFromEnv();
}

/**
 * §23 — resolve the provider's VERIFIED target set. The Google adapter
 * discovers this from GetSupportedLanguages and fails closed; an empty result
 * means "cannot establish capability", not "assume everything is supported".
 */
async function resolveVerifiedTargets(provider: TranslationProvider): Promise<ReadonlySet<string>> {
    if (provider instanceof GoogleAdvancedTranslationProvider) {
        return provider.discoverSupportedTargets();
    }
    // §26 — an unknown provider must prove its own capability; a bare
    // TranslationProvider cannot, so nothing is claimed.
    return new Set<string>();
}

/** §35 — structured error body. The message is safe to surface to a caller. */
function errorResponse(error: TranslationRuntimeError): NextResponse {
    return NextResponse.json(
        { ok: false, error: { code: error.code, message: error.message, retryable: error.retryable } },
        {
            status: error.status,
            headers: {
                ...NO_STORE,
                ...(error.status === 429 ? { 'Retry-After': '60' } : {}),
            },
        }
    );
}

export async function POST(req: Request) {
    let payload: unknown;
    try {
        payload = await req.json();
    } catch {
        return errorResponse(
            new TranslationRuntimeError('INVALID_JSON', 'Request body must be valid JSON.', 400)
        );
    }

    try {
        const securityConfig = productionSecurityConfig();
        const security = translationSecurityInfrastructure(securityConfig);
        const common = {
            request: req,
            payload,
            createProvider,
            resolveVerifiedTargets,
            clientId: clientIp(req),
            routePath: resolveRequestRoutePath(req) ?? '/__missing__',
            sessionToken: req.headers.get('x-mrx-translation-session') ?? undefined,
            sessionSecret: securityConfig.sessionSecret ?? undefined,
            budgetStore: security.budget,
            budgetLimits: budgetLimits(securityConfig),
            rateLimiter: security.rate,
            circuitBreaker: security.circuit,
            audit: translationAuditSink,
        };
        const isBatch = payload !== null && typeof payload === 'object' && Array.isArray((payload as { items?: unknown }).items);
        if (isBatch) {
            const result = await translateBatchRequest(common);
            return NextResponse.json({ ok: true, ...result }, { headers: NO_STORE });
        }
        const result = await translateRequest(common);
        return NextResponse.json(
            {
                ok: true,
                sourceLanguage: result.sourceLanguage,
                targetLanguage: result.targetLanguage,
                surface: result.surface,
                translations: result.translations,
                identity: result.identity,
            },
            { headers: NO_STORE }
        );
    } catch (error) {
        if (error instanceof TranslationConfigError) {
            return errorResponse(new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Translation security infrastructure is not configured.', 503, true));
        }
        if (error instanceof TranslationRuntimeError) {
            return errorResponse(error);
        }
        // Nothing else may escape: a programming fault must not become a 200
        // and must not leak a stack trace.
        return errorResponse(
            new TranslationRuntimeError('PROVIDER_ERROR', 'Translation failed unexpectedly.', 500)
        );
    }
}

/** §22 / §23 — capability-aware language list for the selector. */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        if (url.searchParams.get('mode') === 'session') {
            const origin = checkOrigin(req);
            if (!origin.allowed) throw new TranslationRuntimeError('ORIGIN_NOT_ALLOWED', 'Request origin is not permitted.', 403);
            const securityConfig = productionSecurityConfig();
            translationSecurityInfrastructure(securityConfig);
            if (!securityConfig.sessionSecret) {
                throw new TranslationRuntimeError(
                    'TRANSLATION_PERSISTENT_LIMITER_UNAVAILABLE',
                    'Translation security infrastructure is not configured.',
                    503,
                    true
                );
            }
            const targetLanguage = (url.searchParams.get('target') ?? '').toLowerCase().trim();
            const surface = (url.searchParams.get('surface') ?? '').trim();
            const routePath = resolveRequestRoutePath(req) ?? '';
            const policy = classifyTranslationRoute(routePath);
            if (!isRuntimeTranslatable(targetLanguage) || !policy.translatable || !policy.allowedSurfaces.includes(surface as never)) {
                throw new TranslationRuntimeError('TRANSLATION_ROUTE_BLOCKED', 'Translation session scope is not permitted.', 403);
            }
            const sessionId = crypto.randomUUID();
            const token = issueTranslationSession({
                sessionId,
                targetLanguage,
                routePath,
                routeClass: policy.routeClass,
                surface,
                ttlMs: securityConfig.sessionTtlMs,
                maxRequests: securityConfig.sessionMaxRequests,
                maxCharacters: securityConfig.sessionMaxCharacters,
            }, securityConfig.sessionSecret);
            translationAuditSink({
                event: 'session_issued',
                routeClass: policy.routeClass,
                surface,
                targetLanguage,
            });
            return NextResponse.json({ ok: true, token, expiresInMs: securityConfig.sessionTtlMs }, { headers: NO_STORE });
        }
        const languages = await listSelectableTargets(createProvider, resolveVerifiedTargets);
        return NextResponse.json({ ok: true, languages }, { headers: NO_STORE });
    } catch (error) {
        if (error instanceof TranslationConfigError) {
            return errorResponse(new TranslationRuntimeError('TRANSLATION_STORAGE_UNAVAILABLE', 'Translation security infrastructure is not configured.', 503, true));
        }
        if (error instanceof TranslationRuntimeError) {
            return errorResponse(error);
        }
        // Anything unexpected still fails closed with a retryable 503 rather
        // than a 200 carrying an empty list.
        return errorResponse(
            new TranslationRuntimeError(
                'PROVIDER_CAPABILITY_UNAVAILABLE',
                'Language availability could not be established.',
                503,
                true
            )
        );
    }
}
