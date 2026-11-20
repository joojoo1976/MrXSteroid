// lib/tools/r6/tool-040-lipid-profile-optimizer-visual.test.ts
//
// RED phase for the Tool 040 visual data layer.
//
// PURE MODULE — no React, no DOM, no I/O, no clock. Every number it returns
// comes from the engine result and the R6.1 contract; nothing is estimated.
import { describe, expect, it } from 'vitest';
import { optimizeLipidProfile } from '@/lib/tools/engines/tool-040-lipid-profile-optimizer';
import {
  TOOL_040_PIE_DONUT_DECISION,
  buildLipidBarTooltip,
  buildLipidLadderSteps,
  buildLipidMarkerRows,
  buildLipidTableRows,
} from './tool-040-lipid-profile-optimizer-visual';

const INPUT = {
  panel: { ldl_mg_dl: 160, hdl_mg_dl: 38, triglycerides_mg_dl: 210 },
  age: 45,
  smoker: true,
  systolic_bp: 145,
  on_cycle: true,
  weeks_remaining: 8,
};
const RESULT = optimizeLipidProfile(INPUT);

describe('Tool 040 visual data layer', () => {
  it('builds one row per marker from the engine result, with the unit and the band', () => {
    const rows = buildLipidMarkerRows(INPUT.panel, RESULT);
    expect(rows.map((row) => row.marker)).toEqual(['LDL', 'HDL', 'TG']);
    expect(rows[0].value).toBe(160);
    expect(rows[0].unit).toBe('mg/dL');
    expect(rows[0].band).toBe('very-high');
    expect(rows[1].value).toBe(38);
    expect(rows[1].band).toBe('high');
    expect(rows[1].higherIsBetter).toBe(true);
    expect(rows[2].value).toBe(210);
    expect(rows[2].band).toBe('high');
  });

  it('never invents a value the engine did not produce', () => {
    const rows = buildLipidMarkerRows(INPUT.panel, RESULT);
    for (const row of rows) {
      expect(Number.isFinite(row.value)).toBe(true);
      expect(row.value).toBeGreaterThanOrEqual(0);
    }
  });

  it('scales each gauge on its own scale and clamps the fill to 100 percent', () => {
    const rows = buildLipidMarkerRows(INPUT.panel, RESULT);
    for (const row of rows) {
      expect(row.fillPercent).toBeGreaterThan(0);
      expect(row.fillPercent).toBeLessThanOrEqual(100);
      expect(row.scaleMax).toBeGreaterThan(row.referenceLimit);
      expect(row.referencePercent).toBeGreaterThan(0);
      expect(row.referencePercent).toBeLessThanOrEqual(100);
    }
    // A value far above the scale is clamped, not drawn outside the bar.
    const extreme = buildLipidMarkerRows({ ...INPUT.panel, ldl_mg_dl: 600 }, RESULT);
    expect(extreme[0].fillPercent).toBe(100);
  });

  it('builds the accessible text table equal to the chart values', () => {
    const rows = buildLipidMarkerRows(INPUT.panel, RESULT);
    const table = buildLipidTableRows(rows);
    expect(table).toHaveLength(3);
    expect(table[0].marker).toBe('LDL');
    expect(table[0].value).toBe('160');
    expect(table[0].unit).toBe('mg/dL');
    expect(table[0].band).toBe('very-high');
    expect(table[1].referenceLimit).toBe('60');
  });

  it('gives every element its own tooltip payload', () => {
    const rows = buildLipidMarkerRows(INPUT.panel, RESULT);
    const payload = buildLipidBarTooltip(rows[0], {
      meaning: 'meaning',
      explanation: 'explanation',
      formula: 'formula',
      source: 'source',
      warning: null,
      limitation: 'limitation',
    });
    expect(payload.title).toBe('LDL');
    expect(payload.value).toBe('160');
    expect(payload.unit).toBe('mg/dL');
    expect(payload.ratio).toContain('very-high');
    expect(payload.meaning).toBe('meaning');
    expect(payload.formula).toBe('formula');

    const hdl = buildLipidBarTooltip(rows[1], {
      meaning: 'm', explanation: 'e', formula: 'f', source: 's', warning: null, limitation: 'l',
    });
    expect(hdl.title).toBe('HDL');
    expect(hdl.title).not.toBe(payload.title);
  });

  it('documents why a pie or donut chart is not used here', () => {
    expect(TOOL_040_PIE_DONUT_DECISION.applicable).toBe(false);
    expect(TOOL_040_PIE_DONUT_DECISION.chart).toBe('none');
    expect(TOOL_040_PIE_DONUT_DECISION.reason.length).toBeGreaterThan(60);
  });

  it('describes the band ladder for the explanation, with the real thresholds', () => {
    const ladder = buildLipidLadderSteps();
    expect(ladder.length).toBe(4);
    expect(ladder.map((step) => step.band)).toEqual(['optimal', 'borderline', 'high', 'very-high']);
    expect(ladder[0].thresholdLabel.length).toBeGreaterThan(0);
  });
});
