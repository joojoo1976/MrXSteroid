/**
 * components/tools/r5-boundaries.test.tsx
 *
 * R5 first batch — boundary and imperial-alignment coverage for BMI,
 * Protein Needs and Water Intake.
 *
 * The canonical ranges are fixed by the engines' pilot bounds:
 *   weight 30-300 kg, height 100-250 cm.
 * The imperial sliders must never emit a canonical value outside those
 * ranges from their own min/max stops.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BmiPilotTool from './bmi-pilot';
import ProteinNeedsPilotTool from './protein-needs-pilot';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(
  component: React.ReactElement,
  locale: 'ar' | 'en' = 'en',
  unitSystem: 'metric' | 'imperial' = 'metric'
) {
  return render(withToolPreferences(component, locale, unitSystem));
}

function sliders(): HTMLInputElement[] {
  return screen.getAllByRole('slider') as HTMLInputElement[];
}

describe('metric boundaries are inclusive', () => {
  it('BMI accepts weight 30 and 300 kg and rejects 29.9 and 300.1', async () => {
    renderTool(<BmiPilotTool />);
    const weight = screen.getByLabelText('Weight (kg)');

    fireEvent.change(weight, { target: { value: '30' } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('9.8'));

    fireEvent.change(weight, { target: { value: '300' } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('98'));

    fireEvent.change(weight, { target: { value: '29.9' } });
    await waitFor(() => expect(screen.queryByTestId('bmi-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);

    fireEvent.change(weight, { target: { value: '300.1' } });
    await waitFor(() => expect(screen.queryByTestId('bmi-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('BMI accepts height 100 and 250 cm and rejects 99.9 and 250.1', async () => {
    renderTool(<BmiPilotTool />);
    const height = screen.getByLabelText('Height (cm)');

    fireEvent.change(height, { target: { value: '100' } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('70'));

    fireEvent.change(height, { target: { value: '250' } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('11.2'));

    fireEvent.change(height, { target: { value: '99.9' } });
    await waitFor(() => expect(screen.queryByTestId('bmi-result')).toBeNull());

    fireEvent.change(height, { target: { value: '250.1' } });
    await waitFor(() => expect(screen.queryByTestId('bmi-result')).toBeNull());
  });

  it('Protein accepts weight 30 and 300 kg and rejects 29.9 and 300.1', async () => {
    renderTool(<ProteinNeedsPilotTool />);
    const weight = screen.getByTestId('protein-weight');

    fireEvent.change(weight, { target: { value: '30' } });
    await waitFor(() => expect(screen.getByTestId('protein-result')).toHaveTextContent('48'));

    fireEvent.change(weight, { target: { value: '300' } });
    await waitFor(() => expect(screen.getByTestId('protein-result')).toHaveTextContent('485'));

    fireEvent.change(weight, { target: { value: '29.9' } });
    await waitFor(() => expect(screen.queryByTestId('protein-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);

    fireEvent.change(weight, { target: { value: '300.1' } });
    await waitFor(() => expect(screen.queryByTestId('protein-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('Water accepts weight 30 and 300 kg and rejects 29.9 and 300.1', async () => {
    renderTool(<WaterIntakePilotTool />);
    const weight = screen.getByTestId('water-weight');

    fireEvent.change(weight, { target: { value: '30' } });
    await waitFor(() => expect(screen.getByTestId('water-result')).toHaveTextContent('1.07'));

    fireEvent.change(weight, { target: { value: '300' } });
    await waitFor(() => expect(screen.getByTestId('water-result')).toHaveTextContent('10.71'));

    fireEvent.change(weight, { target: { value: '29.9' } });
    await waitFor(() => expect(screen.queryByTestId('water-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);

    fireEvent.change(weight, { target: { value: '300.1' } });
    await waitFor(() => expect(screen.queryByTestId('water-result')).toBeNull());
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});

describe('imperial stops stay inside the canonical range', () => {
  it('BMI weight slider minimum produces a valid result', async () => {
    renderTool(<BmiPilotTool />, 'en', 'imperial');
    const weightSlider = sliders()[0];

    fireEvent.change(weightSlider, { target: { value: weightSlider.min } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('9.8'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('BMI height slider minimum produces a valid result', async () => {
    renderTool(<BmiPilotTool />, 'en', 'imperial');
    const heightSlider = sliders()[1];

    fireEvent.change(heightSlider, { target: { value: heightSlider.min } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('69.9'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Protein weight slider minimum produces a valid result', async () => {
    renderTool(<ProteinNeedsPilotTool />, 'en', 'imperial');
    const weightSlider = sliders()[0];

    // The empty field already sits at the minimum; move away first so the
    // native range emits a change, then drag back to the minimum stop.
    fireEvent.change(weightSlider, { target: { value: '220' } });
    await waitFor(() => expect(screen.getByTestId('protein-result')).toBeInTheDocument());

    fireEvent.change(weightSlider, { target: { value: weightSlider.min } });
    await waitFor(() => expect(screen.getByTestId('protein-result')).toHaveTextContent('49'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Water weight slider minimum produces a valid result', async () => {
    renderTool(<WaterIntakePilotTool />, 'en', 'imperial');
    const weightSlider = sliders()[0];

    fireEvent.change(weightSlider, { target: { value: '220' } });
    await waitFor(() => expect(screen.getByTestId('water-result')).toBeInTheDocument());

    fireEvent.change(weightSlider, { target: { value: weightSlider.min } });
    await waitFor(() => expect(screen.getByTestId('water-result')).toHaveTextContent('1.07'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps aria-valuenow inside aria-valuemin/max at the canonical extremes', async () => {
    const view = renderTool(<BmiPilotTool />, 'en', 'metric');
    const weight = screen.getByLabelText('Weight (kg)');

    fireEvent.change(weight, { target: { value: '30' } });
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toBeInTheDocument());
    view.rerender(withToolPreferences(<BmiPilotTool />, 'en', 'imperial'));

    const imperialSlider = sliders()[0];
    const nowAtMin = Number(imperialSlider.getAttribute('aria-valuenow'));
    const min = Number(imperialSlider.getAttribute('aria-valuemin'));
    expect(nowAtMin).toBeGreaterThanOrEqual(min);

    fireEvent.change(screen.getByLabelText('Weight (lb)'), { target: { value: '661.3' } });
    await waitFor(() =>
      expect(screen.getByLabelText('Weight (lb)')).toHaveValue(661.3)
    );
    const nowAtMax = Number(imperialSlider.getAttribute('aria-valuenow'));
    const max = Number(imperialSlider.getAttribute('aria-valuemax'));
    expect(nowAtMax).toBeLessThanOrEqual(max);
  });
});
