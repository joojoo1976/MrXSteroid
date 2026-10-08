/**
 * Tool #006 — Estrogen & Prolactin Control
 * Layer 6: AI/DA Dosing Calculator & Aromatization Risk Assessment
 * Platform: MrXSteroid.com | Core: Hormone Modulation & Lab Interpretation
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate aromatization risk from compound stack
 * - Recommend AI (Aromatase Inhibitor) dose
 * - Recommend DA (Dopamine Agonist) dose for prolactin
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface EstrogenProlactinInput {
  e2Level: number;           // Estradiol (pg/mL)
  prolactinLevel: number;    // Prolactin (ng/mL)
  measurementSystem: 'metric' | 'imperial';
  currentAI?: string;        // Current AI if using one
  currentDA?: string;        // Current DA if using one
  compoundStack: CompoundItem[];
}

export interface AromatizationScore {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskPercentage: number;    // 0-100%
  recommendedAIMg: number;   // Recommended AI dose in mg/week
  recommendedDAMg: number;   // Recommended DA dose in mg/week
  keyFindings: string[];
}

export function getAromatizationFactor(family: string): number {
  const factors: Record<string, number> = {
    testosterone: 1.0,
    nandrolone: 0.2,
    trenbolone: 0.5,
    drostanolone: 0.0,
    stanozolol: 0.0,
    oxandrolone: 0.0,
    metandienone: 1.0,
    boldenone: 0.5,
    methenolone: 0.3,
    testosterone_undecanoate: 1.0,
  };

  return factors[family] || 0.5;
}

export function convertE2Level(value: number, from: 'metric' | 'imperial'): number {
  return value;
}

export function convertProlactinLevel(value: number, from: 'metric' | 'imperial'): number {
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Compound stack item consumed by calculateAromatizationRisk()
// ─────────────────────────────────────────────────────────────────────────────
export interface CompoundItem {
  /** English display name (optional — used for findings text when present). */
  name_en?: string;
  /** Aromatization family key resolved by getAromatizationFactor(). */
  family: string;
  /** Weekly dose in mg — weights the stack contribution (defaults to 1). */
  dose_mg?: number;
}

/**
 * Layer 3 entry point: aromatization risk score from compound stack + labs.
 * Uses only the primitives defined in this file (getAromatizationFactor,
 * convertE2Level, convertProlactinLevel) — no external dependencies.
 */
export function calculateAromatizationRisk(input: EstrogenProlactinInput): AromatizationScore {
  const stack = input.compoundStack ?? [];
  const e2 = convertE2Level(input.e2Level, input.measurementSystem);
  const prolactin = convertProlactinLevel(input.prolactinLevel, input.measurementSystem);

  // Dose-weighted average aromatization factor of the stack (0..1).
  let stackFactor = 0;
  if (stack.length > 0) {
    let weightSum = 0;
    let weighted = 0;
    for (const c of stack) {
      const w = c.dose_mg && c.dose_mg > 0 ? c.dose_mg : 1;
      weightSum += w;
      weighted += getAromatizationFactor(c.family) * w;
    }
    stackFactor = weightSum > 0 ? weighted / weightSum : 0;
  }

  // Risk = stack contribution (0-60) + E2 elevation above 40 pg/mL (0-40).
  const stackScore = Math.min(60, stackFactor * 60);
  const e2Score = Math.min(40, Math.max(0, e2 - 40));
  const riskPercentage = Math.round(Math.max(0, Math.min(100, stackScore + e2Score)));

  const riskLevel: AromatizationScore['riskLevel'] =
    riskPercentage >= 66 ? 'HIGH' : riskPercentage >= 33 ? 'MODERATE' : 'LOW';

  // Anastrozole-equivalent AI (mg/week) and cabergoline-equivalent DA (mg/week).
  const recommendedAIMg = riskLevel === 'HIGH' ? 1 : riskLevel === 'MODERATE' ? 0.5 : 0;
  const recommendedDAMg = prolactin > 25 ? 0.5 : prolactin > 20 ? 0.25 : 0;

  const keyFindings: string[] = [];
  if (stack.length === 0) keyFindings.push('No compounds in stack - baseline assessment only');
  if (e2 > 40) keyFindings.push(`Estradiol elevated at ${e2}`);
  else keyFindings.push('Estradiol within reference range (20-40 pg/mL)');
  if (prolactin > 25) keyFindings.push(`Prolactin elevated at ${prolactin}`);
  if (input.currentAI) keyFindings.push(`Currently using AI: ${input.currentAI}`);
  if (input.currentDA) keyFindings.push(`Currently using DA: ${input.currentDA}`);
  if (riskLevel === 'HIGH') keyFindings.push('High aromatization risk - consider AI protocol');
  else if (riskLevel === 'LOW') keyFindings.push('Low aromatization risk - no AI indicated');

  return {
    riskLevel,
    riskPercentage,
    recommendedAIMg,
    recommendedDAMg,
    keyFindings,
  };
}