import { z } from 'zod';

export const ManualCommandEntryV7Schema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().max(200).optional(),
  unit: z.string().trim().max(40).optional(),
  source: z.string().trim().max(240).optional(),
  recordedOn: z.iso.date().optional(),
  freshness: z.enum(['current', 'old', 'unknown', 'conflicting']).optional(),
}).strict();

export const ManualCommandInputV7Schema = z.object({
  entries: z.array(ManualCommandEntryV7Schema).max(20),
}).strict();

export type ManualCommandEntryV7 = z.infer<typeof ManualCommandEntryV7Schema>;
export type ManualCommandInputV7 = z.infer<typeof ManualCommandInputV7Schema>;
