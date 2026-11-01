import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool114RestaurantMacroNavigator from './tool-114-restaurant-macro-navigator';
import Tool116NutritionGapOptimizer from './tool-116-nutrition-gap-fasting-window-optimizer';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('SmartTools 114 and 116 global measurement preferences', () => {
  it('converts Tool 114 ingredient weights through canonical grams and follows Arabic/RTL', () => {
    const view = render(withToolPreferences(<Tool114RestaurantMacroNavigator />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /Add Ingredient/ }));
    const metricWeight = screen.getByRole('spinbutton', { name: /Weight \(g\)/ });
    fireEvent.change(metricWeight, { target: { value: '100' } });

    view.rerender(withToolPreferences(<Tool114RestaurantMacroNavigator />, 'en', 'imperial'));
    const imperialWeight = screen.getByRole('spinbutton', { name: /Weight \(oz\)/ });
    expect(imperialWeight).toHaveValue(3.5);
    fireEvent.change(imperialWeight, { target: { value: '4' } });

    view.rerender(withToolPreferences(<Tool114RestaurantMacroNavigator />, 'ar', 'metric'));
    const arabicHeading = screen.getByRole('heading', { name: 'دليل الماكروز للمطاعم والوجبات السريعة' });
    expect(arabicHeading.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('spinbutton', { name: /الوزن \(g\)/ })).toHaveValue(113);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('converts Tool 116 food amounts through canonical grams without changing nutrient field units', () => {
    const view = render(withToolPreferences(<Tool116NutritionGapOptimizer />, 'en', 'metric'));
    const metricAmount = screen.getByRole('spinbutton', { name: /Amount \(g\)/ });
    expect(metricAmount).toHaveValue(100);

    view.rerender(withToolPreferences(<Tool116NutritionGapOptimizer />, 'en', 'imperial'));
    const imperialAmount = screen.getByRole('spinbutton', { name: /Amount \(oz\)/ });
    expect(imperialAmount).toHaveValue(3.5);
    fireEvent.change(imperialAmount, { target: { value: '4' } });

    view.rerender(withToolPreferences(<Tool116NutritionGapOptimizer />, 'ar', 'metric'));
    const arabicHeading = screen.getByRole('heading', { name: 'كاشف الفجوات الغذائية ومنظم الصيام المتقطع' });
    expect(arabicHeading.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('spinbutton', { name: /الكمية \(g\)/ })).toHaveValue(113);
    expect(screen.getByRole('spinbutton', { name: /فيتامين أ/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
