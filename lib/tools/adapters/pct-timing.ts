/**
 * lib/tools/adapters/pct-timing.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — Layer 3: Persistence & AI adapter for the PCT Timing Engine.
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
    calculatePctTiming,
    type EngineInput,
    type PctTimingResult,
} from '../engines/pct-timing';

/** Half-life reference band for common injectable esters (days). */
export const HALFLIFE_REFERENCE_RANGE = { low: 2, high: 15, unit: 'days' } as const;
/** PCT starting before washout completes is flagged `important`. */
export const PREMATURE_PCT_WEEK = 0;
/** A no-PCT protocol on a long-ester compound is flagged `important`. */
export const NO_PCT_LONG_ESTER = 'no_pct_long_ester';
/** Long-ester threshold (days) above which skipping PCT is clinically risky. */
export const LONG_ESTER_THRESHOLD_DAYS = 10;

export interface PctTimingOutputOptions {
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

/** Clinical reference provenance for the projected washout/PCT values. */
export function buildPctTimingProvenance(options: PctTimingOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.9 : 0.8;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: HALFLIFE_REFERENCE_RANGE.unit,
        measurementMethod:
            options.provenanceSource && options.provenanceSource !== 'manual'
                ? 'ingested biometric'
                : 'simulated model estimate',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
        referenceRange: {
            low: HALFLIFE_REFERENCE_RANGE.low,
            high: HALFLIFE_REFERENCE_RANGE.high,
            unit: HALFLIFE_REFERENCE_RANGE.unit,
            source: 'Mr. X-Steroid Book — Compound Washout & PCT Scheduling (Ch. 6)',
        },
    };
}

/** Severity-ranked findings derived from the engine result. */
export function buildPctTimingKeyFindings(
    result: PctTimingResult,
    input: EngineInput,
): KeyFinding[] {
    const noPct = input.pctProtocol === 'none';
    const longEster = input.compoundHalfLifeDays >= LONG_ESTER_THRESHOLD_DAYS;
    const recovered = result.fullRecoveryWeek > 0;

    return [
        {
            code: 'WASHOUT_WINDOW',
            labelAr: `نافذة التطهير: ${result.washoutWeeks} أسبوع قبل بدء PCT`,
            labelEn: `Washout window: ${result.washoutWeeks} weeks before PCT start`,
            value: `${result.washoutWeeks}w`,
            severity: 'info',
        },
        {
            code: 'PCT_START',
            labelAr: `بدء PCT مؤهل عند الأسبوع ${result.pctStartWeek} (بعد انخفاض المركب تحت العتبة)`,
            labelEn: `PCT eligible at week ${result.pctStartWeek} (compound below threshold)`,
            value: `wk${result.pctStartWeek}`,
            severity: 'info',
        },
        {
            code: 'PCT_DURATION',
            labelAr:
                result.pctDurationWeeks > 0
                    ? `نافذة PCT: ${result.pctDurationWeeks} أسابيع`
                    : 'لا يوجد بروتوكول PCT — التعافي طبيعي بطيء',
            labelEn:
                result.pctDurationWeeks > 0
                    ? `PCT window: ${result.pctDurationWeeks} weeks`
                    : 'No PCT protocol — slow natural recovery',
            value: result.pctDurationWeeks > 0 ? `${result.pctDurationWeeks}w` : NO_PCT_LONG_ESTER,
            severity: noPct && longEster ? 'important' : noPct ? 'monitor' : 'info',
        },
        {
            code: 'RECOVERY_STATUS',
            labelAr: recovered
                ? `استعادة التستوستيرون الداخلي ≥ ٩٠٪ عند الأسبوع ${result.fullRecoveryWeek}`
                : 'التستوستيرون الداخلي لم يصل إلى ٩٠٪ ضمن نافذة المراقبة',
            labelEn: recovered
                ? `Endogenous T restored ≥ 90% at week ${result.fullRecoveryWeek}`
                : 'Endogenous T did not reach 90% within the observation window',
            value: recovered ? `wk${result.fullRecoveryWeek}` : 'at-risk',
            severity: recovered ? 'info' : 'monitor',
        },
        {
            code: 'FINAL_TESTOSTERONE',
            labelAr: `التستوستيرون الداخلي النهائي: ${result.finalTestosteronePct}% من الخط الأساسي (وفق كتاب Mr. X-Steroid)`,
            labelEn: `Final endogenous testosterone: ${result.finalTestosteronePct}% of baseline (per Mr. X-Steroid Book)`,
            value: `${result.finalTestosteronePct}%`,
            severity: 'info',
        },
    ];
}

/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildPctTimingOutput(
    rawInput: EngineInput,
    options: PctTimingOutputOptions,
): ToolOutput<PctTimingResult> {
    const tool = requireTool('pct-timing');
    const result = calculatePctTiming(rawInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildPctTimingProvenance(options),
        keyFindings: buildPctTimingKeyFindings(result, rawInput),
    });
}
