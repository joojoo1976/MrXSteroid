/**
 * Tool #015 — SHBG Modulator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const SHBGInputSchema = z.object({
  total_testosterone_ng_dL: z.number().min(50).max(2000),
  shbg_nmol_L: z.number().min(1).max(200),
  albumin_g_dL: z.number().optional().min(1).max(10).default(4),
  sex: z.enum(['male', 'female']),
});

export type SHBGInput = z.infer<typeof SHBGInputSchema>;

export const SHBGResultSchema = z.object({
  shbg_nmol_L: z.number(),
  shbg_reference_range: z.tuple([z.number(), z.number()]),
  free_testosterone_ng_dL: z.number(),
  free_testosterone_percentage: z.number(),
  bioavailable_testosterone_ng_dL: z.number(),
  total_testosterone_ng_dL: z.number(),
  interpretation: z.enum(['low', 'normal', 'high']),
  recommendations: z.array(z.string()),
});

export type SHBGResult = z.infer<typeof SHBGResultSchema>;