import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Dumbbell, Heart, Activity, ShieldAlert, ShieldCheck, Clock, TestTube2,
    BookOpen, Map, TrendingUp, RotateCcw, Zap, BicepsFlexed, Trophy, Flag, Star,
    Brain, CircleDollarSign, Sparkles, Syringe
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { Currency, Page, Language } from '../types';
import {
    footerKeywordsPoolAr,
    footerKeywordsPoolEn,
    seoKeywordsArabic,
    seoKeywordsEnglish
} from '../i18n';
import {
    SupportedLanguage,
    SupportedCountry,
    LocalizationState,
    COUNTRY_CONFIGS,
    CurrencyInfo
} from '../types/localization';

/**
 * SHARED & COOKIE UTILITIES
 */
export const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
};

export const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * TOAST UTILITIES
 */
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showLoading = (message: string) => toast.loading(message);
export const dismissToast = (toastId: string) => toast.dismiss(toastId);

/**
 * ANIMATION UTILITIES
 */
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReducedMotion;
}

export const TRANSITIONS = {
    FADE_IN: 'animate-fadeIn transition-opacity duration-300 ease-out',
    SLIDE_UP: 'animate-slideUp transition-transform duration-300 ease-out',
    SCALE_HOVER: 'hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out',
    PULSE_SOFT: 'animate-pulseSoft',
};

/**
 * BRAND STYLING UTILITIES
 */
export const renderStyledBrandName = (text: string, logoClassName?: string): React.ReactNode => {
    if (!text) return text;
    const brandFull = "Mr. X-Steroid";
    const brandShort = "Mr. X";
    const brandArFull = "مستر إكس-ستيرويد";
    const brandArShort = "مستر إكس";
    const regex = new RegExp(`(${brandFull}|${brandArFull}|${brandShort}|${brandArShort})`, 'g');
    const parts = text.split(regex);
    return parts.map((part, index) => {
        if (part === brandFull || part === brandArFull) {
            return <BrandLogo key={index} isLink={true} className={logoClassName || "text-inherit"} />;
        }
        if (part === brandShort || part === brandArShort) {
            return <BrandLogo key={index} variant="short" isLink={true} className={logoClassName || "text-inherit"} />;
        }
        return part;
    });
};

export const replaceBrandWithHtml = (text: string): string => {
    if (!text) return text;
    const brandFull = "Mr. X-Steroid";
    const brandShort = "Mr. X";
    const brandArFull = "مستر إكس-ستيرويد";
    const brandArShort = "مستر إكس";
    const regex = new RegExp(`(${brandFull}|${brandArFull}|${brandShort}|${brandArShort})`, 'g');
    return text.replace(regex, (match) => {
        return `<span class="font-chiller text-gold-500 font-bold cursor-pointer hover:underline" onclick="window.dispatchEvent(new CustomEvent('mrx_navigate', { detail: 'home' }))">${match}</span>`;
    });
};

/**
 * CURRENCY CONVERSION UTILITIES
 */
export interface CurrencyRate {
    code: Currency;
    symbol: string;
    rate: number;
    locale: string;
    name: string;
}

export const CURRENCY_RATES: Record<Currency, CurrencyRate> = {
    [Currency.USD]: { code: Currency.USD, symbol: '$', rate: 1.00, locale: 'en-US', name: 'US Dollar' },
    [Currency.SAR]: { code: Currency.SAR, symbol: 'ر.س', rate: 3.75, locale: 'ar-SA', name: 'Saudi Riyal' },
    [Currency.EGP]: { code: Currency.EGP, symbol: 'ج.م', rate: 50.00, locale: 'ar-EG', name: 'Egyptian Pound' },
    [Currency.EUR]: { code: Currency.EUR, symbol: '€', rate: 0.92, locale: 'de-DE', name: 'Euro' },
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    const amountInUSD = amount / CURRENCY_RATES[from].rate;
    return amountInUSD * CURRENCY_RATES[to].rate;
};

export const formatCurrency = (amount: number, currency: Currency, locale?: string): string => {
    const currencyInfo = CURRENCY_RATES[currency];
    const useLocale = locale || currencyInfo.locale;
    try {
        return new Intl.NumberFormat(useLocale, {
            style: 'currency', currency, currencyDisplay: 'symbol',
            minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
};

export const formatCurrencyWithLocale = (
    amount: number,
    currency: Currency,
    locale: string,
    options?: Intl.NumberFormatOptions
): string => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options,
        }).format(amount);
    } catch (error) {
        const currencyInfo = CURRENCY_RATES[currency];
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
};

