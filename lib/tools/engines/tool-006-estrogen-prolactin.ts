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

export function convertE2Level(value: number, from: 'metric' | 'imperial': 'metric' | 'imperial'): number {
  return value;
}

export function convertProlactinLevel(value: number, from: 'metric' | 'imperial': 'metric' | 'imperial'): number {
  return value;
}