/**
 * lib/engines/core/v4/profiles/bmi-evidence-record.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 1: mrx.tool.bmi — Documentation evidence record
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Cites the CDC's published BMI-categories documentation for the adult
 *  underweight/normal/overweight/obesity boundaries used by the engine.
 *
 *  This is documentation, not a validated clinical screening result. It does
 *  not replace professional assessment. No clinical review is claimed and no
 *  review date is invented. The engine (`lib/tools/engines/bmi.v6.ts`)
 *  remains the sole numeric authority; its behavior is unchanged.
 */

import type { EvidenceReference } from '../contracts.v4';

export type BmiEvidenceRecordV4 = Omit<EvidenceReference, 'reviewedAt'> & {
  evidenceId: 'cdc-adult-bmi-categories';
  sourceType: 'documentation';
  publishedAt: '2023-12-11';
  reviewedAt: null;
  reviewStatus: 'NOT_REVIEWED';
};

export const BMI_DOCUMENTATION_RECORD: BmiEvidenceRecordV4 = {
  evidenceId: 'cdc-adult-bmi-categories',
  sourceType: 'documentation',
  title:
    'Centers for Disease Control and Prevention. Body Mass Index (BMI). Adult BMI categories are a screening measure, not a diagnosis.',
  url: 'https://www.cdc.gov/bmi/',
  publishedAt: '2023-12-11',
  reviewedAt: null,
  reviewStatus: 'NOT_REVIEWED',
  applicability:
    'General adults. Categories: underweight below 18.5, normal 18.5-24.9, overweight 25.0-29.9, obesity 30.0 and above.',
  limitations: [
    'BMI is a screening measure for population-level weight status; it is not a diagnosis.',
    'BMI does not distinguish fat from muscle and ignores body composition, age, sex and clinical conditions.',
  ],
  version: '2023-12-11',
};

