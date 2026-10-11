/** Tool #071 — Antioxidant Manager — input schema (zod). */
import { z } from 'zod';

export const AntioxidantInputSchema = z.object({
  berries: z.boolean(),
  citrus: z.boolean(),
  leafy_greens: z.boolean(),
  cruciferous: z.boolean(),
  nuts_seeds: z.boolean(),
  olive_oil: z.boolean(),
  spices_herbs: z.boolean(),
  green_tea: z.boolean(),
  dark_chocolate: z.boolean(),
  legumes: z.boolean(),
  whole_grains: z.boolean(),
  fatty_fish: z.boolean(),
});

export type AntioxidantInput = z.infer<typeof AntioxidantInputSchema>;
