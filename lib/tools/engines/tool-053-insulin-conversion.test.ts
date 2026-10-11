import { describe, it, expect } from 'vitest';
import { convertInsulin, UNITS_PER_ML } from './tool-053-insulin-conversion';

describe('tool-053 Insulin Conversion', () => {
  it('converts units to volume for U-100', () => {
    const r = convertInsulin({ concentration: 'U-100', units: 20, hypoglycaemia_symptoms: false });
    expect(r.volume_ml).toBeCloseTo(0.2, 3);
    expect(r.units_per_ml).toBe(UNITS_PER_ML['U-100']);
  });

  it('converts volume to units for U-40', () => {
    const r = convertInsulin({ concentration: 'U-40', volume_ml: 0.5, hypoglycaemia_symptoms: false });
    expect(r.units).toBeCloseTo(20, 1);
  });

  it('escalates hypoglycaemia symptoms', () => {
    const r = convertInsulin({ concentration: 'U-100', units: 10, hypoglycaemia_symptoms: true });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toMatch(/urgent/i);
  });

  it('never recommends a dose', () => {
    const r = convertInsulin({ concentration: 'U-100', units: 10, hypoglycaemia_symptoms: false });
    expect(r.educational_notice).toMatch(/educational/i);
    expect(r.educational_notice).not.toMatch(/you should take/i);
  });
});
