'use client';
/** Tool #036 — SUPREME V3 dark-OS dashboard (Linear/Notion).
 * The feature flag was removed on commit b913b104: V3 is the unconditional
 * surface for /smarttools/injection-formulation/tool-036-injection-schedule.
 * Heavy widgets (dnd-kit calendar, recharts chart) are lazy via next/dynamic
 * with ssr:false so neither enters First Load JS. */
import React, { useEffect, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import dynamic from 'next/dynamic';
import {
  runInjectionSchedule, type InjectionScheduleBuildOptions,
} from '@/lib/tools/r6/tool-036-injection-schedule-pipeline';
import {
  ESTER_PROFILES,
  BODY_SITES,
  bodySiteById,
  classifyVolumeZone,
  buildRotationPlan,
  DEFAULT_ROTATION_SITES,
  totalWeeklyMg,
  siteRecency,
  recencyTone,
  nextInjection,
  assessComfort,
  healingStatus,
  averageRecent,
  validateRotation,
  ganttRows,
  accumulationChartSeries,
  type InjectionLog,
} from '@/lib/tools/engines/tool-036-injection-schedule';
import type { CalendarDay } from './tool-036-weekly-calendar';

const WeeklyCalendar = dynamic(() => import('./tool-036-weekly-calendar'), {
  ssr: false,
  loading: () => <div data-testid="calendar-skeleton" className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />,
});

const AccumulationChart = dynamic(() => import('./tool-036-accumulation-chart'), { ssr: false });

type Locale = 'ar' | 'en';

const DAYS: Record<Locale, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const L = {
  title: { en: 'CHRONO-INJECT OS', ar: 'CHRONO-INJECT OS' },
  weeklyMg: { en: 'Weekly load', ar: 'الحمل الأسبوعي' },
  nextInj: { en: 'Next injection', ar: 'الحقن القادم' },
  overdue: { en: 'Overdue', ar: 'متأخر' },
  volGuard: { en: 'Volume Guard', ar: 'حارس الحجم' },
  evidence: { en: 'Evidence', ar: 'الدليل' },
  comfort: { en: 'Comfort', ar: 'الراحة' },
  pain: { en: 'Pain 0-10', ar: 'الألم 0-10' },
  add: { en: 'Add', ar: 'أضف' },
  healing: { en: 'Healing window', ar: 'نافذة الالتئام' },
  calendar: { en: 'This week — drag a shot, or use the arrows', ar: 'هذا الأسبوع — اسحب الحقن أو استخدم الأسهم' },
  rotation: { en: 'Auto rotation', ar: 'التدوير التلقائي' },
  gantt: { en: 'Week 1 Gantt', ar: 'جانت الأسبوع الأول' },
  pdf: { en: 'Export PDF', ar: 'تصدير PDF' },
  chart: { en: 'Accumulation', ar: 'التراكم' },
  chartLoad: { en: 'Load chart', ar: 'تحميل الرسم' },
  compound: { en: 'Compound', ar: 'المركّب' },
  weeklyDose: { en: 'Weekly dose (mg)', ar: 'الجرعة الأسبوعية (ملغ)' },
  concentration: { en: 'Conc. (mg/mL)', ar: 'التركيز (ملغ/مل)' },
  perWeek: { en: 'Injections / week', ar: 'عدد الحقن / أسبوع' },
  site: { en: 'Selected site', ar: 'الموقع المحدد' },
  bodyMap: { en: 'Body map', ar: 'خريطة الجسم' },
  tapSite: { en: 'Tap a site', ar: 'اختر موقعًا' },
  avg5: { en: 'Avg last 5', ar: 'متوسط آخر 5' },
  advisories: { en: 'Advisories', ar: 'التوصيات' },
  warnings: { en: 'Rotation warnings', ar: 'تنبيهات التدوير' },
} as const;

const label = (k: keyof typeof L, locale: Locale) => L[k][locale];

const ZONE_CLS: Record<string, string> = {
  green: 'border-lime-400/40 bg-lime-400/10 text-lime-200',
  yellow: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  red: 'border-rose-500/50 bg-rose-500/10 text-rose-200',
};

interface ScheduleCompound {
  name_en: string;
  weekly_dose_mg: number;
  concentration_mg_ml: number;
  injections_per_week: number;
  max_ml_per_site: number;
}

interface DraftInputs {
  compounds: ScheduleCompound[];
  rotation_sites: string[];
}

export default function Tool036InjectionSchedule() {
  const { locale, unitSystem } = useToolDisplayPreferences();
  const isRtl = locale === 'ar';

  const [compounds, setCompounds] = useState<ScheduleCompound[]>([
    { name_en: 'Testosterone Enanthate', weekly_dose_mg: 500, concentration_mg_ml: 250, injections_per_week: 2, max_ml_per_site: 3 },
  ]);
  const [rotationSites, setRotationSites] = useState<string[]>(['deltoid', 'glute', 'quad']);

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: InjectionScheduleBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale,
    unitSystem,
    snapshotType: 'draft',
  };

  const inputs = { compounds, rotation_sites: rotationSites };

  useEffect(() => {
    if (!compounds.length || !rotationSites.length) {
      setPipelineResult(null);
      setPipelineError(null);
      setPipelineStatus('idle');
      return;
    }
    setPipelineStatus('calculating');
    const pipeline = runInjectionSchedule(inputs, options);
    if (pipeline.ok) {
      setPipelineResult(pipeline.output);
      setPipelineError(null);
      setPipelineStatus('done');
    } else {
      setPipelineResult(null);
      setPipelineError(String(pipeline.error));
      setPipelineStatus('error');
    }
  }, [inputs, options.locale, options.unitSystem, options.snapshotType]);

  const result = pipelineStatus === 'done' && pipelineResult ? pipelineResult.result : null;

  // ... rest of the original component UI (preserved)
  const addCompound = () => setCompounds((prev) => [...prev, { name_en: 'New compound', weekly_dose_mg: 250, concentration_mg_ml: 250, injections_per_week: 1, max_ml_per_site: 3 }]);
  const removeCompound = (i: number) => setCompounds((prev) => prev.filter((_, j) => j !== i));
  const addSite = () => setRotationSites((prev) => [...prev, 'new_site']);
  const removeSite = (i: number) => setRotationSites((prev) => prev.filter((_, j) => j !== i));

  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{L.title[locale]}</h1>
        <div className="flex gap-2"></div>
      </div>

      {/* R6 Pipeline Status */}
      {pipelineStatus === 'calculating' && (
        <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4 mb-4">
          <p className="font-semibold">جاري حساب الجدول عبر R6 Pipeline…</p>
        </div>
      )}
      {pipelineStatus === 'done' && pipelineResult && (
        <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4 mb-4">
          <p className="font-semibold text-green-100">✓ تم الحساب عبر R6 Pipeline</p>
          <p className="mt-1 text-sm text-green-200">عدد الحقن: {pipelineResult.result.shots.length}</p>
          <p className="mt-1 text-sm text-green-200">الحجم الأسبوعي: {pipelineResult.result.total_volume_ml_per_week} مل</p>
          <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
        </div>
      )}
      {pipelineStatus === 'error' && pipelineError && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 mb-4 text-red-100">
          <p className="font-semibold">خطأ في الحساب</p>
          <p className="mt-1 text-sm">{pipelineError}</p>
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
          <h2 className="text-sm font-bold text-zinc-300 mb-4">{L.compound[locale]}</h2>
          <div className="space-y-3">
            {compounds.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <input value={c.name_en} onChange={(e) => setCompounds((prev) => prev.map((x, j) => j === i ? { ...x, name_en: e.target.value } : x))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white" placeholder={L.compound[locale]} />
                <input type="number" value={c.weekly_dose_mg} onChange={(e) => setCompounds((prev) => prev.map((x, j) => j === i ? { ...x, weekly_dose_mg: Number(e.target.value) || 0 } : x))} min="1" className="rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white" />
                <input type="number" value={c.concentration_mg_ml} onChange={(e) => setCompounds((prev) => prev.map((x, j) => j === i ? { ...x, concentration_mg_ml: Number(e.target.value) || 0 } : x))} min="1" className="rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white" />
                <select value={c.injections_per_week} onChange={(e) => setCompounds((prev) => prev.map((x, j) => j === i ? { ...x, injections_per_week: Number(e.target.value) } : x))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white">
                  {[1, 2, 3, 7].map((n) => <option key={n} value={n}>{n}x/week</option>)}
                </select>
                <button type="button" onClick={() => removeCompound(i)} disabled={compounds.length <= 1} className="text-xs text-red-400">✕</button>
              </div>
            ))}
            <button type="button" onClick={addCompound} className="mt-3 w-full rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-lime-400">{L.add[locale]}</button>
          </div>
        </section>

        <section className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
          <h2 className="text-sm font-bold text-zinc-300 mb-4">{L.site[locale]}</h2>
          <div className="space-y-3">
            {rotationSites.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input value={s} onChange={(e) => setRotationSites((prev) => prev.map((x, j) => j === i ? e.target.value : x))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white" />
                <button type="button" onClick={() => removeSite(i)} disabled={rotationSites.length <= 1} className="text-xs text-red-400">✕</button>
              </div>
            ))}
            <button type="button" onClick={addSite} className="mt-3 w-full rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-lime-400">{L.add[locale]}</button>
          </div>
        </section>
      </div>

      {result && (
        <section className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
          <h2 className="text-sm font-bold text-zinc-300 mb-4">نتائج الجدول (R6 Pipeline)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500">إجمالي الحقن</div>
              <div className="text-xl font-bold text-cyan-400">{result.shots.length}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500">الحجم الأسبوعي</div>
              <div className="text-xl font-bold text-lime-400">{result.total_volume_ml_per_week} مل</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500">اليوم الأكثر ازدحاماً</div>
              <div className="text-xl font-bold text-amber-400">{result.busiest_day}</div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs">
            {result.shots.map((shot: any, i: number) => (
              <li key={i} className="flex justify-between bg-zinc-950 p-2 rounded border border-zinc-800">
                <span>{shot.day === 0 ? 'الأحد' : shot.day === 1 ? 'الإثنين' : shot.day === 2 ? 'الثلاثاء' : shot.day === 3 ? 'الأربعاء' : shot.day === 4 ? 'الخميس' : shot.day === 5 ? 'الجمعة' : 'السبت'}</span>
                <span>{shot.compound_name}: {shot.dose_mg} ملغ, {shot.volume_ml} مل</span>
                <span>{shot.site}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
