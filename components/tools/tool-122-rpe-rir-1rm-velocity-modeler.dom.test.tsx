import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool122RPE_RIR_Velocity from './tool-122-rpe-rir-1rm-velocity-modeler';
import { withToolPreferences } from './tool-preferences.test-utils';

describe('Tool 122 feature parity controls', () => {
  afterEach(() => cleanup());

  it('converts target load and submits an explicit canonical output', () => {
    const view = render(withToolPreferences(<Tool122RPE_RIR_Velocity />, 'en', 'metric'));
    expect((screen.getByLabelText('Target Weight (kg)') as HTMLInputElement).value).toBe('100');
    view.rerender(withToolPreferences(<Tool122RPE_RIR_Velocity />, 'en', 'imperial'));
    expect((screen.getByLabelText('Target Weight (lb)') as HTMLInputElement).value).toBe('220.5');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getAllByText(/Model fit category/)).toHaveLength(2);
    expect(screen.getAllByText('Not assessed')).toHaveLength(2);
  });

  it('clears calculated output after input edits and reset', () => {
    render(withToolPreferences(<Tool122RPE_RIR_Velocity />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Target Weight (kg)'), { target: { value: '105' } });
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();
  });
});
