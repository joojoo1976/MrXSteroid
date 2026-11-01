import { describe, expect, it } from 'vitest';
import { calculateAromatizationRisk } from './tool-006-estrogen-prolactin';
import {
  AromatizationScoreSchema,
  EstrogenProlactinInputSchema,
} from '../schemas/tool-006-estrogen-prolactin';

describe('Tool #006 session-only lab record contract', () => {
  it('never derives risk, findings, or medication doses from entered values', () => {
    const low = calculateAromatizationRisk({
      e2Level: 1,
      e2Unit: 'pg/mL',
      prolactinLevel: 1,
      prolactinUnit: 'ng/mL',
    });
    const high = calculateAromatizationRisk({
      e2Level: 1000,
      e2Unit: 'pmol/L',
      prolactinLevel: 1000,
      prolactinUnit: 'mIU/L',
    });

    expect(low).toEqual({
      status: 'NOT_ASSESSED',
      reasonCode: 'UNVALIDATED_RULES',
      riskLevel: null,
      riskPercentage: null,
      recommendedAIMg: null,
      recommendedDAMg: null,
      keyFindings: [],
    });
    expect(high).toEqual(low);
    expect(AromatizationScoreSchema.safeParse(high).success).toBe(true);
  });

  it('validates values and preserves the selected laboratory units without conversion', () => {
    const valid = {
      e2Level: 250,
      e2Unit: 'pmol/L',
      prolactinLevel: 12,
      prolactinUnit: 'ng/mL',
    };
    expect(EstrogenProlactinInputSchema.parse(valid)).toEqual(valid);
    expect(EstrogenProlactinInputSchema.safeParse({ ...valid, e2Level: -1 }).success).toBe(false);
    expect(EstrogenProlactinInputSchema.safeParse({ ...valid, prolactinLevel: Number.POSITIVE_INFINITY }).success).toBe(false);
    expect(EstrogenProlactinInputSchema.safeParse({ ...valid, e2Unit: 'unknown' }).success).toBe(false);
    expect(EstrogenProlactinInputSchema.safeParse({ ...valid, prolactinLevel: Number.NaN }).success).toBe(false);
  });
});
