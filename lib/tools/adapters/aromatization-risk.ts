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
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import {
    calculateAromatizationRisk,
    type AromatizationRiskResult,
    type EngineInput,
} from '../engines/aromatization-risk';

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

/** Provenance for an unvalidated scenario output; it is not a lab measurement. */
export function buildAromatizationRiskProvenance(options: AromatizationRiskOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = null;
    return {
        source,
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: 'pg/mL',
        measurementMethod: 'unvalidated scenario model; not a laboratory measurement',
        confidence,
        // Invariant: the bucket is ALWAYS derived, never hand-written.
        dataQuality: deriveDataQuality(confidence),
    };
}

/** Severity-ranked findings derived from the engine result. */
export function buildAromatizationRiskKeyFindings(
    result: AromatizationRiskResult,
    _input: EngineInput,
): KeyFinding[] {
    return [
        {
            code: 'PEAK_E2',
            labelAr: `قيمة ذروة E2 المحسوبة بالنموذج غير المتحقق: ${result.peakE2} pg/mL`,
            labelEn: `Unvalidated modelled peak E2 value: ${result.peakE2} pg/mL`,
            value: `${result.peakE2} pg/mL`,
            severity: 'info',
        },
        {
            code: 'CLINICAL_ASSESSMENT',
            labelAr: 'التقييم السريري غير متاح؛ لا يصدر النموذج درجة خطر أو توصية دوائية',
            labelEn: 'Clinical assessment unavailable; this model provides no risk score or medication recommendation',
            value: 'NOT_ASSESSED',
            severity: 'info',
        },
        {
            code: 'FINAL_E2',
            labelAr: `قيمة E2 المحسوبة في نهاية السيناريو: ${result.finalE2} pg/mL`,
            labelEn: `Modelled E2 value at the end of the scenario: ${result.finalE2} pg/mL`,
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

    return buildToolOutput<AromatizationRiskResult>({
        toolId: tool.toolId,
        toolSlug: tool.slug,
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        accessTier: 'free',
        result,
        provenance: buildAromatizationRiskProvenance(options),
        keyFindings: buildAromatizationRiskKeyFindings(result, rawInput),
        seoLinks: buildSeoLinks(tool),
    });
}
