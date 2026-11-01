/**
 * Tool #030 — Cycle Cost Calculator
 * Educational cost arithmetic from user-entered costs and a disclosed PCT estimate.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { CycleCostInputSchema } from '../schemas/tool-030-cycle-cost-calculator';

export interface CompoundCost {
  id: number;
  name_en: string;
  name_ar: string;
  total_cost_usd: number;
}

export interface CycleCostInput {
  cycle_weeks: number;
  compounds: CompoundCost[];
  pct_duration_weeks: number;
  ancillary_compounds?: CompoundCost[];
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

const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateCycleCost(input: CycleCostInput): CycleCostResult {
  const validatedInput = CycleCostInputSchema.parse(input);
  const { cycle_weeks, compounds, pct_duration_weeks, ancillary_compounds } = validatedInput;
  
  // Sum user-entered item costs; no market price or dose is inferred.
  let totalCompoundCost = 0;
  const compoundCostBreakdown: { name: string; cost: number }[] = [];
  
  for (const compound of compounds) {
    const totalCost = roundCurrency(compound.total_cost_usd);
    totalCompoundCost = roundCurrency(totalCompoundCost + totalCost);
    
    compoundCostBreakdown.push({
      name: compound.name_en,
      cost: totalCost,
    });
  }
  
  //30.2. Ancillary compounds cost
  let totalAncillaryCost = 0;
  const ancillaryCostBreakdown: { name: string; cost: number }[] = [];
  
  for (const anc of ancillary_compounds || []) {
    const totalCost = roundCurrency(anc.total_cost_usd);
    totalAncillaryCost = roundCurrency(totalAncillaryCost + totalCost);
    
    ancillaryCostBreakdown.push({
      name: anc.name_en,
      cost: totalCost,
    });
  }
  
  //30.3. PCT cost calculation
  // Standard PCT: Clomid + Nolvadex estimate
  const pctWeeks = pct_duration_weeks;
  const clomidCost = roundCurrency(pctWeeks * 50); // Assumed $50/week
  const nolvadexCost = roundCurrency(pctWeeks * 60); // Assumed $60/week
  const totalPctCost = roundCurrency(clomidCost + nolvadexCost);
  
  //30.4. Cost per week
  const grandTotal = roundCurrency(totalCompoundCost + totalAncillaryCost + totalPctCost);
  const costPerWeek = roundCurrency(grandTotal / (cycle_weeks + pctWeeks));
  
  //30.5. Most expensive compound
  const mostExpensive = compoundCostBreakdown.reduce((prev, curr) => curr.cost > prev.cost ? curr : prev, compoundCostBreakdown[0] || { name: '', cost: 0 });
  
  return {
    total_compound_cost_usd: totalCompoundCost,
    total_ancillary_cost_usd: totalAncillaryCost,
    total_pct_cost_usd: totalPctCost,
    grand_total_usd: grandTotal,
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
    budget_savings_tips: [],
  };
}
