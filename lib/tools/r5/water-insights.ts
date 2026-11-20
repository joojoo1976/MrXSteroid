import { calculateWaterIntakeV6 } from '@/lib/tools/engines/water-intake.v6';

export interface WaterScenario {
  activityLevel: number;
  liters: number;
}

export const WATER_SCENARIO_LEVELS: readonly number[] = [1, 1.2, 1.4];

const US_FL_OZ_PER_LITER = 33.8140226;

/**
 * Recalculate activity scenarios through the real water engine.
 * No hydration coefficient is duplicated here.
 */
export function buildWaterScenarios(
  weightKg: number,
  levels: readonly number[] = WATER_SCENARIO_LEVELS
): WaterScenario[] {
  const uniqueLevels = [...new Set(levels)].sort((left, right) => left - right);
  return uniqueLevels.map((activityLevel) => ({
    activityLevel,
    liters: calculateWaterIntakeV6({ weightKg, activityLevel }).dailyWaterLiters,
  }));
}

/** Convert litres to whole US fluid ounces for imperial display. */
export function litersToUsFlOz(liters: number): number {
  if (!Number.isFinite(liters) || liters < 0) {
    throw new Error('Litres must be a non-negative finite number');
  }
  return Math.round(liters * US_FL_OZ_PER_LITER);
}
