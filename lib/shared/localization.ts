// lib/shared/localization.ts
/**
 * lib/shared/localization.ts
 * Unified Localization Service for SmartTools
 * Arabic/English support with RTL/LTR direction handling
 */

export type Locale = 'ar' | 'en';
export type Dir = 'rtl' | 'ltr';

/** Supported locales */
export const LOCALES = ['ar', 'en'] as const;

/** Direction mapping */
export const DIR_MAP: Record<Locale, Dir> = {
  ar: 'rtl',
  en: 'ltr',
};

/** Default locale (Arabic is default for the platform) */
export const DEFAULT_LOCALE: Locale = 'ar';

/**
 * Extract flat dictionary from nested or flat JSON structure
 */
function flattenI18n(json: Record<string, unknown>, locale: Locale): Record<string, any> {
  const nested = (json as Record<string, any>)[locale] 
    ?? (json as Record<string, any>).en 
    ?? (json as Record<string, any>).ar 
    ?? json;
  return nested && typeof nested === 'object' ? nested : (json as Record<string, any>);
}

/**
 * Pick localization for a specific locale
 */
export function pickLocalization<T extends Record<string, any>>(
  json: { en?: T; ar?: T } & Record<string, unknown>,
  locale: Locale = 'ar'
): T & { dir: Dir } {
  const flat = flattenI18n(json as Record<string, unknown>, locale);
  return { dir: DIR_MAP[locale], ...flat } as T & { dir: Dir };
}

/**
 * Hook version using PreferencesContext (for React components)
 * Returns flat dictionary with `dir` attribute
 */
export function useLocalization<T extends Record<string, any>>(
  json: { en?: T; ar?: T } & Record<string, unknown>
): T & { dir: Dir } {
  // This is a placeholder - actual implementation uses PreferencesContext
  // Components should use the existing useToolI18n from lib/tools/i18nHelper
  // until we migrate to this shared version
  const locale: Locale = 'ar'; // Default, actual comes from context
  return pickLocalization(json, locale);
}

/**
 * Get direction for locale
 */
export function getDirection(locale: Locale): Dir {
  return DIR_MAP[locale];
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

/**
 * Get opposite locale
 */
export function getOppositeLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

/**
 * Type for i18n JSON structure
 */
export type ToolI18nJson<T = Record<string, string>> = {
  en?: T;
  ar?: T;
} & Record<string, unknown>;

/**
 * Validate that all required keys exist in both locales
 */
export function validateI18nKeys(
  json: ToolI18nJson,
  requiredKeys: string[]
): { missingInAr: string[]; missingInEn: string[] } {
  const ar = json.ar ?? {};
  const en = json.en ?? {};
  
  return {
    missingInAr: requiredKeys.filter(key => !(key in ar)),
    missingInEn: requiredKeys.filter(key => !(key in en)),
  };
}

/**
 * Check for hardcoded strings in component (utility for testing)
 * Returns array of suspicious string literals
 */
export function findHardcodedStrings(content: string): string[] {
  const suspicious: string[] = [];
  // Match string literals that look like UI text (contain spaces, punctuation)
  const stringLiteralRegex = /['"`]([^'"`]{3,}?['"`])/g;
  let match;
  while ((match = stringLiteralRegex.exec(content)) !== null) {
    const str = match[1];
    // Filter out technical strings (paths, IDs, etc.)
    if (!/^[\/.:a-zA-Z0-9_-]+$/.test(str) && str.length > 2) {
      suspicious.push(str);
    }
  }
  return suspicious;
}