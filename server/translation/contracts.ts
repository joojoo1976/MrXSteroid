import { z } from 'zod';
import { validateTargetLanguage, type ProviderCapability } from './languages';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/contracts.ts — T1 Foundation
 *
 *  Translation request contracts and identity constants.
 *
 *  Spec coverage:
 *    §33  translationEngineVersion      → TRANSLATION_ENGINE_VERSION
 *    §33  sourceLanguage REQUIRED       → TranslationRequestSchema (no default)
 *    §34  glossaryVersion               → TRANSLATION_GLOSSARY_VERSION
 *    §36  request contract              → TranslationRequestSchema
 *    §37  sourceLanguage = 'en' only     → RUNTIME_SOURCE_LANGUAGE + normalize
 *    §38  target validated vs registry   → validated in validateTranslationRequest
 *    §39  empty input rejected           → min(1) + explicit whitespace guard
 *    §40  length limits                  → MAX_SOURCE_CHARS / MAX_BATCH_SIZE
 *
 *  This module is pure and side-effect free: no provider calls, no I/O,
 *  no network, no filesystem. It is safe to import from Edge and Node.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** §33 — bump when translation logic changes so stale cache entries separate. */
export const TRANSLATION_ENGINE_VERSION = 'v1';

/** §34 — bump when the glossary changes; no glossary exists yet. */
export const TRANSLATION_GLOSSARY_VERSION = 'none';

/**
 * §3 / §4 / §5 / §37 — the sole permitted runtime translation source.
 * English canonical only. Never Arabic, never a previously translated result.
 */
export const RUNTIME_SOURCE_LANGUAGE = 'en';

/**
 * §40 — per-string ceiling. Larger content is rejected rather than silently
 * split, so this must not exceed what the provider can actually accept.
 *
 * Google Cloud Translation v3 documents a maximum of 1024 codepoints per
 * `contents` entry. An earlier draft used 5000, which meant every string above
 * 1024 passed application validation and then failed at the provider. The
 * ceiling is now pinned to the provider's documented limit; if a later phase
 * needs longer passages it must segment explicitly (translateText accepts up to
 * 1024 entries and ~30,000 codepoints total) rather than raising this blindly.
 */
export const MAX_SOURCE_CHARS = 1_024;

/** §41 — bounded batch size so a single request cannot fan out unboundedly. */
export const MAX_BATCH_SIZE = 50;

/** §54 / §117 — public presentation surfaces only. Deny-by-default (see §67, §68). */
export const TRANSLATION_SURFACES = [
    'header',
    'navigation',
    'hero',
    'public-content',
    'faq',
    'public-tools',
    'public-product-presentation',
    'public-informational',
] as const;

export type TranslationSurface = (typeof TRANSLATION_SURFACES)[number];

export const TranslationSurfaceSchema = z.enum(TRANSLATION_SURFACES);

/** §80 — marker attribute so an already-translated node is never re-translated. */
export const TRANSLATED_ATTR = 'data-mrx-translated';
/** §80 — records which target language a node currently holds. */
export const TRANSLATED_LANG_ATTR = 'data-mrx-translated-lang';
/** §79 — marker identifying an approved translatable surface. */
export const SURFACE_ATTR = 'data-mrx-surface';

const SourceTextSchema = z
    .string()
    .min(1, 'empty_source_text')
    .max(MAX_SOURCE_CHARS, 'source_text_too_long')
    // §39 — whitespace-only content must never reach the provider.
    .refine((value) => value.trim().length > 0, 'blank_source_text');

