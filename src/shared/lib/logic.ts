import { toast } from 'sonner';
import { Currency } from '@/shared/types/types';
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


export const TRANSITIONS = {
    FADE_IN: 'animate-fadeIn transition-opacity duration-300 ease-out',
    SLIDE_UP: 'animate-slideUp transition-transform duration-300 ease-out',
    SCALE_HOVER: 'hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out',
    PULSE_SOFT: 'animate-pulseSoft',
};

/**
 * BRAND STYLING UTILITIES
 */


/**
 * Safely replaces brand mentions with styled elements without creating XSS vulnerabilities
 * This function returns plain text instead of HTML to prevent XSS
 */
export const replaceBrandWithPlainText = (text: string): string => {
    if (!text) return text;
    const brandFull = "Mr. X-Steroid";
    const brandShort = "Mr. X";
    const brandArFull = "مستر إكس-ستيرويد";
    const brandArShort = "مستر إكس";

    // Using a placeholder approach that will be handled safely by React components
    const regex = new RegExp(`(${brandFull}|${brandArFull}|${brandShort}|${brandArShort})`, 'g');
    return text.replace(regex, (match) => {
        // Return the matched text without any HTML markup to prevent XSS
        return match;
    });
};

/**
 * Alternative approach: Return structured data that can be safely rendered by React components
 */
export interface BrandReplacementResult {
    parts: Array<{ text: string; isBrand?: boolean; brandType?: 'full' | 'short' | 'ar-full' | 'ar-short' }>;
}

export const replaceBrandWithStructuredData = (text: string): BrandReplacementResult => {
    if (!text) return { parts: [{ text }] };

    const brandPatterns = [
        { pattern: "Mr. X-Steroid", type: 'full' },
        { pattern: "Mr. X", type: 'short' },
        { pattern: "مستر إكس-ستيرويد", type: 'ar-full' },
        { pattern: "مستر إكس", type: 'ar-short' }
    ];

    // Find all brand occurrences
    const parts = [];
    let lastIndex = 0;

    // Create a combined regex for all brands
    const combinedPattern = new RegExp(brandPatterns.map(bp => bp.pattern).join('|'), 'g');

    let match: RegExpExecArray | null;
    while ((match = combinedPattern.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push({ text: text.substring(lastIndex, match.index) });
        }

        // Add brand match
        const matchedPattern = brandPatterns.find(bp => bp.pattern === match[0]);
        parts.push({
            text: match[0],
            isBrand: true,
            brandType: matchedPattern?.type as 'full' | 'short' | 'ar-full' | 'ar-short'
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex) });
    }

    return { parts };
};

