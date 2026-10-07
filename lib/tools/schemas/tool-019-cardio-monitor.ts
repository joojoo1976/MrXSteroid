/**
 * Tool #019 — Cardiovascular Health Monitor
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const CardioInputSchema = z.object({
  systolic_bp: z.number().min(60).max(250),
  diastolic_bp: z.number().min(40).max(150),
  heart_rate: z.number().min(40).max(200),
  cholesterol_total: z.number().min(50).max(500),
  hdl_cholesterol: z.number().min(20).max(200),
  ldl_cholesterol: z.number().optional().min(20).max(300),
  triglycerides: z.number().optional().min(20).max(1000),
  compounds: z.array(z.object({
    is_lipophilic: z.boolean(),
    family: z.string(),
    default_dose_mg: z.number(),
  })).min(1),
  cycle_length_weeks: z.number().min(1).max(52},
});

export type CardioInput = z.infer<typeof CardioInputSchema>;

export const CardioRiskSchema = z.object({
  overall_risk: z.enum(['low', 'moderate', 'high']),
  risk_score: z.number().min(0).max(100),
  cholesterol_ratio: z.number().min(1).max(10),
  risk_factors: z.array(z.string()),
  compound_warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type CardioRisk = z.infer<typeof CardioRiskSchema>;