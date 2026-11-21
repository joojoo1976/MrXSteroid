import { z } from 'zod';

export const CardioCompoundSchema = z.object({
  name_en: z.string().trim().min(1).max(120),
  is_lipophilic: z.boolean(),
  aromatization_factor: z.number().finite().min(0).max(1).optional(),
}).strict();

export type CardioCompound = z.infer<typeof CardioCompoundSchema>;

export const CardioInputSchema = z.object({
  systolic_bp: z.number().finite().min(0).max(300),
  diastolic_bp: z.number().finite().min(0).max(200),
  heart_rate: z.number().finite().min(0).max(250),
  cholesterol_total: z.number().finite().positive(),
  hdl_cholesterol: z.number().finite().positive(),
  ldl_cholesterol: z.number().finite().nonnegative().optional(),
  triglycerides: z.number().finite().nonnegative().optional(),
  compounds: z.array(CardioCompoundSchema).min(1),
  cycle_length_weeks: z.number().finite().int().min(1).max(52),
}).strict();

export type CardioInput = z.infer<typeof CardioInputSchema>;

export const CardioRiskSchema = z.object({
  overall_risk: z.enum(['low', 'moderate', 'high']),
  risk_score: z.number().finite().min(0).max(100),
  cholesterol_ratio: z.number().finite().positive(),
  risk_factors: z.array(z.string()),
  compound_warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
}).strict();

export type CardioRisk = z.infer<typeof CardioRiskSchema>;
