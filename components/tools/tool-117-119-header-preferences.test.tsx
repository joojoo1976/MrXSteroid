import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool118CNSRecoveryScore from './tool-118-cns-recovery-score';
import Tool117IntraWorkoutVolumizer from './tool-117-intra-workout-nutrient-volumizer';
import Tool119VolumeHypertrophy from './tool-119-training-volume-hypertrophy-index';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('SmartTools 117–119 global preference parity', () => {
  it('converts Tool 118 temperature inputs through canonical Celsius across header preference changes', () => {
    const view = render(withToolPreferences(<Tool118CNSRecoveryScore />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Body Temp/ }), { target: { value: '37.2' } });

    view.rerender(withToolPreferences(<Tool118CNSRecoveryScore />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: /Body Temp.*°F/ })).toHaveValue(99);
    expect(screen.getByRole('spinbutton', { name: /Baseline Temp.*°F/ })).toHaveValue(97.9);

    view.rerender(withToolPreferences(<Tool118CNSRecoveryScore />, 'ar', 'imperial'));
    const arabicHeading118 = screen.getByRole('heading', { name: 'مؤشر استعادة الجهاز العصبي المركزي' });
    expect(arabicHeading118.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('spinbutton', { name: /درجة حرارة الجسم.*°F/ })).toHaveValue(99);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('converts Tool 117 fluid inputs across global unit changes and localizes from the header language', () => {
    const view = render(withToolPreferences(<Tool117IntraWorkoutVolumizer />, 'en', 'metric'));
    const fluid = screen.getByRole('spinbutton', { name: /Current fluid/ });
    expect(fluid).toHaveValue(500);

    view.rerender(withToolPreferences(<Tool117IntraWorkoutVolumizer />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: /Current fluid.*fl oz\/h/ })).toHaveValue(16.9);
    expect(screen.getByRole('spinbutton', { name: /Sweat Rate.*fl oz\/h/ })).toHaveValue(33.8);

    view.rerender(withToolPreferences(<Tool117IntraWorkoutVolumizer />, 'ar', 'imperial'));
    const arabicHeading117 = screen.getByRole('heading', { name: 'محرك المغذيات أثناء التدريب' });
    expect(arabicHeading117.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('spinbutton', { name: /السوائل الحالية.*fl oz\/h/ })).toHaveValue(16.9);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('converts Tool 119 canonical training loads across global units and follows language changes', () => {
    const view = render(withToolPreferences(<Tool119VolumeHypertrophy />, 'en', 'metric'));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Weight \(kg\)/ }), { target: { value: '100' } });

    view.rerender(withToolPreferences(<Tool119VolumeHypertrophy />, 'en', 'imperial'));
    expect(screen.getByRole('spinbutton', { name: /Weight \(lb\)/ })).toHaveValue(220.5);

    view.rerender(withToolPreferences(<Tool119VolumeHypertrophy />, 'ar', 'imperial'));
    const arabicHeading119 = screen.getByRole('heading', { name: 'مؤشر حجم التدريب والتضخم العضلي' });
    expect(arabicHeading119.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('spinbutton', { name: /الوزن.*lb/ })).toHaveValue(220.5);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
