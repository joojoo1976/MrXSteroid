import { describe, expect, it } from 'vitest';
import { checkDrugInteractions } from './tool-017-drug-interaction';
import { DrugInteractionResultSchema } from '../schemas/tool-017-drug-interaction';

describe('Tool 017 interaction-source availability contract', () => {
  it('returns NOT_AVAILABLE regardless of user-provided content while no verified source is configured', () => {
    const result = checkDrugInteractions({
      compounds: [{ family: 'unknown', is_lipophilic: true }],
      medications: ['warfarin'],
      health_conditions: ['heart condition'],
      age: 45,
    });

    expect(result).toEqual({ status: 'NOT_AVAILABLE', reason: 'NO_VERIFIED_INTERACTION_SOURCE' });
    expect(DrugInteractionResultSchema.safeParse(result).success).toBe(true);
    expect(result).not.toHaveProperty('overall_safety');
    expect(result).not.toHaveProperty('flags');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('rejects result states that could imply a completed negative or positive screen', () => {
    expect(DrugInteractionResultSchema.safeParse({ overall_safety: 'safe', flags: [], summary: 'No interactions' }).success).toBe(false);
    expect(DrugInteractionResultSchema.safeParse({ status: 'NOT_AVAILABLE', reason: 'NO_VERIFIED_INTERACTION_SOURCE', flags: [] }).success).toBe(false);
  });
});
