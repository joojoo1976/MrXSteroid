/**
 * Tool #022 — Half-Life Timing Arithmetic
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Derive schedule and timing heuristics from user-entered values
 * - Identify the input with the longest stated half-life
 * - Does not validate pharmacokinetics or recommend treatment timing
 */

import { StackTimingInputSchema } from '../schemas/tool-022-half-life-stacker';

export interface EsterCompound {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  ester_type: 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other';
  half_life_days: number;
  release_rate: 'slow' | 'medium' | 'fast';
  anabolic_score: number;
  androgenic_score: number;
  description_text: string;
}

export interface StackTimingInput {
  compounds: EsterCompound[];
  cycle_length_weeks: number;
  injection_frequency: 'daily' | 'every-other-day' | '2x-week' | '1x-week';
}

export interface StackTimingResult {
  peak_platform_days: number; // Days until peak concentration
  total_cycle_half_lives: number;
  recommended_pct_start_days: number;
  washout_complete_days: number;
  ester_bottleneck: EsterCompound;
  optimal_injection_schedule: string[];
  compound_peak_times: Record<string, number>;
}

export function calculateStackTiming(input: StackTimingInput): StackTimingResult {
  const validatedInput = StackTimingInputSchema.parse(input);
  const { compounds, cycle_length_weeks, injection_frequency } = validatedInput;
  
  //22.1. Identify ester bottleneck (longest half-life)
  let maxHalfLife = 0;
  let bottleneckIndex = 0;
  
  for (let i = 0; i < compounds.length; i++) {
    if (compounds[i].half_life_days > maxHalfLife) {
      maxHalfLife = compounds[i].half_life_days;
      bottleneckIndex = i;
    }
  }
  
  const esterBottleneck = compounds[bottleneckIndex];
  
  //22.2. Calculate peak platform days (time to reach peak concentration)
  // Legacy heuristic only; this is not a pharmacokinetic peak model.
  const peakPlatformDays = Math.ceil(maxHalfLife * 2.5);
  
  //22.3. Total cycle half-lives
  const totalHalfLifeSum = compounds.reduce((sum, c) => sum + c.half_life_days, 0);
  const totalCycleHalfLives = totalHalfLifeSum / maxHalfLife;
  
  //22.4. Recommended PCT start days
  // Standard: start PCT when last long-ester is ~50% cleared
  // That's ~1 half-life after cycle end for the bottleneck
  const pctStartDays = Math.ceil(maxHalfLife + (cycle_length_weeks * 7) * 0.1); // 10% of cycle as buffer
  
  //22.5. Washout complete days
  // 4-5 half-lives to clear almost completely
  const washoutCompleteDays = Math.ceil(maxHalfLife * 4.5);
  
  //22.6. Optimal injection schedule
  const freqMap: Record<string, number> = {
    daily: 1,
    'every-other-day': 2,
    '2x-week': 3.5,
    '1x-week': 7,
  };
  
  const freqDays = freqMap[injection_frequency] || 1;
  const optimalSchedule: string[] = [];
  
  for (let day = 1; day <= cycle_length_weeks * 7; day += freqDays) {
    optimalSchedule.push(`Day ${day} of cycle`);
  }
  
  //22.7. Compound peak times
  const compoundPeakTimes: Record<string, number> = {};
  for (const compound of compounds) {
    compoundPeakTimes[compound.name_en] = Math.round(compound.half_life_days * 2.5);
  }
  
  return {
    peak_platform_days: peakPlatformDays,
    total_cycle_half_lives: Math.round(totalCycleHalfLives * 10) / 10,
    recommended_pct_start_days: pctStartDays,
    washout_complete_days: washoutCompleteDays,
    ester_bottleneck: esterBottleneck,
    optimal_injection_schedule: optimalSlice(optimalSchedule, cycle_length_weeks),
    compound_peak_times: compoundPeakTimes,
  };
}

function optimalSlice(schedule: string[], weeks: number): string[] {
  const maxDays = weeks * 7;
  return schedule.filter((s) => {
    const dayNum = parseInt(s.split(' ')[1]);
    return dayNum <= maxDays;
  });
}
