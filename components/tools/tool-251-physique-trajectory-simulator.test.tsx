import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool251 from './tool-251-physique-trajectory-simulator';

afterEach(() => cleanup());

describe('Tool 251 scenario simulator UI', () => {
  it('reports missing required inputs instead of silently doing nothing', () => {
    render(withToolPreferences(<Tool251 />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter current weight, both body-fat values, and at least one weekly rate.');
  });

  it('rejects malformed comma-separated rates rather than dropping the bad token', () => {
    render(withToolPreferences(<Tool251 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Weekly change rates (kg, comma-separated)'), { target: { value: '0.5, invalid, 1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByRole('alert')).toHaveTextContent('weekly rates');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calculates one selected arithmetic scenario and labels the result', () => {
    render(withToolPreferences(<Tool251 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Weekly change rates (kg, comma-separated)'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByRole('status')).toHaveTextContent('1.0 kg/week');
    expect(screen.getByRole('status')).toHaveTextContent('CALCULATED: deterministic arithmetic scenario only');
  });

  it('uses the global imperial preference and preserves the entered value when units change', () => {
    const view = render(withToolPreferences(<Tool251 />, 'en', 'metric'));
    const weight = screen.getByLabelText('Current weight (kg)') as HTMLInputElement;
    const rates = screen.getByLabelText('Weekly change rates (kg, comma-separated)') as HTMLInputElement;
    fireEvent.change(weight, { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '15' } });
    fireEvent.change(rates, { target: { value: '1' } });

    view.rerender(withToolPreferences(<Tool251 />, 'en', 'imperial'));
    expect(screen.getByLabelText('Current weight (lb)')).toHaveValue(198.41604);
    expect(screen.getByLabelText('Weekly change rates (lb, comma-separated)')).toHaveValue('2.2046226');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByRole('status')).toHaveTextContent('lb/week');
  });

  it('localizes validation and direction without adding local language or unit toggles', () => {
    render(withToolPreferences(<Tool251 />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'محاكي سيناريوهات المسار الجسدي' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('button', { name: 'احسب السيناريوهات' }));
    expect(screen.getByRole('alert')).toHaveTextContent('أكمل الوزن الحالي');
    expect(screen.queryByRole('button', { name: /اللغة|نظام القياس|unit system|language/i })).not.toBeInTheDocument();
  });
});
