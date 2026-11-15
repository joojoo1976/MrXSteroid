/**
 * lib/tools/schemas/tool-138-raw-powder-density-oil-formulation-engine.ts
 * Tool #138 — Raw Powder Density / Oil Formulation Engine — Zod Schema
 */

import { z } from 'zod';

export const DensityInputSchema = z.object({
  massG: z.number().min(0).max(100000),
  volumeMl: z.number().min(0).max(100000),
});

export type DensityInput = z.infer<typeof DensityInputSchema>;

export const DensityResultSchema = z.object({
  densityGPerMl: z.number().nullable(),
  massG: z.number(),
  volumeMl: z.number(),
  scope_notice: z.string(),
});

export type DensityResult = z.infer<typeof DensityResultSchema>;