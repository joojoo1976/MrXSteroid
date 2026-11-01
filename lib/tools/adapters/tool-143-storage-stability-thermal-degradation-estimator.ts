import type { KeyFinding, ToolOutput } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { assessStorageExcursionV6, type StorageExcursionInput, type StorageExcursionResult } from '../engines/tool-143-storage-stability-thermal-degradation-estimator.v6';
import type { HeuristicOutputOptions } from './tool-126-130-common';

export function buildStorageExcursionOutput(input: StorageExcursionInput, options: HeuristicOutputOptions): ToolOutput<StorageExcursionResult> {
  const result = assessStorageExcursionV6(input);
  const ar = options.locale === 'ar';
  const temperatureUnit = options.unitSystem === 'imperial' ? '°F' : '°C';
  const displayTemperature = (celsius: number) => options.unitSystem === 'imperial' ? Number((celsius * 9 / 5 + 32).toFixed(4)) : celsius;
  const statusText = result.status === 'not_evaluable' ? (ar ? 'غير قابلة للتقييم؛ لا يُفترض نطاق تخزين' : 'Not evaluable; no storage range is assumed') : result.status === 'outside_entered_range' ? (ar ? 'القراءات تتجاوز النطاق المنقول' : 'Readings exceed the transcribed range') : (ar ? 'القراءات ضمن النطاق المنقول' : 'Readings are within the transcribed range');
  const missingLabels: Record<string, [string, string]> = {
    productName: ['اسم المنتج', 'product name'], productState: ['حالة المنتج', 'product state'], queriedAt: ['وقت الاستعلام', 'query time'],
    'DailyMed label reference': ['مرجع ملصق DailyMed محدد', 'specific DailyMed label reference'],
    'complete label storage range': ['حدا نطاق التخزين في الملصق', 'both label storage limits'],
    'complete observed temperature range': ['حدا نطاق الحرارة المسجل', 'both observed temperature limits'],
  };
  const localizedMissing = result.missingFields.map((field) => missingLabels[field]?.[ar ? 0 : 1] ?? field).join('، ');
  const stateLabel = result.productState ? ({ unopened: ar ? 'غير مفتوح' : 'unopened', in_use: ar ? 'قيد الاستخدام' : 'in use', reconstituted: ar ? 'بعد إعادة التحضير' : 'reconstituted' } as const)[result.productState] : (ar ? 'الحالة غير مسجلة' : 'state not recorded');
  const reviewInstruction = result.reviewInstruction ? (ar ? 'اتبع تعليمات التخزين الخاصة بالمنتج وراجع الصيدلي أو الشركة المصنّعة للحصول على توجيه خاص بهذا المنتج.' : result.reviewInstruction) : null;
  const findings: KeyFinding[] = [
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: ar ? 'مقارنة تعليمية فقط. لا تستنتج ثباتاً أو فعالية أو سلامة أو عقماً أو صلاحية للاستخدام.' : 'Educational comparison only. No stability, potency, safety, sterility, or suitability-for-use conclusion is made.', severity: 'important' },
    { code: 'RANGE_COMPARISON', labelAr: 'نتيجة مقارنة النطاق', labelEn: 'Range comparison', value: statusText, severity: result.status === 'outside_entered_range' ? 'monitor' : 'info' },
    { code: 'PRODUCT_AND_SOURCE', labelAr: 'المنتج وحالته ومرجع DailyMed', labelEn: 'Product, state and DailyMed reference', value: `${result.productName ?? (ar ? 'غير مسجل' : 'Not recorded')} · ${stateLabel} · ${result.labelReference ?? (ar ? 'مرجع غير متحقق' : 'No verified reference')} · ${result.queriedAt ?? (ar ? 'تاريخ البحث غير مسجل' : 'Query date not recorded')}`, severity: result.labelReference ? 'info' : 'important' },
    { code: 'ENTERED_RANGES', labelAr: `نطاق الملصق ثم القراءات (${temperatureUnit})`, labelEn: `Label range then readings (${temperatureUnit})`, value: `${result.labelRangeC ? `${displayTemperature(result.labelRangeC.min)}–${displayTemperature(result.labelRangeC.max)}` : '—'} · ${result.observedRangeC ? `${displayTemperature(result.observedRangeC.min)}–${displayTemperature(result.observedRangeC.max)}` : '—'}`, severity: 'info' },
    ...(reviewInstruction ? [{ code: 'REVIEW_REQUIRED', labelAr: 'الخطوة التالية', labelEn: 'Next step', value: reviewInstruction, severity: 'important' as const }] : []),
    ...(result.missingFields.length ? [{ code: 'MISSING_DATA', labelAr: 'بيانات لازمة للمقارنة', labelEn: 'Data needed for comparison', value: localizedMissing, severity: 'important' as const }] : []),
  ];
  const tool = requireTool('tool-143-storage-stability-thermal-degradation-estimator');
  return buildToolOutput({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt,
    locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType,
    accessTier: tool.accessTier, result,
    provenance: { source: 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: '°C', measurementMethod: 'User-entered DailyMed label reference and temperature ranges compared directly; no stability model or quality assessment', confidence: null, dataQuality: 'not_assessed' },
    keyFindings: findings, seoLinks: buildSeoLinks(tool),
  });
}
