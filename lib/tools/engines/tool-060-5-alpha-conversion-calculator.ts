/**
 * Tool #060 — 5-Alpha Conversion Calculator
 * 5-alpha reductase conversion estimator: DHT ≈ testosterone × conversion
 * factor, dampened by documented 5-ARI inhibition levels (finasteride 1/5mg,
 * dutasteride 0.5mg). Population-level educational estimate only.
 * Pure engine, no I/O.
 */

export interface DhtConversionInput {
  testosterone_ng_dl: number; // 50..3000
  inhibitor: 'none' | 'finasteride_1mg' | 'finasteride_5mg' | 'dutasteride_0.5mg';
}

export interface DhtConversionResult {
  dht_estimate_ng_dl: number;
  est_conversion_pct: number; // testosterone → DHT conversion share
  suppression_pct: number; // vs the no-inhibitor baseline factor
  band: 'suppressed-dht' | 'normal-range' | 'elevated-dht';
  warnings: string[];
}

const BASELINE_FACTOR = 0.1; // documented ~10% 5-alpha conversion share

const FACTORS: Record<DhtConversionInput['inhibitor'], number> = {
  none: 0.1,
  finasteride_1mg: 0.05,
  finasteride_5mg: 0.03,
  'dutasteride_0.5mg': 0.01,
};

export function estimateDhtConversion(input: DhtConversionInput): DhtConversionResult {
  const { testosterone_ng_dl, inhibitor } = input;
  const warnings: string[] = ['educational_population_estimate'];

  const factor = FACTORS[inhibitor];
  const dht_estimate_ng_dl = Math.round(testosterone_ng_dl * factor);
  const suppression_pct = Math.round(((BASELINE_FACTOR - factor) / BASELINE_FACTOR) * 100);

  if (factor <= 0.05) warnings.push('dht_suppression_context');

  const band: DhtConversionResult['band'] =
    dht_estimate_ng_dl < 30 ? 'suppressed-dht' : dht_estimate_ng_dl <= 85 ? 'normal-range' : 'elevated-dht';

  return {
    dht_estimate_ng_dl,
    est_conversion_pct: factor * 100,
    suppression_pct,
    band,
    warnings: [...new Set(warnings)],
  };
}
