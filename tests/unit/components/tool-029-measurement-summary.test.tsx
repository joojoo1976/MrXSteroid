import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool029MeasurementSummary from '@/components/tools/tool-029-side-effect-early-warning';

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
  return render(<PreferencesContext.Provider value={preferences}><Tool029MeasurementSummary /></PreferencesContext.Provider>);
}

describe('Tool 029 personal measurement summary', () => {
  it('validates user readings and shows arithmetic summaries without clinical interpretation', () => {
    renderWithLocale('en');
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    expect(screen.getByRole('button', { name: 'Calculate descriptive summary' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Reading date'), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText('Systolic pressure (mmHg)'), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText('Diastolic pressure (mmHg)'), { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /Add user-entered reading/ }));

    fireEvent.change(screen.getByLabelText('Reading date'), { target: { value: '2026-10-21' } });
    fireEvent.change(screen.getByLabelText('Systolic pressure (mmHg)'), { target: { value: '140' } });
    fireEvent.change(screen.getByLabelText('Diastolic pressure (mmHg)'), { target: { value: '90' } });
    fireEvent.click(screen.getByRole('button', { name: /Add user-entered reading/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate descriptive summary' }));

    const result = screen.getByRole('region', { name: 'Descriptive summary' });
    expect(result.textContent).toContain('CALCULATED');
    expect(result.textContent).toContain('NOT_AVAILABLE');
    expect(result.textContent).toContain('130 mmHg');
    expect(result.textContent).toContain('85 mmHg');
    expect(result.textContent).not.toMatch(/risk score|recommended|immediate action|safe range/i);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses Arabic RTL and includes no local unit or language controls', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'ملخص القياسات الشخصية' })).toBeInTheDocument();
    expect(screen.getByRole('note').textContent).toContain('خدمات الطوارئ المحلية');
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();
  });
});
