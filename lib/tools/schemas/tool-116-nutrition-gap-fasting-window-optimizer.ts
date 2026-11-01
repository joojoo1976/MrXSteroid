import { z } from 'zod';

const NutrientKeys = [
  'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
  'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc',
  'copper', 'manganese', 'selenium', 'iodine', 'chromium', 'molybdenum',
] as const;

type Nutrient = (typeof NutrientKeys)[number];

const FoodLogEntrySchema = z.object({
  name: z.string().trim().min(1).max(100),
  amount_g: z.number().finite().positive().max(5000),
  nutrients: z.record(z.enum(NutrientKeys), z.number().finite().min(0).max(10000)).optional().default(() => ({} as Record<Nutrient, number>)),
});

export const NutritionGapInputSchema = z.object({
  food_log: z.array(FoodLogEntrySchema).min(1, 'At least one food entry required').max(200),
  days_tracked: z.number().finite().min(1).max(30),
  sex: z.enum(['male', 'female']),
  fasting_goal: z.enum(['weight_loss', 'metabolic_health', 'longevity', 'muscle_retention', 'general_wellness']).optional(),
  chronotype: z.enum(['early', 'intermediate', 'late']).optional(),
  typical_wake_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  typical_sleep_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  current_fasting_window: z.number().finite().min(8).max(23).optional(),
});

export type NutritionGapInput = z.infer<typeof NutritionGapInputSchema>;

