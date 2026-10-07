/**
 * lib/tools/adapters/hcg-serm-protocol.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #005 — Layer 3: Output envelope & persistence adapter
 * ════════════════════════════════════════════════════════════════════════════
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
    calculateHcgSermProtocol,
    type HcgSermEngineInput,
    type HcgSermResult,
} from '../engines/hcg-serm-protocol';
import { parseHcgSermEngineInput } from '../schemas/hcg-serm-protocol';

export const TOOL_SLUG = 'hcg-serm-protocol';

export interface HcgSermProtocolOutputOptions {
    locale: Locale;
    unitSystem: UnitSystem;
    snapshotType: SnapshotType;
    calculatedAt: string;
    recordedAt: string;
    timezone?: string;
    provenanceSource?: DataSource;
}

export function buildHcgSermProtocolProvenance(options: HcgSermProtocolOutputOptions): DataProvenance {
    const source: DataSource = options.provenanceSource ?? 'manual';
    const confidence = source === 'manual' ? 0.9 : 0.8;
    return {
        source,
        confidence,
        dataQuality: deriveDataQuality(confidence),
        recordedAt: options.recordedAt,
        timezone: options.timezone ?? 'UTC',
        unit: 'weeks',
        measurementMethod:
            options.provenanceSource && options.provenanceSource !== 'manual'
                ? 'ingested biometric'
                : 'simulated model estimate',
        referenceRange: {
            low: 4,
            high: 8,
            unit: 'weeks',
            source: 'Mr. X-Steroid Book — Receptor Recovery & HCG Protocols (Ch. 7)',
        },
    };
}

export function buildHcgSermProtocolKeyFindings(
    result: HcgSermResult,
    input: HcgSermEngineInput,
): KeyFinding[] {
    const findings: KeyFinding[] = [];

    // 1. Suppression score finding
    findings.push({
        id: 'suppression_score',
        titleAr: `مؤشر التثبيط المحوري: ${result.sScore} (${result.severityLabelAr})`,
        titleEn: `Suppression Score: ${result.sScore} (${result.severityLabelEn})`,
        detailAr: `تم حساب الحمل التثبيطي لـ ${input.compounds.length} مركبات على مدار ${input.cycleWeeks} أسبوعاً. الخطة المقررة تمتد لـ ${result.totalDurationWeeks} أسابيع.`,
        detailEn: `Calculated suppressive load for ${input.compounds.length} compounds across ${input.cycleWeeks} weeks. Protocol duration is ${result.totalDurationWeeks} weeks.`,
        severity: result.severity === 'severe' ? 'important' : result.severity === 'moderate' ? 'monitor' : 'info',
    });

    // 2. HCG Priming finding
    if (result.hcgRequired) {
        findings.push({
            id: 'hcg_priming_required',
            titleAr: 'تنبيه سريري: مطلوب تهيئة الخصية بواسطة HCG',
            titleEn: 'Clinical Alert: HCG Testicular Priming Required',
            detailAr: `${result.hcgReasonAr ?? 'تنشيط مستقبلات خلايا لايديغ ضروري قبل إعطاء SERMs.'} تحذير: يجب إيقاف HCG قبل 48 ساعة من المرحلة 1.`,
            detailEn: `${result.hcgReasonEn ?? 'Leydig cell reactivation is required before initiating SERMs.'} Caution: Stop HCG at least 48 hours before Phase 1.`,
            severity: 'important',
        });
    }

    // 3. Auto-switch finding if triggered
    if (result.isAutoSwitched) {
        findings.push({
            id: 'serm_auto_switch',
            titleAr: 'تبديل آلي للمركب الوقائي (Auto-Switch)',
            titleEn: 'Automated SERM Selection Adaptation',
            detailAr: result.autoSwitchReasonAr ?? 'تم تبديل مركب SERM لحمايتك من الأعراض الجانبية.',
            detailEn: result.autoSwitchReasonEn ?? 'SERM compound auto-switched to protect against documented sensitivities.',
            severity: 'monitor',
        });
    }

    return findings;
}

export function buildHcgSermProtocolOutput(
    rawInput: unknown,
    options: HcgSermProtocolOutputOptions,
): ToolOutput<HcgSermResult> {
    const tool = requireTool(TOOL_SLUG);
    const validatedInput = parseHcgSermEngineInput(rawInput);
    const result = calculateHcgSermProtocol(validatedInput);

    return buildToolOutput(tool.slug, {
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        result,
        provenance: buildHcgSermProtocolProvenance(options),
        keyFindings: buildHcgSermProtocolKeyFindings(result, validatedInput),
    });
}
