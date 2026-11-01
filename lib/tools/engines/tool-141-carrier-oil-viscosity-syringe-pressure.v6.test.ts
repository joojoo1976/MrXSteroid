import { describe, expect, it } from 'vitest';
import {
  calculateNewtonianTubePressureV6,
  NewtonianTubeFlowInputSchema,
} from './tool-141-carrier-oil-viscosity-syringe-pressure.v6';

const validInput = {
  dynamicViscosityPaS: 0.1,
  densityKgM3: 900,
  innerDiameterM: 0.0005,
  tubeLengthM: 0.025,
  volumetricFlowM3S: 1e-8,
  measurementTemperatureC: 22,
  viscositySource: 'User-provided report VISC-25',
  densitySource: 'User-provided data sheet DENS-3',
  assumptionsAcknowledged: true as const,
};

describe('Tool 141 ideal Newtonian circular-tube model', () => {
  it('calculates Reynolds number and ideal pressure drop for laminar flow', () => {
    const result = calculateNewtonianTubePressureV6(validInput);
    expect(result.status).toBe('CALCULATED');
    if (result.status !== 'CALCULATED') throw new Error('Expected laminar result');
    expect(result.resultType).toBe('CALCULATED');
    expect(result.reynoldsNumber).toBeCloseTo(0.2291831, 6);
    expect(result.idealTubePressureDropPa).toBeCloseTo(16297.4662, 2);
    expect(result.limitations.join(' ')).toContain('plunger friction');
  });

  it('returns NOT_AVAILABLE in the transitional Reynolds range', () => {
    const result = calculateNewtonianTubePressureV6({ ...validInput, volumetricFlowM3S: 1e-4 });
    expect(result).toMatchObject({ status: 'NOT_AVAILABLE', reason: 'TRANSITIONAL_FLOW' });
  });

  it('returns NOT_AVAILABLE in the turbulent Reynolds range', () => {
    const result = calculateNewtonianTubePressureV6({ ...validInput, volumetricFlowM3S: 0.001 });
    expect(result).toMatchObject({ status: 'NOT_AVAILABLE', reason: 'TURBULENT_FLOW' });
    expect(result).not.toHaveProperty('idealTubePressureDropPa');
  });

  it('scales with viscosity, flow rate and length, and inversely with diameter to the fourth power', () => {
    const baseline = calculateNewtonianTubePressureV6(validInput);
    const doubleViscosity = calculateNewtonianTubePressureV6({ ...validInput, dynamicViscosityPaS: 0.2 });
    const doubleFlow = calculateNewtonianTubePressureV6({ ...validInput, volumetricFlowM3S: 2e-8 });
    const doubleLength = calculateNewtonianTubePressureV6({ ...validInput, tubeLengthM: 0.05 });
    const doubleDiameter = calculateNewtonianTubePressureV6({ ...validInput, innerDiameterM: 0.001 });
    if ([baseline, doubleViscosity, doubleFlow, doubleLength, doubleDiameter].some((r) => r.status !== 'CALCULATED')) throw new Error('Expected laminar results');
    if (baseline.status !== 'CALCULATED' || doubleViscosity.status !== 'CALCULATED' || doubleFlow.status !== 'CALCULATED' || doubleLength.status !== 'CALCULATED' || doubleDiameter.status !== 'CALCULATED') return;
    expect(doubleViscosity.idealTubePressureDropPa).toBeCloseTo(baseline.idealTubePressureDropPa * 2, 4);
    expect(doubleFlow.idealTubePressureDropPa).toBeCloseTo(baseline.idealTubePressureDropPa * 2, 4);
    expect(doubleLength.idealTubePressureDropPa).toBeCloseTo(baseline.idealTubePressureDropPa * 2, 4);
    expect(doubleDiameter.idealTubePressureDropPa).toBeCloseTo(baseline.idealTubePressureDropPa / 16, 4);
  });

  it.each([
    { ...validInput, dynamicViscosityPaS: 0 },
    { ...validInput, densityKgM3: Number.POSITIVE_INFINITY },
    { ...validInput, innerDiameterM: -1 },
    { ...validInput, tubeLengthM: 0 },
    { ...validInput, volumetricFlowM3S: Number.NaN },
    { ...validInput, measurementTemperatureC: -300 },
    { ...validInput, viscositySource: ' ' },
    { ...validInput, densitySource: '' },
    { ...validInput, assumptionsAcknowledged: false },
    { ...validInput, unexpected: 'field' },
  ])('rejects incomplete, nonfinite, out-of-range or undocumented inputs', (input) => {
    expect(NewtonianTubeFlowInputSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a pressure result outside supported numerical range', () => {
    expect(() => calculateNewtonianTubePressureV6({ ...validInput, dynamicViscosityPaS: 1e6, tubeLengthM: 10, innerDiameterM: 1e-5 })).toThrow(RangeError);
  });
});
