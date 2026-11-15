// lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts
// Proves the R6.1 input-contract mirror still agrees with the authoritative
// V6 engine, and that the freshness rule behaves as specified.
import { describe, expect, it } from 'vitest';
import { trackLiverEnzymes } from '@/lib/tools/engines/tool-039-liver-enzyme-tracker';
import { LiverTrackerInputSchema } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import {
  TOOL_039_ALCOHOL_RANGE,
  TOOL_039_CROSS_TOOL_LINKS,
  TOOL_039_DEBOUNCE_MS,
  TOOL_039_FIELD_CONTRACT,
  TOOL_039_LAB_FRESHNESS_DAYS,
  TOOL_039_MARKERS,
  TOOL_039_MAX_READINGS,
  TOOL_039_REFERENCE_LIMITS,
  TOOL_039_RELATED_TOOL_SLUGS,
  TOOL_039_SOURCES,
  TOOL_039_STATUS_THRESHOLDS,
  TOOL_039_VALUE_RANGE,
  buildLiverTrackerCsv,
  classifyAcgElevation,
  computeDeRitisRatio,
  daysSinceDate,
  labFreshness,
} from './tool-039-liver-enzyme-tracker-contract';

describe('Tool 039 R6.1 input contract', () => {
  it('mirrors the engine reference limits and status thresholds exactly', () => {
    for (const marker of TOOL_039_MARKERS) {
      const reference = TOOL_039_REFERENCE_LIMITS[marker];
      const probe = 1000;
      const result = trackLiverEnzymes({
        readings: [{ marker, value: probe, unit: reference.unit, date: '2026-01-01' }],
        oral_steroids: false,
        alcohol_drinks_per_week: 0,
        uses_tudca: false,
      });
      const computed = result.markers.find((m) => m.marker === marker);
      expect(computed, `engine must return ${marker}`).toBeDefined();
      // Engine multiple = round(value / uln, 2) — the mirror must produce it.
      expect(computed!.uln_multiple).toBe(Math.round((probe / reference.uln) * 100) / 100);
    }

    // Threshold semantics: 1x/3x/5x of the limit.
    const statusAt = (marker: 'ALT', factor: number) => {
      const reference = TOOL_039_REFERENCE_LIMITS[marker];
      const result = trackLiverEnzymes({
        readings: [{ marker, value: reference.uln * factor, unit: reference.unit, date: '2026-01-01' }],
        oral_steroids: false,
        alcohol_drinks_per_week: 0,
        uses_tudca: false,
      });
      return result.markers.find((m) => m.marker === marker)!.status;
    };
    expect(statusAt('ALT', TOOL_039_STATUS_THRESHOLDS.elevatedAbove + 0.5)).toBe('elevated');
    expect(statusAt('ALT', TOOL_039_STATUS_THRESHOLDS.highAt)).toBe('high');
    expect(statusAt('ALT', TOOL_039_STATUS_THRESHOLDS.criticalAt)).toBe('critical');
  });

  it('mirrors the Zod schema bounds (no silent widening or narrowing)', () => {
    const valueAt = (value: number) =>
      LiverTrackerInputSchema.safeParse({
        readings: [{ marker: 'ALT', value, unit: 'U/L', date: '2026-01-01' }],
        oral_steroids: false,
        alcohol_drinks_per_week: 0,
        uses_tudca: false,
      }).success;

    expect(valueAt(TOOL_039_VALUE_RANGE.min)).toBe(true);
    expect(valueAt(TOOL_039_VALUE_RANGE.max)).toBe(true);
    expect(valueAt(TOOL_039_VALUE_RANGE.max + 1)).toBe(false);
    expect(valueAt(TOOL_039_VALUE_RANGE.min - 1)).toBe(false);

    const alcoholAt = (value: number) =>
      LiverTrackerInputSchema.safeParse({
        readings: [{ marker: 'ALT', value: 45, unit: 'U/L', date: '2026-01-01' }],
        oral_steroids: false,
        alcohol_drinks_per_week: value,
        uses_tudca: false,
      }).success;
    expect(alcoholAt(TOOL_039_ALCOHOL_RANGE.min)).toBe(true);
    expect(alcoholAt(TOOL_039_ALCOHOL_RANGE.max)).toBe(true);
    expect(alcoholAt(TOOL_039_ALCOHOL_RANGE.max + 1)).toBe(false);
  });

  it('declares every required field with a label key, a help key and a range', () => {
    const ids = TOOL_039_FIELD_CONTRACT.map((field) => field.fieldId);
    expect(ids).toEqual([
      'reading_marker',
      'reading_value',
      'reading_unit',
      'reading_date',
      'oral_steroids',
      'uses_tudca',
      'alcohol_drinks_per_week',
    ]);
    for (const field of TOOL_039_FIELD_CONTRACT) {
      expect(field.labelKey.length).toBeGreaterThan(0);
      expect(field.helpKey.length).toBeGreaterThan(0);
      expect(field.required).toBe(true);
      expect(field.example.length).toBeGreaterThan(0);
      expect(Array.isArray(field.dependsOn)).toBe(true);
      expect(field.visibilityRule.alwaysVisible).toBe(true);
      expect(field.visibilityRule.condition).toBeNull();
      expect(field.visibilityRule.reason.length).toBeGreaterThan(20);
      if (field.slider) {
        expect(field.sliderReasonKey).toBeNull();
      } else {
        expect(field.sliderReasonKey).toBeTruthy();
      }
    }
  });

  it('declares the dependsOn edges the UI actually honours', () => {
    const byId = new Map(TOOL_039_FIELD_CONTRACT.map((field) => [field.fieldId, field]));
    expect(byId.get('reading_value')?.dependsOn).toEqual(['reading_marker']);
    expect(byId.get('reading_unit')?.dependsOn).toEqual(['reading_marker']);
    expect(byId.get('uses_tudca')?.dependsOn).toEqual(['oral_steroids']);
    expect(byId.get('reading_marker')?.dependsOn).toEqual([]);
    expect(byId.get('reading_date')?.dependsOn).toEqual([]);
    expect(byId.get('oral_steroids')?.dependsOn).toEqual([]);
    expect(byId.get('alcohol_drinks_per_week')?.dependsOn).toEqual([]);
    // Every dependency target must itself be a declared field.
    const declared = new Set(TOOL_039_FIELD_CONTRACT.map((field) => field.fieldId));
    for (const field of TOOL_039_FIELD_CONTRACT) {
      for (const dependency of field.dependsOn) {
        expect(declared.has(dependency)).toBe(true);
      }
    }
  });

  it('keeps the slider only on the coarse integer field (precision rule)', () => {
    const sliderFields = TOOL_039_FIELD_CONTRACT.filter((field) => field.slider).map((f) => f.fieldId);
    expect(sliderFields).toEqual(['alcohol_drinks_per_week']);
  });

  it('publishes sources with publisher, review date, evidence level and link', () => {
    expect(TOOL_039_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const source of TOOL_039_SOURCES) {
      expect(source.publisher.length).toBeGreaterThan(0);
      expect(source.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.evidenceLevel).toBe('E2');
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.titleKey.length).toBeGreaterThan(0);
      expect(source.publisherKey.length).toBeGreaterThan(0);
      expect(source.noteKey.length).toBeGreaterThan(0);
    }
  });

  it('applies the 90-day lab freshness rule', () => {
    expect(TOOL_039_LAB_FRESHNESS_DAYS).toBe(90);
    expect(daysSinceDate('2026-01-01', '2026-01-31')).toBe(30);
    expect(labFreshness('2026-01-01', '2026-01-31')).toEqual({ ageDays: 30, stale: false });
    expect(labFreshness('2026-01-01', '2026-06-01')).toEqual({ ageDays: 151, stale: true });
    expect(labFreshness('2026-01-01', '2026-01-01')).toEqual({ ageDays: 0, stale: false });
  });

  it('lists related tools and the maximum reading count', () => {
    expect(TOOL_039_RELATED_TOOL_SLUGS).toContain('tool-024-bloodwork-interpreter');
    expect(TOOL_039_MAX_READINGS).toBe(100);
  });

  it('computes dates in a timezone-free way (same result across DST boundaries)', () => {
    // The freshness rule works on calendar dates, not instants: a reading stays
    // "30 days old" across a daylight-saving change and across UTC offsets.
    expect(daysSinceDate('2026-03-01', '2026-03-31')).toBe(30);
    expect(daysSinceDate('2026-10-25', '2026-11-24')).toBe(30);
    expect(daysSinceDate('2026-01-01', '2026-04-01')).toBe(90);
    expect(labFreshness('2026-01-01', '2026-04-01')).toEqual({ ageDays: 90, stale: false });
    expect(labFreshness('2026-01-01', '2026-04-02')).toEqual({ ageDays: 91, stale: true });
    expect(daysSinceDate('2026-06-15', '2026-06-15')).toBe(0);
  });

  it('declares the cross-tool link contract on every link', () => {
    expect(TOOL_039_CROSS_TOOL_LINKS.length).toBeGreaterThanOrEqual(2);
    for (const link of TOOL_039_CROSS_TOOL_LINKS) {
      // SPEC-R6.1-2: sourceToolId + targetToolId + mappedFields + freshnessRule + staleAction.
      expect(link.sourceToolId).toBe('mrx.tool.039-liver-enzyme-tracker');
      expect(link.targetToolId).toMatch(/^mrx\.tool\./);
      expect(link.targetSlug).toMatch(/^tool-\d{3}-/);
      expect(Array.isArray(link.mappedFields)).toBe(true);
      expect(link.freshnessRule.source).toBe('lab');
      expect(link.freshnessRule.maxAgeDays).toBe(TOOL_039_LAB_FRESHNESS_DAYS);
      expect(link.staleAction).toBe('mark-stale-and-ask-user-to-refresh');
      // No automatic transfer until W18 is approved.
      expect(link.transfer).toBe('manual-reentry');
      if (link.mappedFields.length === 0) {
        expect(link.noSharedFieldReason).toBeTruthy();
      } else {
        expect(link.noSharedFieldReason).toBeNull();
        for (const field of link.mappedFields) {
          expect(field.from.length).toBeGreaterThan(0);
          expect(field.to.length).toBeGreaterThan(0);
          expect(field.note.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('maps the liver analytes with their units and no conversion', () => {
    const interpreter = TOOL_039_CROSS_TOOL_LINKS.find((link) => link.targetSlug === 'tool-024-bloodwork-interpreter');
    expect(interpreter).toBeDefined();
    const alt = interpreter!.mappedFields.find((field) => field.from.includes('ALT'));
    expect(alt?.to).toBe('alt');
    expect(alt?.unit).toBe('U/L');
    const bilirubin = interpreter!.mappedFields.find((field) => field.from.includes('bilirubin'));
    expect(bilirubin?.unit).toBe('mg/dL');
    // The hematocrit monitor shares no analyte and says so.
    const hematocrit = TOOL_039_CROSS_TOOL_LINKS.find((link) => link.targetSlug === 'tool-041-hematocrit-monitor');
    expect(hematocrit?.mappedFields).toHaveLength(0);
    expect(hematocrit?.noSharedFieldReason).toBeTruthy();
  });

  it('debounces the result engine with a declared window', () => {
    expect(TOOL_039_DEBOUNCE_MS).toBeGreaterThan(0);
    expect(TOOL_039_DEBOUNCE_MS).toBeLessThanOrEqual(500);
  });

  it('exports a CSV with the readings, the answers and the computed result', () => {
    const csv = buildLiverTrackerCsv(
      {
        readings: [
          { marker: 'ALT', value: 112, unit: 'U/L', date: '2026-01-01' },
          { marker: 'bilirubin', value: 1.2, unit: 'mg/dL', date: '2026-01-01' },
        ],
        oral_steroids: true,
        alcohol_drinks_per_week: 3,
        uses_tudca: false,
      },
      {
        overall_status: 'elevated',
        stop_orals: false,
        markers: [
          { marker: 'ALT', latest_value: 112, unit: 'U/L', uln_multiple: 2, status: 'elevated', trend_per_30d: 0 },
        ],
        recommendations: ['LFTs, mildly elevated'],
      },
    );
    expect(csv).toContain('ALT,112,U/L,2026-01-01');
    expect(csv).toContain('overall_status,elevated');
    expect(csv).toContain('alcohol_drinks_per_week,3');
    expect(csv).toContain('uses_tudca,false');
    expect(csv).toContain('uln_multiple');
    expect(csv).toContain('LFTs, mildly elevated');
  });

  describe('P-01: ACG 2017 Elevation Classification', () => {
    it('classifies normal when multiple <= 1.0', () => {
      expect(classifyAcgElevation(0.8, 45)).toBe('normal');
      expect(classifyAcgElevation(1.0, 56)).toBe('normal');
    });

    it('classifies borderline when 1.0 < multiple < 2.0', () => {
      expect(classifyAcgElevation(1.1, 62)).toBe('borderline');
      expect(classifyAcgElevation(1.99, 111)).toBe('borderline');
    });

    it('classifies mild when 2.0 <= multiple < 5.0', () => {
      expect(classifyAcgElevation(2.0, 112)).toBe('mild');
      expect(classifyAcgElevation(4.9, 274)).toBe('mild');
    });

    it('classifies moderate when 5.0 <= multiple <= 15.0', () => {
      expect(classifyAcgElevation(5.0, 280)).toBe('moderate');
      expect(classifyAcgElevation(15.0, 840)).toBe('moderate');
    });

    it('classifies severe when multiple > 15.0 and absolute <= 10000', () => {
      expect(classifyAcgElevation(15.1, 845)).toBe('severe');
      expect(classifyAcgElevation(50.0, 2800)).toBe('severe');
    });

    it('classifies massive when absolute value > 10,000 IU/L', () => {
      expect(classifyAcgElevation(200.0, 10500)).toBe('massive');
      expect(classifyAcgElevation(5.0, 12000)).toBe('massive');
    });
  });

  describe('P-02: De Ritis Ratio (AST/ALT)', () => {
    it('computes exact ratio when ALT and AST have matching date and unit', () => {
      const readings = [
        { marker: 'ALT' as const, value: 50, unit: 'U/L', date: '2026-03-01' },
        { marker: 'AST' as const, value: 40, unit: 'U/L', date: '2026-03-01' },
      ];
      const result = computeDeRitisRatio(readings);
      expect(result).not.toBeNull();
      expect(result?.ratio).toBe(0.8);
      expect(result?.drawDate).toBe('2026-03-01');
      expect(result?.interpretation).toBe('ast_lt_alt');
    });

    it('interprets ratio >= 1.0 correctly', () => {
      const readings = [
        { marker: 'ALT' as const, value: 40, unit: 'U/L', date: '2026-03-01' },
        { marker: 'AST' as const, value: 80, unit: 'U/L', date: '2026-03-01' },
      ];
      const result = computeDeRitisRatio(readings);
      expect(result?.ratio).toBe(2.0);
      expect(result?.interpretation).toBe('ast_gt_alt');
    });

    it('returns null when draw dates do not match', () => {
      const readings = [
        { marker: 'ALT' as const, value: 50, unit: 'U/L', date: '2026-03-01' },
        { marker: 'AST' as const, value: 40, unit: 'U/L', date: '2026-03-02' },
      ];
      expect(computeDeRitisRatio(readings)).toBeNull();
    });

    it('returns null when ALT is missing or AST is missing', () => {
      expect(computeDeRitisRatio([{ marker: 'ALT' as const, value: 50, unit: 'U/L', date: '2026-03-01' }])).toBeNull();
      expect(computeDeRitisRatio([{ marker: 'AST' as const, value: 40, unit: 'U/L', date: '2026-03-01' }])).toBeNull();
    });

    it('returns null when ALT is 0 to prevent division by zero', () => {
      const readings = [
        { marker: 'ALT' as const, value: 0, unit: 'U/L', date: '2026-03-01' },
        { marker: 'AST' as const, value: 40, unit: 'U/L', date: '2026-03-01' },
      ];
      expect(computeDeRitisRatio(readings)).toBeNull();
    });

    it('returns null when multiple conflicting readings exist for same marker on same date', () => {
      const readings = [
        { marker: 'ALT' as const, value: 50, unit: 'U/L', date: '2026-03-01' },
        { marker: 'ALT' as const, value: 60, unit: 'U/L', date: '2026-03-01' },
        { marker: 'AST' as const, value: 40, unit: 'U/L', date: '2026-03-01' },
      ];
      expect(computeDeRitisRatio(readings)).toBeNull();
    });
  });
});
