import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool069DetoxificationOptimizer from './tool-069-detoxification-optimizer';
import Tool079FatMetabolismCalculator from './tool-079-fat-metabolism-calculator';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tools 069 and 079 global measurement preferences', () => {
  it('converts daily water L/fl oz and preserves the canonical detoxification result', () => {
    const view = render(withToolPreferences(<Tool069DetoxificationOptimizer />, 'en', 'metric'));
    const water = screen.getByRole('spinbutton', { name: 'Daily Water Intake (L)' });
    fireEvent.change(water, { target: { value: '2.5' } });
    const score = screen.getByText('Hepatic Support Score').nextElementSibling?.textContent;

    view.rerender(withToolPreferences(<Tool069DetoxificationOptimizer />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Daily Water Intake (fl oz)' })).toHaveValue(84.5);
    expect(screen.getByText('Hepatic Support Score').nextElementSibling?.textContent).toBe(score);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Daily Water Intake (fl oz)' }), { target: { value: '64' } });
    view.rerender(withToolPreferences(<Tool069DetoxificationOptimizer />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /تناول الماء اليومي/ }) as HTMLInputElement).value)).toBeCloseTo(1.893, 2);
    expect(screen.getByRole('heading', { name: 'محسّن إزالة السموم' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });

  it('converts body weight kg/lb and keeps fat oxidation outputs stable', () => {
    const view = render(withToolPreferences(<Tool079FatMetabolismCalculator />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body Weight (kg)' }), { target: { value: '90' } });
    const fatOxidation = screen.getByText('Estimated Fat Oxidation').nextElementSibling?.textContent;

    view.rerender(withToolPreferences(<Tool079FatMetabolismCalculator />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Body Weight (lb)' })).toHaveValue(198.4);
    expect(screen.getByText('Estimated Fat Oxidation').nextElementSibling?.textContent).toBe(fatOxidation);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body Weight (lb)' }), { target: { value: '200' } });
    view.rerender(withToolPreferences(<Tool079FatMetabolismCalculator />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /وزن الجسم/ }) as HTMLInputElement).value)).toBeCloseTo(90.718, 2);
    expect(screen.getByRole('heading', { name: 'حاسبة التمثيل الغذائي للدهون' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });
});
