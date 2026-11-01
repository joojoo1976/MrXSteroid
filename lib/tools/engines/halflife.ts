/**
 * lib/tools/engines/halflife.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #4 — Half-Life Simulator (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════════
 * Compound half-life visualization and accumulation calculator.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

export type UnitSystem = 'metric' | 'imperial';

export interface Compound {
  id: string;
  nameEn: string;
  nameAr: string;
  halfLifeDays: number;
  doseMg: number;
  frequencyDays: number; // e.g., 3.5 for twice weekly
  startDay: number;
  endDay?: number;
}

export interface HalflifeInput {
  compounds: Compound[];
  simulationDays: number;
  unitSystem?: UnitSystem;
}

export interface ConcentrationPoint {
  day: number;
  totalMg: number;
  compounds: Array<{ compoundId: string; mg: number }>;
}

export interface HalflifeOutput {
  concentrationCurve: ConcentrationPoint[];
  peakMg: number;
  troughMg: number;
  averageMg: number;
  steadyStateDay: number;
  accumulationRatio: number;
}

function calculateConcentration(compound: Compound, day: number): number {
  if (day < compound.startDay) return 0;
  if (compound.endDay && day > compound.endDay) return 0;

  // Check if this is a dosing day
  const daysSinceStart = day - compound.startDay;
  const isDosingDay = daysSinceStart % compound.frequencyDays === 0;

  if (!isDosingDay) {
    // Calculate residual from previous doses
    let total = 0;
    let doseDay = compound.startDay;
    while (doseDay <= day) {
      const elapsed = day - doseDay;
      const remaining = compound.doseMg * Math.pow(0.5, elapsed / compound.halfLifeDays);
      total += remaining;
      doseDay += compound.frequencyDays;
    }
    return total;
  }

  // On dosing day, add new dose plus residual
  let total = compound.doseMg;
  let doseDay = compound.startDay;
  while (doseDay < day) {
    const elapsed = day - doseDay;
    const remaining = compound.doseMg * Math.pow(0.5, elapsed / compound.halfLifeDays);
    total += remaining;
    doseDay += compound.frequencyDays;
  }
  return total;
}

export function calculateHalflife(input: HalflifeInput): HalflifeOutput {
  const { compounds, simulationDays } = input;

  if (compounds.length === 0) throw new Error('At least one compound required');
  if (simulationDays < 1 || simulationDays > 365) throw new Error('Simulation days must be between 1 and 365');

  const concentrationCurve: ConcentrationPoint[] = [];
  let peakMg = 0;
  let troughMg = Infinity;
  let totalMg = 0;

  for (let day = 1; day <= simulationDays; day++) {
    const compoundsData: ConcentrationPoint['compounds'] = [];
    let dayTotal = 0;

    for (const compound of compounds) {
      const mg = calculateConcentration(compound, day);
      if (mg > 0) {
        compoundsData.push({ compoundId: compound.id, mg: Math.round(mg * 100) / 100 });
        dayTotal += mg;
      }
    }

    concentrationCurve.push({ day, totalMg: Math.round(dayTotal * 100) / 100, compounds: compoundsData });
    peakMg = Math.max(peakMg, dayTotal);
    troughMg = Math.min(troughMg, dayTotal);
    totalMg += dayTotal;
  }

  const averageMg = totalMg / simulationDays;

  // Estimate steady state (when trough stops changing significantly)
  let steadyStateDay = simulationDays;
  for (let day = 7; day <= simulationDays; day++) {
    const prevTrough = concentrationCurve[day - 8]?.totalMg ?? 0;
    const currTrough = concentrationCurve[day - 1]?.totalMg ?? 0;
    if (Math.abs(currTrough - prevTrough) / Math.max(prevTrough, 1) < 0.01) {
      steadyStateDay = day;
      break;
    }
  }

  // Accumulation ratio = steady-state AUC / single-dose AUC
  const singleDoseAUC = compounds.reduce((sum, c) => sum + c.doseMg * c.halfLifeDays / Math.log(2), 0);
  const steadyStateAUC = concentrationCurve.slice(-7).reduce((sum, p) => sum + p.totalMg, 0);
  const accumulationRatio = singleDoseAUC > 0 ? steadyStateAUC / singleDoseAUC : 1;

  return {
    concentrationCurve,
    peakMg: Math.round(peakMg * 100) / 100,
    troughMg: Math.round(troughMg * 100) / 100,
    averageMg: Math.round(averageMg * 100) / 100,
    steadyStateDay,
    accumulationRatio: Math.round(accumulationRatio * 100) / 100,
  };
}