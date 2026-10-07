/**
 * Tool #016 — Libido & Sexual Function Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const LibidoInputSchema = z.object({
  age: z.number().min(14).max(80),
  compound_stack: z.array(z.object({
    default_dose_mg: z.number(),
    family: z.string(),
    aromatization_factor: z.number(),
  })).min(1),
  test_level_ng_dL: z.number().optional().min(50).max(2000),
  shbg_nmol_L: z.number().optional().min(1).max(200),
  symptoms: z.enum(['low', 'normal', 'high', 'hyper']),
  duration_weeks: z.number().min(1).max(52),
});

export type LibidoInput = z.infer<typeof LibidoInputSchema>;

export const LibidoResultSchema = z.object({
  libido_level: z.enum(['low', 'normal', 'high']),
  libido_score: z.number().min(0).max(100),
  symptom_severity: z.enum(['mild', 'moderate', 'severe']),
  recommendations: z.array(z.string()),
  compound_adjustments: z.array(z.string()),
  timeline: z.enum(['immediate', '2-4 weeks', 'pct', 'trt']),
});

export type LibidoResult = z.infer<typeof LibidoResultSchema>;