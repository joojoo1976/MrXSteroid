import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool097HydrationBalanceCalculator from './tool-097-hydration-balance-calculator';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tool 097 global header preferences', () => {
  it('converts canonical weight and fluid measurements when the header unit changes', () => {
    const view = render(withToolPreferences(<Tool097HydrationBalanceCalculator />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body mass before exercise (kg)' }), { target: { value: '75' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body mass after exercise (kg)' }), { target: { value: '74.2' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Fluid consumed during exercise (L)' }), { target: { value: '0.5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Urine output during exercise (enter 0 if none) (L)' }), { target: { value: '0.1' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Exercise duration (min)' }), { target: { value: '60' } });
    expect(screen.getByText('Calculated sweat loss').nextElementSibling).toHaveTextContent('1.2');
    expect(screen.getByText('Calculated sweat rate').nextElementSibling).toHaveTextContent('1.2');

    view.rerender(withToolPreferences(<Tool097HydrationBalanceCalculator />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Body mass before exercise (lb)' })).toHaveValue(165.3);
    expect(screen.getByText('Calculated sweat loss').nextElementSibling).toHaveTextContent('40.58');
    expect(screen.getByText('Calculated sweat rate').nextElementSibling).toHaveTextContent('40.58');

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body mass before exercise (lb)' }), { target: { value: '176.4' } });
    view.rerender(withToolPreferences(<Tool097HydrationBalanceCalculator />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: 'كتلة الجسم قبل التمرين (كجم)' }) as HTMLInputElement).value)).toBeCloseTo(80, 0);
    expect(screen.getByRole('heading', { name: 'قياس معدل التعرق أثناء التمرين' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('starts incomplete without seeding measurements or presenting a result', () => {
    render(withToolPreferences(<Tool097HydrationBalanceCalculator />, 'en', 'metric'));
    expect(screen.getByTestId('tool-097-status')).toHaveTextContent(/Enter all five measurements/);
    expect(screen.queryByText('Calculated sweat loss')).not.toBeInTheDocument();
  });
});
