/**
 * Central glossary for terms whose runtime rendering is product-controlled
 * (§67). Glossary terms travel through the same identity-safe sentinel layer as
 * dynamic placeholders, so the provider cannot alter brands or fixed wording.
 */
export const TRANSLATION_GLOSSARY_VERSION = 'mrx-core-v1';

export type TranslationGlossaryEntry = {
    /** Exact English source term. Matching is case-sensitive. */
    readonly source: string;
    /** Missing targets preserve the canonical English term. */
    readonly translations?: Readonly<Record<string, string>>;
};

export type TranslationGlossaryTerm = {
    readonly source: string;
    readonly replacement: string;
};

export const TRANSLATION_GLOSSARY: readonly TranslationGlossaryEntry[] = [
    { source: 'Mr. X-Steroid' },
    { source: 'MrXSteroid' },
    { source: 'InstaPay' },
    { source: 'Kashier' },
] as const;

export function validateTranslationGlossary(
    entries: readonly TranslationGlossaryEntry[] = TRANSLATION_GLOSSARY
): void {
    const seen = new Set<string>();
    for (const entry of entries) {
        if (entry.source.trim() === '') throw new Error('Glossary source terms must not be blank.');
        if (seen.has(entry.source)) throw new Error(`Conflicting glossary term: ${entry.source}`);
        seen.add(entry.source);
        for (const [target, value] of Object.entries(entry.translations ?? {})) {
            if (target.trim() === '' || value.trim() === '') {
                throw new Error(`Glossary translations must not be blank (${entry.source}).`);
            }
        }
    }
}

export function glossaryTermsForTarget(
    targetLanguage: string,
    entries: readonly TranslationGlossaryEntry[] = TRANSLATION_GLOSSARY
): readonly TranslationGlossaryTerm[] {
    validateTranslationGlossary(entries);
    const target = targetLanguage.toLowerCase().trim();
    return [...entries]
        .sort((a, b) => b.source.length - a.source.length)
        .map((entry) => ({
            source: entry.source,
            replacement: entry.translations?.[target] ?? entry.source,
        }));
}
