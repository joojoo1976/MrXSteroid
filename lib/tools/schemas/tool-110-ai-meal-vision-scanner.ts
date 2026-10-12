import { z } from 'zod';

export const MealInputSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'shake']),
  plate_size: z.enum(['small', 'medium', 'standard', 'large']),
  food_items: z.array(z.string().min(1).max(60)).max(24),
  photo_attached: z.boolean(),
  photo_quality: z.enum(['poor', 'medium', 'high']),
  photo_consent: z.enum(['given', 'not_given', 'declined']),
});

export type MealInput = z.infer<typeof MealInputSchema>;
