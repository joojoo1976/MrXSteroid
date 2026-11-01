import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import BmiPilotTool from '@/components/tools/bmi-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

describe('BmiPilotTool integration', () => {
  it('calculates real BMI output', async () => {
    render(withToolPreferences(<BmiPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toBeInTheDocument());
    const text = screen.getByTestId('bmi-result').textContent ?? '';
    expect(text).toMatch(/BMI/);
    expect(text).not.toMatch(/NaN|Infinity/);
  });

  it('shows validation error for invalid input', async () => {
    render(withToolPreferences(<BmiPilotTool />, 'en', 'metric'));
    const weightInput = screen.getByLabelText(/Weight/);
    fireEvent.change(weightInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('bmi-result')).not.toBeInTheDocument();
  });

  it('uses header imperial units without changing the calculated BMI', async () => {
    render(withToolPreferences(<BmiPilotTool />, 'en', 'imperial'));
    expect(screen.getByText('Weight (lb)')).toBeInTheDocument();
    expect(screen.getByText('Height (in)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('BMI: 22.9'));
  });
});
