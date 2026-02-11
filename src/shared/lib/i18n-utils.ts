
import { SupportedLanguage } from '../types/localization';

/**
 * Sets the HTML dir attribute based on the selected language.
 * Enforces 'rtl' for Arabic and 'ltr' for English.
 * 
 * @param language 'ar' | 'en'
 */
export const setDocumentDirection = (language: string) => {
    const dir = language === SupportedLanguage.AR ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;

    // Consistency check for Tailwind RTL plugins
    if (dir === 'rtl') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
    } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
    }
};

/**
 * Detects the browser language and returns supported format.
 * Defaults to 'en' if neither 'ar' nor 'en' is detected.
 */
export const detectSupportedLanguage = (): SupportedLanguage => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en';
    if (browserLang.startsWith('ar')) return SupportedLanguage.AR;
    return SupportedLanguage.EN;
};
