import { z } from 'zod';

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date.');

export const BloodworkComparisonRecordSchema = z.object({
  id: z.string().uuid(),
  markerName: z.string().trim().min(1).max(120),
  value: z.number().finite(),
  unit: z.string().trim().min(1).max(24),
  referenceLow: z.number().finite(),
  referenceHigh: z.number().finite(),
  sourceLabel: z.string().trim().min(1).max(160),
  sampleDate: DateOnlySchema,
}).strict().superRefine((record, context) => {
  if (record.referenceLow >= record.referenceHigh) {
    context.addIssue({ code: 'custom', path: ['referenceHigh'], message: 'Upper reference limit must exceed lower reference limit.' });
  }
});

export const BloodworkComparisonInputSchema = z.object({
  records: z.array(BloodworkComparisonRecordSchema).min(1).max(30),
}).strict();

export const BloodworkIntervalResultSchema = z.object({
  record: BloodworkComparisonRecordSchema,
  relation: z.enum(['BELOW_ENTERED_INTERVAL', 'WITHIN_ENTERED_INTERVAL', 'ABOVE_ENTERED_INTERVAL']),
}).strict();

export const BloodworkComparisonResultSchema = z.object({
  resultOrigin: z.literal('CALCULATED'),
  comparisons: z.array(BloodworkIntervalResultSchema).min(1).max(30),
}).strict();

export type BloodworkComparisonRecord = z.infer<typeof BloodworkComparisonRecordSchema>;
export type BloodworkComparisonInput = z.infer<typeof BloodworkComparisonInputSchema>;
export type BloodworkIntervalResult = z.infer<typeof BloodworkIntervalResultSchema>;
export type BloodworkComparisonResult = z.infer<typeof BloodworkComparisonResultSchema>;
