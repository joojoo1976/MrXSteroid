'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SecureStorage } from '../shared/lib/secureStorage';
import { detectBrowserLocale } from '../shared/lib/localeDetector';
import { Language, ContentStrings, Theme } from '@/shared/types/types';
import { arContent, enContent } from '../i18n';
import {
    UnitSystem,
    initializeLocalization,
    CURRENCY_RATES,
    formatCurrencyWithLocale
} from '../shared/lib/logic';
import { Currency } from '@/shared/types/types';
import { PreferencesContext, PreferenceStatus } from './PreferencesContext';

const DEFAULT_THEME = Theme.DARK;

const resolveContent = (lang: Language): ContentStrings => {
    const map: Record<Language, ContentStrings> = {
        [Language.AR]: arContent,
        [Language.EN]: enContent,
    };
    return map[lang] || enContent;
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [isAutoDetected, setIsAutoDetected] = useState(false);
    const [status, setStatus] = useState<PreferenceStatus>('BOOT');

    // Initial state matching SSR default to guarantee zero-hydration-mismatch
    const [language, setLanguageState] = useState<Language>(Language.AR);
    const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
    const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
    const [locale, setLocale] = useState<string>('ar-EG');
    const [currency, setCurrency] = useState<string>('USD');

    // Hydration Sync: safely read local preferences upon client mount
    useEffect(() => {
        try {
            // URL locale prefix is authoritative when present (e.g. /ar/timeline).
            // It wins over stored/auto-detected language so a prefixed link or a
            // refresh of /en/* / /ar/* renders the correct language.
            const seg = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
            const urlLang: Language | null = seg === 'ar' ? Language.AR : seg === 'en' ? Language.EN : null;

            if (urlLang) {
                setLanguageState(urlLang);
                setLocale(urlLang === Language.AR ? 'ar-EG' : 'en-US');
                localStorage.setItem('mrx_explicit_language', urlLang);
                SecureStorage.setItem('language', urlLang);
            } else {
                const explicit = localStorage.getItem('mrx_explicit_language');
                if (explicit && (explicit === Language.AR || explicit === Language.EN)) {
                    setLanguageState(explicit as Language);
                    setLocale(explicit === Language.AR ? 'ar-EG' : 'en-US');
                } else {
                    const storedAuto = SecureStorage.getItem('language');
                    if (storedAuto && (storedAuto === Language.AR || storedAuto === Language.EN)) {
                        setLanguageState(storedAuto as Language);
                        setLocale(storedAuto === Language.AR ? 'ar-EG' : 'en-US');
                    } else {
                        const detected = detectBrowserLocale();
                        setLanguageState(detected.language);
                        setLocale(detected.locale);
                    }
                }
            }

            const explicitUnits = localStorage.getItem('mrx_explicit_units');
            const storedUnits = localStorage.getItem('mrx_unit_system');
            if (explicitUnits || storedUnits) {
                setUnitSystemState((explicitUnits || storedUnits) as UnitSystem);
            }

            const storedTheme = localStorage.getItem('mrx_theme');
            if (storedTheme && Object.values(Theme).includes(storedTheme as Theme)) {
                setThemeState(storedTheme as Theme);
            }
        } catch (e) {
            console.warn('Preferences hydration sync warning:', e);
        }
    }, []);

    const initPreferences = useCallback(async (force = false) => {
        const hasExplicitLang = !!localStorage.getItem('mrx_explicit_language');
        const hasExplicitUnits = !!localStorage.getItem('mrx_explicit_units');

        if (force || !isAutoDetected) {
            setStatus('RESOLVING');
            try {
                const geoState = await initializeLocalization();

                const detectedLang = geoState.language as unknown as Language;
                const detectedLocale = geoState.currency?.locale || (detectedLang === Language.AR ? 'ar-SA' : 'en-US');
                const detectedCurrency = geoState.currency?.code || 'USD';

                // Automatically apply if not explicitly overridden by user
                if (!hasExplicitLang || force) {
                    setLanguageState(detectedLang);
                    SecureStorage.setItem('language', detectedLang);
                }

                setLocale(detectedLocale);
                localStorage.setItem('mrx_locale', detectedLocale);

                setCurrency(detectedCurrency);
                localStorage.setItem('mrx_currency', detectedCurrency);

                if (!hasExplicitUnits || force) {
                    const currentLang = (hasExplicitLang && !force) ? language : detectedLang;
                    const smartDefault: UnitSystem = currentLang === Language.AR ? 'metric' : 'imperial';
                    setUnitSystemState(smartDefault);
                    localStorage.setItem('mrx_unit_system', smartDefault);
                }

                setIsAutoDetected(true);
                setStatus('IDLE');
            } catch (error) {
                console.error("Preferences Engine: Geo-Detection Failure", error);
                setStatus('ERROR');
            }
        } else {
            setStatus('IDLE');
        }
    }, [isAutoDetected, language]);

    // Asynchronous Deep Detection (IP Based)
    useEffect(() => {
        if (status === 'BOOT') {
            const timeoutId = setTimeout(() => {
                initPreferences();
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [status, initPreferences]);

    // Side Effects: Language/Direction
    useEffect(() => {
        const isRTL = language === Language.AR;
        document.documentElement.lang = language;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

        // Dynamic Meta and Body classes for seamless transition
        document.body.classList.remove('font-inter', 'font-noto-sans-arabic');
        document.body.classList.add(isRTL ? 'font-noto-sans-arabic' : 'font-inter');
    }, [language]);

    // Side Effects: Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mrx_theme', theme);
    }, [theme]);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Side Effects: User Profile Currency & Unit Sync
    useEffect(() => {
        const syncProfile = async (userId: string) => {
            try {
                const response = await import('../shared/lib/supabase').then(m => m.supabase
                    .from('profiles')
                    .select('currency, unit_system')
                    .eq('id', userId)
                    .single());

                const data = response.data as unknown as { currency?: string; unit_system?: string } | null;

                if (data?.currency) {
                    setCurrency(data.currency);
                    localStorage.setItem('mrx_currency', data.currency);
                }
                if (data?.unit_system && (data.unit_system === 'metric' || data.unit_system === 'imperial')) {
                    setUnitSystemState(data.unit_system as UnitSystem);
                    localStorage.setItem('mrx_explicit_units', data.unit_system);
                    localStorage.setItem('mrx_unit_system', data.unit_system);
                }
            } catch (err) {
                console.warn('Profile sync failed:', err);
            }
        };

        let authSubscription: { unsubscribe: () => void } | null = null;

        import('../shared/lib/supabase').then(async m => {
            const { data } = await m.supabase.auth.getSession();
            if (data.session?.user) {
                setCurrentUserId(data.session.user.id);
                syncProfile(data.session.user.id);
            }

            const { data: { subscription } } = m.supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    setCurrentUserId(session.user.id);
                    syncProfile(session.user.id);
                } else {
                    setCurrentUserId(null);
                }
            });
            authSubscription = subscription;
        });

        return () => {
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, []);

    const setLanguage = useCallback((newLang: Language) => {
        setLanguageState(newLang);
        localStorage.setItem('mrx_explicit_language', newLang);
        SecureStorage.setItem('language', newLang);
        import('../shared/lib/cookies').then(m => m.setPreferenceCookie('mrx_language', newLang));
        setIsAutoDetected(false);

        // Smart unit default: apply only when user has NOT explicitly overridden units
        const hasExplicitUnits = !!localStorage.getItem('mrx_explicit_units');
        if (!hasExplicitUnits) {
            const smartDefault: UnitSystem = newLang === Language.AR ? 'metric' : 'imperial';
            setUnitSystemState(smartDefault);
            localStorage.setItem('mrx_unit_system', smartDefault);
            import('../shared/lib/cookies').then(m => m.setPreferenceCookie('mrx_unit_system', smartDefault));
        }
    }, []);

    const setUnitSystem = useCallback((system: UnitSystem) => {
        setUnitSystemState(system);
        localStorage.setItem('mrx_explicit_units', system);
        localStorage.setItem('mrx_unit_system', system);
        import('../shared/lib/cookies').then(m => m.setPreferenceCookie('mrx_unit_system', system));
        setIsAutoDetected(false);
        window.dispatchEvent(new CustomEvent('mrx_unit_change', { detail: system }));

        // 1. Sync to Supabase user profile if logged in
        if (currentUserId) {
            import('../shared/lib/supabase').then(m => {
                m.supabase
                    .from('profiles')
                    .update({ unit_system: system })
                    .eq('id', currentUserId)
                    .then(({ error }) => {
                        if (error) console.warn('Database unit_system sync failed:', error);
                    });
            });
        }

        // 2. Show rich interactive toast with system explanation & auth recommendation
        import('../shared/lib/unitNotification').then(m => {
            m.showUnitChangeToast(system, !!currentUserId, language === Language.AR, () => router.push('/signup'));
        });
    }, [currentUserId, language, router]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        import('../shared/lib/cookies').then(m => m.setPreferenceCookie('mrx_theme', newTheme));
    }, []);

    const content = useMemo(() => resolveContent(language), [language]);

    const formatPrice = useCallback((priceInUSD: number) => {
        const currencyCode = currency as Currency;
        const rate = CURRENCY_RATES[currencyCode]?.rate || 1;
        const localAmount = priceInUSD * rate;

        // Handle physical products vs digital
        // For Egyptian Pounds (EGP) and similar, we often don't want decimals if the value is high
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol',
            minimumFractionDigits: currencyCode === Currency.EGP ? 0 : 2,
            maximumFractionDigits: 2,
        };

        return formatCurrencyWithLocale(localAmount, currencyCode, locale, options);
    }, [currency, locale]);

    const t = useCallback((key: keyof ContentStrings): string => {
        return (content[key] || enContent[key] || `[MISSING: ${String(key)}]`) as string;
    }, [content]);

    const value = {
        language,
        unitSystem,
        theme,
        status,
        isAutoDetected,
        locale,
        currency,
        formatPrice,
        setLanguage,
        setUnitSystem,
        setTheme,
        t,
        content,
        isRTL: language === Language.AR,
        refreshDetection: () => initPreferences(true)
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};
