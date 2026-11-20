'use client';
/**
 * components/tools/tool-035-hormone-conversion.genius.tsx
 * Tool #035 — Hormone Conversion Rate Calculator: Tool-Owned GENIUS-12 Boxes (CORE-5)
 */
import React, { useState, useMemo } from 'react';
import type { ConversionResult } from '@/lib/tools/schemas/tool-035-hormone-conversion';
import {
  TOOL_035_SOURCES,
  TOOL_035_CROSS_LINKS,
  buildTool035Csv,
  labFreshness,
} from '@/lib/tools/r6/tool-035-hormone-conversion-contract';

type BoxSource = 'engine' | 'static' | 'not_available' | 'not_applicable';

interface BoxDefinition {
  n: number;
  id: string;
  titleKey: string;
  source: BoxSource;
  content: React.ReactNode;
}

const SOURCE_BADGES: Record<BoxSource, { en: string; ar: string; className: string }> = {
  engine: { en: 'engine', ar: 'المحرك', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  static: { en: 'static', ar: 'ثابت', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  not_applicable: { en: 'NOT_APPLICABLE', ar: 'غير منطبق', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

export interface Tool035GeniusProps {
  result: ConversionResult | null;
  analyte?: string;
  value?: string;
  unit?: string;
  measurementDate?: string;
  readingSource?: string;
  compact: boolean;
  onToggleCompact: () => void;
  locale: 'ar' | 'en';
}

export default function Tool035Genius({
  result,
  analyte,
  value,
  unit,
  measurementDate,
  readingSource,
  compact,
  onToggleCompact,
  locale,
}: Tool035GeniusProps) {
  const [copiedCsv, setCopiedCsv] = useState(false);
  const isAr = locale === 'ar';

  const freshness = useMemo(() => {
    if (!measurementDate) return null;
    return labFreshness(measurementDate);
  }, [measurementDate]);

  const csvContent = useMemo(() => {
    const rows = [
      { label: 'Analyte', value: analyte || '-', unit: '' },
      { label: 'Input Value', value: value || '-', unit: unit || '' },
      { label: 'Converted Value', value: result ? String(result.result_value) : '-', unit: result ? result.result_unit : '' },
      { label: 'Conversion Factor', value: result ? String(result.conversion_factor) : '-', unit: '' },
      { label: 'Measurement Date', value: measurementDate || '-', unit: '' },
      { label: 'Reading Source', value: readingSource || '-', unit: '' },
    ];
    return buildTool035Csv(rows);
  }, [analyte, value, unit, result, measurementDate, readingSource]);

  const handleCopyCsv = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(csvContent);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2000);
    }
  };

  const boxes: BoxDefinition[] = [
    // 1. KPI Strip
    {
      n: 1,
      id: 'kpi-strip',
      titleKey: isAr ? 'شريط المؤشرات المحولة' : 'Conversion KPI Strip',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
            <span className="text-xs text-zinc-500">{isAr ? 'القيمة المدخلة' : 'Input Value'}</span>
            <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{result.input_value} {result.input_unit}</p>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
            <span className="text-xs text-zinc-500">{isAr ? 'القيمة المحولة' : 'Converted Value'}</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{result.result_value} {result.result_unit}</p>
          </div>
        </div>
      ) : <p className="text-xs text-zinc-400">{isAr ? 'بانتظار المدخلات...' : 'Awaiting input...'}</p>,
    },
    // 2. Primary Result
    {
      n: 2,
      id: 'primary-result',
      titleKey: isAr ? 'النتيجة الأساسية وتفسيرها' : 'Primary Result & Interpretation',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="space-y-1 text-sm">
          <p><span className="font-semibold">{result.analyte.toUpperCase()} Conversion:</span> {result.input_value} ({result.input_unit}) → {result.result_value} ({result.result_unit})</p>
          <p className="text-xs text-zinc-500">Method: {result.calculation_method}</p>
        </div>
      ) : <p className="text-xs text-zinc-400">{isAr ? 'غير متاح' : 'Not available'}</p>,
    },
    // 3. How Calculated & Assumptions
    {
      n: 3,
      id: 'how-calculated',
      titleKey: isAr ? 'طريقة الحساب والكتلة المولية' : 'How Calculated & Molar Masses',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {isAr
            ? 'تعتمد التحويلات على الكتلة المولية الدقيقة للمركب: التستوستيرون (288.4 g/mol) والإستراديول (272.4 g/mol) طبقاً للمعاير الدولية IUPAC/IFCC.'
            : 'Exact molar-mass derived conversion factors: Testosterone (288.4 g/mol), Estradiol (272.4 g/mol) based on standard IUPAC/IFCC stoichiometric relations.'}
        </p>
      ),
    },
    // 4. Inputs Summary
    {
      n: 4,
      id: 'inputs-summary',
      titleKey: isAr ? 'ملخص المدخلات' : 'Inputs Summary',
      source: 'static',
      content: (
        <div className="text-xs space-y-1">
          <p>Analyte: {analyte || '-'} | Value: {value || '-'} {unit || ''}</p>
          <p>Date: {measurementDate || '-'} | Facility: {readingSource ? `[${readingSource.slice(0, 3)}***]` : '-'}</p>
          {freshness && (
            <p className={freshness.fresh ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {isAr ? `عمر التحليل: ${freshness.days} يوم` : `Lab age: ${freshness.days} days`}
            </p>
          )}
        </div>
      ),
    },
    // 5. What-If Scenarios
    {
      n: 5,
      id: 'what-if',
      titleKey: isAr ? 'تحويلات بديلة' : 'Unit Comparisons',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr
            ? 'تستخدم المعامل في أمريكا الوحدات التقليدية (ng/dL و pg/mL)، بينما تستخدم المعامل الدولية وحدات SI (nmol/L و pmol/L).'
            : 'US laboratories predominantly report in conventional units (ng/dL, pg/mL), whereas European and international labs report in SI (nmol/L, pmol/L).'}
        </p>
      ),
    },
    // 6. Sensitivity Analysis
    {
      n: 6,
      id: 'sensitivity-analysis',
      titleKey: isAr ? 'دقة التحويل والأرقام العشرية' : 'Precision & Rounding',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr
            ? 'تقرب النتائج لأربعة منازل عشرية لمنع تراكم أخطاء التقريب الحسابية.'
            : 'Results rounded to 4 decimal places with intermediate double-precision IEEE-754 arithmetic.'}
        </p>
      ),
    },
    // 7. Warnings & Safety
    {
      n: 7,
      id: 'warnings-safety',
      titleKey: isAr ? 'التحذيرات ومطابقة الوحدات' : 'Warnings & Unit Mismatches',
      source: 'static',
      content: (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {isAr
            ? 'تأكد من عدم الخلط بين نانوجرام/ديسيلتر وبيكوجرام/مللتير؛ فالفرق هو ألف ضعف (1000x).'
            : 'Caution: never confuse ng/dL and pg/mL; magnitude is a factor of 1000x difference.'}
        </p>
      ),
    },
    // 8. Cross-Tool Links
    {
      n: 8,
      id: 'cross-tool-links',
      titleKey: isAr ? 'الأدوات المرتبطة' : 'Cross-Tool Links',
      source: 'static',
      content: (
        <div className="flex flex-wrap gap-1">
          {TOOL_035_CROSS_LINKS.map(link => (
            <span key={link.slug} className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {link.label}
            </span>
          ))}
        </div>
      ),
    },
    // 9. Sources & Evidence
    {
      n: 9,
      id: 'sources-evidence',
      titleKey: isAr ? 'المصادر العلمية' : 'Sources & Evidence',
      source: 'static',
      content: (
        <div className="text-xs space-y-1">
          {TOOL_035_SOURCES.map(src => (
            <div key={src.id}>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                [{src.level}] {src.label}
              </a>
            </div>
          ))}
        </div>
      ),
    },
    // 10. Client-Side Export
    {
      n: 10,
      id: 'client-export',
      titleKey: isAr ? 'تصدير البيانات (CSV)' : 'Client-Side Export (CSV)',
      source: 'static',
      content: (
        <button
          type="button"
          onClick={handleCopyCsv}
          className="text-xs px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
        >
          {copiedCsv ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البيانات كـ CSV' : 'Copy Data as CSV')}
        </button>
      ),
    },
    // 11. History — ALWAYS NOT_APPLICABLE
    {
      n: 11,
      id: 'history-record',
      titleKey: isAr ? 'السجل التاريخي' : 'History & Longitudinal Record',
      source: 'not_applicable',
      content: (
        <p className="text-xs text-zinc-500">
          NOT_APPLICABLE: {isAr ? 'لا يوجد حفظ مستمر للسجل في وضع عدم الاتصال.' : 'No persistent multi-session tracking in zero-persistence mode.'}
        </p>
      ),
    },
    // 12. Next Actions & Referral
    {
      n: 12,
      id: 'next-actions',
      titleKey: isAr ? 'الخطوات القادمة' : 'Next Actions & Clinical Reference',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr
            ? 'استخدم هذه القيمة المحولة للمقارنة مع النطاقات المرجعية لمختبرك المحلي.'
            : 'Use converted value to evaluate compliance against local clinical target reference ranges.'}
        </p>
      ),
    },
  ];

  const visibleBoxes = compact ? boxes.filter(b => [1, 2, 3, 7, 9, 12].includes(b.n)) : boxes;

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {isAr ? 'تحليلات GENIUS-12 المتخصصة' : 'GENIUS-12 Analytical Framework'}
        </h3>
        <button
          type="button"
          onClick={onToggleCompact}
          className="text-xs px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {compact ? (isAr ? 'عرض الكل (12)' : 'Show Full (12)') : (isAr ? 'عرض Core-5' : 'Show Core-5')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleBoxes.map(b => {
          const badge = SOURCE_BADGES[b.source];
          return (
            <div
              key={b.id}
              data-r6-box={b.n}
              data-r6-box-source={b.source}
              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {b.n}. {b.titleKey}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${badge.className}`}>
                  {isAr ? badge.ar : badge.en}
                </span>
              </div>
              <div>{b.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
