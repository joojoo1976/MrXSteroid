import { describe, expect, it } from 'vitest';
import { InjectionSiteHistorySchema, InjectionSiteLogEntrySchema } from './tool-009-injection-site-rotator';

const validEntry = {
  id: '02ed8aa2-e0ad-43c0-84b2-2d15f6e7fd15',
  date: '2026-10-25T12:00:00.000Z',
  site: 'User supplied label',
  location: 'deltoid',
  oil_based: false,
};

describe('Tool 009 user-entered history schema', () => {
  it('accepts a valid history row', () => {
    expect(InjectionSiteLogEntrySchema.safeParse(validEntry).success).toBe(true);
    expect(InjectionSiteHistorySchema.safeParse({ entries: [validEntry] }).success).toBe(true);
  });

  it('rejects missing or invalid user fields', () => {
    expect(InjectionSiteLogEntrySchema.safeParse({ ...validEntry, site: '  ' }).success).toBe(false);
    expect(InjectionSiteLogEntrySchema.safeParse({ ...validEntry, location: 'unsafe-default' }).success).toBe(false);
    expect(InjectionSiteLogEntrySchema.safeParse({ ...validEntry, next_safe_date: '2026-11-01T00:00:00Z' }).success).toBe(false);
  });

  it('bounds history size', () => {
    expect(InjectionSiteHistorySchema.safeParse({ entries: Array(501).fill(validEntry) }).success).toBe(false);
  });
});
