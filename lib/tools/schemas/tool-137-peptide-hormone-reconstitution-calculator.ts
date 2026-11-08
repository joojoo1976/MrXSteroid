/**
 * lib/tools/schemas/tool-137-peptide-hormone-reconstitution-calculator.ts
 * Tool #137 — Peptide Hormone Reconstitution Calculator — Zod Schema
 */

import { z } from 'zod';

export const ReconstitutionInputSchema = z.object({
  peptideMg: z.number().min(0).max(10000),
  solventMl: z.number().min(0).max(1000),
});

export type ReconstitutionInput = z.infer<typeof ReconstitutionInputSchema>;

export const ReconstitutionResultSchema = z.object({
  concentrationMgPerMl: z.number().nullable(),
  totalPeptideMg: z.number(),
  totalSolventMl: z.number(),
  scope_notice: z.string(),
});

export type ReconstitutionResult = z.infer<typeof ReconstitutionResultSchema>;