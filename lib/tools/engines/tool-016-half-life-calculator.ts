/**
 * Tool #016 — Half-Life Calculator
 * Layer 16: Multi-Compound Half-Life & Clearance Optimizer
 * Platform: MrXSteroid.com | Core: Pharmacokinetic Clearance & Timing
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate total clearance time from multi-compound stack
 * - Identify ester bottleneck (slowest-clearing compound)
 * - Compute washout windows for PCT launch
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface HalfLifeCompound {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  half_life_days: number;
  half_life_days_adjusted?: number;
  is_lipophilic: boolean;
  bioavailability: number;
  default_dose_mg: number;
  description_text: string;
  ester_type?: string;
}

export interface HalfLifeInput {
  compounds: HalfLifeCompound[];
  body_fat_percentage?: number;
  organ_health: 'optimal' | 'normal' | 'compromised';
  clearance_threshold?: number; // Percentage of original concentration
}

export interface HalfLifeResult {
  total_half_lives: number;
  effective_half_life_days: number;
  washout_days: number; // Days until < threshold% remaining
  washout_weeks: number;
  bottleneck_compound: HalfLifeCompound;
  confidence_score: number; // 0-100% based on data completeness
  recommendations: string[];
}

export function calculateHalfLife(input: HalfLifeInput): HalfLifeResult {
  const { compounds, body_fat_percentage, organ_health, clearance_threshold = 5 } = input;
  
  if (compounds.length === 0) {
    return {
      total_half_lives: 0,
      effective_half_life_days: 0,
      washout_days: 0,
      washout_weeks: 0,
      bottleneck_compound: compounds[0] || { id: 0, name_en: '', name_ar: '', family: '', half_life_days: 0, is_lipophilic: false, bioavailability: 0, default_dose_mg: 0, description_text: '' },
      confidence_score: 0,
      recommendations: ['No compounds entered'],
    };
  }
  
  //16.1. Identify bottleneck (slowest-clearing ester)
  let maxHalfLife = 0;
  let bottleneckIndex = 0;
  
  for (let i = 0; i < compounds.length; i++) {
    const adjustedHalfLife = compounds[i].half_life_days;
    
    //16.1.1. Body fat adjustment for lipophilic compounds
    if (compounds[i].is_lipophilic && body_fat_percentage) {
      const fatAdjustment = 1 + (body_fat_percentage - 20) * 0.01; // 1% per %BF over 20%
      const cappedAdjustment = Math.min(fatAdjustment, 1.35); // Capped at 35% extension
      compounds[i].half_life_days_adjusted = adjustedHalfLife * cappedAdjustment;
    } else {
      compounds[i].half_life_days_adjusted = adjustedHalfLife;
    }
    
    if ((compounds[i].half_life_days_adjusted ?? 0) > maxHalfLife) {
      maxHalfLife = compounds[i].half_life_days_adjusted ?? maxHalfLife;
      bottleneckIndex = i;
    }
  }
  
  const bottleneckCompound = compounds[bottleneckIndex];
  
  //16.2. Calculate effective half-life (weighted average)
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const compound of compounds) {
    const weight = compound.default_dose_mg || 1;
    totalWeight += weight;
    weightedSum += (compound.half_life_days_adjusted ?? 0) * weight;
  }
  
  const effectiveHalfLifeDays = totalWeight > 0 ? weightedSum / totalWeight : maxHalfLife;
  
  //16.3. Calculate washout days
  const washoutDays = Math.ceil(effectiveHalfLifeDays + (clearance_threshold / 100) * effectiveHalfLifeDays);
  //16.2. Actually: washout = effectiveHalfLifeDays * (1 + (100 - threshold) / 100)
  // Standard: 4-5 half-lives to clear ~97-98%
  // If threshold is 5% remaining, that's ~4.32 half-lives (ln(0.05)/ln(0.5))
  const halfLivesToThreshold = Math.log(clearance_threshold / 100) / Math.log(0.5); // negative
  const washoutDaysCalc = Math.max(1, Math.ceil(effectiveHalfLifeDays * Math.abs(halfLivesToThreshold)));
  
  //16.3. Washout weeks
  const washoutWeeks = Math.ceil(washoutDaysCalc / 7);
  
  //16.4. Confidence score based on data completeness
  let confidence = 50; // Base confidence
  if (compounds.length >= 2) confidence += 20;
  if (body_fat_percentage !== undefined) confidence += 15;
  if (organ_health !== 'compromised') confidence += 15;
  if (clearance_threshold > 0) confidence += 10;
  const confidenceScore = Math.min(100, confidence);
  
  //16.5. Generate recommendations
  const recommendations: string[] = [];
  
  if (bottleneckCompound.is_lipophilic) {
    recommendations.push('Lipophilic compound detected - body fat extends clearance time');
    recommendations.push('Consider body fat reduction to shorten PCT window');
  }
  
  if (organ_health === 'compromised') {
    recommendations.push('Organ health compromised - extend washout period by 25%');
    recommendations.push('Support liver with TUDCA & milk thistle');
  }
  
  if (bottleneckCompound.family === 'nandrolone') {
    recommendations.push('Nandrolone derivative - extended PCT recommended (8+ weeks)');
  }
  
  if (confidenceScore < 70) {
    recommendations.push('Increase data completeness for more accurate calculation');
    recommendations.push('Log administration dates for precise clearance timing');
  }
  
  return {
    total_half_lives: compounds.length,
    effective_half_life_days: Math.round(effectiveHalfLifeDays),
    washout_days: washoutDaysCalc,
    washout_weeks: washoutWeeks,
    bottleneck_compound: bottleneckCompound,
    confidence_score: confidenceScore,
    recommendations,
  };
}
