import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool113GroceryOptimizer from './tool-113-ai-grocery-basket-meal-cost-optimizer';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tool 113 global preference integration', () => {
  it('converts package mass from canonical grams to ounces and follows header language', () => {
    const view = render(withToolPreferences(<Tool113GroceryOptimizer />, 'en', 'metric'));
    const metricMass = screen.getByRole('spinbutton', { name: 'Unit Size (g)' });
    expect(metricMass).toHaveValue(1000);

    view.rerender(withToolPreferences(<Tool113GroceryOptimizer />, 'en', 'imperial'));
    const imperialMass = screen.getByRole('spinbutton', { name: 'Unit Size (oz)' });
    expect(imperialMass).toHaveValue(35.27);

    fireEvent.change(imperialMass, { target: { value: '16' } });
    view.rerender(withToolPreferences(<Tool113GroceryOptimizer />, 'en', 'metric'));
    expect(screen.getByRole('spinbutton', { name: 'Unit Size (g)' })).toHaveValue(453.592);

    view.rerender(withToolPreferences(<Tool113GroceryOptimizer />, 'ar', 'metric'));
    const arabicHeading = screen.getByRole('heading', { name: 'مخطط سلة البقالة بقواعد تقديرية' });
    expect(arabicHeading).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'حجم الوحدة (g)' })).toHaveValue(453.592);
    expect(arabicHeading.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
