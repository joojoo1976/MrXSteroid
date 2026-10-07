/**
 * Tool #026 — Injection Pain Minimizer
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const InjectionPainSiteSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  muscle_group: z.enum(['deltoid', 'glutes', 'quads', 'pectorals', 'triceps', 'biceps']),
  last_injection_date: z.string().optional(),
  current_volume_ml: z.number().optional(),
  pain_level: z.enum(['none', 'mild', 'moderate', 'severe']),
});

export type InjectionPainSite = z.infer<typeof InjectionPainSiteSchema>;

export const InjectionPainInputSchema = z.object({
  compound_viscosity: z.enum(['low', 'medium', 'high']),
  concentration_mg_ml: z.number().min(1).max(500),
  desired_dose_mg: z.number().min(1).max(1000),
  current_sites: z.array(InjectionPainSiteSchema).min(0).max(10),
  injection_site: z.enum(['deltoid', 'glutes', 'quads', 'pectorals', 'triceps', 'biceps']),
});

export type InjectionPainInput = z.infer<typeof InjectionPainInputSchema>;

export const InjectionPainResultSchema = z.object({
  desired_dose_ml: z.number().min(0.1).max(10),
  max_safe_volume_ml: z.number().min(0.1).max(5),
  pain_minimization_score: z.number().min(0).max(100),
  recommended_site: z.string(),
  rotation_schedule: z.array(z.string()),
  solvent_ratio: z.string(),
  temperature_recommendation: z.string(),
  warnings: z.array(z.string()),
});

export type InjectionPainResult = z.infer<typeof InjectionPainResultSchema>;