import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BmiPilotTool from './bmi-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<BmiPilotTool />, locale, unitSystem));
}

describe('BMI input-driven insights', () => {
  it('renders category interpretation, adult scope, boundary gap and engine-derived what-if rows', async () => {
    renderTool();
    await screen.findByTestId('bmi-result');

    expect(screen.getByTestId('bmi-category-interpretation')).toHaveTextContent(
      /normal-weight screening range/i
    );
    expect(screen.getByTestId('bmi-adult-applicability')).toHaveTextContent(/18\+/);
    expect(screen.getByTestId('bmi-boundary-gap')).toHaveTextContent(/2\.1/);

    const rows = screen.getAllByTestId(/^bmi-what-if-row-/);
    expect(rows).toHaveLength(3);
    expect(screen.getByTestId('bmi-what-if-row-65')).toHaveTextContent('21.2');
    expect(screen.getByTestId('bmi-what-if-row-70')).toHaveTextContent('22.9');
    expect(screen.getByTestId('bmi-what-if-row-75')).toHaveTextContent('24.5');
  });

  it('changes the interpretation and advice when the weight moves to another category', async () => {
    renderTool();
    await screen.findByTestId('bmi-result');

    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '120' } });

    await waitFor(() =>
      expect(screen.getByTestId('bmi-result')).toHaveTextContent('39.2')
    );
    expect(screen.getByTestId('bmi-category-interpretation')).toHaveTextContent(
      /obesity screening range/i
    );
    expect(screen.getByTestId('bmi-category-advice')).toHaveTextContent(
      /professional assessment/i
    );
  });

  it('localizes the dynamic interpretation in Arabic', async () => {
    renderTool('ar');
    await screen.findByTestId('bmi-result');
    expect(screen.getByTestId('bmi-category-interpretation')).toHaveTextContent(
      /نطاق الوزن الطبيعي/
    );
    expect(screen.getByTestId('bmi-adult-applicability')).toHaveTextContent(/18\+/);
  });
});
