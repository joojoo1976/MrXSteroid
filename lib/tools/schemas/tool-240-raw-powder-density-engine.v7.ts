import { z } from 'zod';

export const DensityMeasurementInputV7Schema = z.object({
  massGrams: z.number().finite().min(0.001).max(1_000_000),
  measuredVolumeMl: z.number().finite().min(0.001).max(1_000_000),
  measurementMethod: z.enum(['recorded_measurement', 'other']),
  sourceReference: z.string().trim().min(1).max(500),
}).strict();

export type DensityMeasurementInputV7 = z.infer<typeof DensityMeasurementInputV7Schema>;
