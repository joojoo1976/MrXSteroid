import { z } from 'zod';

export const MenstrualCycleManagerInputSchema = z.object({
  cycle_length_days: z.number().min(21).max(45),
  current_cycle_day: z.number().min(1).max(45),
  oral_contraceptive_active: z.boolean(),
  high_intensity_training_focus: z.boolean(),
});

export type MenstrualCycleManagerInput = z.infer<typeof MenstrualCycleManagerInputSchema>;
