import { z } from 'zod';

export const SodiumPotassiumManagerInputSchema = z.object({
  daily_sodium_mg: z.number().min(500).max(15000),
  daily_potassium_mg: z.number().min(500).max(10000),
  aldosterone_stress_or_aas: z.boolean(),
  resting_blood_pressure_systolic: z.number().min(80).max(220),
});

export type SodiumPotassiumManagerInput = z.infer<typeof SodiumPotassiumManagerInputSchema>;
