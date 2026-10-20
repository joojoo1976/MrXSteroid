'use client';
/** Tool #036 — SUPREME V3 dark-OS dashboard (Linear/Notion).
 * The feature flag was removed on commit b913b104: V3 is the unconditional
 * surface for /smarttools/injection-formulation/tool-036-injection-schedule.
 * Heavy widgets (dnd-kit calendar, recharts chart) are lazy via next/dynamic
 * with ssr:false, and the chart is only mounted after the user opens the chart
 * card (IntersectionObserver + button, below), so this component never pulls
 * recharts into its own render path.
 *
 * NOTE (G-08 audit finding): that is a property of *this* component only. The
 * route that renders it — app/smarttools/[category]/[tool] — still ships the
 * recharts chunks in its initial <script> set for every tool, because
 * lib/tools/loaders.ts resolves tools through a webpack context
 * (`import(`@/components/tools/${slug}`)`) that sweeps every file in
 * components/tools into the route graph. Measured, not assumed — see the
 * audit report. Tracked as a shared-loader follow-up; do not re-assert
 * "recharts is not in First Load JS" for this route until loaders.ts changes. */
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ESTER_PROFILES,
  BODY_SITES,
  bodySiteById,
  classifyVolumeZone,
  buildRotationPlan,
  DEFAULT_ROTATION_SITES,
  totalWeeklyMg,
  nextInjection,
  assessComfort,
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
  noUsage: { en: 'No recorded usage events', ar: 'لا توجد وقائع استخدام مسجّلة' },
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

/**
 * G-05/G-06: a body site is neutral styling until a *recorded* use exists.
 * The old `recencyTone()` colours ('rest' / 'healing' / 'ready') graded a site
 * from elapsed days; that grading is gone, so every site uses one neutral
 * class and the map is annotated with "no recorded usage events".
 */
const SITE_FILL = 'fill-slate-500/30 stroke-slate-300/40';

/** Site centres inside the 200x260 viewBox; each gets a 44x44 tap target. */
const SITE_XY: Record<string, { cx: number; cy: number }> = {
  'deltoid-l': { cx: 40, cy: 76 },
  'deltoid-r': { cx: 160, cy: 76 },
  'dorso-l': { cx: 84, cy: 90 },
  'dorso-r': { cx: 116, cy: 90 },
  'ventro-l': { cx: 84, cy: 126 },
  'ventro-r': { cx: 116, cy: 126 },
  'vastus-l': { cx: 82, cy: 196 },
  'vastus-r': { cx: 118, cy: 196 },
};

const SHOT_DAYS: Record<number, number[]> = { 1: [0], 2: [0, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5] };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
      <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] text-zinc-400">
      {caption}
      {children}
    </label>
  );
}

function formatCountdown(ms: number, locale: Locale): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const unit = locale === 'ar' ? ['ي', 'س', 'د'] : ['d', 'h', 'm'];
  return `${d}${unit[0]} ${h}${unit[1]} ${m}${unit[2]}`;
}

