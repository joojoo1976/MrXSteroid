import { z } from 'zod';

const nonNegative = (maximum: number) => z.number().finite().min(0).max(maximum);

export const RestaurantLabelItemV7Schema = z.object({
  itemName: z.string().trim().min(1).max(100),
  restaurantName: z.string().trim().max(100).optional(),
  servings: z.number().finite().min(0.01).max(50),
  caloriesPerServing: nonNegative(5000),
  proteinGramsPerServing: nonNegative(1000),
  carbohydrateGramsPerServing: nonNegative(1000),
  fatGramsPerServing: nonNegative(500),
  sourceReference: z.string().trim().min(1).max(500),
}).strict();

export const RestaurantMacroInputV7Schema = z.object({
  items: z.array(RestaurantLabelItemV7Schema).min(1).max(12),
}).strict();

export type RestaurantLabelItemV7 = z.infer<typeof RestaurantLabelItemV7Schema>;
export type RestaurantMacroInputV7 = z.infer<typeof RestaurantMacroInputV7Schema>;