// Legacy function - wraps brand names in styled spans
export const replaceBrandWithHtml = (text: string): string => {
    if (text === null || text === undefined) return text;
    if (!text || typeof text !== 'string') return text;

    // Use a single combined regex to avoid double-replacement.
    // Order matters: longer patterns first so "Mr. X-Steroid" matches before "Mr. X".
    const combinedRegex = /(Mr\.\s*X[-\s]Steroid|مستر\s*إكس[-\s]ستيرويد|Mr\.\s*X|مستر\s*إكس)/g;

    return text.replace(combinedRegex, (match) => {
        // Determine which brand was matched
        if (/Mr\.\s*X[-\s]Steroid/.test(match)) {
            return '<span class="brand-full">Mr. X-Steroid</span>';
        }
        if (/مستر\s*إكس[-\s]ستيرويد/.test(match)) {
            return '<span class="brand-ar-full">مستر إكس-ستيرويد</span>';
        }
        if (/Mr\.\s*X/.test(match)) {
            return '<span class="brand-short">Mr. X</span>';
        }
        if (/مستر\s*إكس/.test(match)) {
            return '<span class="brand-ar-short">مستر إكس</span>';
        }
        return match;
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
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    const amountInUSD = amount / CURRENCY_RATES[from].rate;
    return amountInUSD * CURRENCY_RATES[to].rate;
};

export const formatCurrency = (amount: number, currency: Currency, locale?: string): string => {
    const currencyInfo = CURRENCY_RATES[currency];
    const useLocale = locale || currencyInfo.locale;

    // For Arabic locales, we can force the numbering system if requested, 
    // but Intl usually handles it based on the locale tag (e.g., ar-EG)
    try {
        return new Intl.NumberFormat(useLocale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        const currencyInfo = CURRENCY_RATES[currency as Currency] || CURRENCY_RATES[Currency.USD];
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
        // Handle Eastern Arabic numerals for specific locales if necessary
        const finalLocale = locale.startsWith('ar') ? `${locale}-u-nu-arab` : locale;

        return new Intl.NumberFormat(finalLocale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options,
        }).format(amount);
    } catch {
        const currencyInfo = CURRENCY_RATES[currency as Currency] || CURRENCY_RATES[Currency.USD];
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
};

export const getCurrencyByLanguage = (lang: string): Currency => {
    const currencyMap: Record<string, Currency> = { 'en': Currency.USD, 'ar': Currency.SAR };
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
    await new Promise(resolve => setTimeout(resolve, 300));
    const isEgypt = country && (country.toUpperCase() === 'EG' || country.toLowerCase() === 'egypt' || country.includes('مصر'));
    if (isEgypt) {
        return [
            { id: 'eg_standard', name: 'الشحن القياسي - جمهورية مصر العربية', price: 239.00, estimatedDays: '2-4' },
        ];
    }
    return [
        { id: 'dhl_global', name: 'DHL Express International', price: 45.00, estimatedDays: '3-7' },
        { id: 'fedex_priority', name: 'FedEx Priority', price: 38.00, estimatedDays: '5-8' },
        { id: 'ups_worldwide', name: 'UPS Worldwide', price: 42.00, estimatedDays: '4-7' },
        { id: 'aramex_international', name: 'Aramex International', price: 25.00, estimatedDays: '7-12' },
    ];
};

// ═══════════════════════════════════════════════════════════════════════════
//                              PRICING CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const EGP_PRICES: Record<string, number> = {
    'digital': 499,
    'bundle': 749,
    'coaching': 849,
    'coaching_plus': 10848, // 849 + 9999
    'pdf': 499,
    'paperback': 749
};

export const EGP_ORIGINAL_PRICES: Record<string, number> = {
    'digital': 699,
    'bundle': 849,
    'coaching': 949,
    'coaching_plus': 11848,
};

export const COACHING_ADDON_EGP = 9999;
export const COACHING_ADDON_USD = 200.00;

/**
 * Calculates the base amount for a product based on country and original USD price.
 * Ensures consistent pricing across frontend and backend.
 */
export function calculateBaseAmount(
    country: string | undefined,
    productVariant: string,
    defaultUsdAmount: number
): { amount: number; currency: string; isEg: boolean } {
    const isEg = (country || '').toLowerCase() === 'egypt' || country === 'مصر' || country === 'EG';
    
    if (isEg) {
        return {
            amount: EGP_PRICES[productVariant] || EGP_PRICES['bundle'] || 750,
            currency: 'EGP',
            isEg: true
        };
    }

    return {
        amount: defaultUsdAmount,
        currency: 'USD',
        isEg: false
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//                          EXISTING LOGIC
// ═══════════════════════════════════════════════════════════════════════════
export const calculateShippingRates = async (address: { country: string }): Promise<ShippingProvider[]> => {
    // Mock reusing existing logic or just returning consistent data
    // In a real app this uses the full address
    return getShippingProviders(address?.country || 'US');
};

const PROMO_ATTEMPTS = new Map<string, { count: number; lastAttempt: number }>();

export const validatePromoCode = async (
    code: string,
    ip: string = 'user_ip'
): Promise<{ valid: boolean; message: string; discount?: number; discountPct?: number; codeType?: 'fixed' | 'pct' }> => {
    const normalizeCode = code.toUpperCase().trim();
    const now = Date.now();

    // Rate Limiting (Mock IP based)
    const attempts = PROMO_ATTEMPTS.get(ip) || { count: 0, lastAttempt: 0 };

    // Reset if > 1 minute
    if (now - attempts.lastAttempt > 60000) {
        attempts.count = 0;
    }

    if (attempts.count >= 5) {
        return { valid: false, message: "Too many attempts. Blocked for 1 minute." };
    }

    // Update attempts
    PROMO_ATTEMPTS.set(ip, { count: attempts.count + 1, lastAttempt: now });
    await new Promise(r => setTimeout(r, 800)); // Dramatic pause

    // ── Legacy fixed code ──────────────────────────────────────────────────
    if (normalizeCode === 'STEROIDIQ') {
        return { valid: true, message: "✅ Valid Code Applied — $1 Discount", discount: 1.00, codeType: 'fixed' };
    }

    // ── Quiz-generated IQ codes: IQ1P-XXXX (1%) or IQ05-XXXX (0.5%) ──────
    // Format: IQ1P-[4 alphanumeric chars]
    const onePercentMatch = /^IQ1P-[A-Z0-9]{4}$/.test(normalizeCode);
    if (onePercentMatch) {
        return {
            valid: true,
            message: "🔥 Steroid IQ Code Applied — 1% Discount",
            discountPct: 1,        // 1 percent
            codeType: 'pct'
        };
    }

    // Format: IQ05-[4 alphanumeric chars]
    const halfPercentMatch = /^IQ05-[A-Z0-9]{4}$/.test(normalizeCode);
    if (halfPercentMatch) {
        return {
            valid: true,
            message: "🔥 Steroid IQ Code Applied — 0.5% Discount",
            discountPct: 0.5,      // 0.5 percent
            codeType: 'pct'
        };
    }

    return { valid: false, message: "❌ Invalid or expired code." };
};

/**
 * UNIT CONVERSION UTILITIES
 * Consolidated from unitConverter.ts
 */

export type UnitSystem = 'metric' | 'imperial';

export interface UnitPreferences {
    system: UnitSystem;
    weight: 'kg' | 'lbs';
    height: 'cm' | 'inches';
    volume: 'ml' | 'oz';
}

// Precise Conversion Constants
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

/**
 * Universal conversion function that ensures data integrity.
 */
export const convertValue = (value: number, type: 'weight' | 'height' | 'volume' | 'length', toSystem: UnitSystem): number => {
    if (isNaN(value)) return 0;

    switch (type) {
        case 'weight':
            return toSystem === 'imperial' ? value * CONVERSIONS.KG_TO_LBS : value;
        case 'height':
        case 'length':
            return toSystem === 'imperial' ? value * CONVERSIONS.CM_TO_INCHES : value;
        case 'volume':
            return toSystem === 'imperial' ? value * CONVERSIONS.ML_TO_OZ : value;
        default:
            return value;
    }
};

/**
 * Inverse conversion to get the base metric value from an imperial input.
 */
export const toMetric = (value: number, type: 'weight' | 'height' | 'volume' | 'length'): number => {
    if (isNaN(value)) return 0;

    switch (type) {
        case 'weight':
            return value * CONVERSIONS.LBS_TO_KG;
        case 'height':
        case 'length':
            return value * CONVERSIONS.INCHES_TO_CM;
        case 'volume':
            return value * CONVERSIONS.OZ_TO_ML;
        default:
            return value;
    }
};

/**
 * Localized weight unit label ('كجم' | 'رطل' | 'kg' | 'lbs') for the given system/language.
 */
export const getWeightUnitLabel = (system: UnitSystem, isAr: boolean): string =>
    isAr ? (system === 'imperial' ? 'رطل' : 'كجم') : (system === 'imperial' ? 'lbs' : 'kg');

/**
 * Localized length unit label ('سم' | 'بوصة' | 'cm' | 'in') for the given system/language.
 */
export const getLengthUnitLabel = (system: UnitSystem, isAr: boolean): string =>
    isAr ? (system === 'imperial' ? 'بوصة' : 'سم') : (system === 'imperial' ? 'in' : 'cm');

/**
 * Converts a metric value into the display unit system with 1-decimal precision.
 * Pure function — safe to call in render/memoized contexts.
 */
export const toDisplayUnit = (metricValue: number, type: 'weight' | 'length', system: UnitSystem): number =>
    parseFloat(convertValue(metricValue, type, system).toFixed(1));

/**
 * Converts lab values between US and SI units.
 */
export const convertLabValue = (value: number, unit: string, toSystem: UnitSystem): { value: number, unit: string } => {
    if (toSystem === 'metric') {
        if (unit === 'ng/dL') return { value: value * CONVERSIONS.NGDL_TO_NMOLL, unit: 'nmol/L' };
        if (unit === 'pg/mL') return { value: value * CONVERSIONS.PGML_TO_PMOLL, unit: 'pmol/L' };
        if (unit === 'mg/dL') return { value: value * CONVERSIONS.MGDL_TO_MMOLL, unit: 'mmol/L' };
    }
    return { value, unit };
};

/**
 * Formats a lab range and min/max values based on the unit system.
 */
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

    return {
        range: `${min} - ${max}`,
        unit,
        min,
        max
    };
};

// Format with Unit
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

// LocalStorage Keys
const EXT_STORAGE_KEY = 'mrx_unit_system';

// Save Preference
export const saveUnitSystem = (system: UnitSystem): void => {
    try {
        localStorage.setItem(EXT_STORAGE_KEY, system);
    } catch (error) {
        console.warn('Failed to save unit system:', error);
    }
};

// Load Preference
export const loadUnitSystem = (): UnitSystem => {
    try {
        const stored = localStorage.getItem(EXT_STORAGE_KEY);
        if (stored === 'metric' || stored === 'imperial') {
            return stored;
        }
    } catch (error) {
        console.warn('Failed to load unit system:', error);
    }
    return 'metric';
};


/**
 * ADVANCED LOCALIZATION UTILITIES
 * Consolidated from advancedLocalization.ts
 */
import { SupportedLanguage, SupportedCountry, LocalizationState, COUNTRY_CONFIGS, CurrencyInfo } from '@/shared/types/localization';

/**
 * Detects the user's country from their IP address using ipapi.co
 */
export async function detectCountryFromIP(): Promise<SupportedCountry> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code as SupportedCountry;

        if (Object.values(SupportedCountry).includes(countryCode)) {
            return countryCode;
        }

        return detectCountryFromBrowser();
    } catch (error) {
        console.warn('Geo-Detection suppressed or blocked:', error);
        return detectCountryFromBrowser();
    }
}

/**
 * Detects country from browser language settings
 */
export function detectCountryFromBrowser(): SupportedCountry {
    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith('ar')) return SupportedCountry.EG;
    if (browserLang.startsWith('en-gb')) return SupportedCountry.GB;

    return SupportedCountry.US;
}

