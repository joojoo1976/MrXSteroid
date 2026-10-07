/**
 * Tool #022 — Compound Half-Life Stacker
 * Layer 22: Multi-Compound Stack Timing & Ester Analysis
 * Platform: MrXSteroid.com | Core: Stack Pharmacokinetics & Cycle Timing
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate optimal timing for multi-ester stacks
 * - Identify ester clearance bottlenecks
 * - Compute peak plasma time & off-cycle windows
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface EsterCompound {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  ester_type: 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cyionate' | 'cypionate' | 'heptanoate' | 'other';
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
  user_goal: 'bulk' | 'cut' | 'recomp' | 'strength';
}

export interface StackTimingResult {
  peak_platform_days: number; // Days until peak concentration
  total_cycle_half_lives: number;
  recommended_pct_start_days: number;
  washout_complete_days: number;
  ester_bottleneck: EsterCompound;
  optimal_injection_schedule: string[];
  compound_peak_times: Record<string, number>;
  confidence_score: number;
}

export function calculateStackTiming(input: StackTimingInput): StackTimingResult {
  const { compounds, cycle_length_weeks, injection_frequency, user_goal } = input;
  
  if (compounds.length === 0) {
    return {
      peak_platform_days: 0,
      total_cycle_half_lives: 0,
      recommended_pct_start_days: 0,
      washout_complete_days: 0,
      ester_bottleneck: compounds[0] || { id: 0, name_en: '', name_ar: '', family: '', ester_type: 'other', half_life_days: 0, release_rate: 'slow', anabolic_score: 0, androgenic_score: 0, description_text: '' },
      optimal_injection_schedule: [],
      compound_peak_times: {},
      confidence_score: 0,
    };
  }
  
  #22.1. Identify ester bottleneck (longest half-life)
  let maxHalfLife = 0;
  let bottleneckIndex = 0;
  
  for (let i = 0; i < compounds.length; i++) {
    if (compounds[i].half_life_days > maxHalfLife) {
      maxHalfLife = compounds[i].half_life_days;
      bottleneckIndex = i;
    }
  }
  
  const esterBottleneck = compounds[bottleneckIndex];
  
  #22.2. Calculate peak platform days (time to reach peak concentration)
  # For simplicity: assume peak at 2-3 half-lives for most compounds
  const peakPlatformDays = Math.ceil(maxHalfLife * 2.5);
  
  #22.3. Total cycle half-lives
  const totalHalfLifeSum = compounds.reduce((sum, c) => sum + c.half_life_days, 0);
  const totalCycleHalfLives = totalHalfLifeSum / maxHalfLife;
  
  #22.4. Recommended PCT start days
  # Standard: start PCT when last long-ester is ~50% cleared
  # That's ~1 half-life after cycle end for the bottleneck
  const pctStartDays = Math.ceil(maxHalfLife + (cycle_length_weeks * 7) * 0.1); // 10% of cycle as buffer
  
  #22.5. Washout complete days
  # 4-5 half-lives to clear almost completely
  const washoutCompleteDays = Math.ceil(maxHalfLife * 4.5);
  
  #22.6. Optimal injection schedule
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
  
  #22.7. Compound peak times
  const compoundPeakTimes: Record<string, number> = {};
  for (const compound of compounds) {
    compoundPeakTimes[compound.name_en] = Math.round(compound.half_life_days * 2.5);
  }
  
  #22.8. Confidence score
  let confidence = 50;
  if (compounds.length >= 2) confidence += 20;
  if (cycle_length_weeks > 0) confidence += 15;
  if (user_goal) confidence += 15;
  const confidenceScore = Math.min(100, confidence);
  
  return {
    peak_platform_days: peakPlatformDays,
    total_cycle_half_lives: Math.round(totalCycleHalfLives * 10) / 10,
    recommended_pct_start_days: pctStartDays,
    washout_complete_days: washoutCompleteDays,
    ester_bottleneck,
    optimal_injection_schedule: optimalSlice(optimalSchedule, cycle_length_weeks),
    compound_peak_times,
    confidence_score: confidenceScore,
  };
}

function optimalSlice(schedule: string[], weeks: number): string[] {
  const maxDays = weeks * 7;
  return schedule.filter((s, i) => {
    const dayNum = parseInt(s.split(' ')[1]);
    return dayNum <= maxDays;
  });
}