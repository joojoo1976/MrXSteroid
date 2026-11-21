/**
 * P03-RESULT-SCHEMA-GATE — structural proof for all 30 execution pipelines.
 *
 * Every pipeline must validate the ENGINE RESULT before an envelope is built:
 *   const engineResult = <engine>(...)
 *   const resultParsed = <ResultSchema>.safeParse(engineResult)
 *   if (!resultParsed.success) { return { ok: false, error: resultParsed.error } }
 *   <build...>(..., resultParsed.data, ...)
 *
 * This test reads the real pipeline sources and fails if any pipeline is missing
 * the gate, has the gate AFTER the build call, or still forwards the raw
 * engineResult into the envelope builder.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PIPELINES = [
  'tool-006-estrogen-prolactin-pipeline.ts',
  'tool-008-side-effect-tracker-pipeline.ts',
  'tool-014-water-retention-pipeline.ts',
  'tool-015-shbg-modulator-pipeline.ts',
  'tool-016-half-life-pipeline.ts',
  'tool-017-drug-interaction-pipeline.ts',
  'tool-022-half-life-stacker-pipeline.ts',
  'tool-023-trt-optimization-pipeline.ts',
  'tool-025-drug-interaction-pro-pipeline.ts',
  'tool-026-injection-pain-pipeline.ts',
  'tool-027-ester-conversion-pipeline.ts',
  'tool-029-side-effect-early-warning-pipeline.ts',
  'tool-031-cycle-length-optimizer-pipeline.ts',
  'tool-034-compound-clearance-pipeline.ts',
  'tool-035-hormone-conversion-pipeline.ts',
  'tool-037-side-effect-probability-pipeline.ts',
  'tool-038-stack-compatibility-pipeline.ts',
  'tool-039-liver-enzyme-tracker-pipeline.ts',
  'tool-040-lipid-profile-optimizer-pipeline.ts',
  'tool-041-hematocrit-monitor-pipeline.ts',
  'tool-042-estrogen-management-pipeline.ts',
  'tool-043-prolactin-management-pipeline.ts',
  'tool-044-dht-side-effects-pipeline.ts',
  'tool-045-cycle-break-planner-pipeline.ts',
  'tool-046-trt-lifetime-pipeline.ts',
  'tool-047-fertility-preservation-pipeline.ts',
  'tool-048-cardiovascular-risk-pipeline.ts',
  'tool-049-bone-density-pipeline.ts',
  'tool-050-mental-health-pipeline.ts',
  'tool-051-peptide-dosage-pipeline.ts'
];

const root = join(process.cwd(), 'lib', 'tools', 'r6');

const GATE = /const\s+resultParsed\s*=\s*([A-Za-z0-9_]+Schema)\.safeParse\(\s*engineResult\s*\)/;
// Tool 008 is a log-capture tool: there is no computation engine, the validated
// log IS the result. Its engineResult is therefore the parsed input by design.
const ENGINE_CALL_OR_LOG_CAPTURE = /const\s+engineResult\s*=\s*(?:[A-Za-z0-9_]+\(|parsed\.data\s*;)/;
const FAIL_BRANCH = /if\s*\(\s*!resultParsed\.success\s*\)\s*\{\s*return\s*\{\s*ok:\s*false\s*,\s*error:\s*resultParsed\.error\s*,?\s*\}\s*;?\s*\}/;
const ENGINE_CALL = /const\s+engineResult\s*=\s*[A-Za-z0-9_]+\(/;
const PASSES_CHECKED_DATA = /,?\s*resultParsed\.data\b/;

describe('P03-RESULT-SCHEMA-GATE (structural, 30 pipelines)', () => {
  for (const file of PIPELINES) {
    it(`${file}: validates the engine result before the envelope`, () => {
      const src = readFileSync(join(root, file), 'utf8');

      expect(ENGINE_CALL_OR_LOG_CAPTURE.test(src), 'engine call must be captured as engineResult').toBe(true);

      const gate = src.match(GATE);
      expect(gate, 'resultParsed = <Schema>.safeParse(engineResult) is missing').not.toBeNull();
      expect(gate![1]).not.toBe('TrtInputSchema');

      expect(FAIL_BRANCH.test(src), 'failure branch must return { ok: false, error: resultParsed.error }').toBe(true);

      const gateIndex = src.search(GATE);
      const failIndex = src.search(FAIL_BRANCH);
      const checkedIndex = src.search(PASSES_CHECKED_DATA);
      expect(failIndex).toBeGreaterThan(gateIndex);
      expect(checkedIndex, 'the envelope must receive resultParsed.data').toBeGreaterThan(failIndex);

      // the raw engine result must never reach a builder after the gate
      const afterGate = src.slice(gateIndex);
      const rawForward = /build[A-Za-z0-9_]*\([^)]*,\s*engineResult\s*,/.test(afterGate);
      expect(rawForward, 'raw engineResult must not be forwarded to the envelope builder').toBe(false);
    });
  }

  it('covers exactly the 30 declared execution pipelines', () => {
    expect(PIPELINES).toHaveLength(30);
    expect(new Set(PIPELINES).size).toBe(30);
  });
});
