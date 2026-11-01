import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool020GeneticPotential from './tool-020-genetic-potential';

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: undefined, isLoading: false }),
  useUpdateToolState: () => ({ mutate: vi.fn(), isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

afterEach(() => cleanup());

function withPreferences(locale: 'ar' | 'en', unitSystem: 'metric' | 'imperial') {
  const value = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem,
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale,
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: vi.fn(),
    setUnitSystem: vi.fn(),
    setTheme: vi.fn(),
    t: (key: string) => key,
    content: {} as any,
    isRTL: locale === 'ar',
    refreshDetection: vi.fn().mockResolvedValue(undefined),
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}><Tool020GeneticPotential /></PreferencesContext.Provider>;
}

describe('tool 020 shared header preferences and safe output', () => {
  it('converts weight and height input across global unit changes', () => {
    const { rerender, container } = render(withPreferences('ar', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/ليس اختباراً جينياً/)).toBeInTheDocument();
    const numbers = document.querySelectorAll('input[type="number"]');
    const weight = numbers[3] as HTMLInputElement;
    const height = numbers[4] as HTMLInputElement;
    expect(weight).toHaveValue(85);
    expect(height).toHaveValue(180);
    rerender(withPreferences('ar', 'imperial'));
    expect(weight).toHaveValue(187.39);
    expect(height).toHaveValue(70.87);
    expect(document.body.textContent).toContain('الوزن الحالي (lb)');
    expect(document.body.textContent).toContain('الطول (in)');
  });

  it('shows an arithmetic-only result without cycle, drug, or dose recommendations', () => {
    render(withPreferences('en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate indicator' }));
    expect(document.body.textContent).toContain('Arithmetic indicator:');
    expect(document.body.textContent).toContain('does not measure genetic potential or health');
    expect(document.body.textContent).not.toContain('dosage multiplier');
    expect(document.body.textContent).not.toContain('Recommended Compounds');
    expect(document.body.textContent).not.toContain('Recommended Cycle');
  });
});
