import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import BodyCompositionVisionPilotTool from '@/components/tools/body-composition-vision-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

describe('BodyCompositionVisionPilotTool integration', () => {
  it('calculates body composition estimate', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('body-composition-result')).toBeInTheDocument());
    const text = screen.getByTestId('body-composition-result').textContent ?? '';
    expect(text).toMatch(/Body fat:/);
    expect(text).not.toMatch(/NaN|Infinity/);
  });

  it('shows validation error for invalid input', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    const heightInput = screen.getByText('Height (cm)').querySelector('input') as HTMLInputElement;
    fireEvent.change(heightInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('body-composition-result')).not.toBeInTheDocument();
  });

  it('shows validation error for female without hip', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    const sexSelect = screen.getByText('Sex').querySelector('select') as HTMLSelectElement;
    fireEvent.change(sexSelect, { target: { value: 'female' } });
    const hipInput = screen.getByText('Hip (cm)').querySelector('input') as HTMLInputElement;
    fireEvent.change(hipInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('body-composition-result')).not.toBeInTheDocument();
  });

  it('shows validation error when waist <= neck', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    const waistInput = screen.getByText('Waist (cm)').querySelector('input') as HTMLInputElement;
    const neckInput = screen.getByText('Neck (cm)').querySelector('input') as HTMLInputElement;
    fireEvent.change(waistInput, { target: { value: '30' } });
    fireEvent.change(neckInput, { target: { value: '40' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('body-composition-result')).not.toBeInTheDocument();
  });

  it('shows disclaimer', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('body-composition-result')).toBeInTheDocument());
    const text = screen.getByTestId('body-composition-result').textContent ?? '';
    expect(text).toMatch(/Heuristic estimate/);
  });

  it('keeps fat + lean mass consistent with weight', async () => {
    render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('body-composition-result')).toBeInTheDocument());
    const text = screen.getByTestId('body-composition-result').textContent ?? '';
    const fatMatch = text.match(/Fat mass: ([\d.]+) kg/);
    const leanMatch = text.match(/Lean mass: ([\d.]+) kg/);
    expect(fatMatch).not.toBeNull();
    expect(leanMatch).not.toBeNull();
    const fat = Number(fatMatch![1]);
    const lean = Number(leanMatch![1]);
    expect(Math.abs(fat + lean - 80)).toBeLessThanOrEqual(0.2);
  });

  it('uses the header language and converts circumference/weight inputs for imperial display', async () => {
    const { container } = render(withToolPreferences(<BodyCompositionVisionPilotTool />, 'ar', 'imperial'));
    expect(container.querySelector('[data-tool-id="mrx.tool.108-ai-body-composition-vision-engine"]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('الطول (in)')).toBeInTheDocument();
    expect(screen.getByText('الوزن (lb)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'احسب' }));
    await waitFor(() => expect(screen.getByTestId('body-composition-result')).toBeInTheDocument());
    expect(screen.getByTestId('body-composition-result')).toHaveTextContent('lb');
  });
});
