/**
 * lib/engines/core/v4/profiles/water-intake-evidence-record.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 3: mrx.tool.water-intake — SPEC v3 documentation record
 * ═══════════════════════════════════════════════════════════════════════════════
 *  The 35 mL/kg plus coarse activity adjustment is an application-designed SPEC
 *  v3 convention. It is NOT externally validated and has NO clinical review
 *  date. This record exists so the envelope can cite its own documented
 *  convention honestly; it is not evidence of clinical validity, and it must
 *  not be presented as medical advice. The engine remains the sole authority.
 */

import type { EvidenceReference } from '../contracts.v4';

export type WaterIntakeSpecRecordV4 = Omit<EvidenceReference, 'reviewedAt'> & {
  evidenceId: 'mrx-spec-v3-water-intake';
  sourceType: 'documentation';
  reviewedAt: null;
  reviewStatus: 'NOT_REVIEWED';
};

export const WATER_INTAKE_SPEC_RECORD: WaterIntakeSpecRecordV4 = {
  evidenceId: 'mrx-spec-v3-water-intake',
  sourceType: 'documentation',
  title:
    'MrXSteroid SPEC v3 — Daily Water Intake Estimate heuristic (35 mL per kg with a coarse activity adjustment)',
  applicability:
    'General adult users; application-designed estimate of daily fluid needs in litres. Not a medical or clinical target.',
  reviewedAt: null,
  reviewStatus: 'NOT_REVIEWED',
  limitations: [
    'Application-designed heuristic; it is not clinically validated or reviewed.',
    'Not medical advice. Needs vary with climate, diet, conditions, pregnancy and activity.',
    'Does not account for water from food or other beverages.',
  ],
  version: '3.0.0',
};

