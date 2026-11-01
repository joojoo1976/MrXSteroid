import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import StrengthStandardsPilotTool from '@/components/tools/strength-standards-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

describe('StrengthStandardsPilotTool integration', () => {
  const setInputs = (lift: number, bw: number) => {
    const liftInput = screen.getByLabelText(/Lift/);
    const bwInput = screen.getByLabelText(/Body weight/);
    fireEvent.change(liftInput, { target: { value: String(lift) } });
    fireEvent.change(bwInput, { target: { value: String(bw) } });
  };

  const calculate = async () => {
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('strength-standards-result')).toBeInTheDocument());
  };

  it('calculates ratio and level', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(100, 80);
    await calculate();
    const text = screen.getByTestId('strength-standards-result').textContent ?? '';
    expect(text).toMatch(/1.25/);
    expect(text).toMatch(/intermediate/);
  });

  it('shows validation error for invalid input', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(0, 80);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('strength-standards-result')).not.toBeInTheDocument();
  });

  it('classifies beginner', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(10, 80);
    await calculate();
    expect(screen.getByTestId('strength-standards-result').textContent).toMatch(/beginner/);
  });

  it('classifies novice', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(40, 80);
    await calculate();
    expect(screen.getByTestId('strength-standards-result').textContent).toMatch(/novice/);
  });

  it('classifies advanced', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(120, 80);
    await calculate();
    expect(screen.getByTestId('strength-standards-result').textContent).toMatch(/advanced/);
  });

  it('classifies elite', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'en', 'metric'));
    setInputs(160, 80);
    await calculate();
    expect(screen.getByTestId('strength-standards-result').textContent).toMatch(/elite/);
  });

  it('uses global imperial units and Arabic locale', async () => {
    render(withToolPreferences(<StrengthStandardsPilotTool />, 'ar', 'imperial'));
    expect(screen.getByText('الرفعة (lb)')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('الرفعة (lb)'), { target: { value: '264.6' } });
    fireEvent.change(screen.getByLabelText('وزن الجسم (lb)'), { target: { value: '176.4' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب' }));
    await waitFor(() => expect(screen.getByTestId('strength-standards-result')).toBeInTheDocument());
    expect(screen.getByTestId('strength-standards-result')).toHaveTextContent('1.5');
    expect(screen.getByTestId('strength-standards-result')).toHaveTextContent('متقدم');
  });
});
