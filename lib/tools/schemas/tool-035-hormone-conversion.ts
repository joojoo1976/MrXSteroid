import { z } from 'zod';

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  if (Number(value.slice(0, 4)) < 1) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date in YYYY-MM-DD format.');

export const ConversionInputSchema = z.object({
  analyte: z.enum(['testosterone', 'estradiol']),
  value: z.number().finite().min(0).max(10_000_000),
  unit: z.enum(['ng/dL', 'nmol/L', 'pg/mL', 'pmol/L']),
  measurement_date: calendarDate,
  reading_source: z.string().trim().min(3).max(200),
}).strict().superRefine((input, context) => {
  const allowedUnits = input.analyte === 'testosterone' ? ['ng/dL', 'nmol/L'] : ['pg/mL', 'pmol/L'];
  if (!allowedUnits.includes(input.unit)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['unit'], message: `Choose a unit that matches ${input.analyte}.` });
  }
});

export type ConversionInput = z.infer<typeof ConversionInputSchema>;

export const ConversionResultSchema = z.object({
  status: z.literal('CALCULATED'),
  analyte: z.enum(['testosterone', 'estradiol']),
  input_value: z.number().finite().min(0),
  input_unit: z.enum(['ng/dL', 'nmol/L', 'pg/mL', 'pmol/L']),
  result_value: z.number().finite().min(0),
  result_unit: z.enum(['ng/dL', 'nmol/L', 'pg/mL', 'pmol/L']),
  measurement_date: calendarDate,
  reading_source: z.string().min(3).max(200),
  conversion_factor: z.number().finite().positive(),
  calculation_method: z.literal('MOLAR_MASS_DERIVED_UNIT_CONVERSION'),
}).strict();

export type ConversionResult = z.infer<typeof ConversionResultSchema>;
