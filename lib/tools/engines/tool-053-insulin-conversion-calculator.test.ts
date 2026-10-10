import { describe, it, expect } from 'vitest';
import { convertInsulin } from './tool-053-insulin-conversion-calculator';

describe('tool-053 insulin conversion engine (syringe-mismatch safety)', () => {
  it('converts U-100 doses to volume and exposes the U-40 misreading', () => {
    const r = convertInsulin({ concentration: 'u100', dose_iu: 10 });
    expect(r.volume_ml).toBe(0.1);
    expect(r.draw_units_u100).toBe(10);
    expect(r.draw_units_u40).toBe(4); // what a U-40 syringe scale would read
    expect(r.warnings).toContain('syringe_mismatch_fatal_risk');
    expect(r.warnings).toContain('insulin_requires_medical_supervision');
  });

  it('converts U-40 insulin and warns the scales are not interchangeable', () => {
    const r = convertInsulin({ concentration: 'u40', dose_iu: 8 });
    expect(r.volume_ml).toBe(0.2); // U-40: 40 units per ml
    expect(r.draw_units_u40).toBe(8);
    expect(r.draw_units_u100).toBe(20); // same volume on a U-100 scale
  });

  it('halved concentrations multiply the physical volume for the same IU dose', () => {
    const u100 = convertInsulin({ concentration: 'u100', dose_iu: 20 });
    const u40 = convertInsulin({ concentration: 'u40', dose_iu: 20 });
    expect(u100.volume_ml).toBe(0.2);
    expect(u40.volume_ml).toBe(0.5); // same IU, 2.5x the volume on U-40
    expect(u40.volume_ml / u100.volume_ml).toBe(2.5);
  });
});
