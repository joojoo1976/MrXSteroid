import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool025DrugInteractionCheckerPro from '@/components/tools/tool-025-drug-interaction-pro';

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
  return render(<PreferencesContext.Provider value={preferences}><Tool025DrugInteractionCheckerPro /></PreferencesContext.Provider>);
}

describe('Tool 025 medication session list', () => {
  it('validates and records only user-entered items in page state', () => {
    renderWithLocale('en');
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    expect(screen.getByRole('status').textContent).toContain('No validated interaction source');

    fireEvent.click(screen.getByRole('button', { name: /Add to temporary list/ }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Medication or item name'), { target: { value: 'User supplied item' } });
    fireEvent.change(screen.getByLabelText('Dose or label details (as written)'), { target: { value: 'label text' } });
    fireEvent.click(screen.getByRole('button', { name: /Add to temporary list/ }));
    expect(screen.getByText('User supplied item')).toBeInTheDocument();
    expect(screen.getByText('USER_PROVIDED · not independently verified')).toBeInTheDocument();
    expect(screen.queryByText(/\bcritical\b|recommendation|score/i)).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('User supplied item')).toBeNull();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses Arabic labels and RTL while keeping the interaction limitation explicit', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'قائمة مؤقتة للأدوية والمركّبات' })).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain('NOT_AVAILABLE');
    expect(screen.queryByRole('button', { name: /metric|imperial|وحدات/i })).toBeNull();
  });
});
