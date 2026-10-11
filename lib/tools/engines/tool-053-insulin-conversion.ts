/**
 * Tool #053 — Insulin Conversion Calculator (Educational)
 * Layer 53: insulin concentration / unit arithmetic (clinical-lab style).
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §19, §40):
 *  - Conversion arithmetic only; never recommends an insulin dose.
 *  - Hypoglycaemia is a red flag → urgent guidance.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type InsulinConcentration = 'U-100' | 'U-40' | 'U-500';

export const UNITS_PER_ML: Readonly<Record<InsulinConcentration, number>> = {
  'U-40': 40,
  'U-100': 100,
  'U-500': 500,
};

export interface InsulinConversionInput {
  concentration: InsulinConcentration;
  /** Volume in mL (optional). */
  volume_ml?: number;
  /** Units (optional). */
  units?: number;
  /** Symptoms of hypoglycaemia for escalation. */
  hypoglycaemia_symptoms: boolean;
}

export interface InsulinConversionResult {
  units_per_ml: number;
  units: number | null;
  volume_ml: number | null;
  emergency: boolean;
  emergency_message: string | null;
  educational_notice: string;
}

const round = (v: number, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function convertInsulin(input: InsulinConversionInput): InsulinConversionResult {
  const upm = UNITS_PER_ML[input.concentration];
  const units = typeof input.units === 'number' ? input.units : null;
  const volume =
    typeof input.volume_ml === 'number'
      ? input.volume_ml
      : units !== null
        ? round(units / upm, 4)
        : null;
  const resolvedUnits = units !== null ? units : volume !== null ? round(volume * upm, 2) : null;

  const emergency = input.hypoglycaemia_symptoms;

  return {
    units_per_ml: upm,
    units: resolvedUnits,
    volume_ml: volume,
    emergency,
    emergency_message: emergency
      ? 'URGENT: symptoms of hypoglycaemia require immediate treatment with fast-acting glucose and, if severe, emergency care. Do not rely on this tool.'
      : null,
    educational_notice:
      'Educational unit conversion only. Insulin must be dosed by a clinician; never change insulin products without professional guidance.',
  };
}
