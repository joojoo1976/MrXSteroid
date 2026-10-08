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
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
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
        code: 'suppression_score',
        labelAr: `مؤشر التثبيط المحوري: ${result.sScore} (${result.severityLabelAr}) — تم حساب الحمل التثبيطي لـ ${input.compounds.length} مركبات على مدار ${input.cycleWeeks} أسبوعاً. الخطة المقررة تمتد لـ ${result.totalDurationWeeks} أسابيع.`,
        labelEn: `Suppression Score: ${result.sScore} (${result.severityLabelEn}) — Calculated suppressive load for ${input.compounds.length} compounds across ${input.cycleWeeks} weeks. Protocol duration is ${result.totalDurationWeeks} weeks.`,
        value: result.sScore,
        severity: result.severity === 'severe' ? 'important' : result.severity === 'moderate' ? 'monitor' : 'info',
    });

    // 2. HCG Priming finding
    if (result.hcgRequired) {
        findings.push({
            code: 'hcg_priming_required',
            labelAr: `تنبيه سريري: مطلوب تهيئة الخصية بواسطة HCG — ${result.hcgReasonAr ?? 'تنشيط مستقبلات خلايا لايديغ ضروري قبل إعطاء SERMs.'} تحذير: يجب إيقاف HCG قبل 48 ساعة من المرحلة 1.`,
            labelEn: `Clinical Alert: HCG Testicular Priming Required — ${result.hcgReasonEn ?? 'Leydig cell reactivation is required before initiating SERMs.'} Caution: Stop HCG at least 48 hours before Phase 1.`,
            value: 'HCG priming',
            severity: 'important',
        });
    }

    // 3. Auto-switch finding if triggered
    if (result.isAutoSwitched) {
        findings.push({
            code: 'serm_auto_switch',
            labelAr: `تبديل آلي للمركب الوقائي (Auto-Switch) — ${result.autoSwitchReasonAr ?? 'تم تبديل مركب SERM لحمايتك من الأعراض الجانبية.'}`,
            labelEn: `Automated SERM Selection Adaptation — ${result.autoSwitchReasonEn ?? 'SERM compound auto-switched to protect against documented sensitivities.'}`,
            value: 'SERM auto-switch',
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

    return buildToolOutput<HcgSermResult>({
        toolId: tool.toolId,
        toolSlug: tool.slug,
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        snapshotType: options.snapshotType,
        accessTier: 'free',
        result,
        provenance: buildHcgSermProtocolProvenance(options),
        keyFindings: buildHcgSermProtocolKeyFindings(result, validatedInput),
        seoLinks: buildSeoLinks(tool),
    });
}
