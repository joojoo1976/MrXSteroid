import { describe, expect, it } from 'vitest';
import { calculateMassVolumeDensityV6, MassVolumeDensityInputSchema } from './tool-144-homebrew-chemistry-calculator.v6';

describe('tool 144 general mass-volume-density calculator', () => {
  it('calculates density with explicit unit conversions', () => {
    const result = calculateMassVolumeDensityV6({ solveFor: 'density', mass: 1, massUnit: 'kg', volume: 1, volumeUnit: 'L', densityTemperatureC: 20, resultUnit: 'kg/m3' });
    expect(result.value).toBe(1000);
    expect(result.formula).toBe('ρ = m / V');
  });

  it('calculates mass and volume with sourced density', () => {
    const density = { density: 1, densityUnit: 'g/mL' as const, densitySource: 'User-recorded material specification', densityTemperatureC: 20 };
    expect(calculateMassVolumeDensityV6({ solveFor: 'mass', ...density, volume: 2, volumeUnit: 'L', resultUnit: 'kg' }).value).toBe(2);
    expect(calculateMassVolumeDensityV6({ solveFor: 'volume', ...density, mass: 500, massUnit: 'g', resultUnit: 'mL' }).value).toBe(500);
  });

  it('converts between US customary units and SI units deterministically', () => {
    const metric = calculateMassVolumeDensityV6({ solveFor: 'density', mass: 1, massUnit: 'kg', volume: 1, volumeUnit: 'L', densityTemperatureC: 20, resultUnit: 'kg/m3' });
    const customary = calculateMassVolumeDensityV6({ solveFor: 'density', mass: 2.2046226218, massUnit: 'lb', volume: 33.8140227018, volumeUnit: 'US fl oz', densityTemperatureC: 68, resultUnit: 'lb/ft3' });
    expect(metric.value).toBe(1000);
    expect(customary.value).toBeCloseTo(62.42796, 4);
    expect(customary.unit).toBe('lb/ft3');
  });

  it('requires a source and temperature for entered density and rejects zero inputs', () => {
    const base = { solveFor: 'mass' as const, density: 1, densityUnit: 'g/mL' as const, volume: 2, volumeUnit: 'mL' as const, resultUnit: 'g' as const };
    expect(MassVolumeDensityInputSchema.safeParse(base).success).toBe(false);
    expect(MassVolumeDensityInputSchema.safeParse({ ...base, densitySource: 'Reference', densityTemperatureC: 22, volume: 0 }).success).toBe(false);
  });

  it('rejects nonfinite and extreme values', () => {
    expect(MassVolumeDensityInputSchema.safeParse({ solveFor: 'density', mass: Infinity, massUnit: 'g', volume: 1, volumeUnit: 'mL', densityTemperatureC: 20, resultUnit: 'g/mL' }).success).toBe(false);
    expect(() => calculateMassVolumeDensityV6({ solveFor: 'density', mass: 1e12, massUnit: 'kg', volume: 0.0001, volumeUnit: 'mL', densityTemperatureC: 20, resultUnit: 'kg/m3' })).toThrow();
  });
});
