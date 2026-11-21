import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BmiPilotTool from './bmi-pilot';
import ProteinNeedsPilotTool from './protein-needs-pilot';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

describe('global Header measurement switch keeps canonical state', () => {
  it('keeps BMI canonical inputs and result across repeated metric/imperial switches', async () => {
    const view = render(withToolPreferences(<BmiPilotTool />, 'en', 'metric'));
    await screen.findByTestId('bmi-result');
    expect(screen.getByLabelText('Weight (kg)')).toHaveValue(70);
    expect(screen.getByLabelText('Height (cm)')).toHaveValue(175);

    for (let index = 0; index < 2; index += 1) {
      view.rerender(withToolPreferences(<BmiPilotTool />, 'en', 'imperial'));
      await waitFor(() => expect(screen.getByLabelText('Weight (lb)')).toHaveValue(154.3));
      expect(screen.getByLabelText('Height (in)')).toHaveValue(68.9);
      expect(screen.getByTestId('bmi-result')).toHaveTextContent('22.9');

      view.rerender(withToolPreferences(<BmiPilotTool />, 'en', 'metric'));
      await waitFor(() => expect(screen.getByLabelText('Weight (kg)')).toHaveValue(70));
      expect(screen.getByLabelText('Height (cm)')).toHaveValue(175);
      expect(screen.getByTestId('bmi-result')).toHaveTextContent('22.9');
    }
  });

  it('keeps protein canonical weight and grams across metric/imperial switches', async () => {
    const view = render(withToolPreferences(<ProteinNeedsPilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: '70' } });
    await screen.findByTestId('protein-result');

    view.rerender(withToolPreferences(<ProteinNeedsPilotTool />, 'en', 'imperial'));
    await waitFor(() => expect(screen.getByLabelText('Weight (lb)')).toHaveValue(154.3));
    expect(screen.getByTestId('protein-result')).toHaveTextContent('113');

    view.rerender(withToolPreferences(<ProteinNeedsPilotTool />, 'en', 'metric'));
    await waitFor(() => expect(screen.getByLabelText('Weight (kg)')).toHaveValue(70));
    expect(screen.getByTestId('protein-result')).toHaveTextContent('113');
  });

  it('keeps water canonical weight and litres across metric/imperial switches', async () => {
    const view = render(withToolPreferences(<WaterIntakePilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    await screen.findByTestId('water-result');

    view.rerender(withToolPreferences(<WaterIntakePilotTool />, 'en', 'imperial'));
    await waitFor(() => expect(screen.getByLabelText('Weight (lb)')).toHaveValue(154.3));
    expect(screen.getByTestId('water-result')).toHaveTextContent('2.5 L/day (2500 mL)');

    view.rerender(withToolPreferences(<WaterIntakePilotTool />, 'en', 'metric'));
    await waitFor(() => expect(screen.getByLabelText('Weight (kg)')).toHaveValue(70));
    expect(screen.getByTestId('water-result')).toHaveTextContent('2.5 L/day (2500 mL)');
  });
});
