import type { KeyFinding, ToolOutput } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { convertLabResultV6, type LabResultConversionInput, type LabResultConversionResult } from '../engines/tool-140-dosage-unit-conversion-engine.v6';
import type { HeuristicOutputOptions } from './tool-126-130-common';

export function buildLabResultConversionOutput(input: LabResultConversionInput, options: HeuristicOutputOptions): ToolOutput<LabResultConversionResult> {
  const result = convertLabResultV6(input);
  const ar = options.locale === 'ar';
  const findings: KeyFinding[] = [
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: ar ? 'تحويل وحدات نتيجة مخبرية للعنصر والوحدات المحددة فقط؛ لا يفسّر النتيجة ولا يحول جرعات الأدوية.' : 'Laboratory-result unit conversion for the exact listed analyte and units only; it does not interpret results or convert medication doses.', severity: 'important' },
    { code: 'CONVERTED_RESULT', labelAr: 'النتيجة المحوّلة', labelEn: 'Converted result', value: `${result.outputValue} ${result.toUnit}`, severity: 'info' },
    { code: 'FORMULA', labelAr: 'المعادلة وعامل التحويل', labelEn: 'Formula and conversion factor', value: `${result.formula} · factor ${result.factor}`, severity: 'info' },
    { code: 'SOURCE', labelAr: 'مرجع عامل التحويل', labelEn: 'Conversion-factor source', value: result.source, severity: 'info' },
  ];
  const tool = requireTool('tool-140-dosage-unit-conversion-engine');
  return buildToolOutput({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt,
    locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType,
    accessTier: tool.accessTier, result,
    provenance: { source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: `${input.fromUnit} → ${input.toUnit}`, measurementMethod: 'Published analyte-specific laboratory conversion factor; no interpretation', confidence: null, dataQuality: 'not_assessed' },
    keyFindings: findings, seoLinks: buildSeoLinks(tool),
  });
}