export const getCurrencyByLanguage = (lang: string): Currency => {
    const currencyMap: Record<string, Currency> = { 'en': Currency.USD, 'ar': Currency.SAR, 'de': Currency.EUR, 'ja': Currency.USD };
    return currencyMap[lang] || Currency.USD;
};

export const saveCurrencyPreference = (currency: Currency): void => {
    try { localStorage.setItem('mrx_currency_preference', currency); } catch (e) {
        console.warn('Failed to save currency preference:', e);
    }
};

export const loadCurrencyPreference = (defaultLang: string = 'en'): Currency => {
    try {
        const stored = localStorage.getItem('mrx_currency_preference');
        if (stored && Object.values(Currency).includes(stored as Currency)) return stored as Currency;
    } catch (e) {
        console.warn('Failed to load currency preference:', e);
    }
    return getCurrencyByLanguage(defaultLang);
};

/**
 * SHIPPING UTILITIES
 */
export interface ShippingProvider {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
}

export const getShippingProviders = async (country: string): Promise<ShippingProvider[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isEgypt = country.toLowerCase() === 'egypt' || country === 'مصر';
    if (isEgypt) {
        return [
            { id: 'bosta_standard', name: 'Bosta Standard (3-5 Days)', price: 5.00, estimatedDays: '3-5' },
            { id: 'bosta_express', name: 'Bosta Express (1-2 Days)', price: 12.00, estimatedDays: '1-2' },
        ];
    }
    return [
        { id: 'dhl_global', name: 'DHL Express International', price: 45.00, estimatedDays: '3-7' },
        { id: 'fedex_priority', name: 'FedEx Priority', price: 38.00, estimatedDays: '5-8' },
        { id: 'ups_worldwide', name: 'UPS Worldwide', price: 42.00, estimatedDays: '4-7' },
        { id: 'aramex_international', name: 'Aramex International', price: 25.00, estimatedDays: '7-12' },
    ];
};

/**
 * UNIT CONVERSION UTILITIES
 */
export type UnitSystem = 'metric' | 'imperial';

export interface UnitPreferences {
    system: UnitSystem;
    weight: 'kg' | 'lbs';
    height: 'cm' | 'inches';
    volume: 'ml' | 'oz';
}

export const CONVERSIONS = {
    KG_TO_LBS: 2.20462262,
    LBS_TO_KG: 0.45359237,
    CM_TO_INCHES: 0.393700787,
    INCHES_TO_CM: 2.54,
    ML_TO_OZ: 0.0338140227,
    OZ_TO_ML: 29.5735296,
    // Lab Conversions (US to SI)
    NGDL_TO_NMOLL: 0.0347, // Testosterone
    PGML_TO_PMOLL: 3.67,  // Estradiol
    MGDL_TO_MMOLL: 0.0555, // Glucose (standard)
} as const;

export const convertValue = (value: number, type: 'weight' | 'height' | 'volume', toSystem: UnitSystem): number => {
    if (isNaN(value)) return 0;
    switch (type) {
        case 'weight': return toSystem === 'imperial' ? value * CONVERSIONS.KG_TO_LBS : value;
        case 'height': return toSystem === 'imperial' ? value * CONVERSIONS.CM_TO_INCHES : value;
        case 'volume': return toSystem === 'imperial' ? value * CONVERSIONS.ML_TO_OZ : value;
        default: return value;
    }
};

export const toMetric = (value: number, type: 'weight' | 'height' | 'volume'): number => {
    if (isNaN(value)) return 0;
    switch (type) {
        case 'weight': return value * CONVERSIONS.LBS_TO_KG;
        case 'height': return value * CONVERSIONS.INCHES_TO_CM;
        case 'volume': return value * CONVERSIONS.OZ_TO_ML;
        default: return value;
    }
};

export const convertLabValue = (value: number, unit: string, toSystem: UnitSystem): { value: number, unit: string } => {
    if (toSystem === 'metric') {
        if (unit === 'ng/dL') return { value: value * CONVERSIONS.NGDL_TO_NMOLL, unit: 'nmol/L' };
        if (unit === 'pg/mL') return { value: value * CONVERSIONS.PGML_TO_PMOLL, unit: 'pmol/L' };
        if (unit === 'mg/dL') return { value: value * CONVERSIONS.MGDL_TO_MMOLL, unit: 'mmol/L' };
    }
    return { value, unit };
};

