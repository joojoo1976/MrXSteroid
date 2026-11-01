import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import SmartToolsPage from './page';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

afterEach(cleanup);

function renderSmartToolsPage(locale: 'ar' | 'en') {
  const preferences = {
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
    content: {} as PreferencesContextProps['content'],
    isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  } satisfies PreferencesContextProps;

  return render(
    <PreferencesContext.Provider value={preferences}>
      {SmartToolsPage()}
    </PreferencesContext.Provider>,
  );
}

describe('SmartTools catalog-wide search integration', () => {
  it('finds a tool by visible English UI copy outside its catalog description', () => {
    renderSmartToolsPage('en');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search SmartTools' }), {
      target: { value: 'data provenance' },
    });

    expect(screen.getByRole('link', { name: /Smart Food & Macro Substitution Engine/ }))
      .toHaveAttribute('href', '/smarttools/nutrition/tool-111-smart-food-macro-substitution');
    expect(screen.getByText('Search results: 1 of 264 tools')).toBeInTheDocument();
  });

  it('finds the same localized tool by its Arabic UI copy', () => {
    renderSmartToolsPage('ar');
    fireEvent.change(screen.getByRole('searchbox', { name: 'ابحث في الأدوات' }), {
      target: { value: 'مصدر البيانات' },
    });

    expect(screen.getByRole('link', { name: /محرك استبدال الأطعمة الذكي بالمكرويات/ }))
      .toHaveAttribute('href', '/smarttools/nutrition/tool-111-smart-food-macro-substitution');
  });
});
