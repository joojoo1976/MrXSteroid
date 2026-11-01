import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool011ProgressTracker from './tool-011-progress-tracker';

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: undefined, isLoading: false }),
  useUpdateToolState: () => ({ mutate: vi.fn(), isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

afterEach(() => cleanup());

function renderWithPreferences(locale: 'ar' | 'en', unitSystem: 'metric' | 'imperial') {
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
  return <PreferencesContext.Provider value={value}><Tool011ProgressTracker /></PreferencesContext.Provider>;
}

const numericInputs = () => document.querySelectorAll('input[type="number"]');

describe('tool-011 global header preferences', () => {
  it('uses the selected language and direction without local preference buttons', () => {
    const { container, rerender } = render(renderWithPreferences('ar', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('متابع التقدم');
    expect(document.body.textContent).toContain('التاريخ:');
    expect(document.body.textContent).toContain('القوة (kg):');
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();

    rerender(renderWithPreferences('en', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'ltr');
    expect(document.body.textContent).toContain('Date:');
  });

  it('converts the canonical weight and strength drafts when the header unit changes', () => {
    const { rerender } = render(renderWithPreferences('en', 'metric'));
    fireEvent.change(numericInputs()[0], { target: { value: '80' } });
    fireEvent.change(numericInputs()[1], { target: { value: '100' } });

    rerender(renderWithPreferences('en', 'imperial'));
    expect(numericInputs()[0]).toHaveValue(176.37);
    expect(numericInputs()[1]).toHaveValue(220.46);
    expect(screen.getByText('Weight (lb):')).toBeInTheDocument();

    fireEvent.change(numericInputs()[0], { target: { value: '200' } });
    rerender(renderWithPreferences('en', 'metric'));
    expect(Number((numericInputs()[0] as HTMLInputElement).value)).toBeCloseTo(200 / 2.20462, 6);
  });
});
