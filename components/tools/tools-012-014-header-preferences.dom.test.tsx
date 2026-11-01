import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool012CalorieAdjuster from './tool-012-calorie-adjuster';
import Tool013MacroOptimizer from './tool-013-macro-optimizer';
import Tool014WaterRetention from './tool-014-water-retention';

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: undefined, isLoading: false }),
  useUpdateToolState: () => ({ mutate: vi.fn(), isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

afterEach(() => cleanup());

function withPreferences(component: React.ReactNode, locale: 'ar' | 'en', unitSystem: 'metric' | 'imperial') {
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
  return <PreferencesContext.Provider value={value}>{component}</PreferencesContext.Provider>;
}

const firstWeightInput = () => document.querySelector('input[type="number"]') as HTMLInputElement;

describe('legacy tools 012–014 follow global header preferences', () => {
  it('converts Tool 012 weight from the global unit while keeping calculation input canonical', () => {
    const { rerender, container } = render(withPreferences(<Tool012CalorieAdjuster />, 'en', 'metric'));
    expect(firstWeightInput()).toHaveValue(25); // age is first
    const weight = document.querySelectorAll('input[type="number"]')[1] as HTMLInputElement;
    const height = document.querySelectorAll('input[type="number"]')[2] as HTMLInputElement;
    expect(weight).toHaveValue(85);
    expect(height).toHaveValue(180);
    rerender(withPreferences(<Tool012CalorieAdjuster />, 'en', 'imperial'));
    expect(weight).toHaveValue(187.39);
    expect(height).toHaveValue(70.87);
    expect(document.body.textContent).toContain('Weight (lb;');
    expect(document.body.textContent).toContain('Height (in;');
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'ltr');
  });

  it('validates Tool 012 before calculating and clears results when inputs change', () => {
    render(withPreferences(<Tool012CalorieAdjuster />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate target' }));
    expect(document.body.textContent).toContain('TDEE (Daily Calories): 2875 kcal/day');

    const age = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(age, { target: { value: '18' } });
    expect(document.body.textContent).not.toContain('TDEE (Daily Calories): 2875 kcal/day');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate target' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Check the entered values/);
  });

  it('converts Tool 013 body weight and localizes controls and results', () => {
    const { rerender, container } = render(withPreferences(<Tool013MacroOptimizer />, 'ar', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('المحسّن المغذي');
    const weight = firstWeightInput();
    expect(weight).toHaveValue(85);
    rerender(withPreferences(<Tool013MacroOptimizer />, 'ar', 'imperial'));
    expect(weight).toHaveValue(187.39);
    expect(document.body.textContent).toContain('الوزن (lb;');
    fireEvent.click(screen.getByRole('button', { name: 'احسب المغذيات' }));
    expect(document.body.textContent).toContain('بروتين (جم)');
    expect(document.body.textContent).toContain('2244 kcal');
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
  });

  it('blocks invalid or infeasible Tool 013 macro inputs and removes stale results', () => {
    render(withPreferences(<Tool013MacroOptimizer />, 'en', 'metric'));
    const numbers = document.querySelectorAll('input[type="number"]');
    const proteinRate = numbers[1] as HTMLInputElement;
    fireEvent.change(proteinRate, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate macros' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Check the values');
    expect(document.body.textContent).not.toContain('Protein (g): 170g/day');

    fireEvent.change(proteinRate, { target: { value: '5' } });
    const fatRate = numbers[2] as HTMLInputElement;
    fireEvent.change(fatRate, { target: { value: '2' } });
    const weight = numbers[0] as HTMLInputElement;
    fireEvent.change(weight, { target: { value: '30' } });
    const goal = screen.getByRole('combobox');
    fireEvent.change(goal, { target: { value: 'cut' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate macros' }));
    expect(screen.getByRole('alert')).toHaveTextContent('exceed the scenario calorie target');
  });

  it('shows Tool 014 as unavailable until a validated model exists', () => {
    const { rerender, container } = render(withPreferences(<Tool014WaterRetention />, 'ar', 'metric'));
    expect(container.querySelector('.pct-timing-tool')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('status')).toHaveTextContent('غير متاح حالياً');
    expect(document.querySelector('input')).toBeNull();
    rerender(withPreferences(<Tool014WaterRetention />, 'ar', 'imperial'));
    expect(screen.getByRole('status')).toHaveTextContent('لا يتوفر حالياً نموذج حسابي موثّق');
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
  });
});
