import { describe, expect, it } from 'vitest';
import { buildMedicationSessionV7 } from './tool-025-drug-interaction-pro';
import { MedicationSessionEntrySchema, MedicationSessionResultSchema } from '../schemas/tool-025-drug-interaction-pro';

const entry = MedicationSessionEntrySchema.parse({
  id: '00000000-0000-4000-8000-000000000025',
  itemName: 'User entered item',
  itemType: 'supplement',
  doseDescription: 'as transcribed from label',
  sourceLabel: 'User supplied label',
});

describe('Tool 025 session record engine', () => {
  it('returns user entries unchanged and marks interaction assessment unavailable', () => {
    const result = buildMedicationSessionV7([entry]);
    expect(result).toEqual({
      resultOrigin: 'USER_PROVIDED',
      interactionAssessment: 'NOT_AVAILABLE',
      reason: 'NO_VALIDATED_INTERACTION_SOURCE_CONFIGURED',
      entries: [entry],
    });
    expect(MedicationSessionResultSchema.safeParse(result).success).toBe(true);
    expect(result).not.toHaveProperty('score');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('does not infer interactions from repeated names or item types', () => {
    const duplicateEntries = [entry, { ...entry, id: '00000000-0000-4000-8000-000000000026' }];
    const result = buildMedicationSessionV7(duplicateEntries);
    expect(result.interactionAssessment).toBe('NOT_AVAILABLE');
    expect(result.entries).toHaveLength(2);
  });

  it('rejects malformed direct engine input', () => {
    expect(() => buildMedicationSessionV7([{ ...entry, itemType: 'unknown' } as never])).toThrow();
  });
});
