import { z } from 'zod';

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date.');

export const BloodPressureReadingSchema = z.object({
  id: z.string().uuid(),
  date: DateOnlySchema,
  metric: z.literal('blood_pressure'),
  systolicMmHg: z.number().finite().positive().max(1000),
  diastolicMmHg: z.number().finite().positive().max(1000),
  sourceLabel: z.string().trim().max(160).optional(),
}).strict();

export const PulseReadingSchema = z.object({
  id: z.string().uuid(),
  date: DateOnlySchema,
  metric: z.literal('pulse'),
  beatsPerMinute: z.number().finite().positive().max(1000),
  sourceLabel: z.string().trim().max(160).optional(),
}).strict();

export const MeasurementReadingSchema = z.discriminatedUnion('metric', [BloodPressureReadingSchema, PulseReadingSchema]);

export const MeasurementSummaryInputSchema = z.object({
  readings: z.array(MeasurementReadingSchema).min(1).max(200),
}).strict().superRefine(({ readings }, context) => {
  const seen = new Set<string>();
  readings.forEach((reading, index) => {
    if (seen.has(reading.id)) {
      context.addIssue({ code: 'custom', path: ['readings', index, 'id'], message: 'Reading IDs must be unique.' });
    }
    seen.add(reading.id);
  });
});

export const DescriptiveSeriesSchema = z.object({
  metric: z.enum(['blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse']),
  count: z.number().int().positive().max(200),
  minimum: z.number().finite().positive(),
  maximum: z.number().finite().positive(),
  arithmeticMean: z.number().finite().positive(),
  unit: z.enum(['mmHg', 'beats/min']),
}).strict();

export const MeasurementSummaryResultSchema = z.object({
  resultOrigin: z.literal('CALCULATED'),
  method: z.literal('DESCRIPTIVE_ARITHMETIC_ONLY'),
  clinicalAssessment: z.literal('NOT_AVAILABLE'),
  readings: z.array(MeasurementReadingSchema).min(1).max(200),
  summaries: z.array(DescriptiveSeriesSchema).min(1).max(3),
}).strict();

export type BloodPressureReading = z.infer<typeof BloodPressureReadingSchema>;
export type PulseReading = z.infer<typeof PulseReadingSchema>;
export type MeasurementReading = z.infer<typeof MeasurementReadingSchema>;
export type MeasurementSummaryInput = z.infer<typeof MeasurementSummaryInputSchema>;
export type DescriptiveSeries = z.infer<typeof DescriptiveSeriesSchema>;
export type MeasurementSummaryResult = z.infer<typeof MeasurementSummaryResultSchema>;
