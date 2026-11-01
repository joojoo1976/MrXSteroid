import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool107ContestPrep from './tool-107-contest-prep-peak-week-manipulator';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tool 107 global measurement preferences', () => {
  it('converts body weight and reference water while preserving canonical calculations', () => {
    const view = render(withToolPreferences(<Tool107ContestPrep />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight (kg)' }), { target: { value: '90' } });
    const metricWater = screen.getByText(/\d+(?:\.\d+)? - \d+(?:\.\d+)? L/).textContent;
    const sodiumReference = screen.getByText(/\d+ - \d+ mg/).textContent;

    view.rerender(withToolPreferences(<Tool107ContestPrep />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Weight (lb)' })).toHaveValue(198.4);
    const liters = metricWater?.match(/[\d.]+/g)?.map(Number) ?? [];
    const expectedOunces = liters.map((value) => Number((value * 33.8140227).toFixed(1)));
    expect(screen.getByText(`${expectedOunces[0]} - ${expectedOunces[1]} fl oz`)).toBeInTheDocument();
    expect(screen.getByText(sodiumReference as string)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight (lb)' }), { target: { value: '200' } });
    view.rerender(withToolPreferences(<Tool107ContestPrep />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /الوزن/ }) as HTMLInputElement).value)).toBeCloseTo(90.718, 2);
    expect(screen.getByRole('heading', { name: 'حاسبة التلاعب بأسبوع الذروة قبل البطولة' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
