/**
 * lib/tools/engines/tool-137-peptide-hormone-reconstitution-calculator.ts
 * Tool #137 — Peptide Hormone Reconstitution Calculator
 * (Layer 1 — Pure Calculation Engine)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no Date, no I/O.
 *
 * SCOPE: Basic reconstitution concentration (mg + mL → mg/mL).
 * PK predictions and dosing recommendations are NOT_AVAILABLE.
 */

export interface ReconstitutionInput {
  peptideMg: number;
  solventMl: number;
}

export interface ReconstitutionResult {
  concentrationMgPerMl: number | null;
  totalPeptideMg: number;
  totalSolventMl: number;
  scope_notice: string;
}

export function calculateReconstitution(input: ReconstitutionInput): ReconstitutionResult {
  const peptideMg = Number.isFinite(input.peptideMg) && input.peptideMg > 0 ? input.peptideMg : 0;
  const solventMl = Number.isFinite(input.solventMl) && input.solventMl > 0 ? input.solventMl : 0;

  const concentration = solventMl > 0 ? peptideMg / solventMl : null;

  return {
    concentrationMgPerMl: concentration !== null ? Math.round(concentration * 100) / 100 : null,
    totalPeptideMg: peptideMg,
    totalSolventMl: solventMl,
    scope_notice: 'educational_reconstitution_arithmetic_not_a_dosing_or_preparation_guide',
  };
}