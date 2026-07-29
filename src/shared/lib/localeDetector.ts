import { Language } from '@/shared/types/types';
import { UnitSystem } from './logic';

export interface InitialLocaleConfig {
    language: Language;
    unitSystem: UnitSystem;
    locale: string;
}

/**
 * Detects browser Accept-Language preferences via navigator.languages / navigator.language.
 * Establishes smart initial defaults for first-time visitors:
 * - Arabic (ar) -> Language: AR, UnitSystem: metric (kg/cm), Locale: ar-EG
 * - English (en) / Others -> Language: EN, UnitSystem: imperial (lbs/in), Locale: en-US
 */
export function detectBrowserLocale(): InitialLocaleConfig {
    if (typeof window === 'undefined') {
        return { language: Language.EN, unitSystem: 'imperial', locale: 'en-US' };
    }

    const browserLangs = navigator.languages || [navigator.language || 'en'];
    
    for (const rawLang of browserLangs) {
        if (!rawLang) continue;
        const code = rawLang.split('-')[0].toLowerCase();
        if (code === 'ar') {
            return {
                language: Language.AR,
                unitSystem: 'metric',
                locale: rawLang.toLowerCase().includes('sa') ? 'ar-SA' : 'ar-EG'
            };
        }
        if (code === 'en') {
            return {
                language: Language.EN,
                unitSystem: 'imperial',
                locale: 'en-US'
            };
        }
    }

    // Default fallback
    return {
        language: Language.EN,
        unitSystem: 'imperial',
        locale: 'en-US'
    };
}
