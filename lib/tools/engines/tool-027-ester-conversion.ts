/**
 * Tool #027 — Ester Conversion Calculator
 * Layer 27: Ester Weight Conversion & Base Hormone Equivalence
 * Platform: MrXSteroid.com | Core: Ester Chemistry & Milligram Conversion
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Convert milligrams between different ester types
 * - Calculate base hormone weight from ester weight
 * - Identify ester potency factors
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface EsterCompound {
  id: number;
  name_en: string;
  name_ar: string;
  ester_type: 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other';
  ester_ratio: number; // Base hormone % (e.g., 0.72 for enanthate)
  description_text: string;
}

export interface EsterConversionInput {
  compound_name: string;
  ester_type: 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other';
  ester_mg: number; // Ester weight in mg
  target_ester?: 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other';
}

export interface EsterConversionResult {
  ester_mg: number;
  base_hormone_mg: number; // Base hormone weight
  conversion_to_target: number; // mg of target ester equivalent
  potency_factor: number;
  molecular_weight_adjustment: number;
  notes: string[];
}

export function calculateEsterConversion(input: EsterConversionInput): EsterConversionResult {
  const { compound_name, ester_type, ester_mg, target_ester } = input;
  
  //27.1. Ester ratio table (percentage of base hormone by weight)
  const esterRatios: Record<string, number> = {
    acetate: 0.85,
    phenylpropionate: 0.8,
    propionate: 0.78,
    decanoate: 0.58,
    undecanoate: 0.62,
    enanthate: 0.72,
    cypionate: 0.71,
    heptanoate: 0.75,
    other: 0.75,
  };
  
  const ratio = esterRatios[ester_type] || 0.75;
  
  //27.2. Calculate base hormone weight
  const baseHormone_mg = Math.round(ester_mg * ratio * 10) / 10;
  
  //27.3. Calculate conversion to target ester
  let conversionToTarget = ester_mg;
  if (target_ester) {
    const targetRatio = esterRatios[target_ester] || 0.75;
    // To get equivalent base hormone, then convert back to target ester
    const equivalentBase = ester_mg * ratio;
    conversionToTarget = Math.round(equivalentBase / targetRatio * 100) / 100;
  }
  
  //27.4. Potency factor
  const potencyFactor = ratio;
  
  //27.5. Molecular weight adjustment note
  const notes: string[] = [];
  
  if (ratio < 0.6) {
    notes.push('Low ester ratio - longer ester chain, more weight per mg base hormone');
  }
  if (ratio > 0.8) {
    notes.push('High ester ratio - shorter ester chain, less weight per mg base hormone');
  }
  if (target_ester && target_ester !== ester_type) {
    notes.push(`Converting from ${ester_type} to ${target_ester} adjusts mg equivalence`);
  }
  
  return {
    ester_mg: ester_mg,
    base_hormone_mg: baseHormone_mg,
    conversion_to_target: conversionToTarget,
    potency_factor: potencyFactor,
    molecular_weight_adjustment: ratio,
    notes,
  };
}
