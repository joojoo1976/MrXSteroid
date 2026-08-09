export enum SupportedLanguage {
    AR = 'ar',
    EN = 'en'
}

export enum SupportedCountry {
    SA = 'SA', // Saudi Arabia
    EG = 'EG', // Egypt
    US = 'US', // United States
    GB = 'GB'  // United Kingdom
}

export interface CurrencyInfo {
    code: string;
    symbol: string;
    rate: number;
    locale: string;
}

export interface LocalizationState {
    country: SupportedCountry;
    language: SupportedLanguage;
    currency: CurrencyInfo;
    direction: 'rtl' | 'ltr';
    isAutoDetected: boolean;
}

export interface CountryConfig {
    code: SupportedCountry;
    name: string;
    nameAr: string;
    nameEn: string;
    language: SupportedLanguage;
    currency: CurrencyInfo;
    flag: string;
}

export const COUNTRY_CONFIGS: Record<SupportedCountry, CountryConfig> = {
    [SupportedCountry.SA]: {
        code: SupportedCountry.SA,
        name: 'السعودية',
        nameAr: 'السعودية',
        nameEn: 'Saudi Arabia',
        language: SupportedLanguage.AR,
        currency: { code: 'SAR', symbol: 'ر.س', rate: 3.75, locale: 'ar-SA' },
        flag: '🇸🇦'
    },
    [SupportedCountry.EG]: {
        code: SupportedCountry.EG,
        name: 'مصر',
        nameAr: 'مصر',
        nameEn: 'Egypt',
        language: SupportedLanguage.AR,
        currency: { code: 'EGP', symbol: 'ج.م', rate: 50.0, locale: 'ar-EG' },
        flag: '🇪🇬'
    },
    [SupportedCountry.US]: {
        code: SupportedCountry.US,
        name: 'United States',
        nameAr: 'الولايات المتحدة',
        nameEn: 'United States',
        language: SupportedLanguage.EN,
        currency: { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
        flag: '🇺🇸'
    },
    [SupportedCountry.GB]: {
        code: SupportedCountry.GB,
        name: 'United Kingdom',
        nameAr: 'المملكة المتحدة',
        nameEn: 'United Kingdom',
        language: SupportedLanguage.EN,
        currency: { code: 'USD', symbol: '$', rate: 1, locale: 'en-GB' },
        flag: '🇬🇧'
    }
};
