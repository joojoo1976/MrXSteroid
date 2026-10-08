/**
 * lib/tools/i18nHelper.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Sélecteur AR/EN partagé pour les composants SmartTools.
 *  Les fichiers /i18n/tool-*.json sont structurés { en: {...}, ar: {...} },
 *  tandis que les composants consomment historiquement un dictionnaire plat
 *  (i18nData.tool_name …) plus un attribut `dir`.
 *  useToolI18n() fait le pont entre les deux formes et garantit le rendu RTL
 *  côté arabe (langue par défaut du site) / LTR côté anglais.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { usePreferences } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';

/** Shape of the JSON files: either nested by locale or already flat. */
export type ToolI18nJson = {
  en?: Record<string, string>;
  ar?: Record<string, string>;
} & Record<string, unknown>;

/**
 * Returns the flat i18n dictionary for the active language, including a
 * `dir` attribute ('rtl' for Arabic, 'ltr' for English).
 * Safe with both nested ({en, ar}) and flat JSON files.
 */
export function useToolI18n(json: ToolI18nJson): Record<string, any> {
  const { language } = usePreferences();
  const locale: 'en' | 'ar' = language === Language.EN ? 'en' : 'ar';
  const nested = (json as any)[locale] ?? (json as any).en ?? (json as any).ar;
  const flat: Record<string, any> =
    nested && typeof nested === 'object' ? nested : (json as Record<string, any>);
  return { dir: locale === 'en' ? 'ltr' : 'rtl', ...flat };
}

/** Non-hook variant for module-level usage (locale passed explicitly). */
export function pickToolI18n(json: ToolI18nJson, locale: 'en' | 'ar' = 'ar'): Record<string, any> {
  const nested = (json as any)[locale] ?? (json as any).en ?? (json as any).ar;
  const flat: Record<string, any> =
    nested && typeof nested === 'object' ? nested : (json as Record<string, any>);
  return { dir: locale === 'en' ? 'ltr' : 'rtl', ...flat };
}
