import { describe, expect, it } from 'vitest';
import { buildStackComparisonWorksheetV7 } from './tool-028-stacking-synergy';

const input = {
  scenarioA: { name: 'Option A', items: ['User item one', 'User item two'], notes: 'A note' },
  scenarioB: { name: 'Option B', items: ['Different item'], notes: 'Another note' },
};

describe('Tool 028 manual comparison engine', () => {
  it('returns user-provided lists without calculating compatibility or synergy', () => {
    const result = buildStackComparisonWorksheetV7(input);
    expect(result).toEqual({
      resultOrigin: 'USER_PROVIDED',
      assessment: 'NOT_AVAILABLE',
      reason: 'NO_VALIDATED_COMPATIBILITY_SOURCE_CONFIGURED',
      ...input,
    });
    expect(result).not.toHaveProperty('score');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('rejects incomplete or malformed input at the engine boundary', () => {
    expect(() => buildStackComparisonWorksheetV7({ ...input, scenarioA: { name: '', items: [] } } as never)).toThrow();
  });

  it('is deterministic for identical input', () => {
    expect(buildStackComparisonWorksheetV7(input)).toEqual(buildStackComparisonWorksheetV7(input));
  });
});
