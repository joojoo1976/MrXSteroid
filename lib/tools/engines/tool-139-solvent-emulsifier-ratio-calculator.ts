/**
 * lib/tools/engines/tool-139-solvent-emulsifier-ratio-calculator.ts
 * Tool #139 — Solvent & Emulsifier Ratio Calculator (BA/BB)
 * (Layer 1 — Pure Calculation Engine)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no Date, no I/O.
 *
 * SCOPE: Basic solvent/emulsifier ratio calculation.
 * Formulation recommendations are NOT_AVAILABLE.
 */

export interface SolventRatioInput {
  solventAMl: number;
  solventBMl: number;
}

export interface SolventRatioResult {
  ratioA: number | null;
  ratioB: number | null;
  totalMl: number;
  percentageA: number | null;
  percentageB: number | null;
  scope_notice: string;
}

export function calculateSolventRatio(input: SolventRatioInput): SolventRatioResult {
  const a = Number.isFinite(input.solventAMl) && input.solventAMl >= 0 ? input.solventAMl : 0;
  const b = Number.isFinite(input.solventBMl) && input.solventBMl >= 0 ? input.solventBMl : 0;
  const total = a + b;

  return {
    ratioA: total > 0 ? Math.round((a / total) * 100) / 100 : null,
    ratioB: total > 0 ? Math.round((b / total) * 100) / 100 : null,
    totalMl: total,
    percentageA: total > 0 ? Math.round((a / total) * 1000) / 10 : null,
    percentageB: total > 0 ? Math.round((b / total) * 1000) / 10 : null,
    scope_notice: 'educational_ratio_arithmetic_not_a_formulation_guide',
  };
}