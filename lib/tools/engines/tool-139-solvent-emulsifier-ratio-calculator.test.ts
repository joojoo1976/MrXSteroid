import { describe, it, expect } from 'vitest';
import { calculateSolventRatio } from './tool-139-solvent-emulsifier-ratio-calculator';

describe('Tool #139 — Solvent/Emulsifier Ratio', () => {
  it('calculates ratio correctly', () => {
    const r = calculateSolventRatio({ solventAMl: 3, solventBMl: 1 });
    expect(r.ratioA).toBe(0.75);
    expect(r.ratioB).toBe(0.25);
    expect(r.totalMl).toBe(4);
    expect(r.percentageA).toBe(75);
    expect(r.percentageB).toBe(25);
  });

  it('returns null for zero total', () => {
    const r = calculateSolventRatio({ solventAMl: 0, solventBMl: 0 });
    expect(r.ratioA).toBeNull();
    expect(r.ratioB).toBeNull();
    expect(r.totalMl).toBe(0);
  });

  it('handles invalid inputs', () => {
    const r = calculateSolventRatio({ solventAMl: NaN, solventBMl: Infinity });
    expect(r.ratioA).toBeNull();
    expect(r.ratioB).toBeNull();
    expect(r.totalMl).toBe(0);
  });

  it('rounds correctly', () => {
    const r = calculateSolventRatio({ solventAMl: 1, solventBMl: 2 });
    expect(r.ratioA).toBe(0.33);
    expect(r.ratioB).toBe(0.67);
  });
});