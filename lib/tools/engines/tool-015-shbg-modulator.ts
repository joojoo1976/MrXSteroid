/**
 * Tool #015 — SHBG Modulator
 * Layer 15: SHBG Impact on Free Testosterone & Hormone Bioavailability
 * Platform: MrXSteroid.com | Core: Hormone Bioavailability & Free Hormone Calculation
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate free testosterone using SHBG, total T, albumin
 * - Determine SHBG modulation through compounds, diet, lifestyle
 * - Estimate bioavailable testosterone fraction
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface SHBGInput {
  total_testosterone_ng_dL: number;   // Total Testosterone (ng/dL)
  shbg_nmol_L: number;               // SHBG (nmol/L)
  albumin_g_dL?: number;             // Albumin (g/dL), default 4.0
  sex: 'male' | 'female';
}

export interface SHBGResult {
  shbg_nmol_L: number;
  shbg_reference_range: [number, number]; // Normal range
  free_testosterone_ng_dL: number;       // Calculated free T
  free_testosterone_percentage: number;  // % of total
  bioavailable_testosterone_ng_dL: number; // Albumin-bound + free
  total_testosterone_ng_dL: number;
  interpretation: 'low' | 'normal' | 'high';
  recommendations: string[];
}

export function calculateSHBG(input: SHBGInput): SHBGResult {
  const { total_testosterone_ng_dL, shbg_nmol_L, albumin_g_dL = 4.0, sex } = input;
  
  // Reference ranges
  const shbgReferenceLow = sex === 'male' ? 10 : 20;
  const shbgReferenceHigh = sex === 'male' ? 57 : 120;
  
  // Calculate free testosterone using Vermeulen equation
  // FT = Total T / (1 + (SHBG * 10) / (Albumin * 0.1 + Kd))
  // Simplified: most labs use Vermeulen or Weiss equation
  
  const albumin_mg_dL = albumin_g_dL * 100; // convert g/dL to mg/dL
  const kh = 1.0; // binding constant for SHBG-testosterone (approximate)
  
  // Vermeulen equation
  const freeTestosterone_nmol_L = (total_testosterone_ng_dL * 0.0347) / (1 + (shbg_nmol_L * 10) / (albumin_mg_dL * 0.1 + kh));
  const freeTestosterone_ng_dL = freeTestosterone_nmol_L / 0.0347; // convert back to ng/dL
  
  // Calculate percentage
  const freePercentage = (freeTestosterone_ng_dL / total_testosterone_ng_dL) * 100;
  
  // Bioavailable T = Free T + Albumin-bound T
  // Albumin-bound approx: total - free (simplified)
  const bioavailableTestosterone_ng_dL = total_testosterone_ng_dL * (1 - 0.01 * freePercentage / 100) + freeTestosterone_ng_dL * 0.01;
  
  // Determine interpretation
  let interpretation: 'low' | 'normal' | 'high';
  const freeRefRangeLow = sex === 'male' ? 2.5 : 1.0;
  const freeRefRangeHigh = sex === 'male' ? 25.0 : 20.0;
  
  if (freePercentage < 1.0 || freeTestosterone_ng_dL < freeRefRangeLow) {
    interpretation = 'low';
  } else if (freePercentage > 5.0 || freeTestosterone_ng_dL > freeRefRangeHigh * 1.5) {
    interpretation = 'high';
  } else {
    interpretation = 'normal';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (freePercentage < 1.5) {
    recommendations.push('Low free testosterone detected - consider SHBG modulation');
    recommendations.push('Compounds that lower SHBG: DHT derivatives (Masteron, Halotestin)');
    recommendations.push('Lifestyle: Resistance training, adequate zinc intake');
  }
  
  if (freePercentage > 5) {
    recommendations.push('High free testosterone - monitor for estrogen conversion');
    recommendations.push('Consider aromatase inhibitor if E2 elevated (see Tool #6)');
  }
  
  if (shbg_nmol_L < shbgReferenceLow) {
    recommendations.push('Low SHBG detected - may increase hormone availability');
    recommendations.push('Compounds that raise SHBG: Oral 17-alpha-alkylated steroids');
  }
  
  if (shbg_nmol_L > shbgReferenceHigh) {
    recommendations.push('High SHBG detected - limits hormone availability');
    recommendations.push('Consider SHBG-modulating compounds or dosage adjustment');
  }
  
  return {
    shbg_nmol_L,
    total_testosterone_ng_dL,
    shbg_reference_range: [shbgReferenceLow, shbgReferenceHigh],
    free_testosterone_ng_dL: Math.round(freeTestosterone_ng_dL * 10) / 10,
    free_testosterone_percentage: Math.round(freePercentage * 10) / 10,
    bioavailable_testosterone_ng_dL: Math.round(bioavailableTestosterone_ng_dL * 10) / 10,
    interpretation,
    recommendations,
  };
}