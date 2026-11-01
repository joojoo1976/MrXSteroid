import { z } from 'zod';

export const OilObservationInputV7Schema = z.object({
  note: z.string().trim().min(1).max(400),
}).strict();

export type OilObservationInputV7 = z.infer<typeof OilObservationInputV7Schema>;
