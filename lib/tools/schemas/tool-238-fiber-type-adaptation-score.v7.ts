import { z } from 'zod';

export const FiberObservationInputV7Schema = z.object({
  exercise: z.string().trim().min(1).max(100),
  testMethod: z.string().trim().min(1).max(200),
  observedResult: z.string().trim().min(1).max(400),
  sourceReference: z.string().trim().max(500).optional(),
}).strict();

export type FiberObservationInputV7 = z.infer<typeof FiberObservationInputV7Schema>;
