import {
  HalfLifeInputSchema,
  HalfLifeResultSchema,
  type HalfLifeInput,
  type HalfLifeResult,
} from '../schemas/tool-016-half-life-calculator';

/**
 * Calculates a user-entered mathematical elimination scenario for each
 * independent substance. This is not a drug-specific pharmacokinetic model,
 * washout recommendation, or PCT timing estimate.
 */
export function calculateHalfLife(rawInput: HalfLifeInput): HalfLifeResult {
  const input = HalfLifeInputSchema.parse(rawInput);
  const remainingFraction = input.remaining_percent / 100;
  const compounds = input.compounds.map((compound) => {
    const elapsedDays = compound.half_life_days * Math.log(remainingFraction) / Math.log(0.5);
    return {
      name: compound.name,
      half_life_days: compound.half_life_days,
      source: compound.source,
      remaining_percent: input.remaining_percent,
      elapsed_days: elapsedDays,
    };
  });

  return HalfLifeResultSchema.parse({
    status: 'CALCULATED',
    model: 'SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO',
    compounds,
    assumptions: ['constant_half_life', 'independent_items', 'not_clinical'],
  });
}
