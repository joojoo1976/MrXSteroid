import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool028CompoundStackingWorksheet from '@/components/tools/tool-028-stacking-synergy';

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
  return render(<PreferencesContext.Provider value={preferences}><Tool028CompoundStackingWorksheet /></PreferencesContext.Provider>);
}

describe('Tool 028 scenario comparison worksheet', () => {
  it('validates and displays the two entered lists with assessment unavailable', () => {
    renderWithLocale('en');
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    fireEvent.click(screen.getByRole('button', { name: 'Display both user-entered scenarios' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText('Scenario label')[0], { target: { value: 'Option A' } });
    fireEvent.change(screen.getAllByLabelText('Items, one per line (1–10)')[0], { target: { value: 'Item A\nItem B' } });
    fireEvent.change(screen.getAllByLabelText('Scenario label')[1], { target: { value: 'Option B' } });
    fireEvent.change(screen.getAllByLabelText('Items, one per line (1–10)')[1], { target: { value: 'Item C' } });
    fireEvent.click(screen.getByRole('button', { name: 'Display both user-entered scenarios' }));

    const result = screen.getByRole('region', { name: 'User-entered lists' });
    expect(result.textContent).toContain('USER_PROVIDED');
    expect(result.textContent).toContain('NOT_AVAILABLE');
    expect(result.textContent).toContain('Item A');
    expect(result.textContent).toContain('Item C');
    expect(result.textContent).not.toMatch(/synergy score|recommended addition|protocol tip/i);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses Arabic RTL and reset clears the manually entered worksheet', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'ورقة مقارنة السيناريوهات والمركّبات' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();
    fireEvent.change(screen.getAllByLabelText('اسم السيناريو')[0], { target: { value: 'أ' } });
    fireEvent.change(screen.getAllByLabelText('العناصر، عنصر واحد في كل سطر (1–10)')[0], { target: { value: 'عنصر' } });
    fireEvent.change(screen.getAllByLabelText('اسم السيناريو')[1], { target: { value: 'ب' } });
    fireEvent.change(screen.getAllByLabelText('العناصر، عنصر واحد في كل سطر (1–10)')[1], { target: { value: 'عنصر آخر' } });
    fireEvent.click(screen.getByRole('button', { name: 'اعرض السيناريوهين كما أدخلتهما' }));
    fireEvent.click(screen.getByRole('button', { name: 'مسح الورقة' }));
    expect(screen.queryByRole('region', { name: 'القوائم التي أدخلها المستخدم' })).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
