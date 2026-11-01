import { describe, expect, it } from 'vitest';
import {
  calculateUserAssayMassV6,
  UserAssayMassInputSchema,
} from './tool-142-compound-purity-active-yield-estimator.v6';

const validInput = {
  sampleMass: 100,
  massUnit: 'g' as const,
  assayPercent: 92,
  statedUncertaintyPercentPoints: 1.5,
  uncertaintyDescription: 'Expanded uncertainty as stated on the report; coverage is not interpreted here',
  sourceReference: 'Lab report LAB-2026-17, page 2',
  methodDescription: 'User-transcribed chromatographic assay result',
  reportDate: '2026-08-11',
};

describe('Tool 142 user-provided assay mass arithmetic', () => {
  it('calculates the central value and arithmetic bounds from explicit user data', () => {
    expect(calculateUserAssayMassV6(validInput)).toMatchObject({
      resultType: 'CALCULATED',
      centralMass: 92,
      lowerArithmeticBound: 90.5,
      upperArithmeticBound: 93.5,
      unit: 'g',
      limitation: 'USER_PROVIDED_ASSAY_NOT_VERIFIED',
    });
  });

  it('converts the input mass unit without changing the reported result unit', () => {
    expect(calculateUserAssayMassV6({ ...validInput, sampleMass: 1, massUnit: 'kg' })).toMatchObject({
      centralMass: 0.92,
      lowerArithmeticBound: 0.905,
      upperArithmeticBound: 0.935,
      unit: 'kg',
    });
    expect(calculateUserAssayMassV6({ ...validInput, sampleMass: 16, massUnit: 'oz' }).centralMass).toBe(14.72);
  });

  it('accepts a zero assay as zero arithmetic amount', () => {
    expect(calculateUserAssayMassV6({ ...validInput, assayPercent: 0, statedUncertaintyPercentPoints: 0 }).centralMass).toBe(0);
  });

  it.each([
    { ...validInput, sampleMass: 0 },
    { ...validInput, sampleMass: Number.NaN },
    { ...validInput, assayPercent: 101 },
    { ...validInput, assayPercent: -1 },
    { ...validInput, massUnit: 'mL' },
    { ...validInput, sourceReference: '   ' },
    { ...validInput, methodDescription: '' },
    { ...validInput, reportDate: 'not-a-date' },
    { ...validInput, assayPercent: 99, statedUncertaintyPercentPoints: 2 },
    { ...validInput, assayPercent: 1, statedUncertaintyPercentPoints: 2 },
    { ...validInput, undocumentedSafetyClaim: true },
  ])('rejects incomplete, invalid, inconsistent, or unknown input keys', (input) => {
    expect(UserAssayMassInputSchema.safeParse(input).success).toBe(false);
  });

  it('is deterministic for identical inputs', () => {
    expect(calculateUserAssayMassV6(validInput)).toEqual(calculateUserAssayMassV6(validInput));
  });
});
