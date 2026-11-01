import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool026InjectionExperienceLog from '@/components/tools/tool-026-injection-pain';

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
  return render(<PreferencesContext.Provider value={preferences}><Tool026InjectionExperienceLog /></PreferencesContext.Provider>);
}

describe('Tool 026 injection experience log', () => {
  it('stores only user notes in page state and rejects missing required fields', () => {
    renderWithLocale('en');
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    fireEvent.click(screen.getByRole('button', { name: /Add session note/ }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date of event'), { target: { value: '2026-10-25' } });
    fireEvent.change(screen.getByLabelText('Your experience or notes'), { target: { value: 'User-authored note.' } });
    fireEvent.click(screen.getByRole('button', { name: /Add session note/ }));
    expect(screen.getByText('User-authored note.')).toBeInTheDocument();
    expect(screen.getByText('USER_PROVIDED · not independently assessed')).toBeInTheDocument();
    expect(screen.queryByText(/mL|safe volume|solvent|temperature recommendation|pain score/i)).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses Arabic and RTL and lets the user clear the session list', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'سجل تجربة الحقن' })).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();

    fireEvent.change(screen.getByLabelText('تاريخ التجربة'), { target: { value: '2026-10-25' } });
    fireEvent.change(screen.getByLabelText('وصف التجربة أو ملاحظاتك'), { target: { value: 'ملاحظة المستخدم' } });
    fireEvent.click(screen.getByRole('button', { name: /إضافة ملاحظة للجلسة/ }));
    fireEvent.click(screen.getByRole('button', { name: 'مسح الملاحظات' }));
    expect(screen.queryByText('ملاحظة المستخدم')).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
