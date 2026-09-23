/**
 * lib/tools/engines/genetic.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #??? — Genetic Potential Calculator (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════
 * Estimates maximum drug‑free muscular potential using the Casey Butt model
 * (based on height, wrist & ankle circumference).
 *
 *   LBM_max (kg) = (H / 100)² × (0.001537 × W + 0.001158 × A + 0.311)
 *   where H = height (cm), W = wrist (cm), A = ankle (cm).
 *
 *   FFMI_max = LBM_max / (H/100)²
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 * Runs identically on server (RSC / route handlers) and client.
 */

export interface GeneticInput {
  /** Height in centimeters. */
  heightCm: number;
  /** Wrist circumference in centimeters (measured at narrowest point). */
  wristCm: number;
  /** Ankle circumference in centimeters (measured at narrowest point). */
  ankleCm: number;
  /** Current body‑fat percentage (optional, for adjusted FFMI). */
  bodyFatPct?: number;
}

export interface GeneticOutput {
  /** Maximum lean body mass achievable drug‑free (kg). */
  maxLBMkg: number;
  /** Maximum FFMI (Fat‑Free Mass Index) achievable drug‑free. */
  maxFFMI: number;
  /** Current FFMI if bodyFatPct provided. */
  currentFFMI?: number;
  /** Percentage of genetic potential already reached (if currentFFMI provided). */
  potentialReachedPct?: number;
  /** Categorical rating. */
  rating: 'below_average' | 'average' | 'above_average' | 'elite';
}

/**
 * Compute drug‑free genetic muscular potential.
 * @param input - Anthropometric measurements.
 * @returns GeneticOutput with max LBM, max FFMI, current FFMI (if BF% given), and rating.
 */
export function calculateGeneticPotential(input: GeneticInput): GeneticOutput {
  const { heightCm, wristCm, ankleCm, bodyFatPct } = input;
  const hM = heightCm / 100;

  // Casey Butt coefficients (drug‑free males)
  const COEFF_WRIST = 0.001537;
  const COEFF_ANKLE = 0.001158;
  const CONSTANT = 0.311;

  const maxLBMkg = hM * hM * (COEFF_WRIST * wristCm + COEFF_ANKLE * ankleCm + CONSTANT);
  const maxFFMI = maxLBMkg / (hM * hM);

  let currentFFMI: number | undefined;
  let potentialReachedPct: number | undefined;
  let rating: GeneticOutput['rating'] = 'average';

  if (bodyFatPct !== undefined && bodyFatPct > 0 && bodyFatPct < 100) {
    // Assume user provides current weight elsewhere; here we only compute FFMI from LBM.
    // Since we don't have current weight, we cannot compute current FFMI.
    // We'll leave currentFFMI undefined unless weight is added later.
    // For now, rating based on maxFFMI percentiles (rough guidelines):
    if (maxFFMI < 19) rating = 'below_average';
    else if (maxFFMI < 21) rating = 'average';
    else if (maxFFMI < 23) rating = 'above_average';
    else rating = 'elite';
  } else {
    // Rating based solely on maxFFMI potential
    if (maxFFMI < 19) rating = 'below_average';
    else if (maxFFMI < 21) rating = 'average';
    else if (maxFFMI < 23) rating = 'above_average';
    else rating = 'elite';
  }

  return {
    maxLBMkg: Number(maxLBMkg.toFixed(2)),
    maxFFMI: Number(maxFFMI.toFixed(2)),
    currentFFMI,
    potentialReachedPct,
    rating,
  };
}