/**
 * Gets the default language for a country
 */
export function getLanguageByCountry(country: SupportedCountry): SupportedLanguage {
    return COUNTRY_CONFIGS[country].language;
}

/**
 * Gets the unit system (metric/imperial) based on the country code.
 * Implementation of "Smart Geo-Adaptation" algorithm for Mr. X.
 */
export function getSystemFromRegion(countryCode: string): UnitSystem {
    const imperialCountries = ['US', 'MM', 'LR'];
    const hybridCountries = ['GB', 'UK']; // UK often uses stones/imperial for bodybuilding

    const code = countryCode.toUpperCase();

    if (imperialCountries.includes(code)) return 'imperial';
    if (hybridCountries.includes(code)) return 'imperial'; // Defaulting UK to imperial for Bodybuilding standards

    return 'metric'; // Default fallback
}

/**
 * Gets currency information for a country
 */
export function getCurrencyByCountry(country: SupportedCountry): CurrencyInfo {
    return COUNTRY_CONFIGS[country].currency;
}

/**
 * Determines text direction based on language
 */
export function getDirectionByLanguage(language: SupportedLanguage): 'rtl' | 'ltr' {
    return language === SupportedLanguage.AR ? 'rtl' : 'ltr';
}

/**
 * Creates a complete localization state from a country code
 */
