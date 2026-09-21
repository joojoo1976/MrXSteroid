/**
 * lib/tools/adapters/multi-ester-pharmacokinetics.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #001 — Layer 3: Persistence & AI adapter for PharmaSim™.
 * ═══════════════════════════════════════════════════════════════════════════
 * Wraps the pure engine's result into the canonical `ToolOutput` envelope via
 * `buildToolOutput` (identity, access tier and prev/next links come from the
 * REGISTRY — never hand-written), then hands it to the shared commit path
 * (`commitDashboardSnapshot` → `POST /api/tools/logs`).
 *
 * PURE MODULE — timestamps and timezone are INJECTED by the caller, so the
 * envelope stays deterministic and unit-testable (no `Date`, no `Intl` here).
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
import {
    calculateMultiEsterPK,
    type EngineInput,
    type PharmacokineticResult,
} from '../engines/multi-ester-pharmacokinetics';

/** Male physiological serum baseline used as the clinical reference band. */
export const SERUM_REFERENCE_RANGE = { low: 300, high: 1000, unit: 'ng/dL' } as const;
/** Peak above this (ng/dL) is flagged clinically `important`. */
export const PEAK_IMPORTANT_THRESHOLD = 3000;
/** Peak-to-trough fluctuation above this is flagged `monitor`. */
export const FLUCTUATION_MONITOR_THRESHOLD = 3.0;

export interface MultiEsterPKOutputOptions {
    locale: Locale;
    unitSystem: UnitSystem;
    snapshotType: SnapshotType;
    /** ISO-8601 — injected (determinism), mirrors `calculatedAt` in practice. */
    calculatedAt: string;
    /** ISO-8601 instant of the underlying measurement. */
    recordedAt: string;
    /** IANA timezone of the measurement (injected, never probed via `Intl`). */
    timezone?: string;
    provenanceSource?: DataSource;
}

/** Clinical reference provenance for the simulated serum values. */
export function buildSerumProvenance(options: MultiEsterPKOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.98 : 0.85;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: SERUM_REFERENCE_RANGE.unit,
        measurementMethod: options.provenanceSource && options.provenanceSource !== 'manual'
            ? 'ingested biometric'
            : 'simulated model estimate',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
        referenceRange: {
            low: SERUM_REFERENCE_RANGE.low,
            high: SERUM_REFERENCE_RANGE.high,
            unit: SERUM_REFERENCE_RANGE.unit,
            source: 'Physiological Male Baseline Reference',
        },
    };
}

/** Severity-ranked clinical findings derived from the engine result. */
export function buildSerumKeyFindings(result: PharmacokineticResult): KeyFinding[] {
    return [
        {
            code: 'PEAK_SERUM',
            labelAr: 'أعلى ذروة تركيز بمصل الدم',
            labelEn: 'Peak Serum Concentration',
            value: `${result.peakConcentrationNgDl} ng/dL`,
            severity: result.peakConcentrationNgDl > PEAK_IMPORTANT_THRESHOLD ? 'important' : 'info',
        },
        {
            code: 'PEAK_TROUGH_FLUCTUATION',
            labelAr: 'نسبة التذبذب (الذروة / القاع)',
            labelEn: 'Peak-to-Trough Fluctuation Ratio',
            value: `${result.peakToTroughRatio}x`,
            severity: result.peakToTroughRatio > FLUCTUATION_MONITOR_THRESHOLD ? 'monitor' : 'info',
        },
        {
            code: 'STEADY_STATE_ETA',
            labelAr: 'الوصول للحالة المستقرة (Steady State)',
            labelEn: 'Estimated Steady-State Reach',
            value: `اليوم ${result.estimatedSteadyStateDay}`,
            severity: 'info',
        },
    ];
}

/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildMultiEsterPKOutput(
    rawInput: EngineInput,
    options: MultiEsterPKOutputOptions,
): ToolOutput<PharmacokineticResult> {
    const tool = requireTool('multi-ester-pharmacokinetics');
    const result = calculateMultiEsterPK(rawInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildSerumProvenance(options),
        keyFindings: buildSerumKeyFindings(result),
    });
}
