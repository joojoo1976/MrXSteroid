import { z } from 'zod';

export const SubqVsImInputSchema = z.object({
  /** Geometric input only - an already-decided dose, never advised. */
  dose_mg: z.number().min(1).max(3000),
  /** Concentration of the user's own preparation (mg/mL). */
  concentration_mg_ml: z.number().min(5).max(300),
  site_anatomy: z.enum(['abdomen', 'thigh', 'ventrogluteal', 'deltoid']),
  elimination_half_life_days: z.number().min(0.5).max(30),
  injection_interval_days: z.number().min(0.5).max(30),
});

export type SubqVsImInput = z.infer<typeof SubqVsImInputSchema>;

