/**
 * Tool #017 — Drug Interaction Checker
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const DrugInteractionInputSchema = z.object({
  compounds: z.array(z.object({
    default_dose_mg: z.number(),
    is_lipophilic: z.boolean(),
    family: z.string(),
  })).min(1),
  medications: z.array(z.string()).min(0),
  health_conditions: z.array(z.string()).min(0),
  age: z.number().min(14).max(80),
});

export type DrugInteractionInput = z.infer<typeof DrugInteractionInputSchema>;

export const DrugInteractionResultSchema = z.object({
  overall_safety: z.enum(['safe', 'caution', 'danger']),
  flags: z.array(z.object({
    severity: z.enum(['contraindicated', 'warning', 'informational']),
    category: z.enum(['cardiovascular', 'hepatotoxic', 'endocrine', 'renal', 'neurological']),
    description: z.string(),
    recommendation: z.string(),
  })),
  summary: z.string(),
  requires_medical_approval: z.boolean(),
});

export type DrugInteractionResult = z.infer<typeof DrugInteractionResultSchema>;