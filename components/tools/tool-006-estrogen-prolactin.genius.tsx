'use client';
/**
 * components/tools/tool-006-estrogen-prolactin.genius.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #006 — Estradiol & Prolactin: Tool-Owned GENIUS-12 Boxes (CORE-5)
 *
 * Implements the full 12-box framework:
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
 * 12. Next Actions & Referral (C5)
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { AromatizationScore, EstrogenProlactinInput } from '@/lib/tools/schemas/tool-006-estrogen-prolactin';
import {
  TOOL_006_SOURCES,
  TOOL_006_CROSS_TOOL_LINKS,
  getE2Band,
  getProlactinBand,
  computeE2TRatio,
  buildEstrogenProlactinCsv,
  labFreshness,
} from '@/lib/tools/r6/tool-006-estrogen-prolactin-contract';

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
  'bg-purple-950/20 border-purple-900',
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

export interface Tool006GeniusProps {
  locale: 'ar' | 'en';
  input: EstrogenProlactinInput & { testosteroneLevel?: number; panelDate?: string };
  output: ToolOutput<AromatizationScore>;
}

export default function Tool006Genius({ locale, input, output }: Tool006GeniusProps) {
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);

  const e2Normalized = input.e2Unit === 'pmol/L' ? Math.round(input.e2Level / 3.67) : input.e2Level;
  const prlNormalized = input.prolactinUnit === 'mIU/L' ? Math.round(input.prolactinLevel / 21.2) : input.prolactinLevel;
  const tt = input.testosteroneLevel ?? null;
  const panelDate = input.panelDate ?? '2026-03-01';

  const e2Band = getE2Band(e2Normalized);
  const prlBand = getProlactinBand(prlNormalized);
  const ratio = tt && tt > 0 ? computeE2TRatio(e2Normalized, tt) : null;
  const freshness = labFreshness(panelDate, output.calculatedAt.slice(0, 10));

  const handleDownloadCsv = useCallback(() => {
    const csv = buildEstrogenProlactinCsv(
      input.e2Level,
      input.e2Unit,
      input.prolactinLevel,
      input.prolactinUnit,
      tt,
      panelDate,
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `endocrine-record-${panelDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [input.e2Level, input.e2Unit, input.prolactinLevel, input.prolactinUnit, tt, panelDate]);

  const boxes: BoxDefinition[] = useMemo(() => {
    return [
      // 1. KPI Strip (C1)
      {
        n: 1,
        id: 'kpi-strip',
        titleKey: isAr ? '1. شريط المؤشرات الحيوية الرئيسي' : '1. Endocrine KPI Strip',
        source: 'engine',
        content: (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-center">
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">E2 (Sensitive)</span>
              <span className="text-sm font-bold text-pink-400">{e2Normalized} pg/mL</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{e2Band}</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">Prolactin</span>
              <span className="text-sm font-bold text-emerald-400">{prlNormalized} ng/mL</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{prlBand}</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">Total Testosterone</span>
              <span className="text-sm font-bold text-blue-400">{tt ? `${tt} ng/dL` : '—'}</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{tt ? 'RECORDED' : 'OPTIONAL'}</span>
            </div>
            <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 font-sans">E2/T Ratio</span>
              <span className="text-sm font-bold text-purple-400">{ratio !== null ? `${ratio}%` : '—'}</span>
              <span className="block text-[9px] text-zinc-400 uppercase">{ratio && ratio > 6.0 ? 'ELEVATED' : 'BALANCED'}</span>
            </div>
          </div>
        ),
      },
      // 2. Primary Result (C1)
      {
        n: 2,
        id: 'primary-result',
        titleKey: isAr ? '2. النتيجة الأساسية وتصنيف التوازن' : '2. Primary Result & Balance Assessment',
        source: 'engine',
        content: (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">
                {isAr ? 'حالة التوازن الهرموني:' : 'Endocrine Balance Status:'}
              </span>
              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${e2Band === 'high' || prlBand === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                {e2Band === 'high' || prlBand === 'high' ? (isAr ? 'ارتفاع هرموني يتطلب متابعة' : 'Elevated Hormone Level') : (isAr ? 'توازن فسيولوجي ضمن النطاق' : 'Physiological Equilibrium')}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {isAr
                ? `مستوى الإستراديول الحالي (${e2Normalized} pg/mL) يقع في النطاق (${e2Band}) ومستوى البرولاكتين (${prlNormalized} ng/mL) يقع في النطاق (${prlBand}). النتيجة حتمية ومستندة لمجالات Mayo Clinic وEndocrine Society.`
                : `Current Estradiol is ${e2Normalized} pg/mL (${e2Band} band) and Prolactin is ${prlNormalized} ng/mL (${prlBand} band). Evaluated deterministically against Endocrine Society & Mayo Clinic thresholds.`}
            </p>
            <div className="text-[10px] text-zinc-500">
              {isAr ? 'الثقة: حتمية رياضية تامة — خالية من التخمين أو الذكاء الاصطناعي.' : 'Confidence: Deterministic biological banding — zero AI hallucination.'}
            </div>
          </div>
        ),
      },
      // 3. How Calculated (C2)
      {
        n: 3,
        id: 'how-calculated',
        titleKey: isAr ? '3. طريقة الحساب والافتراضات العلمية' : '3. How Calculated & Assumptions',
        source: 'static',
        content: (
          <div className="space-y-1.5 text-xs text-zinc-400">
            <p>
              <strong>{isAr ? 'المعادلة والطريقة:' : 'Methodology & Formula:'} </strong>
              {isAr
                ? 'توحيد الوحدات (pmol/L ÷ 3.67 = pg/mL للـ E2، و mIU/L ÷ 21.2 = ng/mL للبرولاكتين)، ثم مقارنة كل قيمة مع النطاقات المعيارية.'
                : 'Standard metric conversion (pmol/L ÷ 3.67 = pg/mL for E2; mIU/L ÷ 21.2 = ng/mL for Prolactin). Dual threshold classification.'}
            </p>
            <p>
              <strong>{isAr ? 'الافتراضات السريرية:' : 'Clinical Assumptions:'} </strong>
              {isAr
                ? 'يُفترض أن فحص الإستراديول أُجري بطريقة LC-MS/MS الحساسة، وأن العينة سُحبت صباحاً في حالة صيام وتجنب المجهود البدني الشديد.'
                : 'Assumes sensitive LC-MS/MS estradiol assay and fasting morning blood draw without acute post-exercise prolactin surge.'}
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
              <span>Entered E2:</span>
              <span className="text-white">{input.e2Level} {input.e2Unit}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Entered Prolactin:</span>
              <span className="text-white">{input.prolactinLevel} {input.prolactinUnit}</span>
            </div>
            {tt && (
              <div className="flex justify-between font-mono">
                <span>Total Testosterone:</span>
                <span className="text-white">{tt} ng/dL</span>
              </div>
            )}
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
                {isAr ? 'سيناريو: انخفاض الأروماتاز بـ 25%' : 'Scenario: 25% Aromatase Reduction'}
              </span>
              <p className="mt-0.5 text-[11px]">
                {isAr
                  ? `ينخفض الإستراديول المقدر إلى ~${Math.round(e2Normalized * 0.75)} pg/mL (${getE2Band(Math.round(e2Normalized * 0.75))}).`
                  : `Estimated E2 shifts to ~${Math.round(e2Normalized * 0.75)} pg/mL (${getE2Band(Math.round(e2Normalized * 0.75))}).`}
              </p>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="font-semibold text-zinc-300">
                {isAr ? 'سيناريو: عودة البرولاكتين إلى النطاق الأمثل (10 ng/mL)' : 'Scenario: Prolactin Normalized to 10 ng/mL'}
              </span>
              <p className="mt-0.5 text-[11px]">
                {isAr
                  ? 'يختفي التثبيط النخامي للدوبامين وتتحسن مستويات الرغبة وجودة الانتصاب.'
                  : 'Restores baseline dopaminergic tone and normalizes refractory period.'}
              </p>
            </div>
          </div>
        ),
      },
      // 6. Sensitivity Analysis
      {
        n: 6,
        id: 'sensitivity',
        titleKey: isAr ? '6. تحليل الحساسية والتأرجح' : '6. Sensitivity & Fluctuation Analysis',
        source: 'static',
        content: (
          <p className="text-xs text-zinc-400 leading-relaxed">
            {isAr
              ? 'الإستراديول شديد الحساسية لجرعات التستوستيرون وتكرار الحقن؛ تباعد الحقن يسبب قمم أروماتاز حادة. بينما البرولاكتين حساس للإجهاد العصبي، قلة النوم، ومركبات 19-nor.'
              : 'Estradiol sensitivity tracks tightly with injection frequency (infrequent injections cause elevated peak aromatization). Prolactin sensitivity tracks with sleep deprivation, severe stress, and 19-nor compounds.'}
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
              ⚠️ <strong>{isAr ? 'تجنب القمع المفرط للإستراديول:' : 'Avoid Crushing Estradiol:'} </strong>
              {isAr
                ? 'الهبوط تحت 15 pg/mL يسبب آلام المفاصل، جفاف الجلد، تدهور الكوليسترول، والاكتئاب.'
                : 'Crushing E2 below 15 pg/mL accelerates bone resorption, impairs lipid profile, and induces severe joint pain.'}
            </p>
            <p>
              ⚠️ <strong>{isAr ? 'أعراض التثدي المبكر:' : 'Gynecomastia Awareness:'} </strong>
              {isAr
                ? 'تحسس الحلمات أو الألم الموضعي يستوجب استشارة طبية وليس زيادة عشوائية لمثبطات الأروماتاز.'
                : 'Tenderness, burning, or subareolar nodules warrant immediate clinical exam rather than blind AI self-medication.'}
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
            {TOOL_006_CROSS_TOOL_LINKS.map((link) => (
              <div key={link.slug} className="flex flex-col p-2 rounded bg-zinc-950 border border-zinc-800">
                <a href={`/smarttools/${link.slug}`} className="font-semibold text-purple-400 hover:underline">
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
            {TOOL_006_SOURCES.map((s) => (
              <div key={s.n} className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-zinc-200">{s.publisher} ({s.year})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Level {s.level}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{s.title}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-400 hover:underline mt-1 inline-block">
                  {s.doi ? `DOI: ${s.doi}` : 'Access Guideline'} ↗
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
                ? 'تصدير قيم تحليلك في ملف CSV محلياً على جهازك دون إرسال أي معلومة إلى أي خادم.'
                : 'Download your structured endocrine values as a local CSV file. Zero server upload.'}
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
                ? 'NOT_APPLICABLE: هذه الأداة تعمل في الذاكرة المؤقتة للجلسة الحالية فقط دون تخزين سحابي أو محلي دائم لحماية الخصوصية.'
                : 'NOT_APPLICABLE: Session-only compute. No cloud database or persistent browser storage is maintained for privacy.'}
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
                ? 'مراقبة الأعراض الجسدية (تحسس، احتباس ماء، تقلب مزاج) وتأكيد النتيجة بفحص حساس ثانٍ بعد 4-6 أسابيع.'
                : 'Monitor subjective symptoms (nipple sensitivity, mood, water retention). Re-verify with LC-MS/MS in 4–6 weeks.'}
            </p>
            <p>
              <strong>2. {isAr ? 'ما يجب تجنبه قطعيًا:' : 'What NOT To Do:'} </strong>
              {isAr
                ? 'لا تبدأ أو تضاعف جرعات مثبطات الأروماتاز (Anastrozole/Exemestane) بناءً على رقم تحليلي واحد دون استشارة طبية.'
                : 'Do NOT blindly initiate or double aromatase inhibitor doses without physician evaluation.'}
            </p>
            <p>
              <strong>3. {isAr ? 'متى تستشير الطبيب:' : 'When To Consult a Clinician:'} </strong>
              {isAr
                ? 'إذا استمر البرولاكتين >25 ng/mL أو ظهرت نتوءات صلبة تحت الحلمة.'
                : 'If prolactin persists >25 ng/mL or palpable subareolar breast tissue develops.'}
            </p>
          </div>
        ),
      },
    ];
  }, [e2Normalized, prlNormalized, tt, ratio, e2Band, prlBand, isAr, input, panelDate, output.calculatedAt, freshness, handleDownloadCsv]);

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
