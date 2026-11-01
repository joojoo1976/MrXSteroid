import { z } from 'zod';

export const HalfLifeCompoundInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  half_life_days: z.number().finite().positive().max(1_000_000),
  source: z.string().trim().min(5).max(500),
}).strict();

export const HalfLifeInputSchema = z.object({
  compounds: z.array(HalfLifeCompoundInputSchema).min(1).max(12),
  remaining_percent: z.number().finite().gt(0).lt(100),
}).strict();

export const HalfLifeCompoundResultSchema = z.object({
  name: z.string(),
  half_life_days: z.number().finite().positive(),
  source: z.string(),
  remaining_percent: z.number().finite().positive().lt(100),
  elapsed_days: z.number().finite().positive(),
}).strict();

export const HalfLifeResultSchema = z.object({
  status: z.literal('CALCULATED'),
  model: z.literal('SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO'),
  compounds: z.array(HalfLifeCompoundResultSchema).min(1).max(12),
  assumptions: z.array(z.enum(['constant_half_life', 'independent_items', 'not_clinical'])).min(1),
}).strict();

export type HalfLifeCompoundInput = z.infer<typeof HalfLifeCompoundInputSchema>;
export type HalfLifeInput = z.infer<typeof HalfLifeInputSchema>;
export type HalfLifeCompoundResult = z.infer<typeof HalfLifeCompoundResultSchema>;
export type HalfLifeResult = z.infer<typeof HalfLifeResultSchema>;
