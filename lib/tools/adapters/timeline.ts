/**
 * lib/tools/adapters/timeline.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #080 — Layer 3: Persistence & AI adapter for the Timeline Engine.
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
    type KeyFinding,
    type Locale,
    type SnapshotType,
    type ToolOutput,
    type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool } from '../registry';
import {
    calculateTimeline,
    type EngineInput,
    type TimelineResult,
} from '../engines/timeline';

/** Healthy adult body-fat reference band used as the clinical anchor. */
export const BODYFAT_REFERENCE_RANGE = { low: 10, high: 22, unit: '%' } as const;
/** Surplus / deficit above this magnitude is flagged `monitor`. */
export const AGGRESSIVE_DELTA_THRESHOLD = 1000;
/** A plateau before week 8 is flagged `important` (premature stalling). */
export const PREMATURE_PLATEAU_WEEK = 8;

export interface TimelineOutputOptions {
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

/** Clinical reference provenance for the projected body-composition values. */
export function buildTimelineProvenance(options: TimelineOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.9 : 0.8;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: BODYFAT_REFERENCE_RANGE.unit,
        measurementMethod:
            options.provenanceSource && options.provenanceSource !== 'manual'
                ? 'ingested biometric'
                : 'simulated model estimate',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
        referenceRange: {
            low: BODYFAT_REFERENCE_RANGE.low,
            high: BODYFAT_REFERENCE_RANGE.high,
            unit: BODYFAT_REFERENCE_RANGE.unit,
            source: 'Mr. X-Steroid Book — Body Composition Kinetics',
        },
    };
}

/** Severity-ranked findings derived from the engine result. */
export function buildTimelineKeyFindings(result: TimelineResult): KeyFinding[] {
    const plateauSeverity =
        result.plateauWarningWeek > 0 && result.plateauWarningWeek < PREMATURE_PLATEAU_WEEK
            ? 'important'
            : result.plateauWarningWeek > 0
              ? 'monitor'
              : 'info';

    return [
        {
            code: 'GOAL_FEASIBILITY',
            labelAr: result.targetReached
                ? 'الهدف قابل للتحقيق ضمن الجدول الزمني'
                : 'الهدف غير قابل للتحقيق ضمن الجدول الزمني',
            labelEn: result.targetReached
                ? 'Goal is achievable within the timeline'
                : 'Goal is NOT achievable within the timeline',
            value: result.targetReached ? 'feasible' : 'at-risk',
            severity: result.targetReached ? 'info' : 'monitor',
        },
        {
            code: 'PROJECTED_COMPLETION',
            labelAr: `الزمن المتوقع للوصول للهدف: ${result.totalWeeksNeeded} أسبوع`,
            labelEn: `Projected time to goal: ${result.totalWeeksNeeded} weeks`,
            value: `${result.totalWeeksNeeded}w`,
            severity: 'info',
        },
        {
            code: 'TOTAL_COMPOSITION_CHANGE',
            labelAr: `صافي التغيّر: +${result.muscleGainedKg} كجم عضلة / -${Math.max(0, result.fatLostKg)} كجم دهون (وفق كتاب Mr. X-Steroid)`,
            labelEn: `Net change: +${result.muscleGainedKg} kg muscle / -${Math.max(0, result.fatLostKg)} kg fat (per Mr. X-Steroid Book)`,
            value: `+${result.muscleGainedKg}kg / -${Math.max(0, result.fatLostKg)}kg`,
            severity: 'info',
        },
        {
            code: 'PLATEAU_STATUS',
            labelAr:
                result.plateauWarningWeek > 0
                    ? `تحذير هضبة أيضية عند الأسبوع ${result.plateauWarningWeek}`
                    : 'لا توجد هضبة أيضية ضمن الجدول',
            labelEn:
                result.plateauWarningWeek > 0
                    ? `Metabolic plateau flagged at week ${result.plateauWarningWeek}`
                    : 'No metabolic plateau within the timeline',
            value: result.plateauWarningWeek > 0 ? `wk${result.plateauWarningWeek}` : 'none',
            severity: plateauSeverity,
        },
    ];
}

/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildTimelineOutput(
    rawInput: EngineInput,
    options: TimelineOutputOptions,
): ToolOutput<TimelineResult> {
    const tool = requireTool('timeline');
    const result = calculateTimeline(rawInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildTimelineProvenance(options),
        keyFindings: buildTimelineKeyFindings(result),
    });
}
