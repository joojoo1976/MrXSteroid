'use client';

import { useContext } from 'react';
import { PreferencesContext } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';

/**
 * Read the language and measurement system selected in the global header.
 * Metric defaults are only a fallback for isolated component previews/tests;
 * SmartTools pages run under PreferencesProvider.
 */
export function useToolDisplayPreferences() {
  const preferences = useContext(PreferencesContext);
  const locale: 'ar' | 'en' = preferences?.language === Language.EN ? 'en' : 'ar';
  const unitSystem = preferences?.unitSystem ?? 'metric';
  const isRtl = preferences?.isRTL ?? locale === Language.AR;

  return { locale, unitSystem, isRtl };
}
