import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';

export function withToolPreferences(children: React.ReactNode, locale: 'ar' | 'en', unitSystem: 'metric' | 'imperial') {
  return (
    <PreferencesContext.Provider value={{
      language: locale === 'ar' ? Language.AR : Language.EN,
      unitSystem,
      isRTL: locale === 'ar',
    } as PreferencesContextProps}>
      {children}
    </PreferencesContext.Provider>
  );
}
