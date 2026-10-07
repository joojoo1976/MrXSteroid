/**
 * Tool #021 — Peptide Protocol Planner
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const PeptideCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  category: z.enum(['hgh', 'igf-1', 'bpc-157', 'tb-500', 'cjc-1295', 'other']),
  concentration_mg_ml: z.number().min(0.1).max(500),
  default_dose_mcg_kg: z.number().min(0.1).max(100),
  half_life_hours: z.number().min(0.5).max(720),
  administration: z.enum(['subcutaneous', 'intramuscular', 'intranasal']),
  description_text: z.string(),
});

export type PeptideCompound = z.infer<typeof PeptideCompoundSchema>;

export const PeptideProtocolInputSchema = z.object({
  user_weight_kg: z.number().min(40).max(300),
  target_compounds: z.array(PeptideCompoundSchema).min(1).max(5),
  goal: z.enum(['recovery', 'muscle_growth', 'fat_loss', 'anti_aging']),
  protocol_duration_weeks: z.number().min(1).max(52),
  injection_frequency: z.enum(['daily', 'every-other-day', '3x-week', 'weekly']),
});

export type PeptideProtocolInput = z.infer<typeof PeptideProtocolInputSchema>;

export const PeptideProtocolResultSchema = z.object({
  daily_dose_mcg: z.number().min(0.1).max(500),
  total_cycle_dose_mg: z.number().min(0.1).max(500),
  injection_frequency_days: z.number().min(1).max(7),
  total_injections: z.number().min(1).max(400),
  protocol_weeks: z.number().min(1).max(52),
  timing_recommendations: z.array(z.string()).min(0).max(10),
  storage_requirements: z.array(z.string()).min(0).max(10),
  side_effect_warnings: z.array(z.string()).min(0).max(10),
  post_protocol_therapy: z.boolean(),
});

export type PeptideProtocolResult = z.infer<typeof PeptideProtocolResultSchema>;