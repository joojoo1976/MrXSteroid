/**
 * Tool #058 — Androgenic Balance Calculator
 * Androgenic/anabolic balance screen via two documented ratios: DHT/T (%
 * androgenic skew, 10–25% balanced) and E2/T (% estrogenic skew, ≤0.6%
 * balanced). Educational screening only. Pure engine, no I/O.
 */

export interface AndrogenicBalanceInput {
  dht_ng_dl: number; // 5..500
  testosterone_ng_dl: number; // 50..3000
  estradiol_pg_ml: number; // 2..500
}

export interface AndrogenicBalanceResult {
  dht_t_ratio_pct: number;
  e2_t_ratio_pct: number;
  dht_band: 'dht-low' | 'balanced' | 'androgenic-dominant';
  e2_band: 'low-e2-context' | 'balanced' | 'e2-dominant';
  warnings: string[];
}

export function assessAndrogenicBalance(input: AndrogenicBalanceInput): AndrogenicBalanceResult {
  const { dht_ng_dl, testosterone_ng_dl, estradiol_pg_ml } = input;
  const warnings: string[] = ['educational_screening_ratio_only'];

  const dht_t_ratio_pct = round1((dht_ng_dl / testosterone_ng_dl) * 100);
  const e2_t_ratio_pct = round1((estradiol_pg_ml * 10) / testosterone_ng_dl);

  if (dht_t_ratio_pct > 25) warnings.push('androgenic_dominance_flag');
  if (e2_t_ratio_pct > 0.6) warnings.push('e2_dominant_context');

  const dht_band: AndrogenicBalanceResult['dht_band'] =
    dht_t_ratio_pct < 10 ? 'dht-low' : dht_t_ratio_pct <= 25 ? 'balanced' : 'androgenic-dominant';
  const e2_band: AndrogenicBalanceResult['e2_band'] =
    e2_t_ratio_pct < 0.2 ? 'low-e2-context' : e2_t_ratio_pct <= 0.6 ? 'balanced' : 'e2-dominant';

  return {
    dht_t_ratio_pct,
    e2_t_ratio_pct,
    dht_band,
    e2_band,
    warnings: [...new Set(warnings)],
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
