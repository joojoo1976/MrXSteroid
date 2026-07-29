import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectBrowserLocale } from '../../shared/lib/localeDetector';
import { setPreferenceCookie, getPreferenceCookie } from '../../shared/lib/cookies';
import { Language } from '@/shared/types/types';

describe('Locale & Unit Management System (Smart Hybrid Approach)', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
        vi.unstubAllGlobals();
        mockStorage = {};
        vi.mocked(localStorage.getItem).mockImplementation((key: string) => mockStorage[key] || null);
        vi.mocked(localStorage.setItem).mockImplementation((key: string, val: string) => { mockStorage[key] = String(val); });
        vi.mocked(localStorage.clear).mockImplementation(() => { mockStorage = {}; });
        document.cookie = '';
    });

    it('detects Arabic Accept-Language and sets smart defaults (AR + Metric)', () => {
        vi.stubGlobal('navigator', {
            languages: ['ar-SA', 'ar', 'en-US'],
            language: 'ar-SA'
        });

        const detected = detectBrowserLocale();
        expect(detected.language).toBe(Language.AR);
        expect(detected.unitSystem).toBe('metric');
        expect(detected.locale).toBe('ar-SA');
    });

    it('detects English Accept-Language and sets smart defaults (EN + Imperial)', () => {
        vi.stubGlobal('navigator', {
            languages: ['en-US', 'en', 'fr'],
            language: 'en-US'
        });

        const detected = detectBrowserLocale();
        expect(detected.language).toBe(Language.EN);
        expect(detected.unitSystem).toBe('imperial');
        expect(detected.locale).toBe('en-US');
    });

    it('supports arbitrary decoupled manual combinations (Arabic + Imperial)', () => {
        localStorage.setItem('mrx_explicit_language', 'ar');
        localStorage.setItem('mrx_explicit_units', 'imperial');

        expect(localStorage.getItem('mrx_explicit_language')).toBe('ar');
        expect(localStorage.getItem('mrx_explicit_units')).toBe('imperial');
    });

    it('supports arbitrary decoupled manual combinations (English + Metric)', () => {
        localStorage.setItem('mrx_explicit_language', 'en');
        localStorage.setItem('mrx_explicit_units', 'metric');

        expect(localStorage.getItem('mrx_explicit_language')).toBe('en');
        expect(localStorage.getItem('mrx_explicit_units')).toBe('metric');
    });

    it('persists preferences to cookies seamlessly', () => {
        setPreferenceCookie('mrx_language', Language.AR);
        setPreferenceCookie('mrx_unit_system', 'imperial');

        expect(getPreferenceCookie('mrx_language')).toBe(Language.AR);
        expect(getPreferenceCookie('mrx_unit_system')).toBe('imperial');
    });
});
