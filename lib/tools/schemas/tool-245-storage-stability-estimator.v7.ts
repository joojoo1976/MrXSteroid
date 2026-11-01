import { z } from 'zod';

export const StorageObservationInputV7Schema = z.object({
  note: z.string().trim().min(1).max(400),
}).strict();

export type StorageObservationInputV7 = z.infer<typeof StorageObservationInputV7Schema>;
