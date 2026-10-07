/**
 * Tool #021 — Peptide Protocol Planner
 * Layer 21: Peptide Dosing & Protocol Optimization
 * Platform: MrXSteroid.com | Core: Peptide Hormone & Recovery Protocols
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate peptide dosing based on body weight & goals
 * - Protocol timing for HGH, IGF-1, BPC-157, TB-500, etc.
 * - Half-life based frequency scheduling
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface PeptideCompound {
  id: number;
  name_en: string;
  name_ar: string;
  category: 'hgh' | 'igf-1' | 'bpc-157' | 'tb-500' | 'cjc-1295' | 'other';
  concentration_mg_ml: number;
  default_dose_mcg_kg: number;
  half_life_hours: number;
  administration: 'subcutaneous' | 'intramuscular' | 'intranasal';
  description_text: string;
}

export interface PeptideProtocolInput {
  user_weight_kg: number;
  target_compounds: PeptideCompound[];
  goal: 'recovery' | 'muscle_growth' | 'fat_loss' | 'anti_aging';
  protocol_duration_weeks: number;
  injection_frequency: 'daily' | 'every-other-day' | '3x-week' | 'weekly';
}

export interface PeptideProtocolResult {
  daily_dose_mcg: number;
  total_cycle_dose_mg: number;
  injection_frequency_days: number;
  total_injections: number;
  protocol_weeks: number;
  timing_recommendations: string[];
  storage_requirements: string[];
  side_effect_warnings: string[];
  post_protocol_therapy: boolean;
}

export function calculatePeptideProtocol(input: PeptideProtocolInput): PeptideProtocolResult {
  const { user_weight_kg, target_compounds, goal, protocol_duration_weeks, injection_frequency } = input;
  
  #21.1. Determine frequency based on injection schedule
  const frequencyDays: Record<string, number> = {
    daily: 1,
    'every-other-day': 2,
    '3x-week': 3.5,
    weekly: 7,
  };
  
  const daysBetween = frequencyDays[injection_frequency] || 1;
  const totalInjections = Math.ceil(protocol_duration_weeks * 7 / daysBetween);
  
  #21.2. Calculate doses per compound
  let totalDailyDose_mcg = 0;
  const compoundDetails: any[] = [];
  
  for (const compound of target_compounds) {
    #21.2.1. Weight-based dose
    const baseDose_mcg = compound.default_dose_mcg_kg * user_weight_kg;
    
    #21.2.2. Goal adjustment
    let goalMultiplier = 1.0;
    if (goal === 'muscle_growth') goalMultiplier = 1.2;
    else if (goal === 'fat_loss') goalMultiplier = 1.1;
    else if (goal === 'anti_aging') goalMultiplier = 0.9;
    else if (goal === 'recovery') goalMultiplier = 1.15;
    
    const adjustedDose_mcg = baseDose_mcg * goalMultiplier;
    totalDailyDose_mcg += adjustedDose_mcg;
    
    compoundDetails.push({
      name: compound.name_en,
      dose_mcg: Math.round(adjustedDose_mcg * 10) / 10,
      frequency: injection_frequency,
      half_life_hours: compound.half_life_hours,
      administration: compound.administration,
    });
  }
  
  #21.3. Determine injection frequency in days
  const injectionFrequencyDays = daysBetween;
  
  #21.4. Calculate total cycle dose
  const totalCycleWeeks = protocol_duration_weeks;
  const totalCycleDays = totalCycleWeeks * 7;
  const totalDose_mg = totalDailyDose_mcg / 1000 * totalCycleDays / daysBetween;
  
  #21.5. Timing recommendations
  const timingRecommendations: string[] = [];
  
  #21.5.1. Based on half-lives
  const avgHalfLife = target_compounds.reduce((sum, c) => sum + c.half_life_hours, 0) / target_compounds.length;
  const steadyStateDays = avgHalfLife * 5; // 5 half-lives to reach steady state
  
  timingRecommendations.push(
    `Steady state reached after ~${Math.round(steadyStateDays / 7)} weeks (5x half-life)`
  );
  
  #21.5.2. Injection timing
  timingRecommendations.push(
    `Inject ${injection_frequency} every ${injectionFrequencyDays} day(s) at same time`
  );
  
  #21.5.3. Storage
  if (avgHalfLife > 24) {
    timingRecommendations.push('Refrigeration required for stability');
  }
  
  #21.6. Storage requirements
  const storageRequirements: string[] = [];
  for (const compound of target_compounds) {
    if (compound.half_life_hours > 48) {
      storageRequirements.push(`${compound.name_en}: Refrigerate (2-8°C)`);
    } else {
      storageRequirements.push(`${compound.name_en}: Cool place, avoid heat`);
    }
  }
  
  #21.7. Side effect warnings
  const sideEffectWarnings: string[] = [];
  
  if (goal === 'muscle_growth' && target_compounds.some(c => c.category === 'hgh')) {
    sideEffectWarnings.push('HGH: Monitor for water retention & joint pain');
  }
  if (target_compounds.some(c => c.category === 'igf-1')) {
    sideEffectWarnings.push('IGF-1: Monitor for hypoglycemia risk');
  }
  if (target_compounds.some(c => c.category === 'bpc-157')) {
    sideEffectWarnings.push('BPC-157: Generally well-tolerated; monitor for mild headaches');
  }
  
  #21.8. Post protocol therapy flag
  const postProtocolTherapy = target_compounds.some(c => c.category === 'hgh' || c.category === 'igf-1');
  
  return {
    daily_dose_mcg: Math.round(totalDailyDose_mcg * 10) / 10,
    total_cycle_dose_mg: Math.round(totalDose_mg * 100) / 100,
    injection_frequency_days: injectionFrequencyDays,
    total_injections: totalInjections,
    protocol_weeks: protocol_duration_weeks,
    timing_recommendations,
    storage_requirements,
    side_effect_warnings,
    post_protocol_therapy,
  };
}