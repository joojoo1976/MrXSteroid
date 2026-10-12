import { z } from 'zod';

export const RenalFunctionInputSchema = z.object({
  serum_creatinine_mg_dl: z.number().min(0.1).max(20),
  age_years: z.number().min(18).max(120),
  sex: z.enum(['male', 'female']),
  body_weight_kg: z.number().min(30).max(250),
  fluid_intake_liters: z.number().min(0).max(15),
  climate: z.enum(['temperate', 'hot_humid']),
  training_sweat_liters: z.number().min(0).max(10),
});

export type RenalFunctionInput = z.infer<typeof RenalFunctionInputSchema>;

