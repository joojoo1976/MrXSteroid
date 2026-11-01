import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool103RenalFunctionHydration from './tool-103-renal-function-hydration-index';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tool 103 global measurement and language preferences', () => {
  it('converts weight and fluid values for imperial display while preserving canonical renal calculations', () => {
    const view = render(withToolPreferences(<Tool103RenalFunctionHydration />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Body Weight \(kg\)/ }), { target: { value: '100' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Daily Fluid Intake \(L\)/ }), { target: { value: '3' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Training Sweat Loss \(L\)/ }), { target: { value: '0.4' } });
    const metricTarget = screen.getByText(/^\d+(?:\.\d+)? L$/).textContent;

    view.rerender(withToolPreferences(<Tool103RenalFunctionHydration />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: /Body Weight \(lb\)/ })).toHaveValue(220.5);
    expect(screen.getByRole('spinbutton', { name: /Daily Fluid Intake \(fl oz\)/ })).toHaveValue(101.4);
    expect(screen.getByRole('spinbutton', { name: /Training Sweat Loss \(fl oz\)/ })).toHaveValue(13.5);
    expect(screen.getByText(/^\d+(?:\.\d+)? fl oz$/).textContent).toBe(String(Number((Number(metricTarget?.replace(' L', '')) * 33.8140227).toFixed(1))) + ' fl oz');

    fireEvent.change(screen.getByRole('spinbutton', { name: /Body Weight \(lb\)/ }), { target: { value: '200' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Daily Fluid Intake \(fl oz\)/ }), { target: { value: '100' } });
    view.rerender(withToolPreferences(<Tool103RenalFunctionHydration />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'مؤشر وظائف الكلى والترطيب المتقدم' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(Number((screen.getByRole('spinbutton', { name: /الوزن \(kg\)/ }) as HTMLInputElement).value)).toBeCloseTo(90.718, 2);
    expect(Number((screen.getByRole('spinbutton', { name: /السوائل اليومية \(L\)/ }) as HTMLInputElement).value)).toBeCloseTo(2.957, 2);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
