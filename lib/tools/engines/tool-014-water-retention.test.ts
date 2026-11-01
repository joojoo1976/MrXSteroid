import { describe, expect, it } from 'vitest';
import { calculateWaterRetention } from './tool-014-water-retention';
import { WaterRetentionResultSchema } from '../schemas/tool-014-water-retention';

describe('tool 014 unavailable model contract', () => {
  it('returns NOT_AVAILABLE instead of estimates, severity, or treatment advice', () => {
    const result = calculateWaterRetention({ e2_level: 120, weight_kg: 85, compound_stack: [] });
    expect(result).toEqual({ status: 'NOT_AVAILABLE', reason: 'NO_VALIDATED_MODEL' });
    expect(WaterRetentionResultSchema.safeParse(result).success).toBe(true);
    expect(result).not.toHaveProperty('recommendations');
    expect(result).not.toHaveProperty('diuretic_suggestions');
    expect(result).not.toHaveProperty('estimated_retention_liters');
    expect(result).not.toHaveProperty('retention_severity');
    expect(result).not.toHaveProperty('target_weight_loss_kg');
  });
});