export const formatLabRange = (min: number, max: number, unit: string, toSystem: UnitSystem): { range: string, unit: string, min: number, max: number } => {
    const minConv = convertLabValue(min, unit, toSystem);
    const maxConv = convertLabValue(max, unit, toSystem);
    if (toSystem === 'metric' && minConv.unit !== unit) {
        return {
            range: `${minConv.value.toFixed(minConv.value < 10 ? 2 : 1)} - ${maxConv.value.toFixed(maxConv.value < 10 ? 2 : 1)}`,
            unit: minConv.unit,
            min: minConv.value,
            max: maxConv.value
        };
    }
    return { range: `${min} - ${max}`, unit, min, max };
};

export const formatUnit = (value: number, type: 'weight' | 'height' | 'volume', system: UnitSystem, decimals: number = 1): string => {
    const val = convertValue(value, type, system);
    if (type === 'height' && system === 'imperial') {
        const totalInches = val;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
    }
    const unitMap = {
        weight: system === 'metric' ? 'kg' : 'lbs',
        height: system === 'metric' ? 'cm' : 'inches',
        volume: system === 'metric' ? 'ml' : 'oz'
    };
    return `${val.toFixed(decimals)} ${unitMap[type]}`;
};

export const saveUnitSystem = (system: UnitSystem): void => {
    try { localStorage.setItem('mrx_unit_system', system); } catch (e) {
        console.warn('Failed to save unit system:', e);
    }
};

export const loadUnitSystem = (): UnitSystem => {
    try {
        const stored = localStorage.getItem('mrx_unit_system');
        if (stored === 'metric' || stored === 'imperial') return stored;
    } catch (e) { console.warn('Failed to load unit system:', e); }
    return 'metric';
};

/**
 * ADVANCED LOCALIZATION UTILITIES
 */
export async function detectCountryFromIP(): Promise<SupportedCountry> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code as SupportedCountry;
        if (Object.values(SupportedCountry).includes(countryCode)) {
            console.log('🌍 Auto-detected country:', countryCode);
            return countryCode;
        }
        return detectCountryFromBrowser();
    } catch (error) {
        console.warn('IP detection failed, falling back to browser detection:', error);
        return detectCountryFromBrowser();
    }
}

export function detectCountryFromBrowser(): SupportedCountry {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ar')) return SupportedCountry.SA;
    if (browserLang.startsWith('de')) return SupportedCountry.DE;
    if (browserLang.startsWith('ja')) return SupportedCountry.JP;
    if (browserLang.startsWith('en-gb')) return SupportedCountry.GB;
    return SupportedCountry.US;
}

export function getLanguageByCountry(country: SupportedCountry): SupportedLanguage {
    return COUNTRY_CONFIGS[country].language;
}

export function getCurrencyByCountry(country: SupportedCountry): CurrencyInfo {
    return COUNTRY_CONFIGS[country].currency;
}

export function getDirectionByLanguage(language: SupportedLanguage): 'rtl' | 'ltr' {
    return language === SupportedLanguage.AR ? 'rtl' : 'ltr';
}

export function createLocalizationState(country: SupportedCountry, isAutoDetected: boolean = false): LocalizationState {
    const language = getLanguageByCountry(country);
    const currency = getCurrencyByCountry(country);
    const direction = getDirectionByLanguage(language);
    return { country, language, currency, direction, isAutoDetected };
}

export function saveLocalizationState(state: LocalizationState): void {
    localStorage.setItem('advanced_localization_state', JSON.stringify(state));
}

export function loadLocalizationState(): LocalizationState | null {
    try {
        const saved = localStorage.getItem('advanced_localization_state');
        if (saved) return JSON.parse(saved);
    } catch (e) { console.warn('Failed to load localization state:', e); }
    return null;
}

export async function initializeLocalization(): Promise<LocalizationState> {
    const saved = loadLocalizationState();
    if (saved && !saved.isAutoDetected) {
        console.log('📍 Using saved localization preference');
        return saved;
    }
    console.log('🔍 Auto-detecting user location...');
    const country = await detectCountryFromIP();
    const state = createLocalizationState(country, true);
    saveLocalizationState(state);
    return state;
}

export function switchCountry(country: SupportedCountry): LocalizationState {
    const state = createLocalizationState(country, false);
    saveLocalizationState(state);
    console.log('🌐 Switched to:', country);
    return state;
}

