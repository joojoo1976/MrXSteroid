import { describe, it, expect } from 'vitest';
import { computePeptideDose } from './tool-051-peptide-dosage-calculator';

describe('tool-051 peptide dosage engine', () => {
  it('reconstitutes a 5mg vial to 2.5mg/ml and yields 10 IU per 0.25mg dose', () => {
    const r = computePeptideDose({ vial_mg: 5, bac_water_ml: 2, desired_dose_mg: 0.25 });
    expect(r.concentration_mg_per_ml).toBe(2.5);
    expect(r.dose_volume_ml).toBe(0.1);
    expect(r.draw_units_u100).toBe(10); // 0.1ml on a U-100 syringe
    expect(r.doses_per_vial).toBe(20);
    expect(r.warnings).toContain('verify_peptide_identity_and_lab');
  });

  it('rounds tiny doses to a safe minimum draw of 2 units', () => {
    const r = computePeptideDose({ vial_mg: 10, bac_water_ml: 1, desired_dose_mg: 0.05 });
    // concentration 10 mg/ml -> 0.005 ml = 0.5 IU -> clamped to 2 IU minimum
    expect(r.draw_units_u100).toBe(2);
    expect(r.clamped).toBe(true);
    expect(r.warnings).toContain('dose_below_syringe_resolution');
  });

  it('computes partial-vial dose counts without over-claiming precision', () => {
    const r = computePeptideDose({ vial_mg: 2, bac_water_ml: 1, desired_dose_mg: 0.3 });
    expect(r.concentration_mg_per_ml).toBe(2);
    expect(r.dose_volume_ml).toBe(0.15); // 0.3 / 2
    expect(r.draw_units_u100).toBe(15);
    expect(r.doses_per_vial).toBe(6); // floor(2/0.3)
  });
});
