/** Tool #058 — Androgenic Balance Calculator — input schema (zod). */
import { z } from 'zod';

export const AndrogenicBalanceInputSchema = z.object({
  anabolic_activity: z.number().min(1).max(100),
  androgenic_activity: z.number().min(1).max(100),
  androgenic_side_effects: z.number().int().min(0).max(3),
  mpb_history: z.boolean(),
  acne_severity: z.number().int().min(0).max(3),
});

export type AndrogenicBalanceInput = z.infer<typeof AndrogenicBalanceInputSchema>;
