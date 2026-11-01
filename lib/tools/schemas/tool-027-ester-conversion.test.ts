import { describe, expect, it } from 'vitest';
import { MolarMassConversionInputSchema } from './tool-027-ester-conversion';

const validInput = {
  sourceSubstanceLabel: 'Material A',
  sourceMass: 100,
  sourceMassUnit: 'mg',
  sourceMolarMass: 100,
  sourceMolarMassSource: 'Source A',
  targetSubstanceLabel: 'Material B',
  targetMolarMass: 200,
  targetMolarMassSource: 'Source B',
  targetMassUnit: 'g',
};

describe('Tool 027 molar-mass conversion schema', () => {
  it('requires both labels and evidence for both entered molar masses', () => {
    expect(MolarMassConversionInputSchema.safeParse(validInput).success).toBe(true);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, sourceMolarMassSource: '' }).success).toBe(false);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, targetSubstanceLabel: ' ' }).success).toBe(false);
  });

  it('accepts only supported mass units and positive finite bounded values', () => {
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, sourceMassUnit: 'kg' }).success).toBe(true);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, sourceMassUnit: 'lb' }).success).toBe(false);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, sourceMolarMass: 0 }).success).toBe(false);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, targetMolarMass: Number.POSITIVE_INFINITY }).success).toBe(false);
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, sourceMass: 1_000_000_001 }).success).toBe(false);
  });

  it('rejects unrecognized fields that could reintroduce clinical calculations', () => {
    expect(MolarMassConversionInputSchema.safeParse({ ...validInput, doseMg: 100 }).success).toBe(false);
  });
});
