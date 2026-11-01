import { z } from 'zod';

export const ChemistryObservationInputV7Schema = z.object({
  note: z.string().trim().min(1).max(400),
}).strict();

export type ChemistryObservationInputV7 = z.infer<typeof ChemistryObservationInputV7Schema>;
