import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import BodyFatPilotTool from '@/components/tools/bodyfat-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

describe('BodyFatPilotTool integration', () => {
  it('calculates real Body Fat v6 output', async () => {
    render(withToolPreferences(<BodyFatPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('bodyfat-result')).toBeInTheDocument());
    const text = screen.getByTestId('bodyfat-result').textContent ?? '';
    expect(text).toMatch(/Body fat/);
    expect(text).not.toMatch(/NaN|Infinity/);
  });

  it('shows validation error for invalid age without rendering result', async () => {
    render(withToolPreferences(<BodyFatPilotTool />, 'en', 'metric'));
    const ageInput = screen.getByText('Age').querySelector('input') as HTMLInputElement;
    fireEvent.change(ageInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent ?? '').toMatch(/Age/);
    expect(screen.queryByTestId('bodyfat-result')).not.toBeInTheDocument();
  });
  it('shows validation error for invalid weight without rendering result', async () => {
    render(withToolPreferences(<BodyFatPilotTool />, 'en', 'metric'));
    const weightInput = screen.getByLabelText(/Weight/);
    fireEvent.change(weightInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('bodyfat-result')).not.toBeInTheDocument();
  });

  it('uses global English/imperial preferences for labels and measurements', async () => {
    const { rerender } = render(withToolPreferences(<BodyFatPilotTool />, 'en', 'imperial'));
    expect(screen.getByText('Weight (lb)')).toBeInTheDocument();
    expect(screen.getByText('Height (in)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('bodyfat-result')).toBeInTheDocument());
    expect(screen.getByTestId('bodyfat-result')).toHaveTextContent('Lean mass:');
    expect(screen.getByTestId('bodyfat-result')).toHaveTextContent('lb');
    rerender(withToolPreferences(<BodyFatPilotTool />, 'ar', 'metric'));
    expect(screen.getByText('الوزن (kg)')).toBeInTheDocument();
    expect(screen.getByTestId('bodyfat-result')).toHaveTextContent('الكتلة الخالية من الدهون');
    expect(screen.getByTestId('bodyfat-result')).toHaveTextContent('kg');
  });
});
