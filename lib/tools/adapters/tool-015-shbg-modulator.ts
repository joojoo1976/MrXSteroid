import type { KeyFinding } from '../contracts';
import type { SHBGInput, SHBGResult } from '../schemas/tool-015-shbg-modulator';
import { heuristicProvenance, registeredHeuristicOutput, type HeuristicOutputOptions } from './tool-126-130-common';

/** Publishes calculated lab-derived values and model provenance, without interpretation. */
export function buildSHBGOutput(input: SHBGInput, result: SHBGResult, options: HeuristicOutputOptions) {
  const findings: KeyFinding[] = [
    {
      code: 'CALCULATED_FREE_TESTOSTERONE',
      labelAr: 'التستوستيرون الحر المحسوب',
      labelEn: 'Calculated free testosterone',
      value: `${result.free_testosterone_ng_dL.toFixed(2)} ng/dL (${result.free_testosterone_nmol_L.toFixed(3)} nmol/L)`,
      severity: 'info',
    },
    {
      code: 'CALCULATED_BIOAVAILABLE_TESTOSTERONE',
      labelAr: 'التستوستيرون المتاح حيوياً المحسوب',
      labelEn: 'Calculated bioavailable testosterone',
      value: `${result.bioavailable_testosterone_ng_dL.toFixed(2)} ng/dL (${result.bioavailable_testosterone_nmol_L.toFixed(3)} nmol/L)`,
      severity: 'info',
    },
    {
      code: 'FREE_TESTOSTERONE_PERCENTAGE',
      labelAr: 'نسبة التستوستيرون الحر المحسوبة',
      labelEn: 'Calculated free testosterone percentage',
      value: `${result.free_testosterone_percentage.toFixed(2)}%`,
      severity: 'info',
    },
    {
      code: 'FORMULA_AND_SCOPE',
      labelAr: 'المعادلة والنطاق',
      labelEn: 'Formula and scope',
      value: 'Vermeulen mass-action calculation from total testosterone, SHBG, and albumin. Arithmetic output only; no reference-range classification, diagnosis, or treatment advice.',
      severity: 'important',
    },
  ];
  const provenance = heuristicProvenance(
    options,
    'ng/dL; nmol/L; %',
    'Vermeulen mass-action calculation from user-entered total testosterone, SHBG, and albumin; not a diagnosis or reference-range assessment.',
  );

  return registeredHeuristicOutput('tool-015-shbg-modulator', result, findings, provenance, options);
}
