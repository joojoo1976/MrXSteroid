import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool104ThyroidDynamics from './tool-104-thyroid-metabolic-rate-dynamics';
import Tool106GlycogenModeler from './tool-106-glycogen-supercompensation-water-modeler';
import Tool108VisionEngine from './tool-108-ai-body-composition-vision-engine';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

function metricValue(label: string): string | null {
  return screen.getByText(label).nextElementSibling?.textContent ?? null;
}

describe('Tools 104, 106 and 108 global measurement preferences', () => {
  it('converts Tool 104 weight and height while preserving its canonical BMR calculation', () => {
    const view = render(withToolPreferences(<Tool104ThyroidDynamics />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight (kg)' }), { target: { value: '100' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Height (cm)' }), { target: { value: '180' } });
    const metricBmr = metricValue('BMR (kcal/day)');

    view.rerender(withToolPreferences(<Tool104ThyroidDynamics />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Weight (lb)' })).toHaveValue(220.5);
    expect(screen.getByRole('spinbutton', { name: 'Height (in)' })).toHaveValue(70.9);
    expect(metricValue('BMR (kcal/day)')).toBe(metricBmr);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight (lb)' }), { target: { value: '200' } });
    view.rerender(withToolPreferences(<Tool104ThyroidDynamics />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /الوزن/ }) as HTMLInputElement).value)).toBeCloseTo(90.718, 2);
    expect(screen.getByRole('heading', { name: 'حاسبة ديناميكيات الغدة الدرقية ومعدل الأيض' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });

  it('converts Tool 106 body and lean mass plus water volume, keeping nutrition units unchanged', () => {
    const view = render(withToolPreferences(<Tool106GlycogenModeler />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Body Weight (kg)' }), { target: { value: '90' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Lean Mass (kg)' }), { target: { value: '75' } });
    const metricWater = metricValue('Water Reference');
    const glycogen = metricValue('Glycogen Total');

    view.rerender(withToolPreferences(<Tool106GlycogenModeler />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Body Weight (lb)' })).toHaveValue(198.4);
    expect(screen.getByRole('spinbutton', { name: 'Lean Mass (lb)' })).toHaveValue(165.3);
    expect(metricValue('Water Reference')).toBe(`${Number((Number(metricWater?.replace(' L', '')) * 33.8140227).toFixed(1))} fl oz`);
    expect(screen.getByRole('spinbutton', { name: 'Target Carbs (g/kg/day)' })).toHaveValue(8);
    expect(metricValue('Glycogen Total')).toBe(glycogen);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Lean Mass (lb)' }), { target: { value: '150' } });
    view.rerender(withToolPreferences(<Tool106GlycogenModeler />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /الكتلة الدهنية/ }) as HTMLInputElement).value)).toBeCloseTo(68.039, 2);
    expect(screen.getByRole('heading', { name: 'حاسبة التحميل النشوي الفائق والاحتفاظ بالماء' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });

  it('converts Tool 108 all physical measurements and preserves estimator outputs', () => {
    const view = render(withToolPreferences(<Tool108VisionEngine />, 'en', 'metric'));
    const metricBmi = metricValue('BMI');
    view.rerender(withToolPreferences(<Tool108VisionEngine />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: 'Weight (lb)' })).toHaveValue(176.4);
    expect(screen.getByRole('spinbutton', { name: 'Height (in)' })).toHaveValue(70.1);
    expect(screen.getByRole('spinbutton', { name: 'Neck (in)' })).toHaveValue(15);
    expect(screen.getByRole('spinbutton', { name: 'Waist (in)' })).toHaveValue(36.2);
    expect(screen.getByRole('spinbutton', { name: 'Hips (in)' })).toHaveValue(39.4);
    expect(screen.getByRole('spinbutton', { name: 'Chest (in)' })).toHaveValue(43.3);
    expect(metricValue('BMI')).toBe(metricBmi);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Waist (in)' }), { target: { value: '40' } });
    view.rerender(withToolPreferences(<Tool108VisionEngine />, 'ar', 'metric'));
    expect(Number((screen.getByRole('spinbutton', { name: /الخصر/ }) as HTMLInputElement).value)).toBeCloseTo(101.6, 1);
    expect(screen.getByRole('heading', { name: 'محرك التحليل البصري الذكي للجسد' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });
});
