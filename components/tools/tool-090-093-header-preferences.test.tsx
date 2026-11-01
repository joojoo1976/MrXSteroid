import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool090FemaleHormoneBalanceCalculator from './tool-090-female-hormone-balance-calculator';
import Tool093MenstrualCycleManager from './tool-093-menstrual-cycle-manager';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/adapters/toolLogAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/tools/adapters/toolLogAdapter')>();
  return { ...original, loadDraft: vi.fn(() => null), saveDraft: vi.fn(() => true) };
});

afterEach(() => cleanup());

describe('Tools 090 and 093 shared locale preferences', () => {
  it('Tool 090 follows header language while cycle duration remains in days', () => {
    const view = render(withToolPreferences(<Tool090FemaleHormoneBalanceCalculator />, 'en', 'metric'));
    const cycleLength = screen.getByRole('spinbutton');
    fireEvent.change(cycleLength, { target: { value: '30' } });
    view.rerender(withToolPreferences(<Tool090FemaleHormoneBalanceCalculator />, 'ar', 'imperial'));
    expect(screen.getByRole('spinbutton')).toHaveValue(30);
    expect(screen.getByRole('heading', { name: 'حاسبة التوازن الهرموني الأنثوي' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('Tool 093 follows header language while cycle days remain unchanged', () => {
    const view = render(withToolPreferences(<Tool093MenstrualCycleManager />, 'en', 'metric'));
    const cycleLength = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(cycleLength, { target: { value: '30' } });
    view.rerender(withToolPreferences(<Tool093MenstrualCycleManager />, 'ar', 'imperial'));
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(30);
    expect(screen.getByRole('heading', { name: 'مدير الدورة الشهرية' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
