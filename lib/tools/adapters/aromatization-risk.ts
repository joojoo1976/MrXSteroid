/**
 * lib/tools/adapters/aromatization-risk.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #002 — Layer 3: Persistence & AI adapter for the Aromatization Risk Engine.
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
    calculateAromatizationRisk,
    E2_CRITICAL_THRESHOLD,
    E2_OPTIMAL_HIGH,
    E2_OPTIMAL_LOW,
    type AromatizationRiskResult,
    type EngineInput,
} from '../engines/aromatization-risk';

/** Adult male estradiol (E2) reference band (the clinical anchor). */
export const E2_REFERENCE_RANGE = { low: E2_OPTIMAL_LOW, high: E2_OPTIMAL_HIGH, unit: 'pg/mL' } as const;
/** E2 above this is flagged `important` (gyno-risk threshold). */
export const E2_CRITICAL_THRESHOLD_ADAPTER = E2_CRITICAL_THRESHOLD;
/** AI on a non-aromatising compound is always surfaced as an `important` finding. */
export const UNNECESSARY_AI_ALERT = 'unnecessary_ai';

export interface AromatizationRiskOutputOptions {
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

/** Clinical reference provenance for the projected E2 values. */
export function buildAromatizationRiskProvenance(options: AromatizationRiskOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.9 : 0.8;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: E2_REFERENCE_RANGE.unit,
        measurementMethod:
            options.provenanceSource && options.provenanceSource !== 'manual'
                ? 'ingested biometric'
                : 'simulated model estimate',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
        referenceRange: {
            low: E2_REFERENCE_RANGE.low,
            high: E2_REFERENCE_RANGE.high,
            unit: E2_REFERENCE_RANGE.unit,
            source: 'Mr. X-Steroid Book — Estrogen Management & Aromatization (Ch. 4)',
        },
    };
}

/** Severity-ranked findings derived from the engine result. */
export function buildAromatizationRiskKeyFindings(
    result: AromatizationRiskResult,
    input: EngineInput,
): KeyFinding[] {
    const critical = result.peakE2 > E2_CRITICAL_THRESHOLD;
    const unnecessaryAi = input.compoundType === 'trenbolone' && input.aiProtocol !== 'none';

    return [
        {
            code: 'PEAK_E2',
            labelAr: `ذروة الاستراديول: ${result.peakE2} pg/mL`,
            labelEn: `Peak estradiol: ${result.peakE2} pg/mL`,
            value: `${result.peakE2} pg/mL`,
            severity: critical ? 'important' : result.peakE2 > E2_OPTIMAL_HIGH ? 'monitor' : 'info',
        },
        {
            code: 'RISK_ZONE',
            labelAr: `منطقة المخاطر عند الذروة: ${result.peakRiskZone}`,
            labelEn: `Peak risk zone: ${result.peakRiskZone}`,
            value: result.peakRiskZone,
            severity: critical ? 'important' : result.peakRiskZone === 'elevated' ? 'monitor' : 'info',
        },
        {
            code: 'GYNO_RISK',
            labelAr: `درجة خطر التثدي الهرموني: ${result.gynoRiskScore}/100`,
            labelEn: `Gynecomastia risk score: ${result.gynoRiskScore}/100`,
            value: `${result.gynoRiskScore}`,
            severity: result.gynoRiskScore >= 60 ? 'important' : result.gynoRiskScore >= 30 ? 'monitor' : 'info',
        },
        {
            code: 'AI_RECOMMENDATION',
            labelAr: unnecessaryAi
                ? 'استخدام مثبطات الأروماتاز غير ضروري مع مركب لا يُأَرومَتَز'
                : result.aiRecommendation === 'adjust_up'
                  ? 'يُنصح بزيادة جرعة مثبط الأروماتاز'
                  : result.aiRecommendation === 'reduce_ai'
                    ? 'يُنصح بتقليل جرعة مثبط الأروماتاز — خطر انهيار الاستراديول'
                    : result.aiRecommendation === 'monitor'
                      ? 'راقب الاستراديول — قد يحتاج تدخل خفيف'
                      : 'لا حاجة لتدخل مثبط الأروماتاز حالياً',
            labelEn: unnecessaryAi
                ? 'AI use unnecessary with a non-aromatising compound'
                : result.aiRecommendation === 'adjust_up'
                  ? 'Increase AI dose recommended'
                  : result.aiRecommendation === 'reduce_ai'
                    ? 'Reduce AI dose — E2 crash risk'
                    : result.aiRecommendation === 'monitor'
                      ? 'Monitor E2 — mild intervention may be needed'
                      : 'No AI intervention needed at this time',
            value: unnecessaryAi ? UNNECESSARY_AI_ALERT : result.aiRecommendation,
            severity: unnecessaryAi ? 'important' : result.aiRecommendation === 'adjust_up' || result.aiRecommendation === 'reduce_ai' ? 'monitor' : 'info',
        },
        {
            code: 'FINAL_E2',
            labelAr: `الاستراديول النهائي بعد الدورة: ${result.finalE2} pg/mL`,
            labelEn: `Post-cycle final E2: ${result.finalE2} pg/mL`,
            value: `${result.finalE2} pg/mL`,
            severity: 'info',
        },
    ];
}

/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildAromatizationRiskOutput(
    rawInput: EngineInput,
    options: AromatizationRiskOutputOptions,
): ToolOutput<AromatizationRiskResult> {
    const tool = requireTool('aromatization-risk');
    const result = calculateAromatizationRisk(rawInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildAromatizationRiskProvenance(options),
        keyFindings: buildAromatizationRiskKeyFindings(result, rawInput),
    });
}