export function createLocalizationState(
    country: SupportedCountry,
    isAutoDetected: boolean = false
): LocalizationState {
    const language = getLanguageByCountry(country);
    const currency = getCurrencyByCountry(country);
    const direction = getDirectionByLanguage(language);

    return {
        country,
        language,
        currency,
        direction,
        isAutoDetected
    };
}

/**
 * Saves localization state to localStorage
 */
export function saveLocalizationState(state: LocalizationState): void {
    try {
        localStorage.setItem('advanced_localization_state', JSON.stringify(state));
    } catch (error: unknown) { // Explicitly type error as unknown
        console.warn('Failed to save localization state:', error);
    }
}

/**
 * Loads localization state from localStorage
 */
export function loadLocalizationState(): LocalizationState | null {
    try {
        const saved = localStorage.getItem('advanced_localization_state');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error: unknown) { // Explicitly type error as unknown
        console.warn('Failed to load localization state:', error);
    }
    return null;
}

/**
 * Initializes localization on app startup
 */
export async function initializeLocalization(): Promise<LocalizationState> {
    const saved = loadLocalizationState();
    if (saved && !saved.isAutoDetected) {
        return saved;
    }

    const country = await detectCountryFromIP();
    const state = createLocalizationState(country, true);

    saveLocalizationState(state);
    return state;
}

/**
 * Switches to a new country and updates all related settings
 */
export function switchCountry(country: SupportedCountry): LocalizationState {
    const state = createLocalizationState(country, false);
    saveLocalizationState(state);
    return state;
}

/**
 * Gets the country name in the current language
 */
export function getCountryName(country: SupportedCountry, language: SupportedLanguage): string {
    const config = COUNTRY_CONFIGS[country];
    switch (language) {
        case SupportedLanguage.AR: return config.nameAr;
        case SupportedLanguage.EN: return config.nameEn;
        default: return config.nameEn;
    }
}
