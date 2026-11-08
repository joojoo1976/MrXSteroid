/**
 * lib/tools/engines/tool-138-raw-powder-density-oil-formulation-engine.ts
 * Tool #138 — Raw Powder Density / Oil Formulation Engine
 * (Layer 1 — Pure Calculation Engine)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no Date, no I/O.
 *
 * SCOPE: Basic density calculation (mass/volume → density g/mL).
 * Formulation recommendations and safety are NOT_AVAILABLE.
 */

export interface DensityInput {
  massG: number;
  volumeMl: number;
}

export interface DensityResult {
  densityGPerMl: number | null;
  massG: number;
  volumeMl: number;
  scope_notice: string;
}

export function calculateDensity(input: DensityInput): DensityResult {
  const massG = Number.isFinite(input.massG) && input.massG >= 0 ? input.massG : 0;
  const volumeMl = Number.isFinite(input.volumeMl) && input.volumeMl > 0 ? input.volumeMl : 0;

  const density = volumeMl > 0 ? massG / volumeMl : null;

  return {
    densityGPerMl: density !== null ? Math.round(density * 1000) / 1000 : null,
    massG,
    volumeMl,
    scope_notice: 'educational_density_arithmetic_not_a_formulation_or_safety_guide',
  };
}