import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool017DrugInteraction from './tool-017-drug-interaction';

afterEach(() => cleanup());

function renderWithLocale(locale: 'ar' | 'en') {
  const value = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale,
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: (key: string) => key,
    content: {} as any,
    isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return render(<PreferencesContext.Provider value={value}><Tool017DrugInteraction /></PreferencesContext.Provider>);
}

describe('Tool 017 fail-closed unavailable state', () => {
  it('shows the English unavailable state without collecting medication data or claiming safety', () => {
    const { container } = renderWithLocale('en');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('status')).toHaveTextContent('NOT_AVAILABLE');
    expect(screen.getByText(/does not mean a combination is safe/i)).toBeInTheDocument();
    expect(container.querySelector('input, select, textarea, button')).toBeNull();
    expect(screen.getByRole('link', { name: 'DailyMed: current U.S. medicine labels' })).toHaveAttribute('href', 'https://dailymed.nlm.nih.gov/dailymed/');
  });

  it('localizes the unavailable state and follows global Arabic RTL preference', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('فاحص التداخلات الدوائية');
    expect(screen.getByRole('status')).toHaveTextContent('NOT_AVAILABLE');
    expect(screen.getByText(/هذا لا يعني أن الجمع آمن/)).toBeInTheDocument();
    expect(container.querySelector('input, select, textarea, button')).toBeNull();
  });
});
