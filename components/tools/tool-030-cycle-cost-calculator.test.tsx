import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool030CycleCostCalculator from './tool-030-cycle-cost-calculator';

const { saveMock } = vi.hoisted(() => ({ saveMock: vi.fn() }));

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: null, isLoading: false }),
  useUpdateToolState: () => ({ mutate: saveMock, isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

describe('Tool 030 user-entered cost workflow', () => {
  beforeEach(() => saveMock.mockReset());

  it('calculates from entered costs and duration without inserting default medicines', () => {
    const { container } = render(withToolPreferences(<Tool030CycleCostCalculator />, 'en', 'metric'));

    fireEvent.click(screen.getByRole('button', { name: 'Add compound cost' }));
    fireEvent.change(screen.getByLabelText('Item name (English)'), { target: { value: 'Item A' } });
    fireEvent.change(screen.getByLabelText('Item name (Arabic)'), { target: { value: 'بند أ' } });
    fireEvent.change(screen.getByLabelText('User-entered total cost (USD)'), { target: { value: '25.50' } });
    fireEvent.change(screen.getByLabelText('PCT duration (weeks)'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate cost' }));

    expect(screen.getByText('Grand Total (USD): $245.5')).toBeInTheDocument();
    expect(screen.getByText('Cost Per Week (USD): $24.55/week')).toBeInTheDocument();
    expect(screen.queryByText(/Testosterone|Aromatase Inhibitor|HCG/)).not.toBeInTheDocument();
    expect(screen.getByText(/illustrative estimate/i)).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('dir', 'ltr');
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error and does not save incomplete rows', () => {
    render(withToolPreferences(<Tool030CycleCostCalculator />, 'ar', 'metric'));

    fireEvent.click(screen.getByRole('button', { name: 'إضافة تكلفة مركب' }));
    fireEvent.click(screen.getByRole('button', { name: 'احسب التكلفة' }));

    expect(screen.getByRole('alert')).toHaveTextContent('تحقق من القيم المدخلة');
    expect(saveMock).not.toHaveBeenCalled();
  });
});
