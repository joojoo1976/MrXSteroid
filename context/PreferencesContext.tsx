'use client';

import { createContext, useContext } from 'react';
import { Language, ContentStrings, Theme } from '@/shared/types/types';
import { UnitSystem } from '../shared/lib/logic';

export type PreferenceStatus = 'BOOT' | 'DECRYPTING' | 'RESOLVING' | 'IDLE' | 'ERROR';

export interface PreferencesContextProps {
    language: Language;
    unitSystem: UnitSystem;
    theme: Theme;
    status: PreferenceStatus;
    isAutoDetected: boolean;
    locale: string;
    currency: string;
    formatPrice: (priceInUSD: number) => string;
    setLanguage: (lang: Language) => void;
    setUnitSystem: (system: UnitSystem) => void;
    setTheme: (theme: Theme) => void;
    t: (key: keyof ContentStrings) => string;
    content: ContentStrings;
    isRTL: boolean;
    refreshDetection: () => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
