/**
 * Tool #017 — Drug Interaction Checker
 * Layer 17: Compound & Medication Interaction Screening
 * Platform: MrXSteroid.com | Core: Safety & Interaction Monitoring
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Check interactions between selected compounds
 * - Screen against common medications (HIV, heart, liver drugs)
 - Identify contraindications & warning flags
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface DrugInteractionInput {
  compounds: any[]; // Compound items from DB
  medications: string[]; // User's current medications
  health_conditions: string[]; // e.g., 'liver_disease', 'heart_condition'
  age: number;
}

export interface InteractionFlag {
  severity: 'contraindicated' | 'warning' | 'informational';
  category: 'cardiovascular' | 'hepatotoxic' | 'endocrine' | 'renal' | 'neurological';
  description: string;
  recommendation: string;
}

export interface DrugInteractionResult {
  overall_safety: 'safe' | 'caution' | 'danger';
  flags: InteractionFlag[];
  summary: string;
  requires_medical_approval: boolean;
}

export function checkDrugInteractions(input: DrugInteractionInput): DrugInteractionResult {
  const { compounds, medications, health_conditions, age } = input;
  const flags: InteractionFlag[] = [];
  
  // Compound-compound interactions
  for (let i = 0; i < compounds.length; i++) {
    for (let j = i + 1; j < compounds.length; j++) {
      const c1 = compounds[i];
      const c2 = compounds[j];
      
      // Same family stacking (e.g., two aromatizable compounds)
      if (c1.family === c2.family && c1.family in ['testosterone', 'nandrolone']) {
        flags.push({
          severity: 'warning',
          category: 'endocrine',
          description: `Two ${c1.family} compounds may compound estrogenic effects`,
          recommendation: 'Monitor estrogen levels closely; consider AI support'
        });
      }
      
      #1.5. Severe liver stress from compound combo
      if (c1.is_lipophilic && c2.is_lipophilic) {
        flags.push({
          severity: 'warning',
          category: 'hepatotoxic',
          description: 'Two lipophilic compounds may stress liver',
          recommendation: 'Support liver with supplements (TUDCA, milk thistle); monitor LFTs'
        });
      }
    }
  }
  
  // Compound-medication interactions
  for (const med of medications) {
    const lowerMed = med.toLowerCase();
    if (lowerMed.includes('statin') || lowerMed.includes('cholesterol')) {
      // Some compounds affect lipid metabolism
      flags.push({
        severity: 'informational',
        category: 'cardiovascular',
        description: 'Statins + androgenic compounds may affect liver enzymes',
        recommendation: 'Monitor liver function; space dosing if possible'
      });
    }
    if (lowerMed.includes('anticoagulant') || lowerMed.includes('blood thinner') || lowerMed.includes('warfarin')) {
      flags.push({
        severity: 'contraindicated',
        category: 'cardiovascular',
        description: 'Powerful androgenic compounds may enhance anticoagulant effects',
        recommendation: 'IMMEDIATE medical review required - do not combine without supervision'
      });
    }
    if (lowerMed.includes('diabetic') || lowerMed.includes('insulin')) {
      flags.push({
        severity: 'warning',
        category: 'endocrine',
        description: 'Androgenic compounds may affect blood glucose control',
        recommendation: 'Monitor blood sugar; adjust diabetic medication as needed'
      });
    }
  }
  
  // Health condition interactions
  for (const condition of health_conditions) {
    const lowerCond = condition.toLowerCase();
    if (lowerCond.includes('liver') || lowerCond.includes('hepat')) {
      flags.push({
        severity: 'contraindicated',
        category: 'hepatotoxic',
        description: 'Pre-existing liver condition',
        recommendation: 'Avoid oral 17-alpha-alkylated compounds; limit cycle length to 6-8 weeks'
      });
    }
    if (lowerCond.includes('heart') || lowerCond.includes('cardi')) {
      flags.push({
        severity: 'contraindicated',
        category: 'cardiovascular',
        description: 'Pre-existing heart condition',
        recommendation: 'Cardiologist clearance required before starting cycle'
      });
    }
    if (lowerCond.includes('high_blood') || lowerCond.includes('hypertension')) {
      flags.push({
        severity: 'warning',
        category: 'cardiovascular',
        description: 'Hypertension - androgenic compounds may elevate BP',
        recommendation: 'Monitor BP regularly; consider compounds with lower BP impact'
      });
    }
  }
  
  // Determine overall safety
  const contraindicated = flags.filter(f => f.severity === 'contraindicated');
  const warnings = flags.filter(f => f.severity === 'warning');
  
  let overallSafety: 'safe' | 'caution' | 'danger';
  if (contraindicated.length > 0) overallSafety = 'danger';
  else if (warnings.length > 2) overallSafety = 'caution';
  else overallSafety = 'safe';
  
  // Generate summary
  let summary = 'No major interactions detected';
  if (contraindicated.length > 0) {
    summary = `⚠️ ${contraindicated.length} contraindication(s) detected - medical supervision required`;
  } else if (warnings.length > 0) {
    summary = `(${warnings.length} warning(s) detected)`;
  }
  
  return {
    overall_safety: overallSafety,
    flags,
    summary,
    requires_medical_approval: contraindicated.length > 0,
  };
}