/**
 * lib/engines/core/v4/profiles/protein-needs-evidence-record.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 2: mrx.tool.protein-needs — SPEC v3 documentation record
 * ═══════════════════════════════════════════════════════════════════════════════
 *  The 1.6 / 2.0 / 2.2 g/kg per-goal heuristic is an application-designed SPEC
 *  v3 convention. It is NOT externally validated and has NO clinical review
 *  date. This record exists so the envelope can cite its own documented
 *  convention honestly; it is not evidence of clinical validity, and it must
 *  not be presented as medical advice. The engine remains the sole authority.
 */

import type { EvidenceReference } from '../contracts.v4';

export type ProteinNeedsSpecRecordV4 = Omit<EvidenceReference, 'reviewedAt'> & {
  evidenceId: 'mrx-spec-v3-protein-needs';
  sourceType: 'documentation';
  reviewedAt: null;
  reviewStatus: 'NOT_REVIEWED';
};

export const PROTEIN_NEEDS_SPEC_RECORD: ProteinNeedsSpecRecordV4 = {
  evidenceId: 'mrx-spec-v3-protein-needs',
  sourceType: 'documentation',
  title:
    'MrXSteroid SPEC v3 — Protein Needs Estimate heuristic (goal-based g/kg with an activity-factor adjustment)',
  applicability:
    'General adult users; application-designed estimate of daily protein in grams. Not a medical or clinical target.',
  reviewedAt: null,
  reviewStatus: 'NOT_REVIEWED',
  limitations: [
    'Application-designed heuristic; it is not clinically validated or reviewed.',
    'Not medical advice. Individual needs vary with conditions, sex, age, diet and kidney health.',
    'The activity factor is a coarse user-selected adjustment, not a measurement.',
  ],
  version: '3.0.0',
};

