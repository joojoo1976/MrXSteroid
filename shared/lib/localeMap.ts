/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  localeMap.ts — Pure, edge-safe localization mapping
 *
 *  No browser/node APIs, no heavy deps — importable from middleware (Edge),
 *  server components and the client alike. Single source of truth for the
 *  country → language and country → unit-system rules of the auto-localization
 *  engine.
 *
 *  Supported UI languages today: Arabic (ar) + English (en). Any other country
 *  language (German, Chinese, …) intentionally falls back to English per the
 *  product spec, while the unit system stays country-accurate where known.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUPPORTED_LANGS = ['ar', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export type UnitSystemLite = 'metric' | 'imperial';

/** All Arab League members + widely Arabic-speaking territories (ISO-3166 alpha-2). */
export const ARAB_COUNTRIES: ReadonlySet<string> = new Set([
    'SA', 'EG', 'AE', 'BH', 'DJ', 'DZ', 'IQ', 'JO', 'KM', 'KW', 'LB', 'LY',
    'MA', 'MR', 'OM', 'PS', 'QA', 'SD', 'SO', 'SY', 'TN', 'YE', 'EH',
]);

/**
 * Countries that use the imperial/US customary system as primary (or, for the
 * UK, as the bodybuilding convention this platform follows).
 */
export const IMPERIAL_COUNTRIES: ReadonlySet<string> = new Set(['US', 'LR', 'MM', 'GB']);

/** Normalizes any BCP-47 tag to a supported language, or null. */
export function normalizeLang(raw: string | null | undefined): SupportedLang | null {
    if (!raw) return null;
    const base = raw.toLowerCase().split('-')[0];
    return base === 'ar' || base === 'en' ? (base as SupportedLang) : null;
}

/** Official-language mapping: Arab countries → Arabic, everything else → English. */
export function languageForCountry(countryCode: string | null | undefined): SupportedLang {
    return countryCode && ARAB_COUNTRIES.has(countryCode.toUpperCase()) ? 'ar' : 'en';
}

/** Country-accurate unit system: imperial for the US/liberia/Myanmar/UK, else metric. */
export function unitForCountry(countryCode: string | null | undefined): UnitSystemLite {
    return countryCode && IMPERIAL_COUNTRIES.has(countryCode.toUpperCase()) ? 'imperial' : 'metric';
}

/** Language-derived unit fallback when the country is unknown. */
export function unitForLanguage(lang: SupportedLang): UnitSystemLite {
    return lang === 'ar' ? 'metric' : 'imperial';
}

/** BCP-47 locale string for a supported language. */
export function localeForLanguage(lang: SupportedLang): string {
    return lang === 'ar' ? 'ar-EG' : 'en-US';
}

/**
 * Parses an HTTP `Accept-Language` header (with q-values) and returns the first
 * supported language, or null when none of the preferred languages are supported.
 */
export function pickAcceptLanguage(header: string | null | undefined): SupportedLang | null {
    if (!header) return null;
    const parsed = header
        .split(',')
        .map((part) => {
            const [tag, ...params] = part.trim().split(';');
            let q = 1;
            for (const p of params) {
                const m = p.match(/q=([\d.]+)/);
                if (m) q = parseFloat(m[1]);
            }
            return { tag: tag.toLowerCase(), q };
        })
        .filter((x) => x.tag && x.tag !== '*')
        .sort((a, b) => b.q - a.q);

    for (const { tag } of parsed) {
        const lang = normalizeLang(tag);
        if (lang) return lang;
    }
    return null;
}
