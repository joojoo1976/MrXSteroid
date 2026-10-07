/**
 * Tool #008 — Side Effect Tracker
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const SideEffectLogSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  symptom: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  category: z.enum(['estrogenic', 'androgenic', 'cardiovascular', 'hepatotoxic', 'psychological', 'other']),
  notes: z.string().optional(),
  compound_related: z.string().optional(),
});

export type SideEffectLog = z.infer<typeof SideEffectLogSchema>;

export const UserSideEffectProfileSchema = z.object({
  user_id: z.string(),
  total_logs: z.number().default(0),
  most_common_symptoms: z.array(z.string()).default([]),
  severity_trend: z.enum(['improving', 'stable', 'worsening']).default('stable'),
  last_assessment_date: z.string().default(() => new Date().toISOString()),
  risk_level: z.enum(['low', 'moderate', 'high']).default('low'),
});

export type UserSideEffectProfile = z.infer<typeof UserSideEffectProfileSchema>;

export const SideEffectPatternSchema = z.object({
  symptom: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'rare']),
  average_severity: z.number().min(1).max(10),
  first_observed: z.string(),
  last_observed: z.string(),
});

export type SideEffectPattern = z.infer<typeof SideEffectPatternSchema>;