import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool022HalfLifeStacker from './tool-022-half-life-stacker';

const { saveMock } = vi.hoisted(() => ({ saveMock: vi.fn() }));

vi.mock('@/lib/hooks/useToolState', () => ({
  useUserToolState: () => ({ data: null, isLoading: false }),
  useUpdateToolState: () => ({ mutate: saveMock, isPending: false }),
  useDebounce: (callback: (...args: unknown[]) => unknown) => callback,
}));

describe('Tool 022 reduced-confidence and validation UI', () => {
  afterEach(cleanup);
  beforeEach(() => saveMock.mockReset());

  it('shows the bilingual limitation notice and no synthetic confidence value', () => {
    const { container } = render(withToolPreferences(<Tool022HalfLifeStacker />, 'ar', 'metric'));

    fireEvent.click(screen.getByRole('button', { name: 'إضافة مركب' }));
    fireEvent.click(screen.getByRole('button', { name: 'حساب التوقيت' }));

    expect(screen.getByText(/ليست نتائج حركية دوائية معتمدة/)).toBeInTheDocument();
    expect(screen.queryByText(/درجة الثقة|Confidence Score/)).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('prevents invalid cycle-length input from producing or saving a result', () => {
    render(withToolPreferences(<Tool022HalfLifeStacker />, 'en', 'metric'));

    fireEvent.click(screen.getByRole('button', { name: 'Add compound' }));
    fireEvent.change(screen.getByLabelText('Cycle Length (weeks):'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate timing' }));

    expect(screen.getByRole('alert')).toHaveTextContent('outside the allowed range');
    expect(saveMock).not.toHaveBeenCalled();
  });
});
