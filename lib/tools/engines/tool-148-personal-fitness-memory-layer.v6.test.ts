import { describe, expect, it } from 'vitest';
import { selectPersonalContextForTool, validatePersonalFitnessContextItem, validatePersonalFitnessContextList } from './tool-148-personal-fitness-memory-layer.v6';

const base = {
  id: 'weight-1',
  field: 'current_weight_kg',
  value: 85,
  unit: 'kg',
  source: 'user measurement',
  recordedOn: '2026-10-25',
};
const consentTime = '2026-10-25T12:00:00.000Z';

describe('Tool 148 session-context contract', () => {
  it('defaults sharing to false', () => {
    const result = validatePersonalFitnessContextItem(base);
    expect(result.status).toBe('READY');
    if (result.status === 'READY') expect(result.item.shareWithTool149).toBe(false);
  });

  it('rejects unknown fields, invalid ranges, and non-canonical units', () => {
    expect(validatePersonalFitnessContextItem({ ...base, field: 'current_weight_kg', value: Number.POSITIVE_INFINITY }).status).toBe('INVALID_INPUT');
    expect(validatePersonalFitnessContextItem({ ...base, field: 'current_body_fat_pct', value: 80, unit: '%' }).status).toBe('INVALID_INPUT');
    expect(validatePersonalFitnessContextItem({ ...base, unit: 'lb' }).status).toBe('INVALID_INPUT');
    expect(validatePersonalFitnessContextItem({ ...base, shareWithTool149: true }).status).toBe('INVALID_INPUT');
    expect(validatePersonalFitnessContextItem({ ...base, extra: true }).status).toBe('INVALID_INPUT');
  });

  it('rejects duplicate ids and over-capacity session lists', () => {
    expect(validatePersonalFitnessContextList([{ ...base, shareWithTool149: false }, { ...base, shareWithTool149: true }]).valid).toBe(false);
    const entries = Array.from({ length: 31 }, (_, index) => ({ ...base, id: `weight-${index}` }));
    expect(validatePersonalFitnessContextList(entries).valid).toBe(false);
  });

  it('returns only values explicitly shared with Tool 149', () => {
    const entries = [
      { ...base, id: 'private', shareWithTool149: false },
      { ...base, id: 'shared', shareWithTool149: true, shareGrantedAt: consentTime },
      { ...base, id: 'body-fat-shared', field: 'current_body_fat_pct', value: 18, unit: '%', shareWithTool149: true, shareGrantedAt: consentTime },
    ];
    const selected = selectPersonalContextForTool(entries, 'tool-149-physique-trajectory-simulator');
    expect(selected).toHaveLength(2);
    expect(selected[0]).toMatchObject({
      resultId: 'shared',
      sourceToolId: 'tool-148-personal-fitness-memory-layer',
      privacyClass: 'SENSITIVE',
      consent: { grantedAt: consentTime, targetToolIds: ['tool-149-physique-trajectory-simulator'] },
      fields: [{ key: 'current_weight_kg', value: 85, unit: 'kg', origin: 'USER_PROVIDED', sourceLabel: 'User-entered value' }],
    });
    expect(selected[0].fields[0]).not.toHaveProperty('recordedAt');
    expect(selected[0].fields[0].sourceLabel).not.toContain('user measurement');
    expect(selected[1].fields).toEqual([
      expect.objectContaining({ key: 'current_body_fat_pct', value: 18, unit: '%', origin: 'USER_PROVIDED' }),
    ]);
    expect(selected.flatMap((envelope) => envelope.fields.map((field) => field.key))).toEqual(['current_weight_kg', 'current_body_fat_pct']);
  });

  it('fails closed for invalid context before sharing', () => {
    expect(selectPersonalContextForTool([{ ...base, shareWithTool149: true, shareGrantedAt: consentTime }, { ...base, id: 'invalid', value: 900, shareWithTool149: true, shareGrantedAt: consentTime }], 'tool-149-physique-trajectory-simulator')).toEqual([]);
  });
});
