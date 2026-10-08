/**
 * Tool #026 — Injection Pain Minimizer
 * Layer 26: Injection Site Rotation & Pain Management
 * Platform: MrXSteroid.com | Core: Injection Comfort & Safety
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate optimal injection volume per site to minimize pain
 * - Rotate injection sites to prevent abscesses & scar tissue
 * - Solvent ratio guidelines (BA/BB for oil-based compounds)
 * - Temperature & technique tips for reduced pain
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface InjectionPainSite {
  id: number;
  name_en: string;
  name_ar: string;
  muscle_group: 'deltoid' | 'glutes' | 'quads' | 'pectorals' | 'triceps' | 'biceps';
  last_injection_date?: string;
  current_volume_ml?: number;
  pain_level: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface InjectionPainInput {
  compound_viscosity: 'low' | 'medium' | 'high';
  concentration_mg_ml: number;
  desired_dose_mg: number;
  current_sites: InjectionPainSite[];
  injection_site: 'deltoid' | 'glutes' | 'quads' | 'pectorals' | 'triceps' | 'biceps';
}

export interface InjectionPainResult {
  desired_dose_ml: number;
  max_safe_volume_ml: number;
  pain_minimization_score: number; // 0-100
  recommended_site: string;
  rotation_schedule: string[];
  solvent_ratio: string;
  temperature_recommendation: string;
  warnings: string[];
}

export function calculateInjectionPainMinimizer(input: InjectionPainInput): InjectionPainResult {
  const { compound_viscosity, concentration_mg_ml, desired_dose_mg, current_sites, injection_site } = input;
  
  //26.1. Calculate desired volume
  const desired_dose_ml = desired_dose_mg / concentration_mg_ml;
  
  //26.2. Determine max safe volume based on muscle group
  const maxVolumes: Record<string, number> = {
    deltoid: 0.5,
    glutes: 3.0,
    quads: 2.0,
    pectorals: 1.0,
    triceps: 0.5,
    biceps: 0.5,
  };
  
  const baseMax = maxVolumes[injection_site] || 1.0;
  
  //26.2.1. Viscosity adjustment
  const viscosityFactor: Record<string, number> = {
    low: 0.9,
    medium: 1.0,
    high: 1.25,
  };
  
  const maxSafeVolume = Math.min(baseMax * viscosityFactor[compound_viscosity], 5.0);
  
  //26.3. Pain minimization score
  let painScore = 100;
  
  // Volume factor: exceeding safe volume drops score
  if (desired_dose_ml > maxSafeVolume) {
    painScore -= 30;
  }
  if (desired_dose_ml > maxSafeVolume * 1.5) {
    painScore -= 20;
  }
  
  // Site freshness factor
  const today = new Date();
  let freshnessBonus = 0;
  if (current_sites.some(s => s.muscle_group === injection_site)) {
    const matchSite = current_sites.find(s => s.muscle_group === injection_site);
    const lastDate = matchSite?.last_injection_date
      ? new Date(matchSite.last_injection_date)
      : new Date(0);
    const daysSinceLast = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast > 7) {
      freshnessBonus = 20; // 1+ week since last injection
    } else if (daysSinceLast > 3) {
      freshnessBonus = 10; // 3-7 days
    }
  }
  painScore += freshnessBonus;
  
  // Cap at 100
  const painMinimizationScore = Math.min(100, Math.max(0, painScore));
  
  //26.4. Recommend optimal site
  const prioritizedSites: ('deltoid' | 'glutes' | 'quads' | 'pectorals' | 'triceps' | 'biceps')[] = [
    'glutes', 'quads', 'deltoid', 'pectorals', 'triceps', 'biceps'
  ];
  
  let recommendedSite = injection_site;
  for (const site of prioritizedSites) {
    if (site !== injection_site && current_sites.filter(s => s.muscle_group === site).length < 2) {
      recommendedSite = site;
      break;
    }
  }
  
  //26.5. Generate rotation schedule
  const rotationSchedule: string[] = [];
  
  for (const site of current_sites) {
    const lastDate = site.last_injection_date ? new Date(site.last_injection_date) : new Date(0);
    const daysSinceLast = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    const nextEligible = lastDate.getTime() + (2 * 24 * 60 * 60 * 1000); // 48 hours minimum
    const daysUntilEligible = (nextEligible - today.getTime()) / (1000 * 60 * 60 * 24);
    
    rotationSchedule.push(
      `${site.name_en}: ${daysSinceLast.toFixed(0)}d ago, next eligible in ${daysUntilEligible.toFixed(1)}d`
    );
  }
  
  //26.6. Solvent ratio recommendation
  const solventRatio = compound_viscosity === 'high' ? '10% BA / 20% BB' : 
                       compound_viscosity === 'medium' ? '5% BA / 10% BB' : '1% BA / 5% BB';
  
  //26.7. Temperature recommendation
  let tempRec: string;
  if (painMinimizationScore < 50) {
    tempRec = 'Warm the oil to body temperature (37°C) before injection';
  } else {
    tempRec = 'Room temperature (20-25°C) is acceptable';
  }
  
  //26.8. Warnings
  const warnings: string[] = [];
  
  if (desired_dose_ml > maxSafeVolume) {
    warnings.push(`Volume (${desired_dose_ml.toFixed(1)}mL) exceeds safe limit (${maxSafeVolume.toFixed(1)}mL) - will cause pain`);
  }
  if (compound_viscosity === 'high' && desired_dose_ml > 1.0) {
    warnings.push('High viscosity - split across multiple sites or reduce volume');
  }
  
  return {
    desired_dose_ml: Math.round(desired_dose_ml * 10) / 10,
    max_safe_volume_ml: Math.round(maxSafeVolume * 10) / 10,
    pain_minimization_score: painMinimizationScore,
    recommended_site: recommendedSite,
    rotation_schedule: rotationSchedule,
    solvent_ratio: solventRatio,
    temperature_recommendation: tempRec,
    warnings,
  };
}
