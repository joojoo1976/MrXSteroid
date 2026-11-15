import { describe, it, expect } from 'vitest';
import { calculateReconstitution } from './tool-137-peptide-hormone-reconstitution-calculator';

describe('Tool #137 — Peptide Reconstitution', () => {
  it('calculates concentration correctly', () => {
    const r = calculateReconstitution({ peptideMg: 10, solventMl: 2 });
    expect(r.concentrationMgPerMl).toBe(5);
    expect(r.totalPeptideMg).toBe(10);
    expect(r.totalSolventMl).toBe(2);
  });

  it('returns null for zero solvent', () => {
    const r = calculateReconstitution({ peptideMg: 10, solventMl: 0 });
    expect(r.concentrationMgPerMl).toBeNull();
  });

  it('handles invalid inputs', () => {
    const r = calculateReconstitution({ peptideMg: NaN, solventMl: Infinity });
    expect(r.totalPeptideMg).toBe(0);
    expect(r.totalSolventMl).toBe(0);
    expect(r.concentrationMgPerMl).toBeNull();
  });

  it('rounds to 2 decimals', () => {
    const r = calculateReconstitution({ peptideMg: 1, solventMl: 3 });
    expect(r.concentrationMgPerMl).toBe(0.33);
  });
});