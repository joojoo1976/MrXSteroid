/**
 * lib/tools/adapters/genetic.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #??? — Layer 3: Persistence & AI adapter for Genetic Potential.
 * ════════════════════════════════════════════════════════════════════════════
 * Wraps the pure engine's result into the canonical `ToolOutput` envelope via
 * `buildToolOutput` (identity, access tier and prev/next links come from the
 * REGISTRY — never hand‑written), then hands it to the shared commit path
 * (`commitDashboardSnapshot` → `POST /api/tools/logs`).
 *
 * PURE MODULE — timestamps and timezone are INJECTED by the caller, so the
 * envelope stays deterministic and unit‑testable (no `Date`, no `Intl` here).
 */

import {
  deriveDataQuality,
  type DataProvenance,
  type DataSource,
  type Locale,
  type KeyFinding,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool } from '../registry';
import { calculateGeneticPotential, type GeneticInput, type GeneticOutput } from '../engines/genetic';

/** Reference ranges for FFMI (drug‑free males). */
export const FFMI_REFERENCE = { low: 17, high: 22, unit: 'kg/m²' } as const;
/** Threshold for flagging elite potential. */
export const ELITE_FFMI_THRESHOLD = 23;
/** Threshold for below average. */
export const BELOW_AVG_FFMI_THRESHOLD = 19;

export interface GeneticOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  /** ISO‑8601 — injected (determinism), mirrors `calculatedAt` in practice. */
  calculatedAt: string;
  /** ISO‑8601 instant of the underlying measurement. */
  recordedAt: string;
  /** IANA timezone of the measurement (injected, never probed via `Intl`). */
  timezone?: string;
  provenanceSource?: DataSource;
}

/** Provenance for the genetic potential estimate. */
export function buildGeneticProvenance(options: GeneticOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.95 : 0.85;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: FFMI_REFERENCE.unit,
    measurementMethod: options.provenanceSource && options.provenanceSource !== 'manual'
      ? 'ingested biometric'
      : 'anthropometric estimation (Casey Butt model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: {
      low: FFMI_REFERENCE.low,
      high: FFMI_REFERENCE.high,
      unit: FFMI_REFERENCE.unit,
      source: 'Drug‑Free Male FFMI Reference Ranges',
    },
  };
}

/** Severity‑ranked findings derived from the engine result. */
export function buildGeneticKeyFindings(result: GeneticOutput): KeyFinding[] {
  const findings: KeyFinding[] = [];

  findings.push({
    code: 'MAX_FFMI',
    labelAr: 'أقصى مؤشر كتلة عضلية خالية من الدهون (FFMI)',
    labelEn: 'Maximum Fat‑Free Mass Index (FFMI)',
    value: `${result.maxFFMI} kg/m²`,
    severity: result.maxFFMI >= ELITE_FFMI_THRESHOLD ? 'important' : 'info',
  });

  findings.push({
    code: 'MAX_LBM',
    labelAr: 'أقصى كتلة عضلية خالية من الدهون',
    labelEn: 'Maximum Lean Body Mass',
    value: `${result.maxLBMkg} kg`,
    severity: 'info',
  });

  if (result.rating === 'elite') {
    findings.push({
      code: 'ELITE_POTENTIAL',
      labelAr: 'إمكانات وراثية النخبة',
      labelEn: 'Elite Genetic Potential',
      value: 'true',
      severity: 'important',
    });
  } else if (result.rating === 'below_average') {
    findings.push({
      code: 'BELOW_AVG_POTENTIAL',
      labelAr: 'إمكانات وراثية دون المتوسط',
      labelEn: 'Below Average Genetic Potential',
      value: 'true',
      severity: 'monitor',
    });
  }

  return findings;
}

/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildGeneticOutput(
  rawInput: GeneticInput,
  options: GeneticOutputOptions,
): ToolOutput<GeneticOutput> {
  const tool = requireTool('genetic');
  const result = calculateGeneticPotential(rawInput);

  return buildToolOutput(tool.slug, {
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    result,
    provenance: buildGeneticProvenance(options),
    keyFindings: buildGeneticKeyFindings(result),
  });
}