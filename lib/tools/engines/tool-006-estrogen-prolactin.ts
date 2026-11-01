/**
 * Tool #006 — Estradiol and Prolactin Record
 *
 * The former implementation generated unreferenced clinical risk scores and
 * aromatase-inhibitor / dopamine-agonist dose suggestions. It is intentionally
 * disabled as a clinical assessment engine until a validated intended-use
 * model and claim-level evidence are reviewed.
 */

export interface EstrogenProlactinInput {
  /** User-entered laboratory value. No conversion or interpretation occurs. */
  e2Level: number;
  e2Unit: 'pg/mL' | 'pmol/L';
  /** User-entered laboratory value. No conversion or interpretation occurs. */
  prolactinLevel: number;
  prolactinUnit: 'ng/mL' | 'mIU/L';
}

export interface AromatizationScore {
  status: 'NOT_ASSESSED';
  reasonCode: 'UNVALIDATED_RULES';
  riskLevel: null;
  riskPercentage: null;
  recommendedAIMg: null;
  recommendedDAMg: null;
  keyFindings: [];
}

/**
 * No clinical interpretation is computed. Input is deliberately unused so
 * lab values, medication names, and compounds cannot yield an implied action.
 */
export function calculateAromatizationRisk(_input: EstrogenProlactinInput): AromatizationScore {
  return {
    status: 'NOT_ASSESSED',
    reasonCode: 'UNVALIDATED_RULES',
    riskLevel: null,
    riskPercentage: null,
    recommendedAIMg: null,
    recommendedDAMg: null,
    keyFindings: [],
  };
}
