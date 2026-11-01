import { describe, expect, it } from 'vitest';
import { MedicationSessionEntrySchema, MedicationSessionInputSchema } from './tool-025-drug-interaction-pro';

const validEntry = {
  id: '00000000-0000-4000-8000-000000000025',
  itemName: 'Entered item',
  itemType: 'prescription',
};

describe('Tool 025 session schemas', () => {
  it('accepts supported item types with optional user notes', () => {
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, notes: 'entered by user' }).success).toBe(true);
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, itemType: 'unknown' }).success).toBe(false);
  });

  it('rejects missing names, invalid IDs, oversized strings, and unrecognized fields', () => {
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, itemName: ' ' }).success).toBe(false);
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, id: 'bad-id' }).success).toBe(false);
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, notes: 'x'.repeat(241) }).success).toBe(false);
    expect(MedicationSessionEntrySchema.safeParse({ ...validEntry, interactionSeverity: 'critical' }).success).toBe(false);
  });

  it('allows an empty session but enforces the 50-entry limit and unique IDs', () => {
    expect(MedicationSessionInputSchema.safeParse({ entries: [] }).success).toBe(true);
    expect(MedicationSessionInputSchema.safeParse({ entries: Array.from({ length: 51 }, (_, index) => ({
      ...validEntry,
      id: `00000000-0000-4000-8000-${String(index + 25).padStart(12, '0')}`,
    })) }).success).toBe(false);
    expect(MedicationSessionInputSchema.safeParse({ entries: [validEntry, validEntry] }).success).toBe(false);
  });
});