export const TranslationRequestSchema = z.object({
    /**
     * §33 — REQUIRED, and it must be 'en'. There is deliberately no
     * `.optional()` and no `.default()`: a caller that omits the source would
     * otherwise be silently assumed to mean English, which is exactly the
     * assumption §3/§4/§5 forbid. Omission is an explicit validation failure.
     */
    sourceLanguage: z.string().min(1, 'missing_source_language'),
    /** §36 / §38 — target BCP-47 base code, validated against the registry. */
    targetLanguage: z.string().min(1, 'empty_target'),
    /** §36 — the canonical English text to translate. */
    sourceText: SourceTextSchema,
    /** §36 — which allowlisted surface this belongs to. */
    surface: TranslationSurfaceSchema,
    /** §33 — engine version in force for this request. */
    engineVersion: z.string().optional(),
    /** §34 — glossary version in force for this request. */
    glossaryVersion: z.string().optional(),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

export const TranslationBatchSchema = z.object({
    requests: z.array(TranslationRequestSchema).min(1, 'empty_batch').max(MAX_BATCH_SIZE, 'batch_too_large'),
});

export type TranslationBatch = z.infer<typeof TranslationBatchSchema>;

/**
 * §33 / §37 — the source language must be present AND be English.
 *
 * There is no fallback branch. An absent or empty source is a contract
 * violation, not an implied 'en', so this throws rather than coercing.
 */
export function normalizeSourceLanguage(raw: string): 'en' {
    const value = (raw ?? '').trim().toLowerCase();
    if (value === '') {
        throw Object.assign(
            new Error('sourceLanguage is required and must be explicitly set to \'en\''),
            { code: 'MISSING_SOURCE_LANGUAGE' }
        );
    }
    if (value !== RUNTIME_SOURCE_LANGUAGE) {
        throw Object.assign(
            new Error(`Runtime translation source must be '${RUNTIME_SOURCE_LANGUAGE}', received '${value}'`),
            { code: 'INVALID_SOURCE_LANGUAGE' }
        );
    }
    return 'en';
}

export type TranslationContractErrorCode =
    | 'MISSING_SOURCE_LANGUAGE'
    | 'EMPTY_SOURCE_TEXT'
    | 'BLANK_SOURCE_TEXT'
    | 'SOURCE_TEXT_TOO_LONG'
    | 'BATCH_TOO_LARGE'
    | 'EMPTY_BATCH'
    | 'INVALID_SOURCE_LANGUAGE'
    | 'UNKNOWN_SURFACE'
    | 'UNKNOWN_LANGUAGE'
    | 'CANONICAL_TARGET_NOT_ALLOWED'
    | 'LANGUAGE_DISABLED'
    | 'NOT_RUNTIME_TRANSLATABLE'
    | 'PROVIDER_UNSUPPORTED';

export type TranslationContractError = {
    ok: false;
    code: TranslationContractErrorCode;
    message: string;
};

export type TranslationContractOk<T> = { ok: true; value: T };
export type TranslationContractResult<T> = TranslationContractOk<T> | TranslationContractError;

/**
 * §33 / §37 / §38 / §39 / §40 — full contract gate applied before any provider call.
 *
 * Ordering matters: structural validation first, then source enforcement, then
 * registry capability lookup. An unknown or canonical target never reaches Google.
 *
 * `providerTargets` is an OPTIONAL set of targets the provider has verified.
 * When supplied, a target outside it is rejected. When omitted, no claim is made
 * about the vendor either way — the caller simply has not asked.
 */
export function validateTranslationRequest(
    input: unknown,
    providerTargets?: ReadonlySet<string> | null
): TranslationContractResult<{
    sourceLanguage: 'en';
    targetLanguage: string;
    sourceText: string;
    surface: TranslationSurface;
    engineVersion: string;
    glossaryVersion: string;
    providerCapability: ProviderCapability;
}> {
    const parsed = TranslationRequestSchema.safeParse(input);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const message = issue?.message ?? 'invalid_request';
        // §33 — an absent required sourceLanguage surfaces as a zod invalid_type
        // on that path, not as our custom message, so detect it structurally.
        const missingSource =
            issue?.path?.[0] === 'sourceLanguage' &&
            (issue?.code === 'invalid_type' || issue?.code === 'too_small');

        let code: TranslationContractErrorCode = 'UNKNOWN_SURFACE';
        if (missingSource || message === 'missing_source_language') code = 'MISSING_SOURCE_LANGUAGE';
        else if (message === 'empty_source_text') code = 'EMPTY_SOURCE_TEXT';
        else if (message === 'blank_source_text') code = 'BLANK_SOURCE_TEXT';
        else if (message === 'source_text_too_long') code = 'SOURCE_TEXT_TOO_LONG';
        else if (message === 'empty_target') code = 'UNKNOWN_LANGUAGE';
        else if (message === 'empty_batch') code = 'EMPTY_BATCH';
        else if (message === 'batch_too_large') code = 'BATCH_TOO_LARGE';
        return { ok: false, code, message };
    }

    let sourceLanguage: 'en';
    try {
        sourceLanguage = normalizeSourceLanguage(parsed.data.sourceLanguage);
    } catch (error) {
        const code: TranslationContractErrorCode =
            error && typeof error === 'object' && 'code' in error && error.code === 'MISSING_SOURCE_LANGUAGE'
                ? 'MISSING_SOURCE_LANGUAGE'
                : 'INVALID_SOURCE_LANGUAGE';
        return {
            ok: false,
            code,
            message: error instanceof Error ? error.message : 'invalid_source_language',
        };
    }

    // §38 — application-scope check, plus provider capability when verified.
    // An unknown, canonical or disabled target is rejected here and never
    // reaches Google.
    const target = validateTargetLanguage(parsed.data.targetLanguage, providerTargets);
    if (!target.valid) {
        const codeMap: Record<string, TranslationContractErrorCode> = {
            empty_target: 'UNKNOWN_LANGUAGE',
            unknown_language: 'UNKNOWN_LANGUAGE',
            canonical_not_runtime_target: 'CANONICAL_TARGET_NOT_ALLOWED',
            disabled: 'LANGUAGE_DISABLED',
            not_runtime_translatable: 'NOT_RUNTIME_TRANSLATABLE',
            provider_unsupported: 'PROVIDER_UNSUPPORTED',
        };
        return { ok: false, code: codeMap[target.reason] ?? 'UNKNOWN_LANGUAGE', message: target.reason };
    }

    return {
        ok: true,
        value: {
            sourceLanguage,
            targetLanguage: target.language.code,
            sourceText: parsed.data.sourceText,
            surface: parsed.data.surface,
            engineVersion: parsed.data.engineVersion ?? TRANSLATION_ENGINE_VERSION,
            glossaryVersion: parsed.data.glossaryVersion ?? TRANSLATION_GLOSSARY_VERSION,
            providerCapability: target.providerCapability,
        },
    };
}
