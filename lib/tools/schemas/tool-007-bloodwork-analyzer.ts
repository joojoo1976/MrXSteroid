import { z } from 'zod';

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date.');

/** A transcription of values supplied by the user from an identified source. */
export const BloodworkRecordSchema = z.object({
  id: z.string().uuid(),
  markerName: z.string().trim().min(1).max(120),
  value: z.number().finite(),
  unit: z.string().trim().min(1).max(24),
  sourceLabel: z.string().trim().min(1).max(160),
  referenceInterval: z.string().trim().max(120).optional(),
  sampleDate: DateOnlySchema,
}).strict();

export const BloodworkSessionSchema = z.array(BloodworkRecordSchema).max(200);

export type BloodworkRecord = z.infer<typeof BloodworkRecordSchema>;
