/**
 * Legacy import path for unit conversion helpers used by older tools.
 * Global measurement preferences are controlled by the application header;
 * this module intentionally contains no local preference control or storage.
 */
export type MeasurementSystem = 'metric' | 'imperial';

export const KG_TO_LBS = 2.20462;

export const kgToLbs = (kg: number): number => Math.round(kg * KG_TO_LBS);
export const lbsToKg = (lbs: number): number => Math.round((lbs / KG_TO_LBS) * 10) / 10;

/** Mass-ounce conversion (not fluid ounces). 1 oz = 28.349523125 g. */
export const MG_PER_OZ = 28349.523125;
export const mgToOz = (mg: number): number => Math.round((mg / MG_PER_OZ) * 1e6) / 1e6;
export const ozToMg = (oz: number): number => Math.round(oz * MG_PER_OZ * 10) / 10;
