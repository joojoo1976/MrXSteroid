'use client';
/**
 * components/tools/tool-023-trt-optimization.genius.tsx
 * Tool #023 — TRT Optimization Guide: Tool-Owned GENIUS-12 Boxes (CORE-5)
 */
import React, { useState, useMemo } from 'react';
import type { TrtResult } from '@/lib/tools/schemas/tool-023-trt-optimization';
import {
  TOOL_023_SOURCES,
  TOOL_023_CROSS_LINKS,
  buildTool023Csv,
  labFreshness,
} from '@/lib/tools/r6/tool-023-trt-optimization-contract';

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

export interface Tool023GeniusProps {
  result: TrtResult | null;
  age?: string;
  troughT?: string;
  freeT?: string;
  hematocrit?: string;
  e2?: string;
  trtDuration?: string;
  administration?: string;
  panelDate?: string;
  compact: boolean;
  onToggleCompact: () => void;
  locale: 'ar' | 'en';
}

export default function Tool023Genius({
  result,
  age,
  troughT,
  freeT,
  hematocrit,
  e2,
  trtDuration,
  administration,
  panelDate,
  compact,
  onToggleCompact,
  locale,
}: Tool023GeniusProps) {
  const [copiedCsv, setCopiedCsv] = useState(false);
  const isAr = locale === 'ar';

  const freshness = useMemo(() => {
    if (!panelDate) return null;
    return labFreshness(panelDate);
  }, [panelDate]);

  const csvContent = useMemo(() => {
    const rows = [
      { label: 'Age', value: age || '-', unit: 'years' },
      { label: 'Trough Testosterone', value: troughT || '-', unit: 'ng/dL' },
      { label: 'Free Testosterone', value: freeT || '-', unit: 'pg/mL' },
      { label: 'Hematocrit', value: hematocrit || '-', unit: '%' },
      { label: 'Estradiol (E2)', value: e2 || '-', unit: 'pg/mL' },
      { label: 'TRT Duration', value: trtDuration || '-', unit: 'months' },
      { label: 'Administration Route', value: administration || '-', unit: '' },
      { label: 'Recommended Dose', value: result ? String(result.recommended_dose_mg_weekly) : '-', unit: 'mg/week' },
      { label: 'Target Total T', value: result ? String(result.recommended_total_test_ng_dL) : '-', unit: 'ng/dL' },
      { label: 'E2 Management Strategy', value: result ? result.e2_management : '-', unit: '' },
    ];
    return buildTool023Csv(rows);
  }, [age, troughT, freeT, hematocrit, e2, trtDuration, administration, result]);

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
      titleKey: isAr ? 'شريط المؤشرات الحيوية' : 'KPI Strip',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
            <span className="text-xs text-zinc-500">{isAr ? 'الجرعة الموصى بها' : 'Recommended Dose'}</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{result.recommended_dose_mg_weekly} mg/wk</p>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
            <span className="text-xs text-zinc-500">{isAr ? 'الهدف للتستوستيرون' : 'Target Total T'}</span>
            <p className="text-base font-bold text-sky-600 dark:text-sky-400">{result.recommended_total_test_ng_dL} ng/dL</p>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
            <span className="text-xs text-zinc-500">{isAr ? 'إدارة الإستروجين' : 'E2 Management'}</span>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 capitalize">{result.e2_management.replace(/_/g, ' ')}</p>
          </div>
        </div>
      ) : <p className="text-xs text-zinc-400">{isAr ? 'بانتظار البيانات...' : 'Awaiting input...'}</p>,
    },
    // 2. Primary Result
    {
      n: 2,
      id: 'primary-result',
      titleKey: isAr ? 'النتيجة الأساسية وتفسيرها' : 'Primary Result & Interpretation',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="space-y-1 text-sm">
          <p><span className="font-semibold">{isAr ? 'الجرعة الأسبوعية المقترحة:' : 'Suggested Weekly Dose:'}</span> {result.recommended_dose_mg_weekly} mg/week</p>
          <p><span className="font-semibold">{isAr ? 'جدول المتابعة:' : 'Monitoring Schedule:'}</span> {result.monitoring_schedule}</p>
          {result.expected_hematocrit !== undefined && (
            <p><span className="font-semibold">{isAr ? 'الهيماتوكريت المتوقع:' : 'Expected Hematocrit:'}</span> {result.expected_hematocrit}%</p>
          )}
        </div>
      ) : <p className="text-xs text-zinc-400">{isAr ? 'غير متاح' : 'Not available'}</p>,
    },
    // 3. How Calculated & Assumptions
    {
      n: 3,
      id: 'how-calculated',
      titleKey: isAr ? 'طريقة الحساب والافتراضات' : 'How Calculated & Assumptions',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {isAr
            ? 'تعتمد خوارزمية TRT على معايرة الجرعة وفق مستويات تستوستيرون القاع والأعراض المبلّغة، مستهدفة مستوى قاع فيزيولوجي بين 700-1000 نانوجرام/ديسيلتر طبقاً لتوجيهات AUA والجمعية الأمريكية للغدد الصماء.'
            : 'Dosage recommendation adjusts baseline TRT (80-200 mg/wk) based on trough testosterone gap to optimal 750 ng/dL target, modulated by symptom severity, hematocrit status, and estradiol.'}
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
          <p>Age: {age || '-'} yrs | Trough: {troughT || '-'} ng/dL | Free T: {freeT || '-'} pg/mL</p>
          <p>HCT: {hematocrit || '-'}% | E2: {e2 || '-'} pg/mL | Duration: {trtDuration || '-'} mos | Route: {administration || '-'}</p>
          {freshness && (
            <p className={freshness.fresh ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {isAr ? `عمر التحليل: ${freshness.days} يوم (${freshness.fresh ? 'حديث' : 'قديم'})` : `Lab age: ${freshness.days}d (${freshness.fresh ? 'fresh' : 'stale >90d'})`}
            </p>
          )}
        </div>
      ),
    },
    // 5. What-If Scenarios
    {
      n: 5,
      id: 'what-if',
      titleKey: isAr ? 'سيناريوهات المحاكاة' : 'What-If Scenarios',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr
            ? 'تقسيم الجرعة (مرتين أو 3 مرات أسبوعياً) يقلل ذروة الإستروجين وتذبذبات الهيماتوكريت مقارنة بالحقن مرة كل أسبوعين.'
            : 'Splitting dose to q3.5d or subQ typically flattens peak-to-trough fluctuations, lowering peak E2 and mitigating hematocrit spikes.'}
        </p>
      ),
    },
    // 6. Sensitivity Analysis
    {
      n: 6,
      id: 'sensitivity-analysis',
      titleKey: isAr ? 'تحليل الحساسية' : 'Sensitivity Analysis',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr
            ? 'كل تغيير 10 نانوجرام/ديسيلتر في تستوستيرون القاع يعادل تعديلاً تقريبياً قدره 1 ملغ أسبوعياً في جرعة الإستر.'
            : 'Each 10 ng/dL gap from target corresponds approximately to ~1 mg weekly ester dosage adjustment in starting titration.'}
        </p>
      ),
    },
    // 7. Warnings & Safety
    {
      n: 7,
      id: 'warnings-safety',
      titleKey: isAr ? 'التحذيرات والسلامة' : 'Warnings & Safety',
      source: result && result.risk_factors.length > 0 ? 'engine' : 'static',
      content: result && result.risk_factors.length > 0 ? (
        <ul className="text-xs space-y-1 text-rose-600 dark:text-rose-400 list-disc list-inside">
          {result.risk_factors.map((rf, idx) => <li key={idx}>{rf}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {isAr ? 'لم تسجل عوامل خطر حرجة فورية.' : 'No critical safety contraindications flagged.'}
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
          {TOOL_023_CROSS_LINKS.map(link => (
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
      titleKey: isAr ? 'المصادر والأدلة' : 'Sources & Evidence',
      source: 'static',
      content: (
        <div className="text-xs space-y-1">
          {TOOL_023_SOURCES.map(src => (
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
    // 11. History (Session-only lab record) — ALWAYS NOT_APPLICABLE
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
      titleKey: isAr ? 'الخطوات القادمة' : 'Next Actions & Protocol Tips',
      source: result && result.protocol_tips.length > 0 ? 'engine' : 'static',
      content: result && result.protocol_tips.length > 0 ? (
        <ul className="text-xs space-y-1 text-zinc-700 dark:text-zinc-300 list-disc list-inside">
          {result.protocol_tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {isAr ? 'استشر طبيب الغدد أو أخصائي المسالك لمراجعة البروتوكول دورياً.' : 'Review protocol with prescribing physician every 3-6 months.'}
        </p>
      ),
    },
  ];

  // Core-5 compact mode: show boxes [1, 2, 3, 7, 9, 12] = 6 boxes
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
