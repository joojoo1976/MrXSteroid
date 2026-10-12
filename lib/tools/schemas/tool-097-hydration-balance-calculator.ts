import { z } from 'zod';

export const HydrationBalanceCalculatorInputSchema = z.object({
  body_weight_kg: z.number().min(30).max(250),
  training_duration_minutes_daily: z.number().min(0).max(360),
  sweat_rate_intensity: z.enum(['light', 'moderate', 'heavy_profuse']),
  climate_temperature: z.enum(['temperate', 'hot_humid']),
  caffeine_or_diuretic_intake_mg: z.number().min(0).max(2000),
});

export type HydrationBalanceCalculatorInput = z.infer<typeof HydrationBalanceCalculatorInputSchema>;
