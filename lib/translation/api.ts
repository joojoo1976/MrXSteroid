/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  lib/translation/api.ts — T3 integration (client side)
 *
 *  The single place that knows the wire shape of /api/translate.
 *
 *  ── Consuming the route EXACTLY as implemented ──────────────────────────────
 *  This client does not extend, reinterpret or "improve" the T2 contract. Every
 *  field it reads is a field app/api/translate/route.ts actually emits:
 *
 *    GET  /api/translate        → 200 { ok, languages: [{ code, displayName,
 *                                        nativeName, rtl }] }
 *                               → 503 { ok:false, error:{ code, message,
 *                                        retryable } }
 *    POST /api/translate        → 200 { ok, sourceLanguage, targetLanguage,
 *                                        surface, translations[], identity }
 *                               → 4xx/5xx { ok:false, error:{ … } }
 *
 *  Both responses are `Cache-Control: no-store`, so nothing here may be served
 *  from the browser HTTP cache; `cache: 'no-store'` is set on the fetch for the
 *  same reason.
 *
 *  ── Fail-closed client behaviour ───────────────────────────────────────────
 *  · Never throws. Network faults and malformed bodies become an error envelope
 *    with a synthetic code, so a caller cannot mistake a transport failure for
 *    a successful empty result.
 *  · An error is an ERROR. A 503 is never converted into an empty language
 *    list: `listSelectableTargets` returning [] and the route answering 503 are
 *    different states and stay different all the way to the UI.
 *  · `PROVIDER_NOT_CONFIGURED` and `PROVIDER_CAPABILITY_UNAVAILABLE` are
 *    preserved as distinct codes so the UI can tell a missing configuration
 *    from an unreachable vendor.
 *
 *  The browser attaches `Origin` automatically to same-origin POST requests, so
 *  the route's §110 origin gate is satisfied without forging the header here.
 *  GET carries no Origin and the route applies no origin check to the language
 *  list.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    MAX_SOURCE_CHARS,
    TRANSLATION_SURFACES,
    type TranslationSurface,
} from '@/server/translation/contracts';
import { isRuntimeTranslatable } from '@/server/translation/languages';
import type { TranslationCacheIdentity } from './cache';

export const TRANSLATE_ENDPOINT = '/api/translate';

/** Mirrors the shape returned by GET /api/translate. */
export type SelectableTarget = {
    readonly code: string;
    readonly displayName: string;
    readonly nativeName: string;
    readonly rtl: boolean;
};

/** Mirrors the error envelope returned by both verbs. */
export type TranslateApiError = {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
    readonly status: number;
};

export type ApiResult<T> =
    | { readonly ok: true; readonly status: number; readonly data: T }
    | { readonly ok: false; readonly status: number; readonly error: TranslateApiError };

export type TranslateRequest = {
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly sourceText: string;
    readonly surface: TranslationSurface;
};

export type TranslateResponse = {
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly surface: string;
    readonly translations: readonly string[];
    readonly identity: TranslationCacheIdentity;
};

export type SelectableTargetsResponse = {
    readonly languages: readonly SelectableTarget[];
};

