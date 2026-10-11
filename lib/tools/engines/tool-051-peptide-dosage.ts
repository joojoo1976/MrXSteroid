/**
 * Tool #051 — Peptide Dosage Calculator (Educational, non-prescriptive)
 * Layer 51: concentration arithmetic ONLY.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §7.11, §40):
 *  - This tool performs arithmetic on a concentration the USER supplies.
 *  - It NEVER recommends a dose, never suggests an amount, and never frames any
 *    amount as safe. The user must bring their own clinician-directed amount.
 *  - Reconstitution *instructions* for injectables are intentionally out of scope
 *    (that is the restricted concept #137).
 * ════════════════════════════════════════════════════════════════════════════
 */

export type PeptideUnit = 'mcg' | 'mg' | 'iu';

export interface PeptideDosageInput {
  /** Total peptide mass in the vial (mg). Ignored for IU products. */
  vial_mg: number;
  /** Diluent volume added (mL). */
  diluent_ml: number;
  /** Declared potency for IU products (IU per vial). Optional. */
  vial_iu?: number;
  /** Unit the user is working in. */
  unit: PeptideUnit;
  /** Amount stated by the USER (their clinician's figure). Optional. */
  user_stated_amount?: number;
  /** Syringe scale: units per mL (U-100 = 100). */
  syringe_units_per_ml: number;
}

export interface PeptideDosageResult {
  concentration_per_ml: number;
  concentration_unit: PeptideUnit;
  /** mL required to deliver the user-stated amount (arithmetic only). */
  volume_for_stated_amount_ml: number | null;
  /** Syringe ticks required (arithmetic only). */
  syringe_ticks_for_stated_amount: number | null;
  non_prescriptive_notice: string;
  safety_flags: string[];
}

const round = (v: number, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function calculatePeptideConcentration(input: PeptideDosageInput): PeptideDosageResult {
  const flags: string[] = [];
  const diluent = Math.max(0.1, input.diluent_ml);

  let concentration: number;
  if (input.unit === 'iu') {
    const iu = input.vial_iu ?? 0;
    concentration = iu / diluent;
  } else if (input.unit === 'mg') {
    concentration = input.vial_mg / diluent;
  } else {
    concentration = (input.vial_mg * 1000) / diluent; // mcg/mL
  }

  let volume: number | null = null;
  let ticks: number | null = null;
  if (typeof input.user_stated_amount === 'number' && input.user_stated_amount > 0) {
    volume = round(input.user_stated_amount / concentration, 4);
    ticks = round(volume * input.syringe_units_per_ml, 1);
  }

  if (input.unit === 'iu' && !input.vial_iu) {
    flags.push('IU products require a declared potency (IU per vial); none was provided.');
  }
  if (input.user_stated_amount === undefined) {
    flags.push('No user-stated amount supplied — only the concentration was computed.');
  }
  flags.push('This tool performs arithmetic on YOUR figures. It does not recommend or endorse any dose.');
  flags.push('Never prepare or administer injectables without qualified clinical guidance.');

  return {
    concentration_per_ml: round(concentration, 4),
    concentration_unit: input.unit,
    volume_for_stated_amount_ml: volume,
    syringe_ticks_for_stated_amount: ticks,
    non_prescriptive_notice:
      'Educational arithmetic only. This is not a dosing recommendation and does not replace a clinician.',
    safety_flags: flags,
  };
}
