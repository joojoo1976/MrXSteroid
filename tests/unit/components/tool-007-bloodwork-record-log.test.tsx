import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool007BloodworkAnalyzer from '@/components/tools/tool-007-bloodwork-analyzer';

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
  return render(<PreferencesContext.Provider value={preferences}><Tool007BloodworkAnalyzer /></PreferencesContext.Provider>);
}

describe('Tool 007 bloodwork record log', () => {
  it('requires explicit input and records values as USER_PROVIDED without interpreting them', () => {
    renderWithLocale('en');
    fireEvent.click(screen.getByRole('button', { name: 'Add to this session' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a marker, finite value, unit, source, and valid sample date.');
    expect(screen.getByText('No results have been added to this session.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Marker name'), { target: { value: 'Example marker' } });
    fireEvent.change(screen.getByLabelText('Reported value'), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText('Unit exactly as reported'), { target: { value: 'unit/L' } });
    fireEvent.change(screen.getByLabelText('Lab or report source'), { target: { value: 'Example laboratory report' } });
    fireEvent.change(screen.getByLabelText('Sample date'), { target: { value: '2026-10-25' } });
    expect(screen.getByText('No results have been added to this session.')).toBeInTheDocument();
    expect(localStorage.setItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Add to this session' }));
    expect(screen.getByText('Example marker: 42 unit/L')).toBeInTheDocument();
    expect(screen.getByText(/USER_PROVIDED/)).toBeInTheDocument();
    expect(screen.getByText(/NOT_AVAILABLE/)).toBeInTheDocument();
    expect(screen.queryByText(/optimal|concerning|critical|fully recovered/i)).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('follows Arabic global language and direction, and lets the user clear session data', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/لا يفسر النتائج/)).toBeInTheDocument();
    expect(screen.getByText(/لا توجد قواعد سريرية/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('اسم المؤشر المخبري'), { target: { value: 'مؤشر تجريبي' } });
    fireEvent.change(screen.getByLabelText('القيمة الواردة في التقرير'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('الوحدة كما وردت تماماً'), { target: { value: 'mg/L' } });
    fireEvent.change(screen.getByLabelText('مصدر المختبر أو التقرير'), { target: { value: 'تقرير مختبر تجريبي' } });
    fireEvent.change(screen.getByLabelText('تاريخ العينة'), { target: { value: '2026-10-25' } });
    fireEvent.click(screen.getByRole('button', { name: 'إضافة إلى الجلسة' }));
    expect(screen.getByText('مؤشر تجريبي: 0 mg/L')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'مسح الجلسة' }));
    expect(screen.queryByText('مؤشر تجريبي: 0 mg/L')).toBeNull();
  });
});
