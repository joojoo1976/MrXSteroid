import { z } from 'zod';

export const ASSAY_MASS_UNITS = ['mg', 'g', 'kg', 'oz', 'lb'] as const;
export const ASSAY_MASS_TO_GRAMS: Record<(typeof ASSAY_MASS_UNITS)[number], number> = {
  mg: 0.001,
  g: 1,
  kg: 1_000,
  oz: 28.349523125,
  lb: 453.59237,
};

const boundedText = (max: number) => z.string().trim().min(1).max(max);

export const UserAssayMassInputSchema = z.object({
  sampleMass: z.number().finite().positive().max(1_000_000_000),
  massUnit: z.enum(ASSAY_MASS_UNITS),
  assayPercent: z.number().finite().min(0).max(100),
  statedUncertaintyPercentPoints: z.number().finite().min(0).max(100),
  uncertaintyDescription: boundedText(240),
  sourceReference: boundedText(500),
  methodDescription: boundedText(240),
  reportDate: z.string().date(),
}).strict().superRefine((input, context) => {
  if (input.assayPercent - input.statedUncertaintyPercentPoints < 0) {
    context.addIssue({ code: 'custom', path: ['statedUncertaintyPercentPoints'], message: 'ASSAY_INTERVAL_BELOW_ZERO' });
  }
  if (input.assayPercent + input.statedUncertaintyPercentPoints > 100) {
    context.addIssue({ code: 'custom', path: ['statedUncertaintyPercentPoints'], message: 'ASSAY_INTERVAL_ABOVE_100' });
  }
});

export type UserAssayMassInput = z.infer<typeof UserAssayMassInputSchema>;

export interface UserAssayMassResult {
  resultType: 'CALCULATED';
  unit: UserAssayMassInput['massUnit'];
  centralMass: number;
  lowerArithmeticBound: number;
  upperArithmeticBound: number;
  formula: 'sample mass × user-entered assay fraction';
  assayPercent: number;
  statedUncertaintyPercentPoints: number;
  uncertaintyDescription: string;
  sourceReference: string;
  methodDescription: string;
  reportDate: string;
  limitation: 'USER_PROVIDED_ASSAY_NOT_VERIFIED';
}

function assertFiniteResult(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) {
    throw new RangeError('Calculated amount is outside the supported finite range.');
  }
  return Number(value.toPrecision(10));
}

/**
 * Performs arithmetic on a user-transcribed mass-fraction assay and its stated
 * interval only. It does not measure, validate, or certify a material.
 */
export function calculateUserAssayMassV6(input: UserAssayMassInput): UserAssayMassResult {
  const data = UserAssayMassInputSchema.parse(input);
  const gramsPerUnit = ASSAY_MASS_TO_GRAMS[data.massUnit];
  const sampleMassGrams = data.sampleMass * gramsPerUnit;
  const resultToSelectedUnit = (massGrams: number) => massGrams / gramsPerUnit;
  const lowerPercent = data.assayPercent - data.statedUncertaintyPercentPoints;
  const upperPercent = data.assayPercent + data.statedUncertaintyPercentPoints;

  return {
    resultType: 'CALCULATED',
    unit: data.massUnit,
    centralMass: assertFiniteResult(resultToSelectedUnit(sampleMassGrams * data.assayPercent / 100)),
    lowerArithmeticBound: assertFiniteResult(resultToSelectedUnit(sampleMassGrams * lowerPercent / 100)),
    upperArithmeticBound: assertFiniteResult(resultToSelectedUnit(sampleMassGrams * upperPercent / 100)),
    formula: 'sample mass × user-entered assay fraction',
    assayPercent: data.assayPercent,
    statedUncertaintyPercentPoints: data.statedUncertaintyPercentPoints,
    uncertaintyDescription: data.uncertaintyDescription,
    sourceReference: data.sourceReference,
    methodDescription: data.methodDescription,
    reportDate: data.reportDate,
    limitation: 'USER_PROVIDED_ASSAY_NOT_VERIFIED',
  };
}
