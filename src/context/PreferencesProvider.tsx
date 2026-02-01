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
        const stored = SecureStorage.getItem('language');
        if (stored) return stored as Language;

        // Browser Sniffing
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        const supported = Object.values(Language) as string[];
        return supported.includes(browserLang) ? (browserLang as Language) : DEFAULT_LANG;
    });

    const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
        const stored = localStorage.getItem('mrx_unit_system');
        if (stored) return stored as UnitSystem;

        // Logical Heuristic based on locale/timezone
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
        const storedLang = SecureStorage.getItem('language');
        const storedUnit = localStorage.getItem('mrx_unit_system');
        const storedLocale = localStorage.getItem('mrx_locale');
        const storedCurrency = localStorage.getItem('mrx_currency');

        if (force || (!storedLang || !storedUnit)) {
            setStatus('RESOLVING');
            try {
                const geoState = await initializeLocalization();

                const detectedLang = geoState.language as unknown as Language;
                const detectedLocale = geoState.currency?.locale || (detectedLang === Language.AR ? 'ar-SA' : 'en-US');
                const detectedCurrency = geoState.currency?.code || 'USD';

                if (!storedLang || force) {
                    setLanguageState(detectedLang);
                    if (!storedLang) SecureStorage.setItem('language', detectedLang);
                }

                if (!storedLocale || force) {
                    setLocale(detectedLocale);
                    localStorage.setItem('mrx_locale', detectedLocale);
                }

                if (!storedCurrency || force) {
                    setCurrency(detectedCurrency);
                    localStorage.setItem('mrx_currency', detectedCurrency);
                }

                if (!storedUnit || force) {
                    const detectedUnit = getSystemFromRegion(geoState.country);
                    setUnitSystemState(detectedUnit);
                    if (!storedUnit) localStorage.setItem('mrx_unit_system', detectedUnit);
                }

                setIsAutoDetected(true);
                setStatus('IDLE');
            } catch (error) {
                console.error("Preferences Engine: Geo-Detection Failure", error);
                setStatus('ERROR');
            }
        } else {
            setLocale(storedLocale || 'en-US');
            setCurrency(storedCurrency || 'USD');
            setStatus('IDLE');
        }
    }, []);

    // Asynchronous Deep Detection (IP Based)
    useEffect(() => {
        // To avoid cascading render warning, we ensure the state update 
        // happens in a different tick if it's synchronous logic inside initPreferences
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

        // Font and direction management is now centralized in App.tsx
    }, [language]);

    // Side Effects: Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mrx_theme', theme);
    }, [theme]);

    const setLanguage = useCallback((newLang: Language) => {
        setLanguageState(newLang);
        SecureStorage.setItem('language', newLang);
        setIsAutoDetected(false); // Manually overridden
    }, []);

    const setUnitSystem = useCallback((system: UnitSystem) => {
        setUnitSystemState(system);
        localStorage.setItem('mrx_unit_system', system);
        setIsAutoDetected(false); // Manually overridden
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
