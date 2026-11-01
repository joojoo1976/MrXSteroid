import { z } from 'zod';

export const ANALYSIS_UNITS = [
  'mg', 'g', 'kg', 'lb',
  'mL', 'L', 'fl_oz', 'cup',
  'mm', 'cm', 'm', 'in', 'ft',
  'Pa', 'kPa', 'bar', 'mmHg',
  'C', 'F',
] as const;

export const AnalysisUnitV7Schema = z.enum(ANALYSIS_UNITS);
export const AnalysisUnitConversionInputV7Schema = z.object({
  value: z.number().finite().min(-1_000_000_000).max(1_000_000_000),
  fromUnit: AnalysisUnitV7Schema,
  toUnit: AnalysisUnitV7Schema,
}).strict();

export type AnalysisUnitV7 = z.infer<typeof AnalysisUnitV7Schema>;
export type AnalysisUnitConversionInputV7 = z.infer<typeof AnalysisUnitConversionInputV7Schema>;
