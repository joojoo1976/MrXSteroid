import { z } from 'zod';

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date in YYYY-MM-DD format.');

export const LabReadingSchema = z.object({
  marker: z.string().trim().min(1).max(40),
  value: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(24),
  date: calendarDate,
}).strict();

export const TrendAnalyzerInputSchema = z.object({
  readings: z.array(LabReadingSchema).max(200),
}).strict().superRefine(({ readings }, context) => {
  const markers = new Set(readings.map((reading) => reading.marker));
  if (markers.size > 40) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['readings'], message: 'A maximum of 40 markers is supported.' });
  }

  const unitsByMarker = new Map<string, Set<string>>();
  for (const reading of readings) {
    const units = unitsByMarker.get(reading.marker) ?? new Set<string>();
    units.add(reading.unit);
    unitsByMarker.set(reading.marker, units);
  }
  for (const [marker, units] of unitsByMarker) {
    if (units.size > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['readings'],
        message: `All readings for ${marker} must use the same unit.`,
      });
    }
  }
});

export type TrendAnalyzerInput = z.infer<typeof TrendAnalyzerInputSchema>;

export const TrendDirectionSchema = z.enum(['rising', 'falling', 'stable', 'insufficient_data']);

export const MarkerTrendSchema = z.object({
  marker: z.string().min(1).max(40),
  unit: z.string().min(1).max(24),
  latest_value: z.number().finite(),
  latest_date: calendarDate,
  slope_per_30d: z.number().finite().nullable(),
  direction: TrendDirectionSchema,
  points: z.number().int().min(1).max(200),
  distinct_dates: z.number().int().min(1).max(200),
}).strict();

export const TrendAnalyzerResultSchema = z.object({
  markers: z.array(MarkerTrendSchema).max(40),
}).strict();

export type TrendAnalyzerResult = z.infer<typeof TrendAnalyzerResultSchema>;
