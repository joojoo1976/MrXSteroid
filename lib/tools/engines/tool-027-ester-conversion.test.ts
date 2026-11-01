import { describe, expect, it } from 'vitest';
import { calculateMolarMassRelationshipV7 } from './tool-027-ester-conversion';
import type { MolarMassConversionInput } from '../schemas/tool-027-ester-conversion';

const validInput: MolarMassConversionInput = {
  sourceSubstanceLabel: 'Material A',
  sourceMass: 100,
  sourceMassUnit: 'mg',
  sourceMolarMass: 100,
  sourceMolarMassSource: 'User supplied source A',
  targetSubstanceLabel: 'Material B',
  targetMolarMass: 200,
  targetMolarMassSource: 'User supplied source B',
  targetMassUnit: 'mg',
};

describe('Tool 027 educational molar-mass relationship engine', () => {
  it('converts using n = m/M and m_target = n*M_target', () => {
    const result = calculateMolarMassRelationshipV7(validInput);
    expect(result.amountInMoles).toBeCloseTo(0.001);
    expect(result.targetAmountInGrams).toBeCloseTo(0.2);
    expect(result.targetAmount).toBeCloseTo(200);
    expect(result.resultOrigin).toBe('CALCULATED');
    expect(result.method).toBe('SAME_AMOUNT_OF_SUBSTANCE');
    expect(result.targetMolarMassSource).toBe(validInput.targetMolarMassSource);
  });

  it('converts output units to g and kg without double conversion', () => {
    expect(calculateMolarMassRelationshipV7({ ...validInput, targetMassUnit: 'g' }).targetAmount).toBeCloseTo(0.2);
    expect(calculateMolarMassRelationshipV7({ ...validInput, targetMassUnit: 'kg' }).targetAmount).toBeCloseTo(0.0002);
    expect(calculateMolarMassRelationshipV7({ ...validInput, sourceMassUnit: 'kg', sourceMass: 0.0001 }).targetAmount).toBeCloseTo(200);
  });

  it('returns identity conversion when both molar masses match', () => {
    const result = calculateMolarMassRelationshipV7({ ...validInput, targetMolarMass: 100 });
    expect(result.targetAmount).toBeCloseTo(100);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid source mass %s', (sourceMass) => {
    expect(() => calculateMolarMassRelationshipV7({ ...validInput, sourceMass })).toThrow();
  });

  it('rejects missing evidence labels and unknown units', () => {
    expect(() => calculateMolarMassRelationshipV7({ ...validInput, sourceMolarMassSource: '' })).toThrow();
    expect(() => calculateMolarMassRelationshipV7({ ...validInput, sourceMassUnit: 'oz' } as never)).toThrow();
  });

  it('is deterministic for identical complete inputs', () => {
    expect(calculateMolarMassRelationshipV7(validInput)).toEqual(calculateMolarMassRelationshipV7(validInput));
  });
});
