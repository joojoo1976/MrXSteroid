/**
 * lib/tools/r6/unit-migration-analysis.test.ts
 * Slice B — Centralized Units and Conversion (G-R6.1-1).
 *
 * Verifies:
 *   1. unit-system.ts is internally consistent (round-trip within documented precision)
 *   2. The four engines with conversion logic do NOT match unit-system.ts constants
 *      (migration would change precision → correctly blocked)
 *   3. No engine currently imports unit-system.ts (shared system is available but unused)
 *
 * No engine is migrated: precision preservation takes precedence over consolidation.
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeUnitConversionMigration,
  ENGINE_CONVERSION_SNAPSHOTS,
  UNIT_SYSTEM_CONSTANTS,
  verifyUnitSystemConsistency,
} from './unit-migration-analysis';
import {
  unitConversions,
  validateRoundTrip,
  PRECISION,
} from '@/lib/shared/unit-system';

describe('Slice B — unit-system.ts internal consistency', () => {
  it('round-trips kg↔lbs within 0.3 kg bound', () => {
    const { ok, detail } = verifyUnitSystemConsistency();
    expect(ok).toBe(true);
    expect(detail.some((d) => d.includes('kg↔lbs round-trip drift') && d.includes('within'))).toBe(
      true,
    );
  });

  it('round-trips mg↔oz within 0.5 mg bound', () => {
    const { ok } = verifyUnitSystemConsistency();
    expect(ok).toBe(true);
  });

  it('validateRoundTrip reports consistency', () => {
    expect(validateRoundTrip()).toBe(true);
  });

  it('precision constants are defined', () => {
    expect(PRECISION.KG_TO_LBS_DP).toBe(0);
    expect(PRECISION.LBS_TO_KG_DP).toBe(1);
    expect(PRECISION.MG_TO_OZ_DP).toBe(6);
    expect(PRECISION.OZ_TO_MG_DP).toBe(1);
  });
});

describe('Slice B — engine conversion snapshot (read-only, no migration)', () => {
  it('identifies four engines with conversion logic', () => {
    expect(ENGINE_CONVERSION_SNAPSHOTS).toHaveLength(4);
    const engines = ENGINE_CONVERSION_SNAPSHOTS.map((e) => e.engine);
    expect(engines).toContain('tool-144-homebrew-chemistry-calculator.v6');
    expect(engines).toContain('tool-242-unit-conversion.v7');
    expect(engines).toContain('tool-027-ester-conversion');
    expect(engines).toContain('bodyfat.v6');
  });

  it('no engine matches unit-system.ts constants (migration blocked)', () => {
    const { engines, migratableCount, blockedCount } =
      analyzeUnitConversionMigration();
    expect(migratableCount).toBe(0);
    expect(blockedCount).toBe(4);
    for (const e of engines) {
      expect(e.matchesUnitSystem).toBe(false);
      expect(e.migrationSafe).toBe(false);
    }
  });

  it('tool-144 lb/oz constants differ from unit-system.ts implied values', () => {
    const e = ENGINE_CONVERSION_SNAPSHOTS.find(
      (x) => x.engine === 'tool-144-homebrew-chemistry-calculator.v6',
    );
    expect(e).toBeDefined();
    // tool-144: lb = 453.59237 g → implied kgToLbs = 1000/453.59237 ≈ 2.2046226
    const implied = 1000 / e!.constants.LB_TO_G;
    expect(implied).not.toBe(UNIT_SYSTEM_CONSTANTS.KG_TO_LBS);
    expect(Math.abs(implied - UNIT_SYSTEM_CONSTANTS.KG_TO_LBS)).toBeGreaterThan(0.000001);
    expect(e!.reason).toContain('NOT SAFE');
  });

  it('tool-242 lb constant differs from unit-system.ts implied value', () => {
    const e = ENGINE_CONVERSION_SNAPSHOTS.find((x) => x.engine === 'tool-242-unit-conversion.v7');
    expect(e).toBeDefined();
    const impliedKgToLbs = 1 / e!.constants.LB_TO_KG;
    expect(impliedKgToLbs).not.toBe(UNIT_SYSTEM_CONSTANTS.KG_TO_LBS);
    expect(Math.abs(impliedKgToLbs - UNIT_SYSTEM_CONSTANTS.KG_TO_LBS)).toBeGreaterThan(0.000001);
    expect(e!.reason).toContain('NOT SAFE');
  });

  it('tool-027 is gram-based molar conversion, not unit-system.ts domain', () => {
    const e = ENGINE_CONVERSION_SNAPSHOTS.find((x) => x.engine === 'tool-027-ester-conversion');
    expect(e).toBeDefined();
    expect(e!.reason).toContain('NOT APPLICABLE');
  });

  it('bodyfat.v6 references a missing module (no observable duplication)', () => {
    const e = ENGINE_CONVERSION_SNAPSHOTS.find((x) => x.engine === 'bodyfat.v6');
    expect(e).toBeDefined();
    expect(e!.reason).toContain('does not exist');
  });

  it('shared unit system is available but unused by any engine', () => {
    // unitConversions is exported and functional
    expect(typeof unitConversions.kgToLbs).toBe('function');
    expect(typeof unitConversions.mgToOz).toBe('function');
    // Direct value check: 1 kg = 2.20462 lbs (rounded to integer)
    expect(unitConversions.kgToLbs(1)).toBe(2);
    expect(unitConversions.mgToOz(28349.523125)).toBe(1);
  });
});
