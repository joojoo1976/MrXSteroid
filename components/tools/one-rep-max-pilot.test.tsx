import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import OneRepMaxPilotTool from '@/components/tools/one-rep-max-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

describe('OneRepMaxPilotTool integration', () => {
  it('calculates real One Rep Max output', async () => {
    render(withToolPreferences(<OneRepMaxPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('orm-result')).toBeInTheDocument());
    const text = screen.getByTestId('orm-result').textContent ?? '';
    expect(text).toMatch(/one-rep max/i);
    expect(text).not.toMatch(/NaN|Infinity/);
  });

  it('shows validation error for invalid input', async () => {
    render(withToolPreferences(<OneRepMaxPilotTool />, 'en', 'metric'));
    const repsInput = screen.getByText('Reps').querySelector('input') as HTMLInputElement;
    fireEvent.change(repsInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('orm-result')).not.toBeInTheDocument();
  });

  it('uses header imperial weight display and output units', async () => {
    const { rerender } = render(withToolPreferences(<OneRepMaxPilotTool />, 'en', 'imperial'));
    expect(screen.getByText('Weight (lb)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('orm-result')).toHaveTextContent('lb'));
    rerender(withToolPreferences(<OneRepMaxPilotTool />, 'ar', 'metric'));
    expect(screen.getByTestId('orm-result')).toHaveTextContent('kg');
  });
});
