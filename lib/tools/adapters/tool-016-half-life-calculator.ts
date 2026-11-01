import type { KeyFinding } from '../contracts';
import type { HalfLifeInput, HalfLifeResult } from '../schemas/tool-016-half-life-calculator';
import { heuristicProvenance, registeredHeuristicOutput, type HeuristicOutputOptions } from './tool-126-130-common';

/** Publishes only indexed arithmetic outputs; user-provided substance names/sources are omitted. */
export function buildHalfLifeOutput(input: HalfLifeInput, result: HalfLifeResult, options: HeuristicOutputOptions) {
  const findings: KeyFinding[] = [
    ...result.compounds.map((compound, index): KeyFinding => ({
      code: `COMPOUND_SCENARIO_${index + 1}`,
      labelAr: `السيناريو الحسابي ${index + 1}`,
      labelEn: `Calculated scenario ${index + 1}`,
      value: `${compound.elapsed_days.toFixed(2)} days to the user-selected ${compound.remaining_percent}% remaining threshold, using a user-entered ${compound.half_life_days} day half-life.`,
      severity: 'info',
    })),
    {
      code: 'MODEL_SCOPE',
      labelAr: 'حدود النموذج',
      labelEn: 'Model scope',
      value: 'Independent user-entered single-exponential arithmetic scenarios only. Not a clinical clearance, drug-testing, safety, or treatment/PCT recommendation.',
      severity: 'important',
    },
  ];
  const provenance = heuristicProvenance(
    options,
    'days; percent remaining',
    'Single-exponential calculation using user-entered half-life and threshold. Substance names and source text are excluded from assistant findings.',
  );
  return registeredHeuristicOutput('tool-016-half-life-calculator', result, findings, provenance, options);
}
