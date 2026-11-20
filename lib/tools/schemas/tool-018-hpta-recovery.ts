import { z } from 'zod';

export const HPTAMarkerSchema = z.object({
  date: z.string().datetime(),
  lh_iu_L: z.number().finite().nonnegative().optional(),
  fsh_iu_L: z.number().finite().nonnegative().optional(),
  total_test_ng_dL: z.number().finite().nonnegative().optional(),
  free_test_ng_dL: z.number().finite().nonnegative().optional(),
  e2_pg_mL: z.number().finite().nonnegative().optional(),
  symptoms: z.enum(['improving', 'stable', 'worsening']),
  notes: z.string().max(500).optional(),
}).strict();

export type HPTAMarker = z.infer<typeof HPTAMarkerSchema>;

export const HPTARecoveryStateSchema = z.object({
  stage: z.enum(['suppressed', 'partial', 'fully_recovered', 'unknown']),
  start_date: z.string().datetime(),
  markers: z.array(HPTAMarkerSchema),
  expected_recovery_weeks: z.number().finite().nonnegative(),
  predicted_completion: z.string().datetime().optional(),
  improvement_rate: z.enum(['slow', 'moderate', 'fast']),
}).strict();

export type HPTARecoveryState = z.infer<typeof HPTARecoveryStateSchema>;
