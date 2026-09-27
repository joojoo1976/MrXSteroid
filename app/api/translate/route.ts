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
import {
    TranslationRuntimeError,
    listSelectableTargets,
    translateRequest,
} from '../../../server/translation/runtime';

/** nodejs is required: the Google adapter uses node:crypto for the JWT grant. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = {
    'Cache-Control': 'no-store',
} as const;

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
        const result = await translateRequest({
            request: req,
            payload,
            createProvider,
            resolveVerifiedTargets,
            clientId: clientIp(req),
        });

        return NextResponse.json(
            {
                ok: true,
                sourceLanguage: result.sourceLanguage,
                targetLanguage: result.targetLanguage,
                surface: result.surface,
                translations: result.translations,
                // §33 — the caller folds this into its cache key.
                identity: result.identity,
            },
            { headers: NO_STORE }
        );
    } catch (error) {
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
export async function GET() {
    try {
        const languages = await listSelectableTargets(createProvider, resolveVerifiedTargets);
        return NextResponse.json({ ok: true, languages }, { headers: NO_STORE });
    } catch (error) {
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
