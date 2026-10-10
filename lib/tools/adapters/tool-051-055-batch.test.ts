/**
 * Tools #051–#055 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildPeptideDoseOutput } from './tool-051-peptide-dosage-calculator';
import { buildGrowthHormoneOutput } from './tool-052-growth-hormone-protocol-planner';
import { buildInsulinConversionOutput } from './tool-053-insulin-conversion-calculator';
import { buildGlucoseOutput } from './tool-054-glucose-tracker';
import { buildInsulinSensitivityOutput } from './tool-055-insulin-sensitivity-optimizer';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 051-055 adapters — canonical envelope', () => {
  it('051 wraps peptide dosing with registry identity', () => {
    const out = buildPeptideDoseOutput({ vial_mg: 5, bac_water_ml: 2, desired_dose_mg: 0.25 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.051-peptide-dosage-calculator');
    expect(out.toolSlug).toBe('tool-051-peptide-dosage-calculator');
    expect(out.result.draw_units_u100).toBe(10);
    expect(out.keyFindings.some((f) => f.code === 'DRAW_UNITS')).toBe(true);
    expect(out.provenance.unit).toBe('IU');
  });

  it('052 wraps GH planning with registry identity', () => {
    const out = buildGrowthHormoneOutput(
      { bodyweight_kg: 85, weekly_iu_total: 14, protocol_pattern: '5on2off', months: 6, cost_per_iu_usd: 8 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.052-growth-hormone-protocol-planner');
    expect(out.result.daily_iu_on_days).toBe(2.8);
    expect(out.keyFindings.some((f) => f.code === 'DAILY_IU')).toBe(true);
    expect(out.provenance.unit).toBe('IU/day');
  });

  it('053 wraps insulin conversion with registry identity', () => {
    const out = buildInsulinConversionOutput({ concentration: 'u100', dose_iu: 10 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.053-insulin-conversion-calculator');
    expect(out.result.volume_ml).toBe(0.1);
    expect(out.result.draw_units_u40).toBe(4);
    expect(out.keyFindings.some((f) => f.code === 'VOLUME_ML')).toBe(true);
    expect(out.provenance.unit).toBe('ml');
  });

  it('054 wraps glucose tracking with registry identity', () => {
    const out = buildGlucoseOutput(
      {
        readings: [
          { mg_dl: 92, date: '2026-01-01', fasting: true },
          { mg_dl: 96, date: '2026-01-02', fasting: true },
          { mg_dl: 98, date: '2026-01-03', fasting: true },
        ],
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.054-glucose-tracker');
    expect(out.result.fasting_avg).toBe(95.3);
    expect(out.result.band).toBe('normal');
    expect(out.keyFindings.some((f) => f.code === 'FASTING_AVG')).toBe(true);
    expect(out.provenance.unit).toBe('mg/dL');
  });

  it('055 wraps insulin sensitivity with registry identity', () => {
    const out = buildInsulinSensitivityOutput(
      { fasting_glucose: 90, fasting_insulin: 8, weekly_training_sessions: 4, sleep_hours: 8 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.055-insulin-sensitivity-optimizer');
    expect(out.result.homa_ir).toBe(1.78);
    expect(out.result.band).toBe('average');
    expect(out.keyFindings.some((f) => f.code === 'HOMA_IR')).toBe(true);
    expect(out.provenance.unit).toBe('HOMA-IR');
  });
});
