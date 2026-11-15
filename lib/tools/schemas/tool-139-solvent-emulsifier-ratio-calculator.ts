/**
 * lib/tools/schemas/tool-139-solvent-emulsifier-ratio-calculator.ts
 * Tool #139 — Solvent & Emulsifier Ratio Calculator — Zod Schema
 */

import { z } from 'zod';

export const SolventRatioInputSchema = z.object({
  solventAMl: z.number().min(0).max(10000),
  solventBMl: z.number().min(0).max(10000),
});

export type SolventRatioInput = z.infer<typeof SolventRatioInputSchema>;

export const SolventRatioResultSchema = z.object({
  ratioA: z.number().nullable(),
  ratioB: z.number().nullable(),
  totalMl: z.number(),
  percentageA: z.number().nullable(),
  percentageB: z.number().nullable(),
  scope_notice: z.string(),
});

export type SolventRatioResult = z.infer<typeof SolventRatioResultSchema>;