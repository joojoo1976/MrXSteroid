import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool024PostCycleBloodworkInterpreter from '@/components/tools/tool-024-bloodwork-interpreter';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  vi.mocked(localStorage.setItem).mockClear();
});

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
  return render(<PreferencesContext.Provider value={preferences}><Tool024PostCycleBloodworkInterpreter /></PreferencesContext.Provider>);
}

describe('Tool 024 lab reference interval comparison', () => {
  it('compares only after explicit actions and clears a stale result after edits', () => {
    renderWithLocale('en');
    expect(screen.getByRole('button', { name: /Compare with entered intervals/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Marker name'), { target: { value: 'Example marker' } });
    fireEvent.change(screen.getByLabelText('Reported value'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Unit as reported'), { target: { value: 'unit/L' } });
    fireEvent.change(screen.getByLabelText('Lower interval limit'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Upper interval limit'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Laboratory/report source'), { target: { value: 'User supplied report' } });
    fireEvent.change(screen.getByLabelText('Sample date'), { target: { value: '2026-10-25' } });
    fireEvent.click(screen.getByRole('button', { name: /Add entered result/ }));
    expect(screen.getByText('Example marker: 25 unit/L')).toBeInTheDocument();
    expect(screen.queryByText('Above the entered interval')).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Compare with entered intervals/ }));
    const resultRegion = screen.getByRole('region', { name: 'Arithmetic comparison' });
    expect(resultRegion.textContent).toContain('Above the entered interval');
    expect(resultRegion.textContent).toContain('CALCULATED · comparison only');
    expect(resultRegion.textContent).not.toMatch(/recovery|risk|diagnosis|treatment/i);
    expect(localStorage.setItem).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Reported value'), { target: { value: '15' } });
    expect(screen.queryByRole('region', { name: 'Arithmetic comparison' })).toBeNull();
  });

  it('uses Arabic global language and direction with explicit data provenance', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/مقارنة حسابية بالنطاقات التي تدخلها/)).toBeInTheDocument();
    expect(screen.getByText(/لا تتحقق الأداة من المصدر أو النطاق/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();
  });
});
