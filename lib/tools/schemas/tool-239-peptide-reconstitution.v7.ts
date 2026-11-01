import { z } from 'zod';

export const PeptideLabelReferenceInputV7Schema = z.object({
  productName: z.string().trim().min(1).max(120),
  manufacturer: z.string().trim().max(120).optional(),
  sourceReference: z.string().trim().min(1).max(500),
  note: z.string().trim().max(400).optional(),
}).strict();

export type PeptideLabelReferenceInputV7 = z.infer<typeof PeptideLabelReferenceInputV7Schema>;
