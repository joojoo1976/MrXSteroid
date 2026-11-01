import type { KeyFinding, ToolOutput } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { calculateMassVolumeDensityV6, type MassVolumeDensityInput, type MassVolumeDensityResult } from '../engines/tool-144-homebrew-chemistry-calculator.v6';
import type { HeuristicOutputOptions } from './tool-126-130-common';

export function buildMassVolumeDensityOutput(input: MassVolumeDensityInput, options: HeuristicOutputOptions): ToolOutput<MassVolumeDensityResult> {
  const result = calculateMassVolumeDensityV6(input);
  const ar = options.locale === 'ar';
  const displayedTemperature = options.unitSystem === 'imperial' ? result.temperatureC * 9 / 5 + 32 : result.temperatureC;
  const temperatureUnit = options.unitSystem === 'imperial' ? '°F' : '°C';
  const findings: KeyFinding[] = [
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: ar ? 'حساب تعليمي للكتلة والحجم والكثافة فقط؛ لا يحسب خلطاً أو تركيزاً أو جرعة أو تحضيراً.' : 'Educational mass, volume and density arithmetic only; no mixing, concentration, dose or preparation calculations.', severity: 'important' },
    { code: 'CALCULATED_VALUE', labelAr: 'القيمة المحسوبة', labelEn: 'Calculated value', value: `${result.value} ${result.unit}`, severity: 'info' },
    { code: 'FORMULA', labelAr: 'العلاقة الحسابية', labelEn: 'Formula', value: result.formula, severity: 'info' },
    { code: 'DENSITY_CONTEXT', labelAr: 'سياق الكثافة', labelEn: 'Density context', value: `${result.densitySource} · ${Number(displayedTemperature.toPrecision(8))} ${temperatureUnit}`, severity: 'info' },
  ];
  const tool = requireTool('tool-144-homebrew-chemistry-calculator');
  return buildToolOutput({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt,
    locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType,
    accessTier: tool.accessTier, result,
    provenance: { source: 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: result.unit, measurementMethod: 'Deterministic SI quantity calculation from user-entered measurements; density source and temperature recorded', confidence: null, dataQuality: 'not_assessed' },
    keyFindings: findings, seoLinks: buildSeoLinks(tool),
  });
}
