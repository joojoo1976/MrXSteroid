import { describe, expect, it } from 'vitest';
import { InjectionExperienceEntrySchema, InjectionExperienceInputSchema } from './tool-026-injection-pain';

const validEntry = {
  id: '00000000-0000-4000-8000-000000000026',
  eventDate: '2026-10-25',
  notes: 'A user-authored observation.',
};

describe('Tool 026 experience log schemas', () => {
  it('requires a valid calendar date and non-empty note', () => {
    expect(InjectionExperienceEntrySchema.safeParse(validEntry).success).toBe(true);
    expect(InjectionExperienceEntrySchema.safeParse({ ...validEntry, eventDate: '2026-02-30' }).success).toBe(false);
    expect(InjectionExperienceEntrySchema.safeParse({ ...validEntry, notes: ' ' }).success).toBe(false);
  });

  it('rejects out-of-size fields and unknown clinical fields', () => {
    expect(InjectionExperienceEntrySchema.safeParse({ ...validEntry, notes: 'x'.repeat(501) }).success).toBe(false);
    expect(InjectionExperienceEntrySchema.safeParse({ ...validEntry, painScore: 100 }).success).toBe(false);
  });

  it('permits empty sessions but enforces maximum size and unique IDs', () => {
    expect(InjectionExperienceInputSchema.safeParse({ entries: [] }).success).toBe(true);
    expect(InjectionExperienceInputSchema.safeParse({ entries: Array.from({ length: 101 }, (_, index) => ({
      ...validEntry,
      id: `00000000-0000-4000-8000-${String(index + 26).padStart(12, '0')}`,
    })) }).success).toBe(false);
    expect(InjectionExperienceInputSchema.safeParse({ entries: [validEntry, validEntry] }).success).toBe(false);
  });
});
