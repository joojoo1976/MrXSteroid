'use client';
/**
 * components/tools/tool-044-dht-side-effects.genius.tsx
 * Tool #044 — DHT Side Effects Analyzer: Tool-Owned GENIUS-12 Boxes (CORE-5)
 */
import React, { useState, useMemo } from 'react';
import type { DhtResult } from '@/lib/tools/schemas/tool-044-dht-side-effects';
import {
  TOOL_044_SOURCES,
  TOOL_044_CROSS_LINKS,
  buildTool044Csv,
  labFreshness,
} from '@/lib/tools/r6/tool-044-dht-side-effects-contract';

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

export interface Tool044GeniusProps {
  result: DhtResult | null;
  dhtLevel?: string;
  usesDhtDerivative?: boolean;
  fiveAri?: string;
  familyHistoryHairloss?: boolean;
  age?: string;
  panelDate?: string;
  compact: boolean;
  onToggleCompact: () => void;
  locale: 'ar' | 'en';
}

export default function Tool044Genius({
  result,
  dhtLevel,
  usesDhtDerivative,
  fiveAri,
  familyHistoryHairloss,
  age,
  panelDate,
  compact,
  onToggleCompact,
  locale,
}: Tool044GeniusProps) {
  const [copiedCsv, setCopiedCsv] = useState(false);
  const isAr = locale === 'ar';

  const freshness = useMemo(() => {
    if (!panelDate) return null;
    return labFreshness(panelDate);
  }, [panelDate]);

  const csvContent = useMemo(() => {
    const rows = [
      { label: 'Serum DHT', value: dhtLevel || '-', unit: 'ng/dL' },
      { label: 'Age', value: age || '-', unit: 'years' },
      { label: 'Uses DHT Derivative', value: usesDhtDerivative ? 'Yes' : 'No', unit: '' },
      { label: '5-ARI In Use', value: fiveAri || 'none', unit: '' },
      { label: 'Family History Hair Loss', value: familyHistoryHairloss ? 'Yes' : 'No', unit: '' },
      { label: 'Overall Burden', value: result ? `${result.overall_burden_pct}%` : '-', unit: '%' },
      { label: 'Hair Loss Risk', value: result ? `${result.hair_loss_risk_pct}%` : '-', unit: '%' },
      { label: 'Prostate Symptom Risk', value: result ? `${result.prostate_symptom_risk_pct}%` : '-', unit: '%' },
      { label: 'Risk Band', value: result ? result.band : '-', unit: '' },
    ];
    return buildTool044Csv(rows);
  }, [dhtLevel, age, usesDhtDerivative, fiveAri, familyHistoryHairloss, result]);

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
      titleKey: isAr ? 'شريط مؤشرات العبء الأندروجيني' : 'Androgenic Load KPI Strip',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded bg-zinc-800">
            <span className="text-[10px] text-zinc-400">{isAr ? 'العبء الكلي' : 'Overall Burden'}</span>
            <p className="text-sm font-bold text-amber-400">{result.overall_burden_pct}%</p>
          </div>
          <div className="p-2 rounded bg-zinc-800">
            <span className="text-[10px] text-zinc-400">{isAr ? 'خطر الشعر' : 'Hair Loss'}</span>
            <p className="text-sm font-bold text-rose-400">{result.hair_loss_risk_pct}%</p>
          </div>
          <div className="p-2 rounded bg-zinc-800">
            <span className="text-[10px] text-zinc-400">{isAr ? 'خطر البروستاتا' : 'Prostate Risk'}</span>
            <p className="text-sm font-bold text-sky-400">{result.prostate_symptom_risk_pct}%</p>
          </div>
        </div>
      ) : <p className="text-xs text-zinc-500">Awaiting inputs...</p>,
    },
    // 2. Primary Result
    {
      n: 2,
      id: 'primary-result',
      titleKey: isAr ? 'التصنيف وخطة الوقاية' : 'Classification & Mitigations',
      source: result ? 'engine' : 'not_available',
      content: result ? (
        <div className="text-xs space-y-1">
          <p><span className="font-semibold text-zinc-300">Risk Band:</span> <span className="font-mono uppercase text-amber-400">{result.band}</span></p>
          {result.mitigations.length > 0 && (
            <ul className="text-zinc-400 list-disc list-inside">
              {result.mitigations.map((m, idx) => <li key={idx}>{m}</li>)}
            </ul>
          )}
        </div>
      ) : <p className="text-xs text-zinc-500">Not available</p>,
    },
    // 3. How Calculated & Assumptions
    {
      n: 3,
      id: 'how-calculated',
      titleKey: isAr ? 'نموذج التقدير الموزون' : 'Weighted Risk Heuristic Model',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400 leading-relaxed">
          Risk calculated from clamped weighted contributions: serum DHT saturation anchor (50 ng/dL), genetic susceptibility, DHT-derivative AAS direct AR affinity, mitigated by 5-ARI enzyme inhibition (finasteride ~70%, dutasteride ~90%).
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
          <p>DHT: {dhtLevel || '-'} ng/dL | Age: {age || '-'} yrs | 5-ARI: {fiveAri || 'none'}</p>
          <p>DHT-derivative: {usesDhtDerivative ? 'Yes' : 'No'} | Fam History: {familyHistoryHairloss ? 'Yes' : 'No'}</p>
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
      titleKey: isAr ? 'تأثير مثبطات 5-ARI' : '5-ARI Mitigation Potency',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400">
          Finasteride blocks Type II 5-alpha reductase, reducing scalp DHT by ~60%. Dutasteride blocks Type I &amp; II, reducing scalp DHT by &gt;85%. Note: DHT-derivative AAS bypass 5-ARI enzyme inhibition.
        </p>
      ),
    },
    // 6. Sensitivity Analysis
    {
      n: 6,
      id: 'sensitivity-analysis',
      titleKey: isAr ? 'حساسية العمر والجينات' : 'Age & Receptor Sensitivity',
      source: 'static',
      content: (
        <p className="text-xs text-zinc-400">
          Age &gt;45 adds direct prostate baseline risk factor. Genetic hair loss history weights heavily (~25%) in follicle miniaturization threshold.
        </p>
      ),
    },
    // 7. Warnings & Safety
    {
      n: 7,
      id: 'warnings-safety',
      titleKey: isAr ? 'التحذيرات والفحوصات المطلوبة' : 'Clinical Warnings & Screening',
      source: 'static',
      content: (
        <p className="text-xs text-amber-400">
          Men over 45 on exogenous androgens must monitor PSA and conduct baseline digital rectal exams. 5-ARIs artificially depress PSA by ~50% (multiply measured PSA by 2 for accurate screening).
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
          {TOOL_044_CROSS_LINKS.map(link => (
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
      titleKey: isAr ? 'المصادر والخطوط الإرشادية' : 'Sources & Clinical Guidelines',
      source: 'static',
      content: (
        <div className="text-xs space-y-1">
          {TOOL_044_SOURCES.map(src => (
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
          Perform baseline scalp phototrichogram and annual PSA screening. Discuss topical antiandrogens (ru58841, pyrilutamide) or systemic 5-ARIs with dermatologist or urologist.
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
