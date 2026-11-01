import { z } from 'zod';

export const SodiumPotassiumManagerInputSchema = z.object({
  daily_sodium_mg: z.number().finite().min(0).max(15000),
  daily_potassium_mg: z.number().finite().positive().max(10000),
}).strict();

export type SodiumPotassiumManagerInput = z.infer<typeof SodiumPotassiumManagerInputSchema>;
