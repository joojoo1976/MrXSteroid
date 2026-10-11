/** Tool #077 — Nitric Oxide Optimizer — input schema (zod). */
import { z } from 'zod';

export const NitricOxideInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  leafy_green_servings: z.number().min(0).max(8),
  beetroot_servings: z.number().min(0).max(14),
  nitrate_rich_veg: z.boolean(),
  exercise_days: z.number().int().min(0).max(7),
  sleep_hours: z.number().min(0).max(14),
  arginine_rich_foods: z.boolean(),
  mouthwash_use: z.boolean(),
  smoker: z.boolean(),
  chest_pain: z.boolean(),
  breathing_difficulty: z.boolean(),
});

export type NitricOxideInput = z.infer<typeof NitricOxideInputSchema>;
