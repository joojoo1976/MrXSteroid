/**
 * T1 Foundation — locale precedence (spec §9, §10, §11, §13, §16, §17, §18).
 *
 * Guards adopted decision D-01 / D-02. The middleware cascade is re-implemented
 * here as a faithful mirror of `middleware.ts` so the precedence contract is
 * pinned by a test rather than by a comment. If the middleware changes, this
 * file must change with it.
 *
 *   Path Locale  (routing signal, highest)
 *   > Explicit   (mrx_explicit_language)
 *   > Saved      (mrx_locale)
 *   > Geo-IP     (x-vercel-ip-country)
 *   > Browser    (Accept-Language)
 *   > English fallback
 */
import { describe, it, expect } from 'vitest';
import { normalizeLang, languageForCountry, pickAcceptLanguage } from '../../../shared/lib/localeMap';

const DEFAULT_LANG = 'en';

type Signals = {
    pathLocale?: string | null;
    explicitLang?: string | null;
    resolvedCookie?: string | null;
    country?: string | null;
    acceptHeader?: string | null;
};

/** Faithful mirror of the cascade in middleware.ts:56-70. */
function resolveLang(s: Signals): string {
    const pathLocale = normalizeLang(s.pathLocale);
    const explicitLang = normalizeLang(s.explicitLang);
    const resolvedCookie = normalizeLang(s.resolvedCookie);
    const accept = pickAcceptLanguage(s.acceptHeader);

    if (pathLocale) return pathLocale;
    if (explicitLang) return explicitLang;
    if (resolvedCookie) return resolvedCookie;
    if (s.country) return languageForCountry(s.country);
    if (accept) return accept;
    if (s.acceptHeader) return 'en';
    return DEFAULT_LANG;
}

describe('T1 · locale precedence · D-01 / D-02', () => {
    it('D-01 · saved locale outranks Geo-IP', () => {
        // A traveller from a non-Arab country keeps a saved Arabic preference.
        expect(resolveLang({ resolvedCookie: 'ar', country: 'US' })).toBe('ar');
    });

    it('D-01 · saved English outranks an Arab Geo-IP country', () => {
        expect(resolveLang({ resolvedCookie: 'en', country: 'EG' })).toBe('en');
    });

    it('§10 explicit preference outranks everything below it', () => {
        expect(resolveLang({ explicitLang: 'ar', resolvedCookie: 'en', country: 'US' })).toBe('ar');
        expect(resolveLang({ explicitLang: 'en', resolvedCookie: 'ar', country: 'EG' })).toBe('en');
    });

    it('D-01 · path locale is the highest routing signal', () => {
        expect(resolveLang({ pathLocale: 'en', explicitLang: 'ar', resolvedCookie: 'ar', country: 'EG' })).toBe('en');
        expect(resolveLang({ pathLocale: 'ar', explicitLang: 'en', resolvedCookie: 'en', country: 'US' })).toBe('ar');
    });

    it('§13 Geo-IP applies only when no stronger signal exists', () => {
        expect(resolveLang({ country: 'EG' })).toBe('ar');
        expect(resolveLang({ country: 'US' })).toBe('en');
    });

    it('§16 browser language is a fallback only', () => {
        // With no stronger signal the browser language decides.
        expect(resolveLang({ acceptHeader: 'ar-EG,ar;q=0.9' })).toBe('ar');
        // But it never overrides an explicit preference...
        expect(resolveLang({ acceptHeader: 'en-US', explicitLang: 'ar' })).toBe('ar');
        // ...nor a valid saved preference.
        expect(resolveLang({ acceptHeader: 'en-US', resolvedCookie: 'ar' })).toBe('ar');
    });

    it('D-01 · Geo-IP outranks the browser language', () => {
        expect(resolveLang({ acceptHeader: 'ar-EG,ar;q=0.9', country: 'US' })).toBe('en');
        expect(resolveLang({ acceptHeader: 'en-US', country: 'EG' })).toBe('ar');
    });

    it('§17 unsupported browser language falls back to English', () => {
        expect(resolveLang({ acceptHeader: 'de-DE,de;q=0.9' })).toBe('en');
    });

    it('D-02 · no signal at all resolves to English, not Arabic', () => {
        expect(DEFAULT_LANG).toBe('en');
        expect(resolveLang({})).toBe('en');
    });

    it('§11 a strong saved preference is never displaced by travel', () => {
        for (const country of ['US', 'GB', 'DE', 'EG', 'SA', 'JP']) {
            expect(resolveLang({ resolvedCookie: 'en', country })).toBe('en');
        }
    });
});