export function getCountryName(country: SupportedCountry, language: SupportedLanguage): string {
    const config = COUNTRY_CONFIGS[country];
    switch (language) {
        case SupportedLanguage.AR: return config.nameAr;
        case SupportedLanguage.EN: return config.nameEn;
        case SupportedLanguage.DE: return config.nameDe;
        case SupportedLanguage.JA: return config.nameJa;
        default: return config.nameEn;
    }
}

/**
 * KEYWORD GENERATOR UTILITIES
 */
export const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + start.getDay() + 1) / 7);
};

const seededShuffle = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((seed / (i + 1)) * (i + 1)) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getWeeklyKeywords = (lang: Language): string[] => {
    const week = getCurrentWeekNumber();
    const isAr = lang === Language.AR;
    const footerPool = isAr ? footerKeywordsPoolAr : footerKeywordsPoolEn;
    const seoPool = isAr ? seoKeywordsArabic : seoKeywordsEnglish;
    const combined = [...footerPool, ...seoPool];
    const shuffled = seededShuffle(combined, week * 13);
    return shuffled.slice(0, Math.max(50, Math.min(combined.length, 60)));
};

/**
 * CRYPTO UTILITIES
 */
export function md5(string: string) {
    function md5_Cycle(x: number[], k: number[]) {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787280);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function add32(a: number, b: number) { return (a + b) & 0xFFFFFFFF; }

    function md5_1(s: string) {
        const n = s.length;
        const state = [1732584193, -271733879, -1732584194, 271733878];
        let i;
        for (i = 64; i <= s.length; i += 64) {
            md5_Cycle(state, md5_Convert(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5_Cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n << 3;
        md5_Cycle(state, tail);
        return state;
    }

    function md5_Convert(s: string) {
        const r = [];
        for (let i = 0; i < 64; i += 4) {
            r[i >> 2] = s.charCodeAt(i) | (s.charCodeAt(i + 1) << 8) | (s.charCodeAt(i + 2) << 16) | (s.charCodeAt(i + 3) << 24);
        }
        return r;
    }

    const hex_Chr = "0123456789abcdef".split("");

    function hex(x: (number | string)[]) {
        for (let i = 0; i < x.length; i++) {
            let s = "";
            for (let j = 0; j < 4; j++)
                s += hex_Chr[((x[i] as number) >> (j * 8 + 4)) & 0x0F] + hex_Chr[((x[i] as number) >> (j * 8)) & 0x0F];
            x[i] = s;
        }
        return x.join("");
    }
    return hex(md5_1(string));
}

/**
 * ICON UTILITIES & FLAG RENDERERS
 */
export const USFlag = () => (
    <svg viewBox="0 0 16 12" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="12" fill="#fff" />
        <path d="M0 0h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0z" fill="#bf0a30" />
        <rect width="7" height="6" fill="#002868" />
        <g fill="#fff">
            <circle cx="1.5" cy="1" r=".5" /><circle cx="3.5" cy="1" r=".5" /><circle cx="5.5" cy="1" r=".5" />
            <circle cx="2.5" cy="3" r=".5" /><circle cx="4.5" cy="3" r=".5" />
            <circle cx="1.5" cy="5" r=".5" /><circle cx="3.5" cy="5" r=".5" /><circle cx="5.5" cy="5" r=".5" />
        </g>
    </svg>
);

export const EGFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="9" fill="#fff" />
        <rect width="12" height="3" fill="#ce1126" />
        <rect width="12" height="3" y="6" fill="#000" />
        <circle cx="6" cy="4.5" r="1.2" fill="#c09300" />
    </svg>
);

export const ILFlag = () => (
    <svg viewBox="0 0 22 16" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="22" height="16" fill="#fff" />
        <rect y="2" width="22" height="2" fill="#005eb8" />
        <rect y="12" width="22" height="2" fill="#005eb8" />
        <g transform="translate(11,8) scale(0.5)">
            <polygon points="0,-6 5.2,3 -5.2,3" fill="none" stroke="#005eb8" strokeWidth="1.5" />
            <polygon points="0,6 5.2,-3 -5.2,-3" fill="none" stroke="#005eb8" strokeWidth="1.5" />
        </g>
    </svg>
);

export const FRFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="9" fill="#002395" /><rect width="4" height="9" x="4" fill="#fff" /><rect width="4" height="9" x="8" fill="#ed2939" />
    </svg>
);

export const ESFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px) shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="2.25" fill="#aa151b" /><rect width="12" height="4.5" y="2.25" fill="#f1bf00" /><rect width="12" height="2.25" y="6.75" fill="#aa151b" />
    </svg>
);

