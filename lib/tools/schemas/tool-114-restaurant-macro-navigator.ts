import { z } from 'zod';

const IngredientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  estimated_weight_g: z.number().finite().positive().max(2000),
  macros_per_100g: z.object({
    protein: z.number().finite().min(0).max(100),
    carbs: z.number().finite().min(0).max(100),
    fat: z.number().finite().min(0).max(100),
    calories: z.number().finite().min(0).max(900),
  }).strict().optional(),
});

const RestaurantItemSchema = z.object({
  id: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  restaurant: z.string().max(100).optional(),
  cuisine: z.enum(['american', 'mexican', 'italian', 'chinese', 'japanese', 'indian', 'mediterranean', 'fast_food', 'other']),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  known_calories: z.number().finite().min(0).max(5000).optional(),
  known_protein_g: z.number().finite().min(0).max(300).optional(),
  known_carbs_g: z.number().finite().min(0).max(500).optional(),
  known_fat_g: z.number().finite().min(0).max(200).optional(),
  ingredients: z.array(IngredientSchema).max(20).optional(),
  portion_size: z.enum(['small', 'regular', 'large', 'extra_large']),
}).refine((data) => {
  // If providing known macros, must provide all
  const known = [data.known_calories, data.known_protein_g, data.known_carbs_g, data.known_fat_g];
  const provided = known.filter((v) => v !== undefined).length;
  return provided === 0 || provided === 4;
}, {
  message: 'If providing known nutrition, must provide all: calories, protein, carbs, fat',
  path: ['known_calories'],
});

export const RestaurantInputSchema = z.object({
  items: z.array(RestaurantItemSchema).min(1, 'At least one meal item required').max(20),
  date: z.string().optional(),
});

export type RestaurantInput = z.infer<typeof RestaurantInputSchema>;
