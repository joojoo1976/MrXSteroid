import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool241 from './tool-241-solvent-ratio';
import Tool242 from './tool-242-dosage-unit-conversion-engine';
import Tool243 from './tool-243-carrier-oil-viscosity-estimator';
import Tool244 from './tool-244-purity-yield-estimator';
import Tool245 from './tool-245-storage-stability-estimator';

afterEach(() => cleanup());

describe('SmartTools 241–245 accessible interfaces and shared preferences', () => {
  it('241 labels its abstract ratio, localizes through header preferences, and rejects zero denominator', () => {
    const view = render(withToolPreferences(<Tool241 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Numerator a'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Denominator b'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate ratio a ÷ b' }));
    expect(screen.getByRole('status')).toHaveTextContent('a / b = 2');
    expect(screen.getByText(/not interpreted as solvents or chemicals/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Denominator b'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate ratio a ÷ b' }));
    expect(screen.getByRole('alert')).toHaveTextContent('denominator must be greater than zero');

    view.rerender(withToolPreferences(<Tool241 />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'حاسبة نسبة رياضية عامة' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /language|اللغة|metric|imperial|القياس/i })).not.toBeInTheDocument();
  });

  it('242 converts compatible temperature units and uses the shared unit preference for initial units', () => {
    render(withToolPreferences(<Tool242 />, 'en', 'metric'));
    expect(screen.getByLabelText('From unit')).toHaveValue('g');
    expect(screen.getByLabelText('To unit')).toHaveValue('mg');
    fireEvent.change(screen.getByLabelText('Measurement dimension'), { target: { value: 'temperature' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '32' } });
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'F' } });
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'C' } });
    fireEvent.click(screen.getByRole('button', { name: 'Convert value' }));
    expect(screen.getByRole('status')).toHaveTextContent('32 °F = 0 °C');
    expect(screen.getByText(/No dose or analyte-specific conversions/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /language|اللغة|metric|imperial|القياس/i })).not.toBeInTheDocument();
  });

  it('242 rejects blank inputs and below-absolute-zero values', () => {
    render(withToolPreferences(<Tool242 />, 'en', 'imperial'));
    expect(screen.getByLabelText('From unit')).toHaveValue('lb');
    fireEvent.click(screen.getByRole('button', { name: 'Convert value' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a value');

    fireEvent.change(screen.getByLabelText('Measurement dimension'), { target: { value: 'temperature' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '-500' } });
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'F' } });
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'C' } });
    fireEvent.click(screen.getByRole('button', { name: 'Convert value' }));
    expect(screen.getByRole('alert')).toHaveTextContent('below absolute zero');
  });

  it('243 and 245 present observation-only records with bilingual labels', () => {
    const oil = render(withToolPreferences(<Tool243 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('note'), { target: { value: 'Observed note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record' }));
    expect(screen.getByRole('status')).toHaveTextContent('Note recorded for this session');
    expect(screen.getByText(/no viscosity estimate or oil selection/i)).toBeInTheDocument();

    oil.unmount();
    render(withToolPreferences(<Tool245 />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'سجل ملاحظة تخزين' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
    fireEvent.change(screen.getByLabelText('note'), { target: { value: 'ملاحظة' } });
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل' }));
    expect(screen.getByRole('status')).toHaveTextContent('تم تسجيل الملاحظة داخل الجلسة');
    expect(screen.getByText(/لا تقدير للثبات أو مدة الصلاحية/i)).toBeInTheDocument();
  });

  it('244 displays the arithmetic ratio and percentage without purity claims', () => {
    render(withToolPreferences(<Tool244 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Input value'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Output value'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate output ÷ input' }));
    expect(screen.getByRole('status')).toHaveTextContent('output / input = 0.25');
    expect(screen.getByRole('status')).toHaveTextContent('Arithmetic percentage: 25%');
    expect(screen.getByText(/not chemical purity or yield/i)).toBeInTheDocument();
  });
});
