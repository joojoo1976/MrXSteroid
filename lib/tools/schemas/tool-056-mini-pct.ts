/** Tool #056 — Mini PCT Calculator — input schema (zod). */
import { z } from 'zod';

export const MiniPctInputSchema = z.object({
  last_injection_iso: z.string().min(8).max(40),
  longest_half_life_days: z.number().min(0.2).max(60),
  cycle_weeks: z.number().min(1).max(52),
  age: z.number().int().min(16).max(90),
  used_hcg: z.boolean(),
});

export type MiniPctInput = z.infer<typeof MiniPctInputSchema>;
