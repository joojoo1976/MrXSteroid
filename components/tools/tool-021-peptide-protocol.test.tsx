import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool021PeptideProtocolPlanner from './tool-021-peptide-protocol';
import { isValidPeptideWeightKg } from '@/lib/tools/engines/tool-021-peptide-protocol';

const { calculateMock, saveMock } = vi.hoisted(() => ({
  calculateMock: vi.fn(),
  saveMock: vi.fn(),
}));

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: null, isLoading: false }),
  useUpdateToolState: () => ({ mutate: saveMock, isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

vi.mock('@/lib/tools/engines/tool-021-peptide-protocol', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/tools/engines/tool-021-peptide-protocol')>(),
  calculatePeptideProtocol: calculateMock,
}));

const sampleResult = {
  daily_dose_mcg: 1,
  total_cycle_dose_mg: 0.1,
  injection_frequency_days: 2,
  total_injections: 28,
  protocol_weeks: 8,
  timing_recommendations: [],
  storage_requirements: [],
  side_effect_warnings: [],
  post_protocol_therapy: false,
};

describe('Tool 021 header preference integration', () => {
  beforeEach(() => {
    calculateMock.mockReset().mockReturnValue(sampleResult);
    saveMock.mockReset();
  });

  it('uses global language and weight units while keeping the engine input in kilograms', () => {
    const { container } = render(withToolPreferences(<Tool021PeptideProtocolPlanner />, 'ar', 'imperial'));

    const weight = screen.getByLabelText(/وزن المستخدم \(lb\)/) as HTMLInputElement;
    expect(weight.value).toBe('187.4');
    expect(screen.getByRole('heading', { name: 'خطط بروتوكول الببتييدات' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إضافة مركب ببتيدي' })).toBeInTheDocument();

    fireEvent.change(weight, { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'إضافة مركب ببتيدي' }));
    fireEvent.click(screen.getByRole('button', { name: 'حساب البروتوكول' }));

    expect(calculateMock).toHaveBeenCalledWith(expect.objectContaining({ user_weight_kg: 200 * 0.45359237 }));
    expect(screen.getByText('توصيات التوقيت')).toBeInTheDocument();
    expect(screen.getByText('متطلبات التخزين')).toBeInTheDocument();
    expect(screen.getByText('تحذيرات الآثار الجانبية')).toBeInTheDocument();
    expect(screen.getByText('علاج ما بعد البروتوكول: لا')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
  });

  it.each([
    [Number.NaN, false],
    [39.99, false],
    [40, true],
    [85, true],
    [300, true],
    [300.01, false],
    [Number.POSITIVE_INFINITY, false],
  ])('validates canonical weight %s as %s', (weightKg, expected) => {
    expect(isValidPeptideWeightKg(weightKg)).toBe(expected);
  });
});
