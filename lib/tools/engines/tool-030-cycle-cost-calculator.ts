/**
 * Tool #030 — Cycle Cost Calculator
 * Layer 30: Financial Planning for Cycles & PCT
 * Platform: MrXSteroid.com | Core: Cycle Cost & Financial Planning
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate total cycle cost including compounds, ancillaries, PCT
 * - Breakdown by compound, dosage, and duration
 * - Compare cost across different cycle goals (bulk/cut/recomp)
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface CompoundCost {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  concentration_mg_ml: number;
  weekly_dose_mg: number;
  cycle_weeks: number;
  total_mg: number;
  total_cost_usd: number;
}

export interface CycleCostInput {
  goal: 'bulk' | 'cut' | 'recomp' | 'strength';
  cycle_weeks: number;
  compounds: CompoundCost[];
  pct_duration_weeks: number;
  ancillary_compounds?: CompoundCost[];
  user_weight_kg: number;
}

export interface CycleCostResult {
  total_compound_cost_usd: number;
  total_ancillary_cost_usd: number;
  total_pct_cost_usd: number;
  grand_total_usd: number;
  cost_breakdown: {
    compounds: { name: string; cost: number }[];
    ancillaries: { name: string; cost: number }[];
    pct: { name: string; cost: number }[];
  };
  cost_per_week_usd: number;
  most_expensive_compound: string;
  budget_savings_tips: string[];
}

export function calculateCycleCost(input: CycleCostInput): CycleCostResult {
  const { goal, cycle_weeks, compounds, pct_duration_weeks, ancillary_compounds, user_weight_kg } = input;
  
  //30.1. Compound cost calculations
  // Base pricing: $5 per mg as standard (adjustable)
  const PRICE_PER_MG = 5;
  
  let totalCompoundCost = 0;
  const compoundCostBreakdown: { name: string; cost: number }[] = [];
  
  for (const compound of compounds) {
    const totalMg = compound.weekly_dose_mg * cycle_weeks;
    const totalCost = Math.round(totalMg * PRICE_PER_MG * 100) / 100;
    totalCompoundCost += totalCost;
    
    compoundCostBreakdown.push({
      name: compound.name_en,
      cost: totalCost,
    });
  }
  
  //30.2. Ancillary compounds cost
  let totalAncillaryCost = 0;
  const ancillaryCostBreakdown: { name: string; cost: number }[] = [];
  
  const defaultAncillaries: CompoundCost[] = [
    { id: 1, name_en: 'Aromatase Inhibitor', name_ar: 'مضاد الأروماتاز', family: 'ai', concentration_mg_ml: 1, weekly_dose_mg: 12.5, cycle_weeks: cycle_weeks, total_mg: 12.5 * cycle_weeks, total_cost_usd: 0 },
    { id: 2, name_en: 'HCG', name_ar: 'HCG', family: 'hcg', concentration_mg_ml: 5000, weekly_dose_mg: 250, cycle_weeks: cycle_weeks, total_mg: 250 * cycle_weeks, total_cost_usd: 0 },
    { id: 3, name_en: 'Liver Support', name_ar: 'دعم الكبد', family: 'support', concentration_mg_ml: 500, weekly_dose_mg: 500, cycle_weeks: cycle_weeks, total_mg: 500 * cycle_weeks, total_cost_usd: 0 },
  ];
  
  const allAncillaries = [...(ancillary_compounds || []), ...defaultAncillaries.filter(a => !ancillary_compounds?.some(ac => ac.name_en === a.name_en))];
  
  for (const anc of allAncillaries) {
    const totalMg = anc.weekly_dose_mg * cycle_weeks;
    const totalCost = Math.round(totalMg * PRICE_PER_MG * 100) / 100;
    totalAncillaryCost += totalCost;
    
    ancillaryCostBreakdown.push({
      name: anc.name_en,
      cost: totalCost,
    });
  }
  
  //30.3. PCT cost calculation
  // Standard PCT: Clomid + Nolvadex estimate
  const pctWeeks = pct_duration_weeks || 4;
  const clomidCost = Math.round(4 * 50 * 100) / 100; // 4 weeks @ $50/week
  const nolvadexCost = Math.round(4 * 60 * 100) / 100; // 4 weeks @ $60/week
  const totalPctCost = clomidCost + nolvadexCost;
  
  //30.4. Cost per week
  const costPerWeek = Math.round((totalCompoundCost + totalAncillaryCost + totalPctCost) / cycle_weeks * 100) / 100;
  
  //30.5. Most expensive compound
  const mostExpensive = compoundCostBreakdown.reduce((prev, curr) => curr.cost > prev.cost ? curr : prev, compoundCostBreakdown[0] || { name: '', cost: 0 });
  
  //30.6. Budget savings tips
  const savingsTips: string[] = [];
  
  if (totalCompoundCost > 200) {
    savingsTips.push('Consider longer esters for cost efficiency');
    savingsTips.push('Run shorter cycles to reduce total spend');
  }
  if (totalAncillaryCost > 100) {
    savingsTips.push('Optimize AI dosage based on bloodwork');
    savingsTips.push('Consider shorter HCG usage');
  }
  if (totalPctCost > 100) {
    savingsTips.push('Use shorter PCT protocols where appropriate');
  }
  savingsTips.push('Buy in bulk quantities for better pricing');
  savingsTips.push('Share costs with cycling partner when safe');
  
  return {
    total_compound_cost_usd: totalCompoundCost,
    total_ancillary_cost_usd: totalAncillaryCost,
    total_pct_cost_usd: totalPctCost,
    grand_total_usd: totalCompoundCost + totalAncillaryCost + totalPctCost,
    cost_breakdown: {
      compounds: compoundCostBreakdown,
      ancillaries: ancillaryCostBreakdown,
      pct: [
        { name: 'Clomid', cost: clomidCost },
        { name: 'Nolvadex', cost: nolvadexCost },
      ],
    },
    cost_per_week_usd: costPerWeek,
    most_expensive_compound: mostExpensive.name,
    budget_savings_tips: savingsTips,
  };
}
