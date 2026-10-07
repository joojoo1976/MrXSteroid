/**
 * Tool #017 — Injection Volume Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const InjectionSiteSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  muscle_group: z.enum(['deltoid', 'glutes', 'quads', 'pectorals', 'triceps', 'biceps']),
  is_lipophilic_preference: z.boolean(),
  current_volume_ml: z.number().optional(),
  last_injection_date: z.string().optional(),
});

export type InjectionSite = z.infer<typeof InjectionSiteSchema>;

export const InjectionVolumeInputSchema = z.object({
  target_muscle: z.enum(['deltoid', 'glutes', 'quads', 'pectorals', 'triceps', 'biceps']),
  compound_viscosity: z.enum(['low', 'medium', 'high']),
  concentration_mg_ml: z.number().min(1).max(500),
  desired_dose_mg: z.number().min(1).max(1000),
  current_sites: z.array(InjectionSiteSchema).min(0).max(10),
  user_body_weight_kg: z.number().min(40).max(300},
});

export type InjectionVolumeInput = z.infer<typeof InjectionVolumeInputSchema>;

export const InjectionVolumeResultSchema = z.object({
  desired_dose_ml: z.number().min(0.1).max(10),
  max_recommended_ml: z.number().min(0.1).max(5),
  injection_sites: z.array(InjectionSiteSchema),
  rotation_schedule: z.array(z.string()),
  warnings: z.array(z.string()),
  measurement_system: z.enum(['metric', 'imperial']),
  imperial_conversion: z.number().min(0).max(1),
});

export type InjectionVolumeResult = z.infer<typeof InjectionVolumeResultSchema>;