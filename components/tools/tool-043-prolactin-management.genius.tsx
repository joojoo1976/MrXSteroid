'use client';
/**
 * components/tools/tool-043-prolactin-management.genius.tsx
 * Tool #043 — Prolactin Management Pro: Tool-Owned GENIUS-12 Boxes (CORE-5)
 */
import React, { useState, useMemo } from 'react';
import type { ProlactinResult } from '@/lib/tools/schemas/tool-043-prolactin-management';
import {
  TOOL_043_SOURCES,
  TOOL_043_CROSS_LINKS,
  buildTool043Csv,
  labFreshness,
} from '@/lib/tools/r6/tool-043-prolactin-management-contract';

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

export interface Tool043GeniusProps {
  result: ProlactinResult | null;
  prolactinLevel?: string;
  uses19Nor?: boolean;
  weeklyCabergolineMcg?: string;
  symptoms?: string[];
  panelDate?: string;
  compact: boolean;
  onToggleCompact: () => void;
  locale: 'ar' | 'en';
}

export default function Tool043Genius({
  result,
  prolactinLevel,
  uses19Nor,
  weeklyCabergolineMcg,
  symptoms,
  panelDate,
  compact,
  onToggleCompact,
  locale,
}: Tool043GeniusProps) {
  const [copiedCsv, setCopiedCsv] = useState(false);
  const isAr = locale === 'ar';

  const freshness = useMemo(() => {
    if (!panelDate) return null;
    return labFreshness(panelDate);
  }, [panelDate]);

  const csvContent = useMemo(() => {
    const rows = [
      { label: 'Prolactin Level', value: prolactinLevel || '-', unit: 'ng/mL' },
      { label: 'Uses 19-nor Compounds', value: uses19Nor ? 'Yes' : 'No', unit: '' },
      { label: 'Current Cabergoline', value: weeklyCabergolineMcg || '0', unit: 'mcg/week' },
      { label: 'Classification Band', value: result ? result.band : '-', unit: '' },
      { label: 'Action Recommendation', value: result ? result.action : '-', unit: '' },
      { label: 'Suggested Cabergoline', value: result ? String(result.suggested_weekly_mcg) : '-', unit: 'mcg/week' },
    ];
    return buildTool043Csv(rows);
  }, [prolactinLevel, uses19Nor, weeklyCabergolineMcg, result]);

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
      titleKey: isAr ? 'شريط مؤشرات البرولاكتين' : 'Prolactin KPI Strip',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-zinc-800">
            <span className="text-[11px] text-zinc-400">{isAr ? 'نطاق البرولاكتين' : 'Prolactin Band'}</span>
            <p className="text-base font-bold text-lime-400 capitalize">{result.band}</p>
          </div>
          <div className="p-2 rounded bg-zinc-800">
            <span className="text-[11px] text-zinc-400">{isAr ? 'جرعة كابيرجولين المقترحة' : 'Suggested Cabergoline'}</span>
            <p className="text-base font-bold text-cyan-400">{result.suggested_weekly_mcg} mcg/wk</p>
          </div>
        </div>
      ) : <p className="text-xs text-zinc-500">{isAr ? 'بانتظار المدخلات...' : 'Awaiting inputs...'}</p>,
    },
    // 2. Primary Result
    {
      n: 2,
      id: 'primary-result',
      titleKey: isAr ? 'الإجراء والتوصيات' : 'Action & Protocol Strategy',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="text-xs space-y-1">
          <p><span className="font-semibold text-zinc-300">Action:</span> <span className="font-mono text-lime-400">{result.action}</span></p>
          <p className="text-zinc-400">Titration suggestion: {result.suggested_weekly_mcg} mcg/week (consult physician).</p>
        </div>
      ) : <p className="text-xs text-zinc-500">Not available</p>,
    },
    // 3. How Calculated & Assumptions
    {
      n: 3,
      id: 'how-calculated',
      titleKey: isAr ? 'طريقة التصنيف والافتراضات' : 'How Classified & 19-nor Context',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400 leading-relaxed">
          {isAr
            ? 'تُصنف مستويات البرولاكتين استناداً إلى التوجيهات السريرية: <20 عادي، 20-25 حدي، 25-50 مرتفع، >50 شديد الارتفاع. مركبات 19-نور تحفز مستقبلات البروجسترون وترفع البرولاكتين.'
            : 'Prolactin banded into normal (<20 ng/mL), borderline (20-25), high (25-50), and very-high (>50). 19-nor AAS directly modulate PR and dopaminergic tone.'}
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
        <div className="text-xs space-y-1 text-zinc-300">
          <p>Prolactin: {prolactinLevel || '-'} ng/mL | 19-nor: {uses19Nor ? 'Yes' : 'No'}</p>
          <p>Current Cabergoline: {weeklyCabergolineMcg || '0'} mcg | Date: {panelDate || '-'}</p>
          {freshness && (
            <p className={freshness.fresh ? 'text-lime-400' : 'text-amber-400'}>
              Lab freshness: {freshness.days} days
            </p>
          )}
        </div>
      ),
    },
    // 5. What-If Scenarios
    {
      n: 5,
      id: 'what-if',
      titleKey: isAr ? 'تأثير مركبات 19-نور' : '19-Nor Progesterone Cross-Reactivity',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400">
          Nandrolone and Trenbolone exhibit progestogenic activity that stimulates pituitary lactotrophs, elevating prolactin even in the presence of controlled estradiol.
        </p>
      ),
    },
    // 6. Sensitivity Analysis
    {
      n: 6,
      id: 'sensitivity-analysis',
      titleKey: isAr ? 'معايرة كابيرجولين والقلب' : 'Dopamine Agonist Titration & Heart',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400">
          High cumulative doses of dopamine agonists carry valvulopathy risk. Use minimum effective dose (0.25 mg q3.5d or q7d) with routine monitoring.
        </p>
      ),
    },
    // 7. Warnings & Safety
    {
      n: 7,
      id: 'warnings-safety',
      titleKey: isAr ? 'التحذيرات وموانع الاستعمال' : 'Warnings & Clinical Safety',
      source: result && result.warnings.length > 0 ? 'engine' : 'static',
      content: result && result.warnings.length > 0 ? (
        <ul className="text-xs space-y-1 text-amber-400 list-disc list-inside">
          {result.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-lime-400">No active high-risk flags.</p>
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
          {TOOL_043_CROSS_LINKS.map(link => (
            <span key={link.slug} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
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
      titleKey: isAr ? 'المصادر السريرية' : 'Sources & Evidence',
      source: 'static',
      content: (
        <div className="text-xs space-y-1">
          {TOOL_043_SOURCES.map(src => (
            <div key={src.id}>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
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
          className="text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
        >
          {copiedCsv ? 'Copied!' : 'Copy Data as CSV'}
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
          NOT_APPLICABLE: No persistent multi-session tracking in zero-persistence mode.
        </p>
      ),
    },
    // 12. Next Actions & Referral
    {
      n: 12,
      id: 'next-actions',
      titleKey: isAr ? 'الخطوات القادمة' : 'Next Actions & Protocol Tips',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400">
          If prolactin exceeds 50 ng/mL, or if symptoms persist, obtain pituitary MRI and consult an endocrinologist.
        </p>
      ),
    },
  ];

  const visibleBoxes = compact ? boxes.filter(b => [1, 2, 3, 7, 9, 12].includes(b.n)) : boxes;

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
          {isAr ? 'تحليلات GENIUS-12 المتخصصة' : 'GENIUS-12 Analytical Framework'}
        </h3>
        <button
          type="button"
          onClick={onToggleCompact}
          className="text-xs px-2.5 py-1 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-300"
        >
          {compact ? 'Show Full (12)' : 'Show Core-5'}
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
              className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
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
