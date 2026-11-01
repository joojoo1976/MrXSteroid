import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool010CompoundStackBuilder from './tool-010-compound-stack-builder';
import { kgToLbs, lbsToKg, mgToOz, ozToMg, MG_PER_OZ } from './MeasurementToggle';

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
  return <PreferencesContext.Provider value={value}><Tool010CompoundStackBuilder /></PreferencesContext.Provider>;
}

const doseInput = () => document.querySelectorAll('input[type="number"]')[0] as HTMLInputElement;

describe('tool-010 header preferences', () => {
  it('uses global language and direction without local language or unit buttons', () => {
    const { rerender, container } = render(renderWithPreferences('ar', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('بناء حزمة المركبات');
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
    rerender(renderWithPreferences('en', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'ltr');
  });

  it('converts canonical dose display when the header measurement preference changes', () => {
    const { rerender } = render(renderWithPreferences('en', 'metric'));
    expect(doseInput().value).toBe('300');
    expect(document.body.textContent).toContain('mg/week');
    rerender(renderWithPreferences('en', 'imperial'));
    expect(doseInput().value).toBe(mgToOz(300).toFixed(6));
    expect(document.body.textContent).toContain('oz/week');
    rerender(renderWithPreferences('en', 'metric'));
    expect(doseInput().value).toBe('300');
  });

  it('stores edits in canonical milligrams while displaying global imperial units', () => {
    const { rerender } = render(renderWithPreferences('en', 'imperial'));
    fireEvent.change(doseInput(), { target: { value: '0.02' } });
    rerender(renderWithPreferences('en', 'metric'));
    expect(doseInput().value).toBe('567');
    expect(document.body.textContent).not.toContain('NaN');
  });

  it('keeps unit conversion helpers stable', () => {
    expect(kgToLbs(85)).toBe(187);
    expect(Math.abs(lbsToKg(187) - 85)).toBeLessThan(0.5);
    expect(MG_PER_OZ).toBe(28349.523125);
    expect(Math.abs(ozToMg(mgToOz(300)) - 300)).toBeLessThanOrEqual(0.5);
  });
});
