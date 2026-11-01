/**
 * Tool #094 — Pregnancy exposure information.
 *
 * A broad compound-class washout model is not configured or validated. Keep
 * this function fail-closed so callers cannot infer fetal safety, clearance,
 * or a date when conception is safe from coarse class-level inputs.
 */

export interface PregnancyRiskCalculatorInput {
  compound_class: 'anabolic_androgenic_steroid' | 'sarm' | 'aromatase_inhibitor_or_serm' | 'retinoid_isotretinoin' | 'thermogenic_adrenergic';
  weeks_since_last_exposure: number;
  currently_pregnant_or_attempting_conception: boolean;
  unprotected_intercourse_during_exposure: boolean;
}

export interface PregnancyRiskCalculatorResult {
  status: 'NOT_AVAILABLE';
  reason: 'NO_PRODUCT_SPECIFIC_PREGNANCY_GUIDANCE';
  resultOrigin: 'NOT_AVAILABLE';
  message: string;
}

export function calculatePregnancyRisk(_input: PregnancyRiskCalculatorInput): PregnancyRiskCalculatorResult {
  return {
    status: 'NOT_AVAILABLE',
    reason: 'NO_PRODUCT_SPECIFIC_PREGNANCY_GUIDANCE',
    resultOrigin: 'NOT_AVAILABLE',
    message: 'No individualized pregnancy-risk, clearance, or conception-timing assessment is available from a broad compound-class model.',
  };
}
