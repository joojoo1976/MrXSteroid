import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { SecureStorage } from '../utils/secureStorage';
import { Language, Currency, ContentStrings } from '../types';
import { arContent, enContent, deContent, jaContent } from '../i18n';
import { CURRENCY_RATES } from '../utils/logic';

// --- Types ---
type I18nStatus = 'BOOT' | 'DECRYPTING' | 'RESOLVING' | 'IDLE' | 'ERROR';

interface LanguageContextProps {
    language: Language;
    direction: 'ltr' | 'rtl';
    status: I18nStatus;
    setLanguage: (lang: Language) => void;
    t: (key: keyof ContentStrings) => string;
    content: ContentStrings;
    isRTL: boolean;
}

// --- Constants ---
const DEFAULT_LANG = Language.EN;
const SUPPORTED_LANGUAGES = Object.values(Language);

// --- Context ---
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// --- Helper: Content Resolution with Fallback ---
const resolveContent = (lang: Language): ContentStrings => {
    const map: Record<Language, ContentStrings> = {
        [Language.AR]: arContent,
        [Language.EN]: enContent,
        [Language.DE]: { ...enContent, ...deContent } as ContentStrings,
        [Language.JA]: { ...enContent, ...jaContent } as ContentStrings,
    };
    return map[lang] || enContent;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<I18nStatus>('BOOT');
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

    // --- 1. BOOT & DECRYPT PHASE (State Machine) ---
    useEffect(() => {
        const initEngine = async () => {
            setStatus('DECRYPTING');

            try {
                // Attempt to read encrypted preference
                const storedLang = SecureStorage.getItem('language');

                setStatus('RESOLVING');
                // Artificial delay for cinematic effect (optional, removed for speed)

                if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as Language)) {
                    setLanguageState(storedLang as Language);
                } else {
                    setLanguageState(DEFAULT_LANG);
                }

                setStatus('IDLE');
            } catch (error) {
                console.error("I18n Engine: Critical Failure using fallback", error);
                setLanguageState(DEFAULT_LANG);
                setStatus('ERROR');
            }
        };

        initEngine();
    }, []);

    // --- 2. SIDE EFFECTS (Document Updates) ---
    useEffect(() => {
        const isRTL = language === Language.AR;
        document.documentElement.lang = language;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

        // Update Font Class on Body
        if (isRTL) {
            document.body.classList.add('font-arabic');
            document.body.classList.remove('font-sans');
        } else {
            document.body.classList.add('font-sans');
            document.body.classList.remove('font-arabic');
        }

    }, [language]);

    // --- 3. PUBLIC API ---
    const setLanguage = useCallback((newLang: Language) => {
        // 1. Update State
        setLanguageState(newLang);
        // 2. Encrypt & Persist
        SecureStorage.setItem('language', newLang);
        // 3. Update Currency Preference (Optional side-effect)
        // We can leave currency decoupling or sync it here.
    }, []);

    const content = useMemo(() => resolveContent(language), [language]);

    const t = useCallback((key: keyof ContentStrings): string => {
        return (content[key] || enContent[key] || `[MISSING: ${String(key)}]`) as string;
    }, [content]);

    const value = {
        language,
        direction: (language === Language.AR ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
        isRTL: language === Language.AR,
        status,
        setLanguage,
        t,
        content
    };

    if (status === 'BOOT' || status === 'DECRYPTING') {
        // Optional: Return a loading skeleton if needed, or just render null
        // For now, we render children to prevent flash, default is EN
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
