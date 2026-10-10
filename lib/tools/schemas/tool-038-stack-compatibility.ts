/**
 * Tool #038 — Stack Compatibility Checker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const StackItemSchema = z.object({
  name_en: z.string().min(1).max(80),
  family: z.enum(['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'ai', 'serm', 'support']),
  weekly_dose_mg: z.number().finite().min(0).max(5000),
  hepatotoxic: z.boolean(),
});

export const StackCompatibilityInputSchema = z.object({
  items: z.array(StackItemSchema).min(1).max(10),
});

export type StackCompatibilityInput = z.infer<typeof StackCompatibilityInputSchema>;

export const CompatibilityFlagSchema = z.object({
  code: z.string().min(1).max(32),
  message: z.string().min(1).max(300),
  severity: z.enum(['info', 'monitor', 'important']),
});

export const StackCompatibilityResultSchema = z.object({
  score_0_100: z.number().int().min(0).max(100),
  verdict: z.enum(['compatible', 'caution', 'incompatible']),
  flags: z.array(CompatibilityFlagSchema).max(16),
  androgen_burden_mg_per_week: z.number().finite().min(0),
});

export type StackCompatibilityResult = z.infer<typeof StackCompatibilityResultSchema>;

