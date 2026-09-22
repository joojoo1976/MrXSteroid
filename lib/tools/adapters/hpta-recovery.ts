/**
 * lib/tools/adapters/hpta-recovery.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #003 — Layer 3: Persistence & AI adapter for the HPTA Recovery Engine.
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
    calculateHptaRecovery,
    RECOVERY_COMPLETE_THRESHOLD,
    type EngineInput,
    type HptaRecoveryResult,
} from '../engines/hpta-recovery';

/** Healthy adult male total-T reference band (the clinical anchor). */
export const TESTOSTERONE_REFERENCE_RANGE = { low: 300, high: 1000, unit: 'ng/dL' } as const;
/** Recovery not reaching 90% within the observation window is flagged `monitor`. */
export const RECOVERY_COMPLETE_THRESHOLD_ADAPTER = RECOVERY_COMPLETE_THRESHOLD;
/** A no-PCT protocol is always surfaced as a `monitor` finding. */
export const NO_PCT_ALERT = 'no_pct';

export interface HptaRecoveryOutputOptions {
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

/** Clinical reference provenance for the projected HPTA values. */
export function buildHptaRecoveryProvenance(options: HptaRecoveryOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.9 : 0.8;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: TESTOSTERONE_REFERENCE_RANGE.unit,
        measurementMethod:
            options.provenanceSource && options.provenanceSource !== 'manual'
                ? 'ingested biometric'
                : 'simulated model estimate',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
        referenceRange: {
            low: TESTOSTERONE_REFERENCE_RANGE.low,
            high: TESTOSTERONE_REFERENCE_RANGE.high,
            unit: TESTOSTERONE_REFERENCE_RANGE.unit,
            source: 'Mr. X-Steroid Book — HPTA Recovery Kinetics (Ch. 6)',
        },
    };
}

/** Severity-ranked findings derived from the engine result. */
export function buildHptaRecoveryKeyFindings(
    result: HptaRecoveryResult,
    input: EngineInput,
): KeyFinding[] {
    const recovered = result.recoveryCompleteWeek > 0;
    const noPct = input.pctProtocol === 'none';

    return [
        {
            code: 'PEAK_SUPPRESSION',
            labelAr: `ذروة التثبيط المحوري: ${result.peakSuppressionPct}%`,
            labelEn: `Peak HPTA suppression: ${result.peakSuppressionPct}%`,
            value: `${result.peakSuppressionPct}%`,
            severity: result.peakSuppressionPct >= 90 ? 'important' : 'monitor',
        },
        {
            code: 'WASHOUT_DURATION',
            labelAr: `مدة التطهير قبل بدء الاستعادة: ${result.washoutWeeks} أسبوع`,
            labelEn: `Washout window before recovery onset: ${result.washoutWeeks} weeks`,
            value: `${result.washoutWeeks}w`,
            severity: 'info',
        },
        {
            code: 'RECOVERY_STATUS',
            labelAr: recovered
                ? `استعادة التستوستيرون الداخلي ≥ ٩٠٪ عند الأسبوع ${result.recoveryCompleteWeek}`
                : 'التستوستيرون الداخلي لم يصل إلى ٩٠٪ ضمن نافذة المراقبة',
            labelEn: recovered
                ? `Endogenous T restored ≥ 90% at week ${result.recoveryCompleteWeek}`
                : 'Endogenous T did not reach 90% within the observation window',
            value: recovered ? `wk${result.recoveryCompleteWeek}` : 'at-risk',
            severity: recovered ? 'info' : 'monitor',
        },
        {
            code: 'PCT_PROTOCOL',
            labelAr: noPct
                ? 'بدون بروتوكول تنظيف — التعافي بطيء ومخاطِر (وفق كتاب Mr. X-Steroid)'
                : `بروتوكول التنظيف فعّال (معامل التسريع ${result.pctProtocolBoost})`,
            labelEn: noPct
                ? 'No PCT protocol — slow, risky recovery (per Mr. X-Steroid Book)'
                : `PCT protocol active (boost factor ${result.pctProtocolBoost})`,
            value: noPct ? NO_PCT_ALERT : `${result.pctProtocolBoost}×`,
            severity: noPct ? 'important' : 'info',
        },
        {
            code: 'FINAL_TESTOSTERONE',
            labelAr: `التستوستيرون الداخلي النهائي: ${result.finalTestosteronePct}% من الخط الأساسي`,
            labelEn: `Final endogenous testosterone: ${result.finalTestosteronePct}% of baseline`,
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
export function buildHptaRecoveryOutput(
    rawInput: EngineInput,
    options: HptaRecoveryOutputOptions,
): ToolOutput<HptaRecoveryResult> {
    const tool = requireTool('hpta-recovery');
    const result = calculateHptaRecovery(rawInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildHptaRecoveryProvenance(options),
        keyFindings: buildHptaRecoveryKeyFindings(result, rawInput),
    });
}
