import { z } from 'zod';

export const GenericRatioInputV7Schema = z.object({
  a: z.number().finite().min(0).max(1_000_000),
  b: z.number().finite().gt(0).max(1_000_000),
}).strict();

export type GenericRatioInputV7 = z.infer<typeof GenericRatioInputV7Schema>;
