import { describe, expect, it } from 'vitest';
import { calculateStackTiming } from './tool-022-half-life-stacker';
import { StackTimingInputSchema, StackTimingResultSchema } from '../schemas/tool-022-half-life-stacker';

const input = {
  compounds: [{
    id: 1,
    name_en: 'Example compound',
    name_ar: 'مركب تجريبي',
    family: 'example',
    ester_type: 'enanthate' as const,
    half_life_days: 4,
    release_rate: 'medium' as const,
    anabolic_score: 10,
    androgenic_score: 10,
    description_text: 'Test fixture only',
  }],
  cycle_length_weeks: 8,
  injection_frequency: '1x-week' as const,
};

describe('Tool 022 input and result contract', () => {
  it('validates the input and exposes arithmetic timing without a confidence score', () => {
    expect(StackTimingInputSchema.safeParse(input).success).toBe(true);
    const result = calculateStackTiming(input);
    expect(StackTimingResultSchema.safeParse(result).success).toBe(true);
    expect(result.peak_platform_days).toBe(10);
    expect(result.washout_complete_days).toBe(18);
    expect(result.optimal_injection_schedule).toHaveLength(8);
    expect(result).not.toHaveProperty('confidence_score');
  });

  it('rejects empty compound selections and invalid cycle lengths', () => {
    expect(() => calculateStackTiming({ ...input, compounds: [] })).toThrow();
    expect(() => calculateStackTiming({ ...input, cycle_length_weeks: 0 })).toThrow();
  });

  it('does not require a user-goal selector for the timing calculation', () => {
    expect(StackTimingInputSchema.safeParse(input).success).toBe(true);
  });

  it('supports the maximum daily schedule allowed by the input schema', () => {
    const result = calculateStackTiming({ ...input, cycle_length_weeks: 52, injection_frequency: 'daily' });
    expect(result.optimal_injection_schedule).toHaveLength(364);
    expect(StackTimingResultSchema.safeParse(result).success).toBe(true);
  });
});
