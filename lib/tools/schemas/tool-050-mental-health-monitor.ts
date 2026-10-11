/** Tool #050 — Mental Health Monitor — input schema (zod). */
import { z } from 'zod';

const item = z.number().int().min(0).max(3);

export const MentalHealthInputSchema = z.object({
  little_interest: item,
  feeling_down: item,
  sleep_problems: item,
  low_energy: item,
  appetite_change: item,
  low_self_worth: item,
  poor_concentration: item,
  psychomotor_change: item,
  suicidal_ideation: item,
  functional_impairment: z.boolean(),
});

export type MentalHealthInput = z.infer<typeof MentalHealthInputSchema>;
