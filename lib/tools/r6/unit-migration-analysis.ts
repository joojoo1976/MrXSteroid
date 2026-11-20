/**
 * lib/tools/r6/unit-migration-analysis.ts
 * Slice B — Centralized Units and Conversion (G-R6.1-1).
 *
 * Migration-safety analysis: identifies engines that perform unit conversions
 * and determines whether they can safely adopt lib/shared/unit-system.ts
 * WITHOUT changing calculation results or output precision.
 *
 * FINDING: No engine currently uses unit-system.ts. Four engines perform their
 * own conversions with different constants/precision. Migrating any of them to
 * unit-system.ts would change output precision → NOT SAFE at this time.
 * unit-system.ts remains available for new engines; migration requires an
 * owner-approved precision reconciliation per engine.
 *
 * PURE MODULE — no I/O, no Supabase, no Date.
 */
import {
  unitConversions,
  UNIT_CONSTANTS,
  PRECISION,
  type UnitSystem,
} from '@/lib/shared/unit-system';

/** Engine conversion constants observed in the repository (read-only snapshot). */
export interface EngineConversionSnapshot {
  engine: string;
  file: string;
  conversions: string[];
  constants: Record<string, number | string>;
  matchesUnitSystem: boolean;
  migrationSafe: boolean;
  reason: string;
}

export const ENGINE_CONVERSION_SNAPSHOTS: EngineConversionSnapshot[] = [
  {
    engine: 'tool-144-homebrew-chemistry-calculator.v6',
    file: 'lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.ts',
    conversions: ['kg↔g↔mg↔lb↔oz (mass)', 'm³↔L↔mL↔... (volume)', 'density units'],
    constants: {
      LB_TO_G: 453.59237,
      OZ_TO_G: 28.349523125,
      KG_TO_G: 1000,
    },
    matchesUnitSystem: false,
    migrationSafe: false,
    reason:
      'lb (453.59237 g) and oz (28.349523125 g) differ from unit-system.ts ' +
      '(kgToLbs = 2.20462 → lb = 453.59237 g implied; oz = 28.349523125 g exact). ' +
      'Migrating would shift rounded display values. NOT SAFE without precision reconciliation.',
  },
  {
    engine: 'tool-242-unit-conversion.v7',
    file: 'lib/tools/engines/tool-242-unit-conversion.v7.ts',
    conversions: ['mg↔g↔kg↔lb (mass)', 'mL↔L↔fl_oz↔cup (volume)', 'mm↔cm↔m↔in↔ft (length)', 'Pa↔kPa↔bar↔mmHg (pressure)', 'C↔F (temperature)'],
    constants: {
      LB_TO_KG: 0.4535924,
      KG_TO_LBS_IMPLIED: 1 / 0.4535924,
    },
    matchesUnitSystem: false,
    migrationSafe: false,
    reason:
      'Supports many more unit types than unit-system.ts (pressure, temperature, volume). ' +
      'lb constant (0.4535924 kg) implies kgToLbs = 2.2046222..., not 2.20462. ' +
      'Migrating kg↔lbs would shift precision; other conversions have no unit-system.ts equivalent. NOT SAFE.',
  },
  {
    engine: 'tool-027-ester-conversion',
    file: 'lib/tools/engines/tool-027-ester-conversion.ts',
    conversions: ['mg↔g↔kg (mass, molar basis)'],
    constants: {
      MG_TO_G: 0.001,
      G_TO_KG: 1000,
    },
    matchesUnitSystem: false,
    migrationSafe: false,
    reason:
      'Gram-based molar-mass conversion (n = m/M), not a unit-system.ts conversion. ' +
      'No kg↔lbs or mg↔oz overlap. NOT SAFE / NOT APPLICABLE.',
  },
  {
    engine: 'bodyfat.v6',
    file: 'lib/tools/engines/bodyfat.v6.ts',
    conversions: ['kg↔lbs (display only, via toDisplayUnit/toCanonical)'],
    constants: {
      SOURCE: 'imports from ../../engines/core/v6/equation-validator.v6 (module not found on disk)',
    },
    matchesUnitSystem: false,
    migrationSafe: false,
    reason:
      'References toDisplayUnit/toCanonical from a module path that does not exist ' +
      '(lib/tools/engines/core/v6/equation-validator.v6 is absent). Dead/unresolved code. ' +
      'No observable duplication of unit-system.ts at runtime. NOT SAFE (module missing).',
  },
];

/**
 * Reports engines that duplicate unit conversions and whether migration to
 * unit-system.ts is safe (precision-preserving).
 */
export function analyzeUnitConversionMigration(): {
  engines: EngineConversionSnapshot[];
  migratableCount: number;
  safeToMigrate: EngineConversionSnapshot[];
  blockedCount: number;
} {
  const safe = ENGINE_CONVERSION_SNAPSHOTS.filter((e) => e.migrationSafe);
  return {
    engines: ENGINE_CONVERSION_SNAPSHOTS,
    migratableCount: safe.length,
    safeToMigrate: safe,
    blockedCount: ENGINE_CONVERSION_SNAPSHOTS.length - safe.length,
  };
}

/** unit-system.ts constants, exposed for cross-engine comparison. */
export const UNIT_SYSTEM_CONSTANTS = {
  KG_TO_LBS: UNIT_CONSTANTS.KG_TO_LBS,
  LBS_TO_KG_IMPLIED: 1 / UNIT_CONSTANTS.KG_TO_LBS,
  MG_TO_OZ_DENOMINATOR: UNIT_CONSTANTS.MG_PER_OZ,
  OZ_TO_MG_IMPLIED: UNIT_CONSTANTS.MG_PER_OZ,
  PRECISION,
} as const;

/** Verify unit-system.ts internal consistency (round-trip within documented precision). */
export function verifyUnitSystemConsistency(): { ok: boolean; detail: string[] } {
  const detail: string[] = [];
  let ok = true;

  // kgToLbs(85) → lbsToKg should round-trip within 0.3 kg
  const kg = 85;
  const backKg = unitConversions.lbsToKg(unitConversions.kgToLbs(kg));
  const kgDrift = Math.abs(backKg - kg);
  if (kgDrift > 0.3) {
    ok = false;
    detail.push(`kg↔lbs round-trip drift ${kgDrift.toFixed(4)} kg exceeds 0.3 kg bound`);
  } else {
    detail.push(`kg↔lbs round-trip drift ${kgDrift.toFixed(4)} kg within 0.3 kg bound`);
  }

  // mgToOz(28349.523125) → ozToMg should round-trip within 0.5 mg
  const mg = 28349.523125;
  const backMg = unitConversions.ozToMg(unitConversions.mgToOz(mg));
  const mgDrift = Math.abs(backMg - mg);
  if (mgDrift > 0.5) {
    ok = false;
    detail.push(`mg↔oz round-trip drift ${mgDrift.toFixed(4)} mg exceeds 0.5 mg bound`);
  } else {
    detail.push(`mg↔oz round-trip drift ${mgDrift.toFixed(4)} mg within 0.5 mg bound`);
  }

  // Precision constants are defined
  detail.push(
    `PRECISION.KG_TO_LBS_DP=${PRECISION.KG_TO_LBS_DP}, PRECISION.LBS_TO_KG_DP=${PRECISION.LBS_TO_KG_DP}`,
  );
  detail.push(
    `PRECISION.MG_TO_OZ_DP=${PRECISION.MG_TO_OZ_DP}, PRECISION.OZ_TO_MG_DP=${PRECISION.OZ_TO_MG_DP}`,
  );

  return { ok, detail };
}

export type { UnitSystem };
