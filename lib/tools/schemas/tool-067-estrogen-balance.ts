/** Tool #067 — Estrogen Balance Calculator — input schema (zod). */
import { z } from 'zod';

export const EstrogenBalanceInputSchema = z.object({
  sex: z.enum(['male', 'female']),
  estradiol_pg_ml: z.number().min(0).max(1000),
  total_testosterone_ng_dl: z.number().min(0).max(3000),
  shbg_nmol_l: z.number().min(1).max(300),
  high_e2_symptoms: z.number().int().min(0).max(3),
  low_e2_symptoms: z.number().int().min(0).max(3),
});

export type EstrogenBalanceInput = z.infer<typeof EstrogenBalanceInputSchema>;
