// lib/tools/r6/tool-040-lipid-profile-optimizer-contract.test.ts
//
// RED phase for the Tool 040 R6.1 input contract (SPEC-R6.1-2).
//
// The contract describes the fields the USER fills in, the units, the ranges,
// the visibility rules, the public reference sources and the freshness rule.
// It is PURE: no React, no DOM, no I/O, no clock.
import { describe, expect, it } from 'vitest';
import {
  TOOL_040_BANDS,
  TOOL_040_CROSS_TOOL_LINKS,
  TOOL_040_DEBOUNCE_MS,
  TOOL_040_FIELD_CONTRACT,
  TOOL_040_LAB_FRESHNESS_DAYS,
  TOOL_040_SOURCES,
  buildLipidOptimizerCsv,
  daysSinceDate,
  labFreshness,
  type Tool040FieldId,
} from './tool-040-lipid-profile-optimizer-contract';

describe('Tool 040 lipid profile optimizer — input contract', () => {
  it('describes every user-facing field with the attributes SPEC-R6.1-2 requires', () => {
    const ids = TOOL_040_FIELD_CONTRACT.map((field) => field.fieldId);
    expect(ids).toEqual([
      'ldl_mg_dl',
      'hdl_mg_dl',
      'triglycerides_mg_dl',
      'total_cholesterol_mg_dl',
      'panel_date',
      'age',
      'smoker',
      'systolic_bp',
      'on_cycle',
      'weeks_remaining',
    ]);

    for (const field of TOOL_040_FIELD_CONTRACT) {
      expect(field.labelKey.length).toBeGreaterThan(0);
      expect(field.helpKey.length).toBeGreaterThan(0);
      expect(['decimal', 'integer', 'date', 'boolean']).toContain(field.type);
      expect(field.example.length).toBeGreaterThan(0);
      expect(Array.isArray(field.dependsOn)).toBe(true);
      expect(field.visibilityRule).toBeTruthy();
      expect(typeof field.visibilityRule.alwaysVisible).toBe('boolean');
      // A slider is either used, or it is refused with a reason.
      if (!field.slider) expect(field.sliderReasonKey).toBeTruthy();
      // Every range is a real range.
      if (field.min !== null && field.max !== null) expect(field.max).toBeGreaterThan(field.min);
    }
  });

  it('fixes the unit to mg/dL and never converts', () => {
    for (const field of TOOL_040_FIELD_CONTRACT) {
      if (field.fieldId.endsWith('_mg_dl')) expect(field.unit).toBe('mg/dL');
    }
    expect(TOOL_040_FIELD_CONTRACT.find((f) => f.fieldId === 'age')?.unit).toBeNull();
    expect(TOOL_040_FIELD_CONTRACT.find((f) => f.fieldId === 'smoker')?.unit).toBeNull();
  });

  it('requires the panel values and the panel date, and leaves total cholesterol optional', () => {
    const required = TOOL_040_FIELD_CONTRACT.filter((f) => f.required).map((f) => f.fieldId);
    expect(required).toContain('ldl_mg_dl');
    expect(required).toContain('hdl_mg_dl');
    expect(required).toContain('triglycerides_mg_dl');
    expect(required).toContain('panel_date');
    expect(required).not.toContain('total_cholesterol_mg_dl');
  });

  it('offers the slider only for the coarse integer field', () => {
    const withSlider = TOOL_040_FIELD_CONTRACT.filter((f) => f.slider).map((f) => f.fieldId);
    expect(withSlider).toEqual(['age']);
  });

  it('mirrors the engine band ladder so the UI can show it', () => {
    expect(TOOL_040_BANDS.LDL.map((b) => b.band)).toEqual(['optimal', 'borderline', 'high', 'very-high']);
    expect(TOOL_040_BANDS.LDL.find((b) => b.band === 'optimal')?.upperExclusive).toBe(100);
    expect(TOOL_040_BANDS.HDL.find((b) => b.band === 'optimal')?.lowerInclusive).toBe(60);
    expect(TOOL_040_BANDS.TG.find((b) => b.band === 'very-high')?.lowerInclusive).toBe(500);
  });

  it('lists only public references, each with a publisher, a date, a level and a link', () => {
    expect(TOOL_040_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const source of TOOL_040_SOURCES) {
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.publisher.length).toBeGreaterThan(0);
      expect(source.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['E1', 'E2', 'E3']).toContain(source.evidenceLevel);
    }
  });

  it('binds the cross-tool links with a freshness rule and a stale action', () => {
    expect(TOOL_040_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_040_CROSS_TOOL_LINKS) {
      expect(link.sourceToolId).toBe('tool-040-lipid-profile-optimizer');
      expect(link.mappedFields.length).toBeGreaterThan(0);
      expect(link.freshnessRule.length).toBeGreaterThan(0);
      expect(link.staleAction.length).toBeGreaterThan(0);
      // Nothing moves between tools without an explicit owner decision (W18).
      expect(link.transfer).toBe('manual-reentry');
    }
  });

  it('applies the lab freshness rule at read time', () => {
    expect(TOOL_040_LAB_FRESHNESS_DAYS).toBe(90);
    expect(daysSinceDate('2026-02-01', '2026-03-01')).toBe(28);
    expect(labFreshness('2026-02-01', '2026-03-01').stale).toBe(false);
    expect(labFreshness('2026-01-01', '2026-06-01').stale).toBe(true);
    expect(labFreshness('2026-01-01', '2026-06-01').ageDays).toBe(151); // 2026 is not a leap year
  });

  it('exports the panel and the computed bands as CSV', () => {
    const csv = buildLipidOptimizerCsv(
      {
        panel: { ldl_mg_dl: 160, hdl_mg_dl: 38, triglycerides_mg_dl: 210 },
        age: 45,
        smoker: true,
        systolic_bp: 145,
        on_cycle: true,
        weeks_remaining: 8,
      },
      {
        ldl_status: 'very-high',
        hdl_status: 'high',
        tg_status: 'high',
        non_hdl: 160,
        overall_band: 'very-high',
        interventions: ['a'],
      },
    );
    expect(csv).toContain('ldl_mg_dl');
    expect(csv).toContain('160');
    expect(csv).toContain('very-high');
    expect(csv).toContain('smoker');
  });

  it('debounces the calculation like every other R6 tool', () => {
    expect(TOOL_040_DEBOUNCE_MS).toBe(120);
  });

  it('keeps every field id unique and resolvable', () => {
    const ids = TOOL_040_FIELD_CONTRACT.map((f) => f.fieldId);
    expect(new Set(ids).size).toBe(ids.length);
    const known: Tool040FieldId[] = [
      'ldl_mg_dl', 'hdl_mg_dl', 'triglycerides_mg_dl', 'total_cholesterol_mg_dl',
      'panel_date', 'age', 'smoker', 'systolic_bp', 'on_cycle', 'weeks_remaining',
    ];
    for (const id of ids) expect(known).toContain(id);
  });
});
// Appended to lib/tools/r6/tool-040-lipid-profile-optimizer-contract.test.ts
//
// ACC-R6.1-3.b — a timezone test. The panel date is a calendar date, not an
// instant, so the freshness rule must give the same answer on every machine
// and across every daylight-saving boundary.
import { describe, expect, it } from 'vitest';
import { daysSinceDate, labFreshness } from './tool-040-lipid-profile-optimizer-contract';

describe('Tool 040 — the panel date is a calendar date, not an instant', () => {
  it('computes the age in a timezone-free way (same result across DST boundaries)', () => {
    // 2026-03-08 is the US spring-forward date; 2026-11-01 the autumn one.
    expect(daysSinceDate('2026-02-08', '2026-03-08')).toBe(28);
    expect(daysSinceDate('2026-09-01', '2026-11-01')).toBe(61);
    // The freshness boundary is exact: 90 days is fresh, 91 is stale.
    expect(labFreshness('2026-08-15', '2026-11-13').stale).toBe(false);
    expect(labFreshness('2026-08-14', '2026-11-13').stale).toBe(true);
    // A future date is not "stale" — it is simply not older than the window.
    expect(labFreshness('2026-12-01', '2026-11-13').stale).toBe(false);
  });

  it('returns null for a date that is not a real calendar date', () => {
    expect(daysSinceDate('2026-02-30', '2026-03-01')).toBeNull();
    expect(daysSinceDate('not-a-date', '2026-03-01')).toBeNull();
    expect(labFreshness('2026-02-30', '2026-03-01').ageDays).toBeNull();
  });
});
