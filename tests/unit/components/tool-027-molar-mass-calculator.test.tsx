import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool027MolarMassRelationshipCalculator from '@/components/tools/tool-027-ester-conversion';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => vi.mocked(localStorage.setItem).mockClear());

function renderWithLocale(locale: 'en' | 'ar') {
  const preferences: PreferencesContextProps = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale: locale === 'ar' ? 'ar-EG' : 'en-US',
    currency: 'USD',
    formatPrice: (price) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: () => '',
    content: {} as PreferencesContextProps['content'],
    isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  };
  return render(<PreferencesContext.Provider value={preferences}><Tool027MolarMassRelationshipCalculator /></PreferencesContext.Provider>);
}

describe('Tool 027 molar mass calculator', () => {
  it('requires complete sourced values and shows the explicit calculation after submit', () => {
    renderWithLocale('en');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate same amount of substance' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Starting material label'), { target: { value: 'Material A' } });
    fireEvent.change(screen.getByLabelText('Starting mass'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Mass unit'), { target: { value: 'mg' } });
    fireEvent.change(screen.getByLabelText('Starting molar mass (g/mol)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Source for starting molar mass'), { target: { value: 'Source A' } });
    fireEvent.change(screen.getByLabelText('Target material label'), { target: { value: 'Material B' } });
    fireEvent.change(screen.getByLabelText('Target molar mass (g/mol)'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Source for target molar mass'), { target: { value: 'Source B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate same amount of substance' }));

    const result = screen.getByRole('region', { name: 'Calculated relationship' });
    expect(result.textContent).toContain('CALCULATED');
    expect(result.textContent).toContain('0.2 g');
    expect(result.textContent).not.toMatch(/dose|potency|bioavailability|recommendation/i);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Target molar mass (g/mol)'), { target: { value: '250' } });
    expect(screen.queryByRole('region', { name: 'Calculated relationship' })).toBeNull();
  });

  it('uses Arabic RTL and links the stated definition source', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'حاسبة الكتلة المولية التي يدخلها المستخدم' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IUPAC Gold Book — molar mass' })).toHaveAttribute('href', 'https://goldbook.iupac.org/terms/view/12214');
    expect(screen.getByText(/ليست تحويلًا لجرعات الأدوية/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();
  });
});
