import { describe, it, expect } from 'vitest';
import { calculatePeptideConcentration } from './tool-051-peptide-dosage';

describe('tool-051 Peptide concentration arithmetic', () => {
  it('computes mcg/mL concentration for a mg vial', () => {
    const r = calculatePeptideConcentration({
      vial_mg: 5, diluent_ml: 2, unit: 'mcg', syringe_units_per_ml: 100,
    });
    expect(r.concentration_per_ml).toBeCloseTo(2500, 0);
    expect(r.concentration_unit).toBe('mcg');
  });

  it('converts a user-stated amount to volume and syringe ticks', () => {
    const r = calculatePeptideConcentration({
      vial_mg: 5, diluent_ml: 2, unit: 'mcg', user_stated_amount: 250, syringe_units_per_ml: 100,
    });
    expect(r.volume_for_stated_amount_ml).toBeCloseTo(0.1, 3);
    expect(r.syringe_ticks_for_stated_amount).toBeCloseTo(10, 1);
  });

  it('flags missing IU potency', () => {
    const r = calculatePeptideConcentration({
      vial_mg: 0, diluent_ml: 1, unit: 'iu', syringe_units_per_ml: 100,
    });
    expect(r.safety_flags.join(' ')).toMatch(/potency/i);
  });

  it('never recommends a dose and always carries the non-prescriptive notice', () => {
    const r = calculatePeptideConcentration({
      vial_mg: 5, diluent_ml: 2, unit: 'mcg', user_stated_amount: 250, syringe_units_per_ml: 100,
    });
    expect(r.non_prescriptive_notice).toMatch(/not a dosing recommendation/i);
    expect(r.safety_flags.join(' ')).not.toMatch(/recommended dose|you should take/i);
  });

  it('returns null volume when no amount is supplied', () => {
    const r = calculatePeptideConcentration({ vial_mg: 10, diluent_ml: 1, unit: 'mg', syringe_units_per_ml: 100 });
    expect(r.volume_for_stated_amount_ml).toBeNull();
  });
});
