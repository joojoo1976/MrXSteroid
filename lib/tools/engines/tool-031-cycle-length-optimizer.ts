/**
 * Tool #031 — Cycle Length Optimizer
 * Optimal cycle duration from goal, suppression load and ester bottleneck.
 * Pure calculation engine (no I/O, no DB).
 */

export interface CycleLengthCompound {
  name_en: string;
  suppression_factor: number; // 0 (mild) .. 5 (harsh, e.g. tren/nandrolone)
  half_life_days: number;
  weekly_dose_mg: number;
}

export interface CycleLengthInput {
  goal: 'bulk' | 'cut' | 'recomp' | 'strength';
  experience: 'beginner' | 'intermediate' | 'advanced';
  previous_cycles: number;
  compounds: CycleLengthCompound[];
}

export interface CycleLengthResult {
  min_weeks: number;
  optimal_weeks: number;
  max_weeks: number;
  suppression_load: number;
  ester_bottleneck_days: number;
  rationale: string[];
}

const GOAL_BASE_WEEKS: Record<CycleLengthInput['goal'], number> = {
  bulk: 12,
  cut: 8,
  recomp: 10,
  strength: 8,
};

export function calculateCycleLength(input: CycleLengthInput): CycleLengthResult {
  const { goal, experience, previous_cycles, compounds } = input;
  const rationale: string[] = [];

  // 31.1 Suppression load: sum(sf * dose/500mg reference)
  let suppressionLoad = 0;
  let bottleneck = 0;
  for (const c of compounds) {
    suppressionLoad += c.suppression_factor * (c.weekly_dose_mg / 500);
    if (c.half_life_days > bottleneck) bottleneck = c.half_life_days;
  }
  suppressionLoad = Math.round(suppressionLoad * 100) / 100;

  // 31.2 Base window from goal
  let optimal = GOAL_BASE_WEEKS[goal];
  rationale.push(`Base ${optimal} weeks for goal '${goal}'`);

  // 31.3 Long esters need extra weeks to reach steady state
  if (bottleneck >= 10) {
    optimal += 2;
    rationale.push(`Long-ester bottleneck (${bottleneck}d half-life): +2 weeks to reach steady state`);
  }

  // 31.4 High suppression caps the safe window
  let maxWeeks = 16;
  if (suppressionLoad > 6) {
    maxWeeks = 8;
    rationale.push(`Suppression load ${suppressionLoad} > 6: cap at 8 weeks (harsh compounds)`);
  } else if (suppressionLoad > 3) {
    maxWeeks = 10;
    rationale.push(`Suppression load ${suppressionLoad} > 3: cap at 10 weeks`);
  } else if (suppressionLoad > 1.5) {
    maxWeeks = 12;
    rationale.push(`Suppression load ${suppressionLoad} > 1.5: cap at 12 weeks`);
  }

  // 31.5 Beginners run shorter first cycles
  let minWeeks = 6;
  if (experience === 'beginner' || previous_cycles === 0) {
    minWeeks = 8;
    maxWeeks = Math.min(maxWeeks, 10);
    rationale.push('Beginner / first cycle: 8-10 week window for recovery safety');
  } else if (experience === 'advanced' && previous_cycles >= 3) {
    minWeeks = 8;
    rationale.push('Advanced history: full window available');
  }

  optimal = Math.max(minWeeks, Math.min(maxWeeks, optimal));
  if (optimal === maxWeeks) rationale.push(`Optimal clamped to max ${maxWeeks} weeks`);

  return {
    min_weeks: minWeeks,
    optimal_weeks: optimal,
    max_weeks: maxWeeks,
    suppression_load: suppressionLoad,
    ester_bottleneck_days: bottleneck,
    rationale,
  };
}
