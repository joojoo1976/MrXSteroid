/**
 * components/tools/dynamic-slider-field.v4.test.tsx
 *
 * R5 Dynamic Input system — shared slider field coverage (BMI/Protein/Water).
 * Verifies BOTH the component contract in isolation and the conversion math,
 * so the three tool pilots can depend on it.
 *
 * The component exposes the rail as two associated controls:
 *  - <input type="range"> (role="slider") with aria-valuemin/max/now/valuetext
 *  - <input type="number"> (precise input)
 * Both share the same bounds and emit the CANONICAL value via onChange.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Language } from '@/shared/types/types';
import {
  DynamicSliderField,
  metricImperialConfigFor,
  type SliderBoundsSet,
} from '@/components/tools/dynamic-slider-field';

afterEach(() => cleanup());

const KG_CM_BOUNDS: SliderBoundsSet = {
  metric: { min: 30, max: 300, step: 0.5, precision: 1, unit: 'kg' },
  imperial: { min: 66, max: 661, step: 1, precision: 1, unit: 'lb' },
};

function renderField(value: number | undefined, unitSystem: 'metric' | 'imperial' = 'metric') {
  const onChange = vi.fn();
  const view = render(
    <DynamicSliderField
      id="weight"
      label="Weight"
      unitSystem={unitSystem}
      dir="ltr"
      value={value}
      bounds={KG_CM_BOUNDS}
      onChange={onChange}
    />
  );
  return { onChange, ...view };
}

describe('metricImperialConfigFor', () => {
  it('uses metric kg values unchanged', () => {
    expect(metricImperialConfigFor(KG_CM_BOUNDS, 'metric')).toEqual({
      min: 30,
      max: 300,
      step: 0.5,
      precision: 1,
      unit: 'kg',
    });
  });

  it('uses imperial lb values unchanged', () => {
    expect(metricImperialConfigFor(KG_CM_BOUNDS, 'imperial')).toEqual({
      min: 66,
      max: 661,
      step: 1,
      precision: 1,
      unit: 'lb',
    });
  });
});

describe('DynamicSliderField', () => {
  it('renders slider and precise input with metric bounds by default', () => {
    renderField(70, 'metric');
    const slider = screen.getByRole('slider', { name: 'Set weight' }) as HTMLInputElement;
    const precise = screen.getByLabelText('Precise input (kg)') as HTMLInputElement;
    expect(slider).toHaveAttribute('aria-valuemin', '30');
    expect(slider).toHaveAttribute('aria-valuemax', '300');
    expect(slider).toHaveAttribute('aria-valuenow', '70');
    expect(slider).toHaveAttribute('aria-valuetext', '70 kg');
    expect(precise).toHaveAttribute('step', '0.5');
    expect(precise).toHaveValue(70);
  });

  it('renders lb bounds and displays the converted value when imperial', () => {
    renderField(70, 'imperial');
    const precise = screen.getByLabelText('Precise input (lb)') as HTMLInputElement;
    expect(precise).toHaveValue(154.3); // 70 kg → 154.3 lb
    const slider = screen.getByRole('slider', { name: 'Set weight' }) as HTMLInputElement;
    expect(slider).toHaveAttribute('aria-valuemin', '66');
    expect(slider).toHaveAttribute('aria-valuemax', '661');
  });

  it('dragging the slider fires onChange with the CANONICAL kg value', () => {
    const { onChange } = renderField(70, 'metric');
    const slider = screen.getByRole('slider', { name: 'Set weight' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '80' } });
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('dragging the slider in imperial mode fires onChange with CANONICAL kg', () => {
    const { onChange } = renderField(70, 'imperial');
    const slider = screen.getByRole('slider', { name: 'Set weight' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '220' } }); // 220 lb ≈ 99.79 kg
    expect(onChange).toHaveBeenCalled();
    const kg = onChange.mock.calls[0][0] as number;
    expect(kg).toBeGreaterThan(99);
    expect(kg).toBeLessThan(100);
  });

  it('editing the precise input in imperial mode stores canonical kg', () => {
    const { onChange } = renderField(70, 'imperial');
    const precise = screen.getByLabelText('Precise input (lb)');
    fireEvent.change(precise, { target: { value: '110.2' } }); // 110.2 lb ≈ 49.99 kg
    expect(onChange).toHaveBeenCalledWith(expect.closeTo(50, 0));
  });

  it('typing out-of-range values passes through raw so the caller can reject', () => {
    const { onChange } = renderField(70, 'metric');
    const precise = screen.getByLabelText('Precise input (kg)');
    fireEvent.change(precise, { target: { value: '999' } });
    expect(onChange).toHaveBeenCalledWith(999);
  });

  it('renders min and max labels and aria text for screen readers', () => {
    renderField(70, 'metric');
    expect(screen.getByText('30 kg')).toBeInTheDocument();
    expect(screen.getByText('300 kg')).toBeInTheDocument();
    const slider = screen.getByRole('slider', { name: 'Set weight' });
    expect(slider).toHaveAttribute('aria-valuetext', '70 kg');
  });

  it('localizes the slider and precise-input accessible names in Arabic', () => {
    render(
      <DynamicSliderField
        id="weight"
        label="الوزن"
        unitSystem="metric"
        dir="rtl"
        locale="ar"
        value={70}
        bounds={KG_CM_BOUNDS}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('slider', { name: 'اضبط الوزن' })).toBeInTheDocument();
    expect(screen.getByLabelText('إدخال دقيق (kg)')).toBeInTheDocument();
  });
});


