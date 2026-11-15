import { describe, it, expect } from 'vitest';
import { calculateDensity } from './tool-138-raw-powder-density-oil-formulation-engine';

describe('Tool #138 — Raw Powder Density', () => {
  it('calculates density correctly', () => {
    const r = calculateDensity({ massG: 10, volumeMl: 5 });
    expect(r.densityGPerMl).toBe(2);
    expect(r.massG).toBe(10);
    expect(r.volumeMl).toBe(5);
  });

  it('returns null for zero volume', () => {
    const r = calculateDensity({ massG: 10, volumeMl: 0 });
    expect(r.densityGPerMl).toBeNull();
  });

  it('handles invalid inputs', () => {
    const r = calculateDensity({ massG: NaN, volumeMl: Infinity });
    expect(r.massG).toBe(0);
    expect(r.volumeMl).toBe(0);
    expect(r.densityGPerMl).toBeNull();
  });

  it('rounds to 3 decimals', () => {
    const r = calculateDensity({ massG: 1, volumeMl: 3 });
    expect(r.densityGPerMl).toBe(0.333);
  });
});