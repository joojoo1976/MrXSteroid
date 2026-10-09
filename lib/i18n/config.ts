export type Locale = 'ar' | 'en';

export const locales: Locale[] = ['ar', 'en'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export function getLocaleDirection(locale: Locale): 'rtl' | 'ltr' {
  return localeDirections[locale];
}
