import { z } from 'zod';

const GroceryItemSchema = z.object({
  id: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  price_per_unit: z.number().finite().positive().max(10000),
  unit: z.enum(['g', 'kg', 'lb', 'oz', 'piece', 'can', 'pack']),
  unit_size_g: z.number().finite().positive().max(50000),
  macros_per_100g: z.object({
    protein: z.number().finite().min(0).max(100),
    carbs: z.number().finite().min(0).max(100),
    fat: z.number().finite().min(0).max(100),
    calories: z.number().finite().min(0).max(900),
  }),
  min_quantity: z.number().finite().min(0).max(1000),
  max_quantity: z.number().finite().min(1).max(1000),
  category: z.enum(['protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy', 'pantry']),
});

export const GroceryInputSchema = z.object({
  items: z.array(GroceryItemSchema).min(1, 'At least one item required').max(50),
  daily_targets: z.object({
    calories: z.number().finite().min(500).max(10000),
    protein_g: z.number().finite().min(20).max(500),
    carbs_g: z.number().finite().min(20).max(1000),
    fat_g: z.number().finite().min(10).max(300),
  }),
  budget_usd: z.number().finite().positive().max(100000),
  days: z.number().finite().min(1).max(30),
});

export type GroceryInput = z.infer<typeof GroceryInputSchema>;
