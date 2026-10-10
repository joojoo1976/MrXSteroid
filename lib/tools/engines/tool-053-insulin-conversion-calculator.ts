/**
 * Tool #053 — Insulin Conversion Calculator
 * Pure unit-conversion + syringe-mismatch safety math. U-100 and U-40 scales
 * are NOT interchangeable — this tool surfaces the exact misreading that a
 * wrong-syringe draw would produce. It never advises dosing; insulin requires
 * medical supervision. Pure engine, no I/O.
 */

export interface InsulinConversionInput {
  concentration: 'u100' | 'u40';
  dose_iu: number; // 0.5..100
}

export interface InsulinConversionResult {
  volume_ml: number;
  draw_units_u100: number; // reading on a U-100 syringe for this volume
  draw_units_u40: number; // reading on a U-40 syringe for this volume
  warnings: string[];
}

const UNITS_PER_ML: Record<InsulinConversionInput['concentration'], number> = { u100: 100, u40: 40 };

export function convertInsulin(input: InsulinConversionInput): InsulinConversionResult {
  const { concentration, dose_iu } = input;

  const volume_ml = dose_iu / UNITS_PER_ML[concentration];
  const draw_units_u100 = Math.round(volume_ml * 100 * 10) / 10;
  const draw_units_u40 = Math.round(volume_ml * 40 * 10) / 10;

  return {
    volume_ml: Math.round(volume_ml * 1000) / 1000,
    draw_units_u100,
    draw_units_u40,
    warnings: ['syringe_mismatch_fatal_risk', 'insulin_requires_medical_supervision'],
  };
}
