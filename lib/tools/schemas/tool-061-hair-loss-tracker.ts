/** Tool #061 — Hair Loss Tracker — input schema (zod). */
import { z } from 'zod';

export const HairLossEntrySchema = z.object({
  month: z.number().min(0).max(600),
  density_score: z.number().min(0).max(100),
});

export const HairLossInputSchema = z.object({
  entries: z.array(HairLossEntrySchema).min(1).max(120),
  norwood_stage: z.number().min(1).max(7),
  daily_shed_strands: z.number().min(0).max(1000),
  recent_stressor: z.boolean(),
  scalp_inflammation: z.boolean(),
});

export type HairLossEntry = z.infer<typeof HairLossEntrySchema>;
export type HairLossInput = z.infer<typeof HairLossInputSchema>;
