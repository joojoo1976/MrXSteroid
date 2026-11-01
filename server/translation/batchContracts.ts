import { z } from 'zod';
import {
    MAX_BATCH_SIZE,
    MAX_SOURCE_CHARS,
    RUNTIME_SOURCE_LANGUAGE,
    TRANSLATION_ENGINE_VERSION,
    TRANSLATION_GLOSSARY_VERSION,
    TranslationSurfaceSchema,
    normalizeSourceLanguage,
    type TranslationContractError,
    type TranslationContractResult,
    type TranslationSurface,
} from './contracts';
import { validateTargetLanguage, type ProviderCapability } from './languages';

/** Stable client-generated identifier used only to map a validated batch result. */
export const TranslationBatchItemSchema = z.object({
    id: z.string().min(1, 'missing_item_id').max(128, 'item_id_too_long'),
    sourceText: z.string()
        .min(1, 'empty_source_text')
        .max(MAX_SOURCE_CHARS, 'source_text_too_long')
        .refine((value) => value.trim().length > 0, 'blank_source_text'),
    surface: TranslationSurfaceSchema,
});

export const TranslationRuntimeBatchSchema = z.object({
    sourceLanguage: z.string().min(1, 'missing_source_language'),
    targetLanguage: z.string().min(1, 'empty_target'),
    items: z.array(TranslationBatchItemSchema).min(1, 'empty_batch').max(MAX_BATCH_SIZE, 'batch_too_large'),
    engineVersion: z.string().optional(),
    glossaryVersion: z.string().optional(),
});

export type TranslationBatchItem = z.infer<typeof TranslationBatchItemSchema>;
export type TranslationRuntimeBatch = z.infer<typeof TranslationRuntimeBatchSchema>;

export type ValidatedTranslationBatch = {
    readonly sourceLanguage: 'en';
    readonly targetLanguage: string;
    readonly items: readonly TranslationBatchItem[];
    readonly engineVersion: string;
    readonly glossaryVersion: string;
    readonly providerCapability: ProviderCapability;
};

function structuralCode(message: string): TranslationContractError['code'] {
    if (message === 'missing_source_language') return 'MISSING_SOURCE_LANGUAGE';
    if (message === 'empty_source_text') return 'EMPTY_SOURCE_TEXT';
    if (message === 'blank_source_text') return 'BLANK_SOURCE_TEXT';
    if (message === 'source_text_too_long') return 'SOURCE_TEXT_TOO_LONG';
    if (message === 'empty_batch') return 'EMPTY_BATCH';
    if (message === 'batch_too_large') return 'BATCH_TOO_LARGE';
    if (message === 'empty_target') return 'UNKNOWN_LANGUAGE';
    if (message === 'missing_item_id' || message === 'item_id_too_long') return 'INVALID_BATCH_IDS';
    return 'UNKNOWN_SURFACE';
}

export function validateTranslationBatch(
    input: unknown,
    providerTargets?: ReadonlySet<string> | null
): TranslationContractResult<ValidatedTranslationBatch> {
    const parsed = TranslationRuntimeBatchSchema.safeParse(input);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const message = issue?.message ?? 'invalid_batch';
        const missingSource = issue?.path?.[0] === 'sourceLanguage' && issue?.code === 'invalid_type';
        return {
            ok: false,
            code: missingSource ? 'MISSING_SOURCE_LANGUAGE' : structuralCode(message),
            message,
        };
    }

    let sourceLanguage: 'en';
    try {
        sourceLanguage = normalizeSourceLanguage(parsed.data.sourceLanguage);
    } catch (error) {
        return {
            ok: false,
            code: error && typeof error === 'object' && 'code' in error && error.code === 'MISSING_SOURCE_LANGUAGE'
                ? 'MISSING_SOURCE_LANGUAGE'
                : 'INVALID_SOURCE_LANGUAGE',
            message: error instanceof Error ? error.message : 'invalid_source_language',
        };
    }

    const ids = new Set<string>();
    for (const item of parsed.data.items) {
        if (ids.has(item.id)) {
            return { ok: false, code: 'INVALID_BATCH_IDS', message: 'duplicate_item_id' };
        }
        ids.add(item.id);
    }

    const target = validateTargetLanguage(parsed.data.targetLanguage, providerTargets);
    if (!target.valid) {
        const codeMap: Record<string, TranslationContractError['code']> = {
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
            sourceLanguage: sourceLanguage ?? RUNTIME_SOURCE_LANGUAGE,
            targetLanguage: target.language.code,
            items: parsed.data.items,
            engineVersion: parsed.data.engineVersion ?? TRANSLATION_ENGINE_VERSION,
            glossaryVersion: parsed.data.glossaryVersion ?? TRANSLATION_GLOSSARY_VERSION,
            providerCapability: target.providerCapability,
        },
    };
}

export type TranslationBatchResultItem = {
    readonly id: string;
    readonly translatedText: string;
};

export type TranslationBatchWireResponse = {
    readonly sourceLanguage: 'en';
    readonly targetLanguage: string;
    readonly surface: TranslationSurface;
    readonly items: readonly TranslationBatchResultItem[];
};