export default function Tool036InjectionSchedule() {
  const [locale, setLocale] = useState<Locale>('ar');
  const [compoundId, setCompoundId] = useState('testosterone-enanthate');
  const [weeklyDoseMg, setWeeklyDoseMg] = useState(250);
  const [concentration, setConcentration] = useState(250);
  const [injectionsPerWeek, setInjectionsPerWeek] = useState(2);
  const [selectedSite, setSelectedSite] = useState('ventro-l');
  const [scores, setScores] = useState<number[]>([]);
  const [painDraft, setPainDraft] = useState(0);
  const [shotDays, setShotDays] = useState<number[]>(SHOT_DAYS[2]);
  const [now, setNow] = useState<number>(() => Date.now());
  const [chartOn, setChartOn] = useState(false);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const el = chartRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setChartOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const profile = ESTER_PROFILES[compoundId] ?? ESTER_PROFILES['testosterone-enanthate'];
  const selectedBodySite = bodySiteById(selectedSite);
  const perShotMg = injectionsPerWeek > 0 ? weeklyDoseMg / injectionsPerWeek : 0;
  const volumeMl = concentration > 0 ? perShotMg / concentration : 0;
  const totalMg = totalWeeklyMg([{ weeklyDoseMg }]);

  const today = new Date(now);
  const todayDayIndex = today.getDay();
  const nowMs = todayDayIndex * 864e5 + today.getHours() * 3600e3 + today.getMinutes() * 60e3 + today.getSeconds() * 1e3;

  const shotModels = shotDays.map((day, i) => ({
    id: `shot-${i}`,
    dayIndex: day,
    siteId: DEFAULT_ROTATION_SITES[i % DEFAULT_ROTATION_SITES.length],
    volumeMl: Number(volumeMl.toFixed(2)),
    mg: Math.round(perShotMg),
  }));

  /*
   * G-06 (audit finding): `shotModels` above is the *plan* the user is editing.
   * The old code fed those planned days straight into `siteRecency()` and
   * `validateRotation()` as if they were recorded injections, so moving a
   * planned shot silently rewrote the tool's claimed "last used / days since"
   * history and its rotation warnings.
   *
   * This tool has no usage-log input in V3 and this fix deliberately does not
   * add one, so there are no recorded events: usage history is empty and the
   * UI states that plainly. Plan dates remain plan dates.
   */
  const recordedUsage: InjectionLog[] = [];
  const countdown = nextInjection(nowMs, shotDays);

  const rotationPlan = buildRotationPlan([...DEFAULT_ROTATION_SITES], recordedUsage, 12);
  const weekRows = ganttRows(rotationPlan).filter((r) => r.weekIndex === 0);
  const violations = validateRotation(recordedUsage, 7, 14);

  const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    label: DAYS[locale][i],
    shots: shotModels.filter((s) => s.dayIndex === i),
  }));

  const zone = classifyVolumeZone(volumeMl, selectedSite);
  const assessment = assessComfort(volumeMl, selectedSite, scores[scores.length - 1] ?? 0);
  const avg = averageRecent(scores);
  const series = accumulationChartSeries(profile, { weeklyDoseMg, injectionsPerWeek }, 12);
  const countdownText = countdown.overdue ? label('overdue', locale) : formatCountdown(countdown.msRemaining, locale);

  function handleMove(id: string, toDay: number) {
    const idx = Number(id.replace('shot-', ''));
    if (!Number.isInteger(idx) || idx < 0 || idx >= shotDays.length) return;
    if (toDay < 0 || toDay > 6) return;
    setShotDays((prev) => prev.map((d, i) => (i === idx ? toDay : d)));
  }

  function addPain() {
    setScores((prev) => [...prev, Math.min(10, Math.max(0, painDraft))]);
  }

  const fieldCls = 'mt-1 w-full rounded bg-white/5 px-2 py-1 text-xs text-zinc-200';

  return (
    <div
      data-testid="v3-shell"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="rounded-2xl border border-white/10 bg-[#0A0A0B] p-4 font-mono text-zinc-200"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 data-testid="v3-title" className="text-lg tracking-tight text-gold-500">
          {label('title', locale)}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-white/10 px-2 py-1 text-xs"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            data-testid="pdf-export"
            className="rounded border border-white/10 px-2 py-1 text-xs"
            onClick={() => window.print()}
          >
            {label('pdf', locale)}
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Card title={label('weeklyMg', locale)}>
          <div data-testid="weekly-mg" className="text-xl">
            {Math.round(totalMg)} mg
          </div>
        </Card>
        <Card title={label('nextInj', locale)}>
          <div data-testid="next-injection" className="text-xl">
            {countdownText}
          </div>
        </Card>
        <Card title={label('volGuard', locale)}>
          <div data-testid="volume-badge" data-zone={zone.zone} className={`rounded border px-2 py-1 text-sm ${ZONE_CLS[zone.zone] ?? ZONE_CLS.green}`}>
            {zone.zone}
          </div>
          <details data-testid="volume-tooltip" className="mt-1 text-[11px] text-zinc-400">
            <summary className="cursor-pointer">{label('evidence', locale)}</summary>
            <p>
              {zone.evidence.note} ({zone.evidence.evidenceId}, {zone.evidence.confidence})
            </p>
          </details>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Field caption={label('compound', locale)}>
          <select value={compoundId} onChange={(e) => setCompoundId(e.target.value)} className={fieldCls}>
            {Object.values(ESTER_PROFILES).map((p) => (
              <option key={p.compoundId} value={p.compoundId}>
                {locale === 'ar' ? p.nameAr : p.nameEn}
              </option>
            ))}
          </select>
        </Field>
        <Field caption={label('weeklyDose', locale)}>
          <input
            type="number"
            value={weeklyDoseMg}
            onChange={(e) => setWeeklyDoseMg(Math.max(0, Number(e.target.value)))}
            className={fieldCls}
          />
        </Field>
        <Field caption={label('concentration', locale)}>
          <input
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(Math.max(0, Number(e.target.value)))}
            className={fieldCls}
          />
        </Field>
        <Field caption={label('perWeek', locale)}>
          <select
            value={injectionsPerWeek}
            onChange={(e) => {
              const n = Number(e.target.value);
              setInjectionsPerWeek(n);
              setShotDays(SHOT_DAYS[n] ?? SHOT_DAYS[2]);
            }}
            className={fieldCls}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field caption={label('site', locale)}>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className={fieldCls}>
            {BODY_SITES.map((s) => (
              <option key={s.siteId} value={s.siteId}>
                {locale === 'ar' ? s.labelAr : s.labelEn}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mb-4">
        <Card title={label('calendar', locale)}>
          <div data-testid="v3-calendar">
            <WeeklyCalendar days={days} onMove={handleMove} />
          </div>
        </Card>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <Card title={label('bodyMap', locale)}>
          <svg data-testid="body-map" viewBox="0 0 200 260" className="mx-auto h-64 w-auto" role="img">
            <circle cx="100" cy="26" r="16" className="fill-white/10 stroke-white/20" />
            <rect x="62" y="48" width="76" height="110" rx="14" className="fill-white/10 stroke-white/20" />
            <rect x="30" y="60" width="18" height="86" rx="9" className="fill-white/10 stroke-white/20" />
            <rect x="152" y="60" width="18" height="86" rx="9" className="fill-white/10 stroke-white/20" />
            <rect x="70" y="162" width="24" height="86" rx="10" className="fill-white/10 stroke-white/20" />
            <rect x="106" y="162" width="24" height="86" rx="10" className="fill-white/10 stroke-white/20" />
            {BODY_SITES.map((s) => {
              const xy = SITE_XY[s.siteId] ?? { cx: 100, cy: 130 };
              const isSelected = selectedSite === s.siteId;
              return (
                <g
                  key={s.siteId}
                  data-testid={`bodysite-${s.siteId}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedSite(s.siteId)}
                >
                  <title>{locale === 'ar' ? s.labelAr : s.labelEn}</title>
                  <rect
                    x={xy.cx - 22}
                    y={xy.cy - 22}
                    width={44}
                    height={44}
                    rx={10}
                    className={`${SITE_FILL} ${isSelected ? 'stroke-gold-500 stroke-2' : ''}`}
                  />
                  <circle cx={xy.cx} cy={xy.cy} r={5} className="fill-white/70" />
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-center text-[11px] text-zinc-500">
            {label('tapSite', locale)}: {selectedBodySite ? (locale === 'ar' ? selectedBodySite.labelAr : selectedBodySite.labelEn) : '—'}
          </p>
          {/* G-05 / G-06: state what is actually known. Nothing is recorded, so
              no site carries a last-used date, a day count or a readiness tone. */}
          <p className="mt-1 text-center text-[11px] text-zinc-500" data-testid="usage-state">
            {label('noUsage', locale)}
          </p>
        </Card>

        <Card title={label('comfort', locale)}>
          <div data-testid="comfort-log">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">{label('pain', locale)}</span>
              <input
                data-testid="pain-input"
                type="number"
                min={0}
                max={10}
                value={painDraft}
                onChange={(e) => setPainDraft(Number(e.target.value))}
                className="w-24 rounded bg-white/5 px-2 py-1 text-xs"
              />
              <button type="button" data-testid="pain-add" onClick={addPain} className="rounded border border-white/10 px-2 py-1 text-xs">
                {label('add', locale)}
              </button>
            </div>
            <p className="mt-2 text-sm">
              {label('avg5', locale)}:{' '}
              <span data-testid="pain-average">{avg === null ? '—' : avg.toFixed(2)}</span>
            </p>

            <p className="mt-1 text-[11px]">
              {locale === 'ar' ? 'شدة الألم' : 'Pain band'}:{' '}
              <span data-testid="comfort-badge" data-level={assessment.painBadge}>
                {assessment.painBadge}
              </span>
            </p>
            {assessment.advisories.length > 0 && (
              <ul className="mt-2 space-y-1 text-[11px] text-amber-200/80" data-testid="advisories">
                {assessment.advisories.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <Card title={label('rotation', locale)}>
          <ol data-testid="rotation-plan" className="space-y-1 text-[11px]">
            {DEFAULT_ROTATION_SITES.map((s, i) => (
              <li key={s} className="flex items-center justify-between rounded border border-white/10 px-2 py-1">
                <span>{s}</span>
                <span className="text-zinc-500">#{i + 1}</span>
              </li>
            ))}
          </ol>
          {violations.length > 0 && (
            <p className="mt-2 text-[11px] text-amber-300">
              {label('warnings', locale)}: {violations.length}
            </p>
          )}
        </Card>

        <Card title={label('gantt', locale)}>
          <div data-testid="gantt-week" className="space-y-1">
            {weekRows.map((r, i) => (
              <div
                key={`${r.weekIndex}-${r.day}-${r.siteId}-${i}`}
                className="flex items-center justify-between rounded border border-white/10 px-2 py-1 text-[11px]"
              >
                <span>{DAYS[locale][r.day]}</span>
                <span>{r.siteId}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={label('chart', locale)}>
        <div ref={chartRef} />
        {chartOn ? (
          <AccumulationChart data={series} label={profile.nameEn} />
        ) : (
          <button
            type="button"
            data-testid="chart-load"
            onClick={() => setChartOn(true)}
            className="rounded border border-white/10 px-2 py-1 text-xs"
          >
            {label('chartLoad', locale)}
          </button>
        )}
      </Card>
    </div>
  );
}
