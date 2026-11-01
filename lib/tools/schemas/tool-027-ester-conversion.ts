import { z } from 'zod';

export const MassUnitSchema = z.enum(['mg', 'g', 'kg']);

export const MolarMassConversionInputSchema = z.object({
  sourceSubstanceLabel: z.string().trim().min(1).max(120),
  sourceMass: z.number().finite().positive().max(1_000_000_000),
  sourceMassUnit: MassUnitSchema,
  sourceMolarMass: z.number().finite().positive().max(1_000_000_000),
  sourceMolarMassSource: z.string().trim().min(1).max(200),
  targetSubstanceLabel: z.string().trim().min(1).max(120),
  targetMolarMass: z.number().finite().positive().max(1_000_000_000),
  targetMolarMassSource: z.string().trim().min(1).max(200),
  targetMassUnit: MassUnitSchema,
}).strict();

export const MolarMassConversionResultSchema = z.object({
  resultOrigin: z.literal('CALCULATED'),
  method: z.literal('SAME_AMOUNT_OF_SUBSTANCE'),
  sourceAmountInGrams: z.number().finite().positive(),
  amountInMoles: z.number().finite().positive(),
  targetAmountInGrams: z.number().finite().positive(),
  targetAmount: z.number().finite().positive(),
  targetMassUnit: MassUnitSchema,
  sourceSubstanceLabel: z.string().min(1),
  targetSubstanceLabel: z.string().min(1),
  sourceMolarMass: z.number().finite().positive(),
  sourceMolarMassSource: z.string().min(1),
  targetMolarMass: z.number().finite().positive(),
  targetMolarMassSource: z.string().min(1),
}).strict();

export type MolarMassConversionInput = z.infer<typeof MolarMassConversionInputSchema>;
export type MolarMassConversionResult = z.infer<typeof MolarMassConversionResultSchema>;
