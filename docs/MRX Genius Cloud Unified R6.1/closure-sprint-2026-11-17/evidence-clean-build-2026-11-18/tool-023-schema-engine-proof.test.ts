import { describe, expect, it } from 'vitest';
import { calculateTrtOptimization } from '@/lib/tools/engines/tool-023-trt-optimization';
import { runTrtOptimization } from '@/lib/tools/r6/tool-023-trt-optimization-pipeline';
import { TrtResultSchema } from '@/lib/tools/schemas/tool-023-trt-optimization';

const options = {
  calculatedAt: '2026-11-18T10:00:00.000Z',
  recordedAt: '2026-11-18T10:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

describe('P-03 dependency proof: tool-023 schema vs engine', () => {
  it('accepts the engine output for a full panel and passes the SAME data to the envelope', () => {
    const input = {
      age: 35,
      current_total_test_ng_dL: 400,
      current_free_test_pg_mL: 8,
      symptoms: 'moderate' as const,
      hematocrit_current: 48,
      e2_current_pg_mL: 35,
      trt_duration_months: 12,
      administration: 'intramuscular' as const,
    };
    const direct = calculateTrtOptimization(input);
    const res = runTrtOptimization(input, options);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.output.result).toEqual(direct);
    expect(TrtResultSchema.safeParse(direct).success).toBe(true);
  });

  it('never rejects a valid engine result across the whole input grid', () => {
    const ages = [18, 35, 50, 65, 80];
    const symptoms = ['none', 'mild', 'moderate', 'severe'] as const;
    const admins = ['intramuscular', 'subcutaneous', 'transdermal', 'pellets'] as const;
    const totals = [undefined, 150, 400, 750, 1200];
    const hcts = [undefined, 45, 52, 60];
    const e2s = [undefined, 20, 35, 80];
    const durations = [0, 3, 6, 12, 600];
    let checked = 0;
    for (const age of ages) {
      for (const s of symptoms) {
        for (const a of admins) {
          for (const t of totals) {
            for (const h of hcts) {
              for (const e of e2s) {
                for (const d of durations) {
                  const input = {
                    age,
                    symptoms: s,
                    administration: a,
                    trt_duration_months: d,
                    ...(t === undefined ? {} : { current_total_test_ng_dL: t }),
                    ...(h === undefined ? {} : { hematocrit_current: h }),
                    ...(e === undefined ? {} : { e2_current_pg_mL: e }),
                  };
                  const parsed = TrtResultSchema.safeParse(calculateTrtOptimization(input));
                  expect(parsed.success, JSON.stringify(input)).toBe(true);
                  checked++;
                }
              }
            }
          }
        }
      }
    }
    expect(checked).toBe(5 * 4 * 4 * 5 * 4 * 4 * 5);
  });

  it('rejects an invalid input safely (no throw, no envelope)', () => {
    const res = runTrtOptimization(
      { age: 81, symptoms: 'none', trt_duration_months: 0, administration: 'intramuscular' },
      options,
    );
    expect(res.ok).toBe(false);
    expect(res).not.toHaveProperty('output');
  });

  it('rejects an unknown extra key instead of silently passing it to the engine', () => {
    const res = runTrtOptimization(
      {
        age: 40,
        symptoms: 'none',
        trt_duration_months: 6,
        administration: 'intramuscular',
        body_weight_kg: 90,
      },
      options,
    );
    expect(res.ok).toBe(false);
  });

  it('keeps optional fields truly optional (no labs at all)', () => {
    const res = runTrtOptimization(
      { age: 45, symptoms: 'mild', trt_duration_months: 2, administration: 'subcutaneous' },
      options,
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.output.result.expected_hematocrit).toBeUndefined();
  });
});
