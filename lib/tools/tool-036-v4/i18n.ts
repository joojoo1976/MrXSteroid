/**
 * Tool-036 V4 — locale helpers (acceptance F7.5).
 *
 * The dictionaries themselves live in `i18n-copy.ts`: they are data, and the
 * preview route resolves them on the server and passes them down (bundle gate,
 * see that file). This module keeps only what the client must run — the locale
 * list, the `dir` mapping, the `{placeholder}` interpolator — plus the copy
 * types, so call sites still have a single import for types.
 *
 * The active locale is NOT owned here: it is `state.prefs.locale`, the same
 * persisted value the envelope exports, so the tool has a single source of
 * truth for language (and one place to restore on reload).
 */
import type { Locale } from '@/lib/i18n/config';

export type UiLocale = Locale;

export const UI_LOCALES: readonly UiLocale[] = ['ar', 'en'];

/** Text direction for a locale. Arabic is right-to-left, English left-to-right. */
export function dirFor(locale: UiLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Replace `{name}` placeholders; unknown placeholders are left visible. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

export type { CopyDict, CopyKey } from './i18n-copy';