function errorResult(status: number, code: string, message: string, retryable = false): ApiResult<never> {
    return { ok: false, status, error: { code, message, retryable, status } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function asIdentity(value: unknown): TranslationCacheIdentity | null {
    if (!isRecord(value)) return null;
    const { engineVersion, glossaryVersion, modelIdentifier, providerId } = value;
    if (
        typeof engineVersion !== 'string' ||
        typeof glossaryVersion !== 'string' ||
        typeof modelIdentifier !== 'string' ||
        typeof providerId !== 'string'
    ) {
        return null;
    }
    return { engineVersion, glossaryVersion, modelIdentifier, providerId };
}

/**
 * GET /api/translate — the provider-verified selectable target set.
 *
 * A 503 is returned as an error, never as `{ languages: [] }`.
 */
export async function fetchSelectableTargets(
    fetchImpl: typeof fetch = fetch
): Promise<ApiResult<SelectableTargetsResponse>> {
    let response: Response;
    try {
        response = await fetchImpl(TRANSLATE_ENDPOINT, {
            method: 'GET',
            cache: 'no-store',
            headers: { accept: 'application/json' },
        });
    } catch (error) {
        return errorResult(
            0,
            'NETWORK_ERROR',
            error instanceof Error ? error.message : 'The translation service is unreachable.',
            true
        );
    }

    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const error = isRecord(body) && isRecord(body.error) ? body.error : {};
        return errorResult(
            response.status,
            typeof error.code === 'string' ? error.code : 'UNEXPECTED_ERROR',
            typeof error.message === 'string' ? error.message : `Request failed with status ${response.status}.`,
            typeof error.retryable === 'boolean' ? error.retryable : response.status >= 500
        );
    }

    // A malformed 200 is treated as a failure rather than as "no languages".
    if (!isRecord(body) || !Array.isArray(body.languages)) {
        return errorResult(response.status, 'MALFORMED_RESPONSE', 'The language list response was malformed.');
    }

    const languages = body.languages
        .filter(
            (entry): entry is SelectableTarget =>
                isRecord(entry) &&
                typeof entry.code === 'string' &&
                entry.code.length > 0 &&
                typeof entry.displayName === 'string' &&
                typeof entry.nativeName === 'string' &&
                typeof entry.rtl === 'boolean'
        )
        // Defence in depth. The route already intersects the registry, so a
        // canonical or unknown code cannot legitimately appear. Filtering again
        // here means a wrong or tampered response still cannot put 'en', 'ar' or
        // an unregistered code into a user-facing selector, where it would be
        // offered as a machine-translation target.
        .filter((entry) => isRuntimeTranslatable(entry.code));

    return { ok: true, status: response.status, data: { languages } };
}

/**
 * POST /api/translate — translate one canonical English string.
 *
 * The route accepts a single `sourceText` per request; there is no batch verb.
 * Oversized or blank input is rejected here rather than spending a request on a
 * guaranteed 4xx.
 */
export async function translateText(
    request: TranslateRequest,
    fetchImpl: typeof fetch = fetch
): Promise<ApiResult<TranslateResponse>> {
    if (!TRANSLATION_SURFACES.includes(request.surface)) {
        return errorResult(0, 'UNKNOWN_SURFACE', `Surface '${request.surface}' is not translatable.`);
    }
    const text = request.sourceText.trim();
    if (text.length === 0) {
        return errorResult(0, 'EMPTY_SOURCE_TEXT', 'Nothing to translate.');
    }
    if (request.sourceText.length > MAX_SOURCE_CHARS) {
        return errorResult(
            0,
            'SOURCE_TEXT_TOO_LONG',
            `Text exceeds the ${MAX_SOURCE_CHARS}-character per-string limit.`
        );
    }

    let response: Response;
    try {
        response = await fetchImpl(TRANSLATE_ENDPOINT, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({
                sourceLanguage: request.sourceLanguage,
                targetLanguage: request.targetLanguage,
                sourceText: request.sourceText,
                surface: request.surface,
            }),
        });
    } catch (error) {
        return errorResult(
            0,
            'NETWORK_ERROR',
            error instanceof Error ? error.message : 'The translation service is unreachable.',
            true
        );
    }

    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const error = isRecord(body) && isRecord(body.error) ? body.error : {};
        return errorResult(
            response.status,
            typeof error.code === 'string' ? error.code : 'UNEXPECTED_ERROR',
            typeof error.message === 'string' ? error.message : `Request failed with status ${response.status}.`,
            typeof error.retryable === 'boolean' ? error.retryable : response.status >= 500
        );
    }

    if (!isRecord(body) || !Array.isArray(body.translations) || body.translations.length === 0) {
        return errorResult(response.status, 'MALFORMED_RESPONSE', 'The translation response was malformed.');
    }
    const translations = body.translations.filter((value): value is string => typeof value === 'string');
    if (translations.length === 0) {
        return errorResult(response.status, 'MALFORMED_RESPONSE', 'The translation response carried no text.');
    }

    const identity = asIdentity(body.identity);
    if (!identity) {
        // Without the identity the entry cannot be keyed safely (§33), so the
        // result is discarded rather than cached under a guessed configuration.
        return errorResult(response.status, 'MALFORMED_RESPONSE', 'The translation response carried no identity.');
    }

    return {
        ok: true,
        status: response.status,
        data: {
            sourceLanguage: typeof body.sourceLanguage === 'string' ? body.sourceLanguage : request.sourceLanguage,
            targetLanguage: typeof body.targetLanguage === 'string' ? body.targetLanguage : request.targetLanguage,
            surface: typeof body.surface === 'string' ? body.surface : request.surface,
            translations,
            identity,
        },
    };
}
