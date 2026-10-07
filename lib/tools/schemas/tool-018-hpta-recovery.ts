/**
 * Tool #018 — HPTA Recovery Monitor
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const HPTAMarkerSchema = z.object({
  date: z.string().datetime(),
  lh_iu_L: z.number().optional().min(0).max(100),
  fsh_iu_L: z.number().optional().min(0).max(100),
  total_test_ng_dL: z.number().optional().min(10).max(2000),
  free_test_ng_dL: z.number().optional().min(1).max(100),
  e2_pg_mL: z.number().optional().min(1).max(500),
  symptoms: z.enum(['improving', 'stable', 'worsening']),
  notes: z.string().optional(),
});

export type HPTAMarker = z.infer<typeof HPTAMarkerSchema>;

export const HPTARecoveryStateSchema = z.object({
  stage: z.enum(['suppressed', 'partial', 'fully_recovered', 'unknown']),
  start_date: z.string(),
  markers: z.array(HPTAMarkerSchema),
  expected_recovery_weeks: z.number().min(1).max(52),
  predicted_completion: z.string().optional(),
  improvement_rate: z.enum(['slow', 'moderate', 'fast']),
});

export type HPTARecoveryState = z.infer<typeof HPTARecoveryStateSchema>;