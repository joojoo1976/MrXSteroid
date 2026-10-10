/**
 * Tool #057 — Free Testosterone Manager
 * Free-T estimate via the Vermeulen simplified linear-binding approximation:
 * free = total / (1 + K_SHBG×[SHBG] + K_alb×[albumin]) with K_SHBG = 1e9 L/mol
 * and K_alb = 3.6e4 L/mol. Educational estimate, not a lab measurement.
 * Pure engine, no I/O.
 */

export interface FreeTestosteroneInput {
  total_test_ng_dl: number; // 10..3000
  shbg_nmol_l: number; // 5..200
  albumin_g_dl: number; // 3..6
}

export interface FreeTestosteroneResult {
  free_t_pg_ml: number;
  free_t_pct: number; // free/total × 100
  band: 'low-free-fraction' | 'normal-free-fraction' | 'high-free-fraction';
  warnings: string[];
}

const T_NG_DL_TO_NMOL = 0.0347;
const ALBUMIN_MW_G_PER_MOL = 66441; // human serum albumin
const K_SHBG = 1e9; // L/mol
const K_ALBUMIN = 3.6e4; // L/mol
const NMOL_TO_PG_ML = 288.4; // testosterone molar mass conversion

export function estimateFreeTestosterone(input: FreeTestosteroneInput): FreeTestosteroneResult {
  const { total_test_ng_dl, shbg_nmol_l, albumin_g_dl } = input;
  const warnings: string[] = ['educational_estimate_vermeulen_simplified'];

  const total_nmol = total_test_ng_dl * T_NG_DL_TO_NMOL;
  const albumin_mol = (albumin_g_dl * 10) / ALBUMIN_MW_G_PER_MOL;
  const n = K_SHBG * shbg_nmol_l * 1e-9 + K_ALBUMIN * albumin_mol;
  const free_nmol = total_nmol / (1 + n);

  const free_t_pg_ml = round1(free_nmol * NMOL_TO_PG_ML);
  const free_t_pct = round1((free_nmol / total_nmol) * 100);

  if (shbg_nmol_l < 20) warnings.push('low_shbg_high_free_context');
  if (shbg_nmol_l > 55) warnings.push('high_shbg_low_free_context');

  const band: FreeTestosteroneResult['band'] =
    free_t_pct < 1.5 ? 'low-free-fraction' : free_t_pct <= 2.5 ? 'normal-free-fraction' : 'high-free-fraction';

  return {
    free_t_pg_ml,
    free_t_pct,
    band,
    warnings: [...new Set(warnings)],
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
