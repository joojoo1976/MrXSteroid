import { z } from 'zod';

/** Bounds protect the calculator from malformed values; they are not guidance. */
export const HydrationBalanceCalculatorInputSchema = z.object({
  pre_exercise_body_weight_kg: z.number().finite().min(1).max(500),
  post_exercise_body_weight_kg: z.number().finite().min(1).max(500),
  fluid_consumed_liters: z.number().finite().min(0).max(100),
  urine_output_liters: z.number().finite().min(0).max(100),
  exercise_duration_minutes: z.number().finite().int().min(1).max(1440),
}).strict();

export type HydrationBalanceCalculatorInput = z.infer<typeof HydrationBalanceCalculatorInputSchema>;
