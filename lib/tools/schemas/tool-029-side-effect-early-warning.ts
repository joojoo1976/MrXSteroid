/**
 * Tool #029 — Side Effect Early Warning
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const SideEffectSymptomSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  category: z.enum(['androgenic', 'estrogenic', 'cardiovascular', 'hepatotoxic', 'suppressive', 'other']),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  days_noticed: z.number().min(0).max(365),
  compound_triggers: z.array(z.string()),
  action_required: z.enum(['monitor', 'ai_support', 'dosage_reduce', 'cycle_stop']),
});

export type SideEffectSymptom = z.infer<typeof SideEffectSymptomSchema>;

export const SideEffectStackInputSchema = z.object({
  compounds: z.array(z.string()).min(1).max(6),
  cycle_day: z.number().min(1).max(365),
  user_age: z.number().min(18).max(80),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
  health_markers: z.object({
    blood_pressure: z.number().min(60).max(200).optional(),
    heart_rate: z.number().min(40).max(200).optional(),
    recent_weight: z.number().min(30).max(300).optional(),
    libido: z.enum(['increased', 'normal', 'decreased']).optional(),
  }),
});

export type SideEffectStackInput = z.infer<typeof SideEffectStackInputSchema>;

export const SideEffectEarlyWarningResultSchema = z.object({
  predicted_side_effects: z.array(SideEffectSymptomSchema).min(0).max(30),
  overall_risk_level: z.enum(['low', 'moderate', 'high', 'critical']),
  risk_score: z.number().min(0).max(100),
  monitoring_recommendations: z.array(z.string()).min(0).max(15),
  immediate_actions: z.array(z.string()).min(0).max(10),
  when_to_concerned: z.string(),
});

export type SideEffectEarlyWarningResult = z.infer<typeof SideEffectEarlyWarningResultSchema>;