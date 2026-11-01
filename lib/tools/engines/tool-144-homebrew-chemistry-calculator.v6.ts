import { z } from 'zod';

export const MASS_UNITS = ['kg', 'g', 'mg', 'lb', 'oz'] as const;
export const VOLUME_UNITS = ['m3', 'L', 'mL', 'cm3', 'US gal', 'US fl oz', 'in3', 'ft3'] as const;
export const DENSITY_UNITS = ['kg/m3', 'g/L', 'mg/mL', 'kg/L', 'g/mL', 'g/cm3', 'lb/ft3', 'lb/US gal', 'oz/US fl oz'] as const;
const quantity = z.number().finite().positive().max(1_000_000_000_000);
const temperature = z.number().finite().min(-273.15).max(1000);

const DensityFields = z.object({
  density: quantity,
  densityUnit: z.enum(DENSITY_UNITS),
  densitySource: z.string().trim().min(1).max(240),
  densityTemperatureC: temperature,
});

export const MassVolumeDensityInputSchema = z.discriminatedUnion('solveFor', [
  z.object({ solveFor: z.literal('mass'), ...DensityFields.shape, volume: quantity, volumeUnit: z.enum(VOLUME_UNITS), resultUnit: z.enum(MASS_UNITS) }),
  z.object({ solveFor: z.literal('volume'), ...DensityFields.shape, mass: quantity, massUnit: z.enum(MASS_UNITS), resultUnit: z.enum(VOLUME_UNITS) }),
  z.object({ solveFor: z.literal('density'), mass: quantity, massUnit: z.enum(MASS_UNITS), volume: quantity, volumeUnit: z.enum(VOLUME_UNITS), densityTemperatureC: temperature, resultUnit: z.enum(DENSITY_UNITS) }),
]);

export type MassVolumeDensityInput = z.infer<typeof MassVolumeDensityInputSchema>;
export interface MassVolumeDensityResult {
  solveFor: MassVolumeDensityInput['solveFor'];
  value: number;
  unit: string;
  formula: string;
  temperatureC: number;
  densitySource: string;
}

export const MASS_TO_GRAMS: Record<(typeof MASS_UNITS)[number], number> = { kg: 1000, g: 1, mg: 0.001, lb: 453.59237, oz: 28.349523125 };
export const VOLUME_TO_MILLILITERS: Record<(typeof VOLUME_UNITS)[number], number> = {
  m3: 1_000_000, L: 1000, mL: 1, cm3: 1, 'US gal': 3785.411784, 'US fl oz': 29.5735295625, in3: 16.387064, ft3: 28_316.846592,
};
export const DENSITY_TO_GRAMS_PER_MILLILITER: Record<(typeof DENSITY_UNITS)[number], number> = {
  'kg/m3': 0.001, 'g/L': 0.001, 'mg/mL': 0.001, 'kg/L': 1, 'g/mL': 1, 'g/cm3': 1,
  'lb/ft3': MASS_TO_GRAMS.lb / VOLUME_TO_MILLILITERS.ft3,
  'lb/US gal': MASS_TO_GRAMS.lb / VOLUME_TO_MILLILITERS['US gal'],
  'oz/US fl oz': MASS_TO_GRAMS.oz / VOLUME_TO_MILLILITERS['US fl oz'],
};

function assertFinite(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > 1_000_000_000_000) throw new RangeError('Calculated value is outside the supported positive finite range.');
  return Number(value.toPrecision(8));
}

export function calculateMassVolumeDensityV6(input: MassVolumeDensityInput): MassVolumeDensityResult {
  const data = MassVolumeDensityInputSchema.parse(input);
  if (data.solveFor === 'mass') {
    const massG = data.density * DENSITY_TO_GRAMS_PER_MILLILITER[data.densityUnit] * data.volume * VOLUME_TO_MILLILITERS[data.volumeUnit];
    return { solveFor: data.solveFor, value: assertFinite(massG / MASS_TO_GRAMS[data.resultUnit]), unit: data.resultUnit, formula: 'm = ρ × V', temperatureC: data.densityTemperatureC, densitySource: data.densitySource };
  }
  if (data.solveFor === 'volume') {
    const volumeMl = (data.mass * MASS_TO_GRAMS[data.massUnit]) / (data.density * DENSITY_TO_GRAMS_PER_MILLILITER[data.densityUnit]);
    return { solveFor: data.solveFor, value: assertFinite(volumeMl / VOLUME_TO_MILLILITERS[data.resultUnit]), unit: data.resultUnit, formula: 'V = m / ρ', temperatureC: data.densityTemperatureC, densitySource: data.densitySource };
  }
  const densityGPerMl = (data.mass * MASS_TO_GRAMS[data.massUnit]) / (data.volume * VOLUME_TO_MILLILITERS[data.volumeUnit]);
  return { solveFor: data.solveFor, value: assertFinite(densityGPerMl / DENSITY_TO_GRAMS_PER_MILLILITER[data.resultUnit]), unit: data.resultUnit, formula: 'ρ = m / V', temperatureC: data.densityTemperatureC, densitySource: 'Calculated from the entered mass and volume' };
}
