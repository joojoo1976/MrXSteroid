import { z } from 'zod';

export const GenericRatioInputV7Schema = z.object({
  input: z.number().finite().gt(0).max(1_000_000),
  output: z.number().finite().min(0).max(1_000_000),
}).strict();

export type GenericRatioInputV7 = z.infer<typeof GenericRatioInputV7Schema>;
