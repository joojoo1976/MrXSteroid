/** Tool #057 — Free Testosterone Manager — input schema (zod). */
import { z } from 'zod';

export const FreeTestosteroneInputSchema = z.object({
  total_testosterone_ng_dl: z.number().min(0).max(3000),
  shbg_nmol_l: z.number().min(1).max(300),
  albumin_g_l: z.number().min(10).max(80),
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
});

export type FreeTestosteroneInput = z.infer<typeof FreeTestosteroneInputSchema>;
