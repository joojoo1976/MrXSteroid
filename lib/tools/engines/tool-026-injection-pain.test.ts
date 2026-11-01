import { describe, expect, it } from 'vitest';
import { buildInjectionExperienceSessionV7 } from './tool-026-injection-pain';
import { InjectionExperienceEntrySchema, InjectionExperienceResultSchema } from '../schemas/tool-026-injection-pain';

const entry = InjectionExperienceEntrySchema.parse({
  id: '00000000-0000-4000-8000-000000000026',
  eventDate: '2026-10-25',
  siteLabel: 'User chosen label',
  notes: 'User authored observation.',
});

describe('Tool 026 experience log engine', () => {
  it('returns user notes without interpretation or recommendations', () => {
    const result = buildInjectionExperienceSessionV7([entry]);
    expect(result).toEqual({
      resultOrigin: 'USER_PROVIDED',
      assessment: 'NOT_AVAILABLE',
      reason: 'NO_CLINICAL_ASSESSMENT_CONFIGURED',
      entries: [entry],
    });
    expect(InjectionExperienceResultSchema.safeParse(result).success).toBe(true);
    expect(result).not.toHaveProperty('painScore');
    expect(result).not.toHaveProperty('recommendation');
  });

  it('rejects malformed data at the engine boundary', () => {
    expect(() => buildInjectionExperienceSessionV7([{ ...entry, eventDate: 'not-a-date' } as never])).toThrow();
  });
});
