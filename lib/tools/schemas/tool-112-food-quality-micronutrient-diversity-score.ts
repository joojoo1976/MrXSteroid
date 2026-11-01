import { z } from 'zod';

const FoodItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  group: z.enum([
    'vegetables',
    'fruits',
    'whole_grains',
    'legumes',
    'nuts_seeds',
    'lean_protein',
    'dairy',
    'healthy_fats',
    'processed_meats',
    'refined_grains',
    'added_sugars',
    'fried_foods',
    'ultra_processed',
  ]),
  processing_level: z.enum(['unprocessed', 'minimally_processed', 'processed', 'ultra_processed']),
  serving_size_g: z.number().finite().min(1).max(2000),
  calories_per_serving: z.number().finite().min(0).max(5000),
  micronutrients: z.array(z.string().trim().min(1)).max(30),
});

export const FoodQualityInputSchema = z.object({
  foods: z.array(FoodItemSchema).min(1, 'At least one food item required').max(100),
  days_tracked: z.number().finite().int().min(1).max(30),
});

export type FoodQualityInput = z.infer<typeof FoodQualityInputSchema>;
