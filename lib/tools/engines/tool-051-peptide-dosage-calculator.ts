/**
 * Tool #051 — Peptide Dosage Calculator
 * Reconstitution concentration and syringe-draw math. Deterministic unit
 * conversions only (mg/ml, ml, U-100 units); informational safety warnings.
 * Pure engine, no I/O.
 */

export interface PeptideDoseInput {
  vial_mg: number; // 0.1..100
  bac_water_ml: number; // 0.1..10
  desired_dose_mg: number; // 0.01..10
}

export interface PeptideDoseResult {
  concentration_mg_per_ml: number;
  dose_volume_ml: number;
  draw_units_u100: number; // U-100 insulin syringe units (100 units = 1 ml)
  doses_per_vial: number; // floor, never over-claims a partial dose
  clamped: boolean; // true when the computed draw was below syringe resolution
  warnings: string[];
}

/** Minimum reliable draw on a U-100 insulin syringe (documented practice). */
const MIN_UNITS = 2;

export function computePeptideDose(input: PeptideDoseInput): PeptideDoseResult {
  const { vial_mg, bac_water_ml, desired_dose_mg } = input;
  const warnings: string[] = ['verify_peptide_identity_and_lab'];

  const concentration_mg_per_ml = vial_mg / bac_water_ml;
  const dose_volume_ml = desired_dose_mg / concentration_mg_per_ml;
  const raw_units = dose_volume_ml * 100; // U-100 scale
  const clamped = raw_units < MIN_UNITS;
  const draw_units_u100 = clamped ? MIN_UNITS : Math.round(raw_units * 10) / 10;
  if (clamped) warnings.push('dose_below_syringe_resolution');

  const doses_per_vial = Math.floor(vial_mg / desired_dose_mg);

  return {
    concentration_mg_per_ml: Math.round(concentration_mg_per_ml * 1000) / 1000,
    dose_volume_ml: Math.round(dose_volume_ml * 1000) / 1000,
    draw_units_u100,
    doses_per_vial,
    clamped,
    warnings: [...new Set(warnings)],
  };
}
