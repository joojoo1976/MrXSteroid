import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SecureStorage } from '../utils/secureStorage';
import { Language, ContentStrings, Theme } from '../types';
import { arContent, enContent } from '../i18n';
import {
    UnitSystem,
    getSystemFromRegion,
    initializeLocalization,
    detectCountryFromBrowser,
    CURRENCY_RATES,
    formatCurrencyWithLocale
} from '../utils/logic';
import { Currency } from '../types';
import { PreferencesContext, PreferenceStatus } from './PreferencesContext';

const DEFAULT_LANG = Language.EN;
const DEFAULT_THEME = Theme.DARK;

const resolveContent = (lang: Language): ContentStrings => {
    const map: Record<Language, ContentStrings> = {
        [Language.AR]: arContent,
        [Language.EN]: enContent,
    };
    return map[lang] || enContent;
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAutoDetected, setIsAutoDetected] = useState(false);
    const [status, setStatus] = useState<PreferenceStatus>('BOOT');

    // Initial Sync Detection for Zero-Latency First Interaction
    const [language, setLanguageState] = useState<Language>(() => {
        // Priority 1: Explicit user override
        const explicit = localStorage.getItem('mrx_explicit_language');
        if (explicit) return explicit as Language;

        // Priority 2: Previously detected auto-language
        const storedAuto = SecureStorage.getItem('language');
        if (storedAuto) return storedAuto as Language;

        // Priority 3: Browser Sniffing (Reliable Fallback)
        const browserLangs = navigator.languages || [navigator.language];
        for (const lang of browserLangs) {
            const code = lang.split('-')[0].toLowerCase();
            if (code === 'ar') return Language.AR;
            if (code === 'en') return Language.EN;
        }

        return DEFAULT_LANG;
    });

    const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
        const explicit = localStorage.getItem('mrx_explicit_units');
        if (explicit) return explicit as UnitSystem;

        const storedAuto = localStorage.getItem('mrx_unit_system');
        if (storedAuto) return storedAuto as UnitSystem;

        const browserCountry = detectCountryFromBrowser();
        return getSystemFromRegion(browserCountry);
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('mrx_theme');
        if (stored && Object.values(Theme).includes(stored as Theme)) return stored as Theme;
        return DEFAULT_THEME;
    });

    const [locale, setLocale] = useState<string>('en-US');
    const [currency, setCurrency] = useState<string>('USD');

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
                    const detectedUnit = getSystemFromRegion(geoState.country);
                    setUnitSystemState(detectedUnit);
                    localStorage.setItem('mrx_unit_system', detectedUnit);
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
    }, [isAutoDetected]);

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

    // Side Effects: User Profile Currency Sync
    useEffect(() => {
        const syncProfile = async (userId: string) => {
            try {
                const response = await import('../lib/supabase').then(m => m.supabase
                    .from('profiles')
                    .select('currency')
                    .eq('id', userId)
                    .single());

                const data = response.data as { currency: string } | null;

                if (data?.currency) {
                    setCurrency(data.currency);
                    localStorage.setItem('mrx_currency', data.currency);
                }
            } catch (err) {
                console.warn('Profile sync failed:', err);
            }
        };

        const { data: { subscription } } = import('../lib/supabase').then(async m => {
            const { data } = await m.supabase.auth.getSession();
            if (data.session?.user) syncProfile(data.session.user.id);

            return m.supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) syncProfile(session.user.id);
            });
        }) as any;

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const setLanguage = useCallback((newLang: Language) => {
        setLanguageState(newLang);
        localStorage.setItem('mrx_explicit_language', newLang);
        SecureStorage.setItem('language', newLang);
        setIsAutoDetected(false);
    }, []);

    const setUnitSystem = useCallback((system: UnitSystem) => {
        setUnitSystemState(system);
        localStorage.setItem('mrx_explicit_units', system);
        localStorage.setItem('mrx_unit_system', system);
        setIsAutoDetected(false);
        window.dispatchEvent(new CustomEvent('mrx_unit_change', { detail: system }));
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
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
