/**
 * Tool #016 — Libido & Sexual Function Calculator
 * Layer 16: Libido & Sexual Health Monitoring & Enhancement
 * Platform: MrXSteroid.com | Core: Sexual Function & Libido Tracking
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Assess libido levels based on compound stack & hormones
 * - Track sexual function symptoms over time
 * - Recommend interventions (compound adjustments, supplements)
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface LibidoInput {
  age: number;
  compound_stack: any[]; // Compound items from DB
  test_level_ng_dL?: number; // Total testosterone
  shbg_nmol_L?: number;      // SHBG
  symptoms: 'low' | 'normal' | 'high' | 'hyper';
  duration_weeks: number;    // Current cycle/recovery duration
}

export interface LibidoResult {
  libido_level: 'low' | 'normal' | 'high';
  libido_score: number; // 0-100
  symptom_severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  compound_adjustments: string[];
  timeline: 'immediate' | '2-4 weeks' | 'pct' | 'trt';
}

export function assessLibido(input: LibidoInput): LibidoResult {
  const { age, compound_stack, test_level_ng_dL, shbg_nmol_L, symptoms, duration_weeks } = input;
  
  // Calculate libido score based on multiple factors
  let libidoScore = 50; // Baseline 50/100
  const factors: string[] = [];
  
  // Compound effects
  let totalAromatizing = 0;
  for (const compound of compound_stack) {
    totalAromatizing += (compound.default_dose_mg || 0) * (compound.aromatization_factor || 0);
  }
  
  // Testosterone impact
  if (test_level_ng_dL) {
    if (test_level_ng_dL < 300) {
      libidoScore -= 20;
      factors.push('Low total testosterone');
    } else if (test_level_ng_dL < 500) {
      libidoScore -= 10;
      factors.push('Borderline testosterone');
    } else if (test_level_ng_dL > 1000) {
      libidoScore += 10;
      factors.push('High testosterone - possible SHBG issues');
    }
  }
  
  // SHBG impact
  if (shbg_nmol_L) {
    if (shbg_nmol_L > 60) {
      libidoScore -= 15;
      factors.push('High SHBG limiting free testosterone');
    } else if (shbg_nmol_L < 25) {
      libidoScore += 5;
      factors.push('Low SHBG - elevated free hormones');
    }
  }
  
  // Compound-specific effects
  const harshCompounds = compound_stack.filter(c => 
    ['nandrolone', 'trenbolone', 'boldenone'].includes(c.family)
  );
  if (harshCompounds.length > 0) {
    libidoScore -= harshCompounds.length * 10;
    factors.push(`${harshCompounds.length} compound(s) known to suppress libido`);
  }
  
  // Symptom adjustment
  const symptomMap: Record<string, number> = {
    low: -20,
    normal: 0,
    high: +10,
    hyper: +20,
  };
  libidoScore += (map[symptoms] || 0);
  if (symptoms !== 'normal') factors.push(`Current symptom level: ${symptoms}`);
  
  // Duration adjustment
  if (duration_weeks > 12) {
    libidoScore -= 10;
    factors.push('Prolonged cycle - hormonal adaptation');
  }
  
  // Clamp score
  libidoScore = Math.max(0, Math.min(100, libidoScore));
  
  // Determine level
  let libidoLevel: 'low' | 'normal' | 'high';
  if (libidoScore < 30) libidoLevel = 'low';
  else if (libidoScore > 70) libidoLevel = 'high';
  else libidoLevel = 'normal';
  
  // Generate recommendations
  const recommendations: string[] = [];
  const compoundAdjustments: string[] = [];
  
  if (libidoLevel === 'low') {
    recommendations.push('Libido suppression detected - take action');
    if (totalAromatizing > 500) {
      recommendations.push('Consider AI support (see Tool #6) to lower estrogen');
    }
    if (shbg_nmol_L && shbg_nmol_L > 50) {
      recommendations.push('Consider SHBG modulation (see Tool #15)');
    }
    recommendations.push('Add compounds with dopaminergic activity');
    compoundAdjustments.push('Reduce or replace suppressive compounds');
    timeline = '2-4 weeks';
  }
  
  if (libidoLevel === 'high') {
    recommendations.push('High libido - monitor for potential sides');
    compoundAdjustments.push('Monitor for overtraining or cardiovascular stress');
  }
  
  if (factors.length > 0) {
    recommendations.push(`Primary factors: ${factors.join(', ')}`);
  }
  
  return {
    libido_level: libidoLevel,
    libido_score: libidoScore,
    symptom_severity: symptoms === 'low' ? 'moderate' : symptoms === 'high' ? 'severe' : 'mild',
    recommendations,
    compound_adjustments,
    timeline,
  };
}