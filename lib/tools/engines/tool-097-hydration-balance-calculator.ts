import { HydrationBalanceCalculatorInputSchema } from '../schemas/tool-097-hydration-balance-calculator';

export type HydrationBalanceCalculatorInput = {
  pre_exercise_body_weight_kg: number;
  post_exercise_body_weight_kg: number;
  fluid_consumed_liters: number;
  urine_output_liters: number;
  exercise_duration_minutes: number;
};

export type HydrationBalanceCalculatorResult =
  | {
      status: 'CALCULATED';
      resultType: 'CALCULATED';
      sweat_loss_liters: number;
      sweat_rate_liters_per_hour: number;
      exercise_duration_hours: number;
    }
  | {
      status: 'NOT_AVAILABLE';
      reason: 'NEGATIVE_SWEAT_LOSS';
    };

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculates only the field-measured sweat loss and rate described by NATA.
 * This is arithmetic over user measurements, not a fluid prescription,
 * hydration assessment, or prediction. Invalid inputs throw Zod's validation
 * error; a negative calculated loss returns NOT_AVAILABLE as inconsistent data.
 */
export function calculateHydrationBalance(input: HydrationBalanceCalculatorInput): HydrationBalanceCalculatorResult {
  const measurement = HydrationBalanceCalculatorInputSchema.parse(input);
  const sweatLossLiters = measurement.pre_exercise_body_weight_kg
    - measurement.post_exercise_body_weight_kg
    + measurement.fluid_consumed_liters
    - measurement.urine_output_liters;

  if (!Number.isFinite(sweatLossLiters) || sweatLossLiters < -1e-9) {
    return { status: 'NOT_AVAILABLE', reason: 'NEGATIVE_SWEAT_LOSS' };
  }

  // Floating-point cancellation can produce tiny negative residues for exact zero.
  const nonNegativeSweatLossLiters = Math.max(0, sweatLossLiters);

  const exerciseDurationHours = measurement.exercise_duration_minutes / 60;
  const sweatRateLitersPerHour = nonNegativeSweatLossLiters / exerciseDurationHours;
  if (!Number.isFinite(sweatRateLitersPerHour)) {
    return { status: 'NOT_AVAILABLE', reason: 'NEGATIVE_SWEAT_LOSS' };
  }

  return {
    status: 'CALCULATED',
    resultType: 'CALCULATED',
    sweat_loss_liters: roundTo(nonNegativeSweatLossLiters, 2),
    sweat_rate_liters_per_hour: roundTo(sweatRateLitersPerHour, 2),
    exercise_duration_hours: roundTo(exerciseDurationHours, 4),
  };
}
