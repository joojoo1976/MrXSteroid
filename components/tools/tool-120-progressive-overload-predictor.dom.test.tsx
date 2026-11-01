import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool120OverloadPredictor from './tool-120-progressive-overload-predictor';
import { withToolPreferences } from './tool-preferences.test-utils';

describe('Tool 120 feature parity controls', () => {
  afterEach(() => cleanup());

  it('converts the displayed load units while keeping a valid form', () => {
    const view = render(withToolPreferences(<Tool120OverloadPredictor />, 'en', 'metric'));
    const metricInput = screen.getByLabelText(/Current 1RM \(kg\)/) as HTMLInputElement;
    expect(metricInput.value).toBe('100');
    view.rerender(withToolPreferences(<Tool120OverloadPredictor />, 'en', 'imperial'));
    expect((screen.getByLabelText(/Current 1RM \(lb\)/) as HTMLInputElement).value).toBe('220.5');
  });

  it('shows the canonical adapter summary after calculation and clears stale output on edits/reset', () => {
    render(withToolPreferences(<Tool120OverloadPredictor />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getAllByText('Not assessed')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Deadlift' } });
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();
  });
});
