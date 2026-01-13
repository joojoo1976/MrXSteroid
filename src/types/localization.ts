export enum SupportedLanguage {
    AR = 'ar',
    EN = 'en',
    DE = 'de',
    JA = 'ja'
}

export enum SupportedCountry {
    SA = 'SA', // Saudi Arabia
    EG = 'EG', // Egypt
    AE = 'AE', // UAE
    JO = 'JO', // Jordan
    US = 'US', // United States
    GB = 'GB', // United Kingdom
    DE = 'DE', // Germany
    JP = 'JP'  // Japan
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
    nameDe: string;
    nameJa: string;
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
        nameDe: 'Saudi-Arabien',
        nameJa: 'サウジアラビア',
        language: SupportedLanguage.AR,
        currency: { code: 'SAR', symbol: 'ر.س', rate: 3.75, locale: 'ar-SA' },
        flag: '🇸🇦'
    },
    [SupportedCountry.EG]: {
        code: SupportedCountry.EG,
        name: 'مصر',
        nameAr: 'مصر',
        nameEn: 'Egypt',
        nameDe: 'Ägypten',
        nameJa: 'エジプト',
        language: SupportedLanguage.AR,
        currency: { code: 'EGP', symbol: 'ج.م', rate: 30.9, locale: 'ar-EG' },
        flag: '🇪🇬'
    },
    [SupportedCountry.AE]: {
        code: SupportedCountry.AE,
        name: 'الإمارات',
        nameAr: 'الإمارات',
        nameEn: 'UAE',
        nameDe: 'VAE',
        nameJa: 'アラブ首長国連邦',
        language: SupportedLanguage.AR,
        currency: { code: 'AED', symbol: 'د.إ', rate: 3.67, locale: 'ar-AE' },
        flag: '🇦🇪'
    },
    [SupportedCountry.JO]: {
        code: SupportedCountry.JO,
        name: 'الأردن',
        nameAr: 'الأردن',
        nameEn: 'Jordan',
        nameDe: 'Jordanien',
        nameJa: 'ヨルダン',
        language: SupportedLanguage.AR,
        currency: { code: 'JOD', symbol: 'د.ا', rate: 0.71, locale: 'ar-JO' },
        flag: '🇯🇴'
    },
    [SupportedCountry.US]: {
        code: SupportedCountry.US,
        name: 'United States',
        nameAr: 'الولايات المتحدة',
        nameEn: 'United States',
        nameDe: 'Vereinigte Staaten',
        nameJa: 'アメリカ合衆国',
        language: SupportedLanguage.EN,
        currency: { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
        flag: '🇺🇸'
    },
    [SupportedCountry.GB]: {
        code: SupportedCountry.GB,
        name: 'United Kingdom',
        nameAr: 'المملكة المتحدة',
        nameEn: 'United Kingdom',
        nameDe: 'Vereinigtes Königreich',
        nameJa: 'イギリス',
        language: SupportedLanguage.EN,
        currency: { code: 'GBP', symbol: '£', rate: 0.79, locale: 'en-GB' },
        flag: '🇬🇧'
    },
    [SupportedCountry.DE]: {
        code: SupportedCountry.DE,
        name: 'Deutschland',
        nameAr: 'ألمانيا',
        nameEn: 'Germany',
        nameDe: 'Deutschland',
        nameJa: 'ドイツ',
        language: SupportedLanguage.DE,
        currency: { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
        flag: '🇩🇪'
    },
    [SupportedCountry.JP]: {
        code: SupportedCountry.JP,
        name: '日本',
        nameAr: 'اليابان',
        nameEn: 'Japan',
        nameDe: 'Japan',
        nameJa: '日本',
        language: SupportedLanguage.JA,
        currency: { code: 'JPY', symbol: '¥', rate: 149.5, locale: 'ja-JP' },
        flag: '🇯🇵'
    }
};