export const DEFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="3" fill="#000" /><rect width="12" height="3" y="3" fill="#dd0000" /><rect width="12" height="3" y="6" fill="#ffce00" />
    </svg>
);

export const ITFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="9" fill="#009246" /><rect width="4" height="9" x="4" fill="#fff" /><rect width="4" height="9" x="8" fill="#ce2b37" />
    </svg>
);

export const RUFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="3" fill="#fff" /><rect width="12" height="3" y="3" fill="#0039a6" /><rect width="12" height="3" y="6" fill="#d52b1e" />
    </svg>
);

export const TRFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="9" fill="#e30a17" /><circle cx="5" cy="4.5" r="2" fill="#fff" /><circle cx="5.5" cy="4.5" r="1.6" fill="#e30a17" />
        <path d="M7 4.5l1 0.5l-0.5 1l-0.5 -1l1 -0.5z" fill="#fff" transform="rotate(-15 7 4.5)" />
    </svg>
);

export const PTFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="4.8" height="9" fill="#006600" /><rect width="7.2" height="9" x="4.8" fill="#ff0000" /><circle cx="4.8" cy="4.5" r="1.5" fill="#ffff00" stroke="#000" strokeWidth="0.1" />
    </svg>
);

export const FAFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="3" fill="#239f40" /><rect width="12" height="3" y="3" fill="#fff" /><rect width="12" height="3" y="6" fill="#da0000" /><circle cx="6" cy="4.5" r="0.8" fill="#da0000" />
    </svg>
);

export const URFlag = () => (
    <svg viewBox="0 0 12 9" className="w-5 h-3.5 rounded-[2px] shadow-sm flex-shrink-0 border border-zinc-100 dark:border-zinc-800" xmlns="http://www.w3.org/2000/svg">
        <rect width="12" height="9" fill="#01411c" /><rect width="3" height="9" fill="#fff" /><circle cx="7.5" cy="4.5" r="2.5" fill="#fff" /><circle cx="8" cy="4" r="2.5" fill="#01411c" />
    </svg>
);

export const IconRenderer = ({ iconKey, className }: { iconKey: string, className?: string }) => {
    const props = className ? { className } : {};
    switch (iconKey) {
        case 'athlete': return <Dumbbell className="w-8 h-8 text-gold-500" {...props} />;
        case 'women': return <Heart className="w-8 h-8 text-pink-500" {...props} />;
        case 'coach': return <Activity className="w-8 h-8 text-blue-500" {...props} />;
        case 'truth': return <ShieldAlert className="w-8 h-8 text-red-500" {...props} />;
        case 'shield': return <ShieldCheck className="w-8 h-8 text-green-500" {...props} />;
        case 'time': return <Clock className="w-8 h-8 text-gold-500" {...props} />;
        case 'science': return <TestTube2 className="w-8 h-8 text-purple-500" {...props} />;
        case 'source': return <BookOpen className="w-8 h-8 text-blue-500" {...props} />;
        case 'health': return <Heart className="w-8 h-8 text-red-500" {...props} />;
        case 'guide': return <Map className="w-8 h-8 text-green-500" {...props} />;
        case 'chart': return <TrendingUp className="w-8 h-8 text-gold-500" {...props} />;
        case 'exit': return <RotateCcw className="w-8 h-8 text-blue-500" {...props} />;
        case 'spark': return <Zap className="w-8 h-8 text-gold-500" {...props} />;
        case 'muscle': return <BicepsFlexed className="w-8 h-8 text-gold-500" {...props} />;
        case 'trophy': return <Trophy className="w-8 h-8 text-gold-500" {...props} />;
        case 'flag': return <Flag className="w-8 h-8 text-gold-500" {...props} />;
        case 'roi': return <CircleDollarSign className="w-8 h-8 text-gold-500" {...props} />;
        case 'safety': return <ShieldCheck className="w-8 h-8 text-green-500" {...props} />;
        case 'simplified': return <Sparkles className="w-8 h-8 text-blue-400" {...props} />;
        case 'smart': return <Brain className="w-8 h-8 text-purple-400" {...props} />;
        case 'injection': return <Syringe className="w-8 h-8 text-gold-500" {...props} />;
        default: return <Star className="w-8 h-8 text-gold-500" {...props} />;
    }
};
