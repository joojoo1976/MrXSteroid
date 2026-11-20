'use client';
/**
 * components/tools/tool-015-shbg-modulator.genius.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #015 — Free Testosterone & SHBG: Tool-Owned GENIUS-12 Boxes
 *
 * Implements the full 12-box framework (CORE-5 + Enrichment):
 * 1. KPI Strip (C1)
 * 2. Primary Result (C1)
 * 3. How Calculated & Assumptions (C2)
 * 4. Inputs Summary (C2 detail)
 * 5. What-If Scenarios
 * 6. Sensitivity Analysis
 * 7. Warnings & Safety (C3)
 * 8. Cross-Tool Links
 * 9. Sources & Evidence (C4)
 * 10. Client-Side Export (CSV)
 * 11. History (Session-only lab record)
 * 12. Next Actions & Clinical Referral (C5)
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { SHBGInput, SHBGResult } from '@/lib/tools/schemas/tool-015-shbg-modulator';
import {
  TOOL_015_SOURCES,
  TOOL_015_CROSS_TOOL_LINKS,
  getShbgBand,
  computeFAI,
  buildShbgCsv,
  labFreshness,
} from '@/lib/tools/r6/tool-015-shbg-modulator-contract';

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

const BOX_TINT = [
  'bg-zinc-900/60 border-zinc-800',
  'bg-sky-950/20 border-sky-900',
  'bg-blue-950/20 border-blue-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-cyan-950/20 border-cyan-900',
  'bg-cyan-950/20 border-cyan-900',
  'bg-orange-950/20 border-orange-900',
  'bg-teal-950/20 border-teal-900',
  'bg-purple-950/20 border-purple-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-zinc-900/60 border-zinc-800',
  'bg-yellow-950/20 border-yellow-900',
];

export interface Tool015GeniusProps {
  locale: 'ar' | 'en';
  input: SHBGInput;
  output: ToolOutput<SHBGResult>;
  panelDate?: string;
}

export default function Tool015Genius({ locale, input, output, panelDate = '2026-03-01' }: Tool015GeniusProps) {
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const result = output.result;

  const shbgBand = getShbgBand(input.shbg_nmol_L);
  const fai = computeFAI(input.total_testosterone_ng_dL, input.shbg_nmol_L);
  const freshness = labFreshness(panelDate, output.calculatedAt.slice(0, 10));

  const handleDownloadCsv = useCallback(() => {
    const csv = buildShbgCsv(
      input.total_testosterone_ng_dL,
      input.shbg_nmol_L,
      input.albumin_g_dL,
      result.free_testosterone_ng_dL,
      result.bioavailable_testosterone_ng_dL,
      fai,
      panelDate,
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shbg-freet-record-${panelDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [
    input.total_testosterone_ng_dL,
    input.shbg_nmol_L,
    input.albumin_g_dL,
    result.free_testosterone_ng_dL,
    result.bioavailable_testosterone_ng_dL,
    fai,
    panelDate,
  ]);

  const boxes: BoxDefinition[] = useMemo(() => {
    return [
      // 1. KPI Strip (C1)
      {
        n: 1,
        id: 'kpi-strip',
        titleKey: isAr ? '1. شريط المؤشرات الحيوية الرئيسي' : '1. Androgen KPI Strip',
        source: 'engine',
        content: (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-center">
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">Free Testosterone</span>
              <span className="text-sm font-bold text-emerald-400">{result.free_testosterone_ng_dL.toFixed(2)} ng/dL</span>
              <span className="block text-[9px] text-zinc-400">{result.free_testosterone_percentage.toFixed(2)}% of total</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">SHBG</span>
              <span className="text-sm font-bold text-sky-400">{input.shbg_nmol_L} nmol/L</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{shbgBand}</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">Bioavailable T</span>
              <span className="text-sm font-bold text-purple-400">{result.bioavailable_testosterone_ng_dL.toFixed(2)} ng/dL</span>
              <span className="block text-[9px] text-zinc-400 uppercase">CALCULATED</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">Free Androgen Index (FAI)</span>
              <span className="text-sm font-bold text-cyan-400">{fai !== null ? `${fai}%` : '—'}</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{fai && fai > 150 ? 'ELEVATED' : 'NORMAL'}</span>
            </div>
          </div>
        ),
      },
      // 2. Primary Result (C1)
      {
        n: 2,
        id: 'primary-result',
        titleKey: isAr ? '2. النتيجة الأساسية وتوافر الأندروجين' : '2. Primary Result & Androgen Availability',
        source: 'engine',
        content: (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">
                {isAr ? 'حالة التستوستيرون الحر:' : 'Free Androgen Status:'}
              </span>
              <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                {result.free_testosterone_ng_dL >= 5.0 && result.free_testosterone_ng_dL <= 21.0
                  ? (isAr ? 'ضمن النطاق الأمثل' : 'OPTIMAL REFERENCE')
                  : result.free_testosterone_ng_dL > 21.0
                    ? (isAr ? 'مرتفع' : 'ELEVATED')
                    : (isAr ? 'منخفض' : 'BELOW REFERENCE')}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {isAr
                ? `وفقاً لمعادلة فيرمولين، يبلغ التستوستيرون الحر المحسوب ${result.free_testosterone_ng_dL.toFixed(2)} ng/dL (${result.free_testosterone_percentage.toFixed(2)}% من الكلي)، بينما يبلغ التستوستيرون المتاح حيوياً للأنسجة ${result.bioavailable_testosterone_ng_dL.toFixed(2)} ng/dL. مستوى SHBG الحالي (${input.shbg_nmol_L} nmol/L) يقع في النطاق (${shbgBand}).`
                : `Calculated free testosterone via Vermeulen mass action is ${result.free_testosterone_ng_dL.toFixed(2)} ng/dL (${result.free_testosterone_percentage.toFixed(2)}% of total T). Bioavailable testosterone fraction is ${result.bioavailable_testosterone_ng_dL.toFixed(2)} ng/dL. Circulating SHBG is ${input.shbg_nmol_L} nmol/L (${shbgBand} band).`}
            </p>
            <div className="text-[10px] text-zinc-500">
              {isAr ? 'الثقة: حتمية رياضية من قانون فعل الكتلة (Vermeulen 1999) — خالية من أي تقديرات ذكاء اصطناعي.' : 'Confidence: Deterministic mass-action equilibrium calculation — zero AI estimation.'}
            </div>
          </div>
        ),
      },
      // 3. How Calculated (C2)
      {
        n: 3,
        id: 'how-calculated',
        titleKey: isAr ? '3. الصيغة الرياضية والافتراضات الكيميائية' : '3. How Calculated & Assumptions',
        source: 'static',
        content: (
          <div className="space-y-1.5 text-xs text-zinc-400">
            <p>
              <strong>{isAr ? 'المعادلة:' : 'Formula:'} </strong>
              {isAr
                ? 'معادلة فيرمولين للاتزان الكتلي التربيعي لحساب التنافس بين جزيئات SHBG والألبومين على ارتباط التستوستيرون.'
                : 'Vermeulen quadratic mass-action equilibrium equation solving competitive binding kinetics between SHBG and human serum albumin.'}
            </p>
            <p>
              <strong>{isAr ? 'الثوابت الفيزيائية والكيميائية:' : 'Physicochemical Constants:'} </strong>
              Albumin MW: 66,500 g/mol; K_alb: 3.6×10⁴ L/mol; K_shbg: 1.0×10⁹ L/mol.
            </p>
          </div>
        ),
      },
      // 4. Inputs Summary (C2 detail)
      {
        n: 4,
        id: 'inputs-summary',
        titleKey: isAr ? '4. ملخص المدخلات وتاريخ التحليل' : '4. Inputs Summary & Freshness Anchor',
        source: 'engine',
        content: (
          <div className="space-y-1 text-xs text-zinc-400">
            <div className="flex justify-between font-mono">
              <span>Total Testosterone:</span>
              <span className="text-white">{input.total_testosterone_ng_dL} ng/dL</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>SHBG:</span>
              <span className="text-white">{input.shbg_nmol_L} nmol/L</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Albumin:</span>
              <span className="text-white">{input.albumin_g_dL} g/dL</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-800">
              <span>{isAr ? 'حداثة التحليل:' : 'Panel Freshness:'}</span>
              <span className={freshness.stale ? 'text-amber-400 font-bold' : 'text-lime-400 font-bold'}>
                {freshness.stale ? (isAr ? 'قديم (>90 يوم)' : 'Stale (>90 days)') : (isAr ? 'حديث' : 'Current')} ({freshness.ageDays} {isAr ? 'يوم' : 'days'})
              </span>
            </div>
          </div>
        ),
      },
      // 5. What-If Scenarios
      {
        n: 5,
        id: 'what-if',
        titleKey: isAr ? '5. سيناريوهات ماذا لو' : '5. What-If Scenarios',
        source: 'static',
        content: (
          <div className="space-y-1.5 text-xs text-zinc-400">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="font-semibold text-zinc-300">
                {isAr ? 'سيناريو: انخفاض SHBG إلى 15 nmol/L' : 'Scenario: SHBG drops to 15 nmol/L'}
              </span>
              <p className="mt-0.5 text-[11px]">
                {isAr
                  ? 'ترتفع نسبة التستوستيرون الحر بنسبة تتجاوز 40%، مما يزيد العبء الأندروجيني وتسارع معدل تصفية الهرمون كبدياً.'
                  : 'Free testosterone percentage increases by >40%, accelerating metabolic clearance and peripheral tissue androgen exposure.'}
              </p>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="font-semibold text-zinc-300">
                {isAr ? 'سيناريو: ارتفاع SHBG إلى 60 nmol/L' : 'Scenario: SHBG elevates to 60 nmol/L'}
              </span>
              <p className="mt-0.5 text-[11px]">
                {isAr
                  ? 'ينخفض الكسر الحر إلى أقل من 1.3%، مما قد يسبب أعراض نقص أندروجيني رغم بقاء التستوستيرون الكلي مرتفعاً.'
                  : 'Free fraction drops below 1.3%, potentially triggering hypogonadal symptoms despite eugonadal total testosterone.'}
              </p>
            </div>
          </div>
        ),
      },
      // 6. Sensitivity Analysis
      {
        n: 6,
        id: 'sensitivity',
        titleKey: isAr ? '6. تحليل حساسية الارتباط' : '6. Binding Sensitivity Dynamics',
        source: 'static',
        content: (
          <p className="text-xs text-zinc-400 leading-relaxed">
            {isAr
              ? 'العلاقة بين تركيز SHBG ونسبة التستوستيرون الحر غير خطية؛ الانخفاضات الحادة تحت 20 nmol/L تسبب قفزات أسية في تركيز الهرمون الحر. بينما تأثير تقلبات الألبومين يكون طفيفاً ومستقراً.'
              : 'The relationship between SHBG and free testosterone percentage is non-linear; drops below 20 nmol/L cause steep exponential increases in free T. Albumin fluctuations yield mild, buffered linear shifts.'}
          </p>
        ),
      },
      // 7. Safety & Warnings (C3)
      {
        n: 7,
        id: 'safety-warnings',
        titleKey: isAr ? '7. السلامة والتحذيرات السريرية' : '7. Safety & Clinical Warnings',
        source: 'static',
        content: (
          <div className="space-y-1.5 text-xs text-amber-200">
            <p>
              ⚠️ <strong>{isAr ? 'انخفاض SHBG المفرط ومقاومة الإنسولين:' : 'Suppressed SHBG & Metabolic Red Flag:'} </strong>
              {isAr
                ? 'الهبوط تحت 15 nmol/L يرتبط بفرط إنسولين الدم، دهون الكبد، ومتلازمة الأيض؛ تجنب استهداف قمع SHBG الدوائي العشوائي.'
                : 'Levels <15 nmol/L strongly associate with hepatic steatosis, hyperinsulinemia, and metabolic syndrome. Do not seek pharmacological SHBG eradication.'}
            </p>
            <p>
              ⚠️ <strong>{isAr ? 'فخ تقييم التستوستيرون الكلي المنفرد:' : 'Isolated Total T Pitfall:'} </strong>
              {isAr
                ? 'تقييم التستوستيرون الكلي وحده مضلل عند وجود خلل في SHBG. استشر طبيب الغدد الصماء لتفسير النتائج مجتمعة.'
                : 'Total T alone is clinically misleading when SHBG is perturbed. Always interpret calculated free T alongside clinical symptomatology.'}
            </p>
          </div>
        ),
      },
      // 8. Cross-Tool Links
      {
        n: 8,
        id: 'cross-tool-links',
        titleKey: isAr ? '8. الروابط المتقاطعة بالأدوات الأخرى' : '8. Cross-Tool Links',
        source: 'static',
        content: (
          <div className="space-y-2 text-xs">
            {TOOL_015_CROSS_TOOL_LINKS.map((link) => (
              <div key={link.slug} className="flex flex-col p-2 rounded bg-zinc-950 border border-zinc-800">
                <a href={`/smarttools/${link.slug}`} className="font-semibold text-sky-400 hover:underline">
                  {isAr ? link.nameAr : link.nameEn} →
                </a>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isAr ? link.relationAr : link.relationEn}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      // 9. Sources & Evidence (C4)
      {
        n: 9,
        id: 'sources-evidence',
        titleKey: isAr ? '9. المصادر والأدلة السريرية' : '9. Evidence & Scientific Sources',
        source: 'static',
        content: (
          <div className="space-y-2 text-xs">
            {TOOL_015_SOURCES.map((s) => (
              <div key={s.n} className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-zinc-200">{s.publisher} ({s.year})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Level {s.level}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{s.title}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-400 hover:underline mt-1 inline-block">
                  {s.doi ? `DOI: ${s.doi}` : 'Access Paper'} ↗
                </a>
              </div>
            ))}
          </div>
        ),
      },
      // 10. Client-Side Export
      {
        n: 10,
        id: 'export-box',
        titleKey: isAr ? '10. تصدير البيانات (CSV)' : '10. Local Data Export',
        source: 'static',
        content: (
          <div className="space-y-2 text-xs">
            <p className="text-zinc-400">
              {isAr
                ? 'تنزيل النتائج المحسوبة في ملف CSV محلياً على جهازك دون إرسال أي معلومة إلى أي خادم.'
                : 'Export calculated free and bioavailable testosterone fractions locally. Zero server transmission.'}
            </p>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold transition"
            >
              📥 {isAr ? 'تنزيل ملف CSV' : 'Download CSV'}
            </button>
          </div>
        ),
      },
      // 11. History (Session-only lab record)
      {
        n: 11,
        id: 'history-box',
        titleKey: isAr ? '11. سجل الجلسة والمقارنة التاريخية' : '11. History & Session Context',
        source: 'not_applicable',
        content: (
          <div className="text-xs text-zinc-500" data-r6-box-source="not_applicable">
            <p>
              {isAr
                ? 'NOT_APPLICABLE: تعمل الأداة في نطاق الذاكرة الحالية للجلسة فقط، ولا يتم تخزين أي نتائج في المتصفح أو قواعد البيانات السحابية.'
                : 'NOT_APPLICABLE: In-memory session calculation only. No persistent browser or cloud storage is maintained.'}
            </p>
          </div>
        ),
      },
      // 12. Next Actions (C5)
      {
        n: 12,
        id: 'next-actions',
        titleKey: isAr ? '12. الخطوات التالية والإجراءات السريرية' : '12. Next Actions & Referral',
        source: 'static',
        content: (
          <div className="space-y-1.5 text-xs text-zinc-300">
            <p>
              <strong>1. {isAr ? 'الخطوة الفورية الأولى:' : 'Immediate Next Step:'} </strong>
              {isAr
                ? 'في حال كان SHBG منخفضاً، يُنصح بفحص صيام السكر التراكمي (HbA1c) وإنزيمات الكبد والدهون الثلاثية لتقييم صحة الأيض.'
                : 'If SHBG is suppressed (<15 nmol/L), evaluate metabolic biomarkers: fasting insulin, HbA1c, and hepatic lipid profile.'}
            </p>
            <p>
              <strong>2. {isAr ? 'ما يجب تجنبه قطعيًا:' : 'What NOT To Do:'} </strong>
              {isAr
                ? 'لا تستخدم مركبات دوائية قمعية لـ SHBG بهدف رفع التستوستيرون الحر بشكل مصطنع دون إشراف طبي.'
                : 'Do NOT use oral androgens or suppressive compounds merely to artificially depress SHBG.'}
            </p>
            <p>
              <strong>3. {isAr ? 'متى تستشير الطبيب:' : 'When To Consult a Clinician:'} </strong>
              {isAr
                ? 'عند وجود أعراض نقص هرموني مستمرة رغم التستوستيرون الكلي الطبيعي، أو عند ارتفاع SHBG غير المبرر (>50 nmol/L).'
                : 'Consult an endocrinologist if persistent hypogonadal symptoms occur despite normal total T, or if SHBG exceeds 50 nmol/L.'}
            </p>
          </div>
        ),
      },
    ];
  }, [input, result, shbgBand, fai, isAr, panelDate, output.calculatedAt, freshness, handleDownloadCsv]);

  const displayedBoxes = compact ? boxes.filter((b) => [1, 2, 3, 7, 9, 12].includes(b.n)) : boxes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-300">
          {isAr ? 'صناديق جينيوس التحليلية (GENIUS-12)' : 'GENIUS Analytical Layer (GENIUS-12)'}
        </h3>
        <button
          type="button"
          onClick={() => setCompact(!compact)}
          className="text-xs px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          {compact ? (isAr ? 'عرض الصناديق الكاملة (12)' : 'Full View (12 Boxes)') : (isAr ? 'الأساسية 5 (Core-5)' : 'Core 5 Only')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {displayedBoxes.map((box) => (
          <section
            key={box.id}
            data-r6-box={box.n}
            className={`rounded-2xl border p-4 shadow-sm ${BOX_TINT[(box.n - 1) % BOX_TINT.length]}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-200">{box.titleKey}</h4>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${SOURCE_BADGES[box.source].className}`}>
                {isAr ? SOURCE_BADGES[box.source].ar : SOURCE_BADGES[box.source].en}
              </span>
            </div>
            {box.content}
          </section>
        ))}
      </div>
    </div>
  );
}
