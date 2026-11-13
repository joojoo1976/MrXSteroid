// lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts
// Data-integrity proof for the Tool 039 visual layer: every chart value comes
// from the R6 pipeline output or from the readings the user typed.
import { describe, expect, it } from 'vitest';
import {
  TOOL_039_PIE_DONUT_DECISION,
  TOOL_039_VISUAL_MARKERS,
  buildLiverTrackerBars,
  buildLiverTrackerBarTooltip,
  buildLiverTrackerPointTooltip,
  buildLiverTrackerSeries,
  buildLiverTrackerTable,
} from './tool-039-liver-enzyme-tracker-visual';
import { trackLiverEnzymes } from '@/lib/tools/engines/tool-039-liver-enzyme-tracker';
import type { LiverTrackerInput } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';

const input: LiverTrackerInput = {
  readings: [
    { marker: 'ALT', value: 90, unit: 'U/L', date: '2026-01-01' },
    { marker: 'ALT', value: 112, unit: 'U/L', date: '2026-02-01' },
    { marker: 'bilirubin', value: 1.2, unit: 'mg/dL', date: '2026-02-01' },
  ],
  oral_steroids: true,
  alcohol_drinks_per_week: 0,
  uses_tudca: false,
};

const result = trackLiverEnzymes(input);

describe('Tool 039 visual data layer', () => {
  it('uses exactly the pipeline output values, units and multiples', () => {
    const series = buildLiverTrackerSeries(input, result);
    expect(series.map((entry) => entry.marker).sort()).toEqual(['ALT', 'bilirubin']);

    const alt = series.find((entry) => entry.marker === 'ALT')!;
    const engineAlt = result.markers.find((marker) => marker.marker === 'ALT')!;
    expect(alt.latestValue).toBe(engineAlt.latest_value);
    expect(alt.unit).toBe(engineAlt.unit);
    expect(alt.ulnMultiple).toBe(engineAlt.uln_multiple);
    expect(alt.status).toBe(engineAlt.status);
    expect(alt.referenceLimit).toBe(56);
  });

  it('plots only the readings that exist — no fabricated points', () => {
    const series = buildLiverTrackerSeries(input, result);
    const alt = series.find((entry) => entry.marker === 'ALT')!;
    expect(alt.points).toHaveLength(2);
    expect(alt.points.map((point) => point.date)).toEqual(['2026-01-01', '2026-02-01']);
    expect(alt.points.map((point) => point.value)).toEqual([90, 112]);
    expect(alt.hasTrend).toBe(true);

    const bilirubin = series.find((entry) => entry.marker === 'bilirubin')!;
    expect(bilirubin.points).toHaveLength(1);
    expect(bilirubin.hasTrend).toBe(false);
  });

  it('computes the change against the previous reading of the same marker', () => {
    const series = buildLiverTrackerSeries(input, result);
    const alt = series.find((entry) => entry.marker === 'ALT')!;
    expect(alt.points[0].changeFromPrevious).toBeNull();
    expect(alt.points[1].changeFromPrevious).toBe(22);
  });

  it('gives every bar row its own scale with the documented reference limit', () => {
    const bars = buildLiverTrackerBars(buildLiverTrackerSeries(input, result));
    const alt = bars.find((bar) => bar.marker === 'ALT')!;
    const bilirubin = bars.find((bar) => bar.marker === 'bilirubin')!;

    expect(alt.referenceLimit).toBe(56);
    expect(alt.unit).toBe('U/L');
    expect(alt.ulnMultiple).toBe(2);
    expect(alt.fillPercent).toBeGreaterThan(alt.referencePercent);

    expect(bilirubin.referenceLimit).toBe(1.2);
    expect(bilirubin.unit).toBe('mg/dL');
    // Separate scales: the two rows are not comparable with each other.
    expect(alt.scaleMax).not.toBe(bilirubin.scaleMax);
  });

  it('produces a textual table with the same values as the charts', () => {
    const rows = buildLiverTrackerTable(buildLiverTrackerSeries(input, result));
    const alt = rows.find((row) => row.marker === 'ALT')!;
    expect(alt.value).toBe('112');
    expect(alt.unit).toBe('U/L');
    expect(alt.referenceLimit).toBe('56');
    expect(alt.ulnMultiple).toBe('2.00×');
    expect(alt.readings).toContain('2026-01-01: 90 U/L');
    expect(alt.readings).toContain('2026-02-01: 112 U/L');
  });

  it('gives every element its own tooltip payload', () => {
    const series = buildLiverTrackerSeries(input, result);
    const bars = buildLiverTrackerBars(series);
    const altBar = bars.find((bar) => bar.marker === 'ALT')!;
    const bilirubinBar = bars.find((bar) => bar.marker === 'bilirubin')!;

    const text = {
      meaning: 'meaning',
      explanation: 'explanation',
      formula: 'value ÷ limit',
      source: 'engine',
      warning: null as string | null,
      limitation: null as string | null,
    };
    const altTooltip = buildLiverTrackerBarTooltip(altBar, text);
    const bilirubinTooltip = buildLiverTrackerBarTooltip(bilirubinBar, text);

    expect(altTooltip.title).toBe('ALT');
    expect(altTooltip.value).toBe('112');
    expect(altTooltip.unit).toBe('U/L');
    expect(altTooltip.ratio).toBe('2.00× ULN');

    expect(bilirubinTooltip.title).toBe('bilirubin');
    expect(bilirubinTooltip.value).toBe('1.2');
    expect(bilirubinTooltip.unit).toBe('mg/dL');
    expect(bilirubinTooltip.ratio).toBe('1.00× ULN');
    // Element-specific content, not one generic string.
    expect(altTooltip.title).not.toBe(bilirubinTooltip.title);
  });

  it('includes the change against the previous reading in the point tooltip', () => {
    const series = buildLiverTrackerSeries(input, result);
    const alt = series.find((entry) => entry.marker === 'ALT')!;
    const tooltip = buildLiverTrackerPointTooltip(alt.points[1], alt, {
      meaning: 'meaning',
      explanation: 'explanation',
      formula: 'value ÷ limit',
      source: 'engine',
      warning: null,
      limitation: null,
    });
    expect(tooltip.title).toBe('ALT · 2026-02-01');
    expect(tooltip.value).toBe('112');
    expect(tooltip.explanation).toContain('+22 U/L');
  });

  it('documents the Pie/Donut decision with a technical justification', () => {
    expect(TOOL_039_PIE_DONUT_DECISION.applicable).toBe(false);
    expect(TOOL_039_PIE_DONUT_DECISION.chart).toBe('none');
    expect(TOOL_039_PIE_DONUT_DECISION.reason).toMatch(/U\/L vs mg\/dL/);
    expect(TOOL_039_PIE_DONUT_DECISION.reason.length).toBeGreaterThan(80);
    expect(TOOL_039_VISUAL_MARKERS).toEqual(['ALT', 'AST', 'GGT', 'ALP', 'bilirubin']);
  });
});
