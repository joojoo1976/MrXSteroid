'use client';
/** Tool #036 — Injection Schedule Planner (dynamic UI, GPT2 spec). useMemo
 * instant recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  planInjectionSchedule,
  planChronoInjectionSchedule,
  classifyVolumeZone,
  siteCeilingMl,
  assessComfort,
  healingStatus,
  averageRecent,
  validateRotation,
  buildRotationPlan,
  buildFhirBundle,
  accumulationChartSeries,
  ganttRows,
  bodySiteById,
  BODY_SITES,
  ESTER_PROFILES,
  type EvidenceRef,
  type ChronoResult,
  type ChartPoint,
  type RotationWeek,
  type RotationViolation,
} from '@/lib/tools/engines/tool-036-injection-schedule';
import dynamic from 'next/dynamic';
import { buildInjectionScheduleOutput } from '@/lib/tools/adapters/tool-036-injection-schedule';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { InjectionScheduleInputSchema, ChronoPlanInputSchema } from '@/lib/tools/schemas/tool-036-injection-schedule';
import i18nJson from '@/i18n/tool-036-injection-schedule.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-036-injection-schedule';
/** P1 feature flag — default OFF keeps the v1 UI byte-for-byte unchanged (zero-risk rollback). */
const SUPREME_ON = process.env.NEXT_PUBLIC_FT_TOOL036_SUPREME_V2 === 'true';
interface CompoundInput { name_en: string; weekly_dose_mg: number; concentration_mg_ml: number; injections_per_week: number; max_ml_per_site: number }
interface DraftInputs { compounds: CompoundInput[]; rotation_sites: string }

const DEFAULT_COMPOUND: CompoundInput = { name_en: 'Testosterone Enanthate', weekly_dose_mg: 500, concentration_mg_ml: 250, injections_per_week: 2, max_ml_per_site: 3 };
const DEFAULT_SITES = 'L glute, R glute, L delt, R delt';
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Draft stores a comma-separated string; the schema needs a string[]. */
function parseSites(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
}

function Tool036V1() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [compounds, setCompounds] = useState<CompoundInput[]>([DEFAULT_COMPOUND]);
  const [sitesText, setSitesText] = useState(DEFAULT_SITES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (!draft) return;
    if (Array.isArray(draft.inputs.compounds) && draft.inputs.compounds.length > 0) setCompounds(draft.inputs.compounds);
    if (typeof draft.inputs.rotation_sites === 'string') setSitesText(draft.inputs.rotation_sites);
  }, []);

  const inputs = useMemo(() => ({ compounds, rotation_sites: parseSites(sitesText) }), [compounds, sitesText]);
  const parsed = useMemo(() => InjectionScheduleInputSchema.safeParse(inputs), [inputs]);

  const result = useMemo(() => (parsed.success ? planInjectionSchedule(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildInjectionScheduleOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: '1970-01-01T00:00:00.000Z', recordedAt: '1970-01-01T00:00:00.000Z', timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale]);

  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);

  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { saveDraft(TOOL_SLUG, { compounds, rotation_sites: sitesText }, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, sitesText, locale, compounds]);

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    setError(null);
    try {
      const now = new Date().toISOString();
      const output = buildInjectionScheduleOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : isRtl ? 'فشل الحفظ' : 'Save failed'); } finally { setIsSaving(false); }
  };

  const updateCompound = (index: number, patch: Partial<CompoundInput>) => {
    setCompounds((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };
  const addCompound = () => setCompounds((p) => (p.length >= 8 ? p : [...p, { ...DEFAULT_COMPOUND }]));
  const removeCompound = (i: number) => setCompounds((p) => (p.length <= 1 ? p : p.filter((_, j) => j !== i)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.compounds}</h2>
      <div className="space-y-2 mb-3">
        {compounds.map((c, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={c.name_en} onChange={(e) => updateCompound(i, { name_en: e.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="Name" />
            <label className="text-[10px] text-zinc-500">mg/wk
              <input type="number" min={1} max={5000} value={c.weekly_dose_mg} onChange={(e) => updateCompound(i, { weekly_dose_mg: Number(e.target.value) || 1 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">mg/mL
              <input type="number" step={1} min={1} max={500} value={c.concentration_mg_ml} onChange={(e) => updateCompound(i, { concentration_mg_ml: Number(e.target.value) || 1 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">inj/wk
              <input type="number" step={1} min={1} max={7} value={c.injections_per_week} onChange={(e) => updateCompound(i, { injections_per_week: Math.max(1, Math.min(7, Math.round(Number(e.target.value) || 1))) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <button type="button" onClick={() => removeCompound(i)} disabled={compounds.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addCompound} disabled={compounds.length >= 8} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_compound}</button>
      <label className="block text-xs font-bold text-zinc-500 mb-4">{t.rotation_sites}
        <input value={sitesText} onChange={(e) => setSitesText(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" placeholder="L glute, R glute, L delt, R delt" />
      </label>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {error && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {error}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40"><span className="text-[10px] text-zinc-400 block">{t.total_volume}</span><span className="text-xl font-bold text-lime-400 font-mono">{result.total_volume_ml_per_week.toFixed(2)}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.busiest_day}</span><span className="text-xl font-bold text-amber-400 font-mono">{isRtl ? DAY_NAMES_AR[result.busiest_day] : DAY_NAMES_EN[result.busiest_day]}</span></div>
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.shots}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-3" dir="ltr">
            {result.shots.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5">
                <span className="font-bold text-zinc-300">{DAY_NAMES_EN[s.day] ?? s.day}</span>
                <span className="text-zinc-400">{s.compound_name}</span>
                <span className="font-mono text-cyan-400">{s.dose_mg} mg / {s.volume_ml.toFixed(2)} mL</span>
                <span className="text-zinc-500 font-mono">{s.site}</span>
                {s.split_warning && <span className="text-amber-400" title="split dose">⇈</span>}
              </li>
            ))}
          </ul>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-amber-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
          </div>
          )}
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">AI context (structured values — no external model call)</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition disabled:opacity-50">{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ في لوحة القيادة الحيوية (Save Snapshot)' : 'Save to Bio-Dashboard')}</button>
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>←</span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </div>
  );
}

/* ==========================================================================
 * LEVEL 1 — MVP CORE (behind NEXT_PUBLIC_FT_TOOL036_SUPREME_V2, default OFF)
 * 7 features only: compound selector · weekly Sun/Thu list · Volume Guard v2
 * (3 zones + evidence badge) · next-injection card · busiest day + total volume ·
 * educational footer · [Advanced ▾]. No Level 2/3, no charts, no drag, no AR.
 * ========================================================================== */

const ZONE_CELL: Record<'green' | 'yellow' | 'red', { en: string; ar: string; cls: string; chip: string }> = {
  green: { en: 'Green · Common (≤2 mL)', ar: 'أخضر · شائع (≤2 مل)', cls: 'border-lime-500/50 bg-lime-500/10', chip: 'border-lime-500/50 text-lime-300' },
  yellow: { en: 'Yellow · Limited Evidence (2–5 mL)', ar: 'أصفر · دليل محدود (2–5 مل)', cls: 'border-amber-500/50 bg-amber-500/10', chip: 'border-amber-500/50 text-amber-300' },
  red: { en: 'Red · Stop (>5 mL)', ar: 'أحمر · توقف (>5 مل)', cls: 'border-red-500/50 bg-red-500/10', chip: 'border-red-500/50 text-red-300' },
};

const L1_STR = {
  compounds: { en: 'Compound', ar: 'المادة' },
  addCompound: { en: 'Add compound', ar: 'إضافة مادة' },
  weekly: { en: 'This week', ar: 'هذا الأسبوع' },
  guard: { en: 'Volume Guard', ar: 'حارس الحجم' },
  next: { en: 'Next injection', ar: 'الحقنة القادمة' },
  total: { en: 'Total / week', ar: 'الإجمالي / أسبوع' },
  busiest: { en: 'Busiest day', ar: 'أكثر الأيام ازدحامًا' },
  advanced: { en: 'Advanced ▾', ar: 'المتقدم ▾' },
  advancedNote: {
    en: 'Advanced levels (2D body map, comfort logger, rotation table, charts) ship in the next PR — still behind this flag.',
    ar: 'المستويات المتقدمة (خريطة الجسم ثنائية الأبعاد، سجل الراحة، جدول التدوير، الرسوم) تُسلَّم في الـPR القادم — لا تزال خلف هذا العلم.',
  },
  educational: {
    en: 'Educational tool only. Not medical advice. Consult a qualified clinician before injecting anything.',
    ar: 'أداة تعليمية فقط، وليست نصيحة طبية. استشر طبيبًا مؤهلاً قبل حقن أي مادة.',
  },
  sources: { en: 'Sources', ar: 'المصادر' },
  evidence: { en: 'Evidence', ar: 'الدليل' },
  confidence: { en: 'Confidence', ar: 'الثقة' },
  noneYet: { en: 'Add at least one compound and one site.', ar: 'أضف مادة واحدة على الأقل وموقعًا واحدًا.' },
} as const;

function EvidenceNote({ evidence, locale }: { evidence: EvidenceRef; locale: 'ar' | 'en' }) {
  return (
    <details className="mt-1 text-[10px] text-zinc-500">
      <summary className="cursor-pointer inline-flex items-center gap-1 text-cyan-400">
        ⓘ {L1_STR.evidence[locale]} — {evidence.evidenceId}
      </summary>
      <div className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 p-2 leading-relaxed" dir="ltr">
        <div><span className="text-zinc-500">Claim:</span> {evidence.evidenceId}</div>
        <div><span className="text-zinc-500">{L1_STR.confidence[locale]}:</span> {evidence.confidence}</div>
        {evidence.note && <div className="text-zinc-400">{evidence.note}</div>}
        <div className="text-amber-400">{L1_STR.educational[locale]}</div>
      </div>
    </details>
  );
}

/* ==========================================================================
 * LEVEL 2 + LEVEL 3 strings (all under the same OFF-by-default flag).
 * ========================================================================== */

const L2_STR = {
  tabs: {
    core: { en: 'Core', ar: 'الأساسي' },
    sites: { en: 'Sites', ar: 'المواقع' },
    comfort: { en: 'Comfort', ar: 'الراحة' },
  },
  bodyMap: { en: '2D body map — 8 sites', ar: 'خريطة الجسم — 8 مواقع' },
  bodyMapNote: {
    en: 'Tap a site. Pure SVG, no 3D, ≥44px targets. Minimum 7 days between hits on the same site.',
    ar: 'اضغط على موقع. SVG فقط بدون 3D، هدف ≥44 بكسل. 7 أيام على الأقل بين الحقن في نفس الموقع.',
  },
  selectedSite: { en: 'Selected site', ar: 'الموقع المحدد' },
  rotation: { en: '12-week rotation table', ar: 'جدول التدوير 12 أسبوعًا' },
  gantt: { en: 'Rotation Gantt', ar: 'مخطط جانت للتدوير' },
  ganttNote: {
    en: 'Desktop: drag the handle to swap. Mobile: use ↑ ↓ arrows.',
    ar: 'سطح المكتب: اسحب المقبض للتبديل. الجوال: استخدم أسهم ↑ ↓.',
  },
  logger: { en: 'Personal pain log (0–10)', ar: 'سجل الألم الشخصي (0–10)' },
  addLog: { en: 'Add entry', ar: 'إضافة قيد' },
  avg5: { en: 'Average (last 5)', ar: 'المتوسط (آخر 5)' },
  healing: { en: 'Healing window', ar: 'نافذة التعافي' },
  daysSince: { en: 'Days since last hit at this site', ar: 'الأيام منذ آخر حقنة في هذا الموقع' },
  comfort: { en: 'Comfort factors', ar: 'عوامل الراحة' },
  volume: { en: 'Volume', ar: 'الحجم' },
  pain: { en: 'Site pain', ar: 'ألم الموقع' },
  chart: { en: 'Accumulation chart (lazy)', ar: 'مخطط التراكم (محمّل تأخيريًا)' },
  chartSkeleton: { en: 'Chart loads on scroll…', ar: 'يُحمّل المخطط عند التمرير…' },
  chartLoad: { en: 'Load chart', ar: 'تحميل المخطط' },
  exportPdf: { en: 'Print / PDF', ar: 'طباعة / PDF' },
  exportFhir: { en: 'Export FHIR (JSON)', ar: 'تصدير FHIR (JSON)' },
  arBadge: { en: 'AR', ar: 'الواقع المعزز' },
  arComingSoon: { en: 'Coming Soon', ar: 'قريبًا' },
  evidenceDrawer: { en: 'Evidence Drawer', ar: 'درج الأدلة' },
  advisories: { en: 'Advisories', ar: 'تنبيهات' },
  none: { en: 'None', ar: 'لا يوجد' },
} as const;

const BADGE_CLS: Record<string, string> = {
  Low: 'border-lime-500/50 text-lime-300 bg-lime-500/10',
  Medium: 'border-amber-500/50 text-amber-300 bg-amber-500/10',
  High: 'border-red-500/50 text-red-300 bg-red-500/10',
};

function BadgeChip({ level, kind }: { level: string; kind: string }) {
  return (
    <span
      data-testid={`badge-${kind}`}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${BADGE_CLS[level] ?? BADGE_CLS.Low}`}
    >
      {level}
    </span>
  );
}

/* ---- LEVEL 3: lazy chart wrapper (IntersectionObserver + skeleton) ------- */

const Tool036AccumulationChart = dynamic(() => import('./tool-036-accumulation-chart'), {
  ssr: false,
  loading: () => (
    <div data-testid="chart-skeleton" className="h-56 w-full animate-pulse rounded-xl bg-zinc-800/60" />
  ),
});

function LazyAccumulationChart({ data, label, locale }: { data: ChartPoint[]; label: string; locale: 'ar' | 'en' }) {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return; // manual button remains as fallback
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={sentinel} data-testid="chart-sentinel">
      {visible ? (
        <Tool036AccumulationChart data={data} label={label} />
      ) : (
        <div className="space-y-2">
          <div data-testid="chart-skeleton" className="h-56 w-full animate-pulse rounded-xl bg-zinc-800/60" />
          <button
            type="button"
            data-testid="chart-load"
            onClick={() => setVisible(true)}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700"
          >
            {L2_STR.chartLoad[locale]}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---- LEVEL 2: 2D SVG body map (>=44px tap targets, no 3D) ---------------- */

const BODY_SITE_POS: Record<string, { x: number; y: number }> = {
  'deltoid-l': { x: 24, y: 56 },
  'deltoid-r': { x: 172, y: 56 },
  'ventro-l': { x: 48, y: 118 },
  'ventro-r': { x: 148, y: 118 },
  'dorso-l': { x: 48, y: 178 },
  'dorso-r': { x: 148, y: 178 },
  'vastus-l': { x: 56, y: 242 },
  'vastus-r': { x: 140, y: 242 },
};

function BodyMap2D({ selected, onSelect, locale }: { selected: string; onSelect: (id: string) => void; locale: 'ar' | 'en' }) {
  return (
    <svg
      viewBox="0 0 240 320"
      role="group"
      aria-label={L2_STR.bodyMap[locale]}
      data-testid="body-map"
      className="mx-auto block h-auto w-full max-w-[280px]"
    >
      <ellipse cx={120} cy={38} rx={22} ry={26} className="fill-zinc-800" />
      <rect x={92} y={70} width={56} height={120} rx={18} className="fill-zinc-800/70" />
      <rect x={84} y={192} width={30} height={108} rx={12} className="fill-zinc-800/60" />
      <rect x={126} y={192} width={30} height={108} rx={12} className="fill-zinc-800/60" />
      {BODY_SITES.map((s) => {
        const p = BODY_SITE_POS[s.siteId];
        const active = selected === s.siteId;
        return (
          <g
            key={s.siteId}
            role="button"
            tabIndex={0}
            aria-label={`${s.labelEn} / ${s.labelAr}`}
            aria-pressed={active}
            data-testid={`bodysite-${s.siteId}`}
            onClick={() => onSelect(s.siteId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(s.siteId);
            }}
            className="cursor-pointer"
          >
            <rect
              x={p.x}
              y={p.y}
              width={44}
              height={44}
              rx={9}
              strokeWidth={2}
              className={active ? 'fill-lime-500/70 stroke-lime-300' : 'fill-cyan-500/20 stroke-cyan-400/60'}
            />
            <text x={p.x + 22} y={p.y + 27} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#fff">
              {s.region.slice(0, 3).toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---- LEVEL 2: 12-week rotation table ------------------------------------ */

function RotationTable({ weeks, violations, locale }: { weeks: RotationWeek[]; violations: RotationViolation[]; locale: 'ar' | 'en' }) {
  const days = locale === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;
  const byWeek = new Map<number, RotationViolation[]>();
  for (const v of violations) {
    const w = Math.floor(v.dayIndex / 7);
    byWeek.set(w, [...(byWeek.get(w) ?? []), v]);
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]" data-testid="rotation-table">
        <thead>
          <tr className="text-zinc-500">
            <th className="p-1 text-start">{locale === 'ar' ? 'أسبوع' : 'Week'}</th>
            <th className="p-1 text-start">{locale === 'ar' ? 'الحقن' : 'Entries'}</th>
            <th className="p-1 text-start">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => {
            const vs = byWeek.get(w.weekIndex) ?? [];
            const hasErr = vs.some((v) => v.severity === 'error');
            return (
              <tr key={w.weekIndex} data-testid="rotation-row" className="border-t border-zinc-800">
                <td className="p-1 font-mono text-zinc-400">{w.weekIndex + 1}</td>
                <td className="p-1 font-mono text-zinc-300" dir="ltr">
                  {w.entries.map((e) => `${days[e.day]}·${e.site}`).join('  ')}
                </td>
                <td className="p-1">
                  {hasErr ? (
                    <span className="font-bold text-red-400">{locale === 'ar' ? 'خطأ' : 'error'}</span>
                  ) : vs.length > 0 ? (
                    <span className="font-bold text-amber-400">{locale === 'ar' ? 'تحذير' : 'warning'}</span>
                  ) : (
                    <span className="font-bold text-lime-400">{locale === 'ar' ? 'سليم' : 'ok'}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- LEVEL 3: Gantt (native HTML5 drag on desktop, arrows on mobile) ----- */

function Gantt({
  rows,
  override,
  onSwap,
  locale,
}: {
  rows: { weekIndex: number; day: number; siteId: string }[];
  override: Record<number, string>;
  onSwap: (i: number, j: number) => void;
  locale: 'ar' | 'en';
}) {
  return (
    <ul className="space-y-1" data-testid="gantt">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-[11px]">
          <span
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = Number(e.dataTransfer.getData('text/plain'));
              if (!Number.isNaN(from)) onSwap(from, i);
            }}
            className="hidden cursor-grab text-zinc-500 md:inline"
            title="drag"
          >
            ⋮⋮
          </span>
          <span className="w-16 font-mono text-zinc-500">
            W{r.weekIndex + 1}·D{r.day}
          </span>
          <span className="flex-1 font-mono text-cyan-400">{override[i] ?? r.siteId}</span>
          <button
            type="button"
            data-testid={`gantt-up-${i}`}
            onClick={() => onSwap(i, i - 1)}
            disabled={i === 0}
            className="rounded bg-zinc-800 px-2 py-0.5 disabled:opacity-30 md:hidden"
            aria-label={locale === 'ar' ? 'أعلى' : 'up'}
          >
            ↑
          </button>
          <button
            type="button"
            data-testid={`gantt-down-${i}`}
            onClick={() => onSwap(i, i + 1)}
            disabled={i === rows.length - 1}
            className="rounded bg-zinc-800 px-2 py-0.5 disabled:opacity-30 md:hidden"
            aria-label={locale === 'ar' ? 'أسفل' : 'down'}
          >
            ↓
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---- LEVEL 2: comfort factors (zones + pain + evidence drawer) ----------- */

function ComfortPanel({
  volumeMl,
  siteId,
  painScore,
  locale,
  onVolume,
  onSite,
  onPain,
}: {
  volumeMl: number;
  siteId: string;
  painScore: number;
  locale: 'ar' | 'en';
  onVolume: (v: number) => void;
  onSite: (s: string) => void;
  onPain: (p: number) => void;
}) {
  const comfort = assessComfort(volumeMl, siteId, painScore);
  const site = bodySiteById(siteId);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h3 className="mb-3 text-xs font-black text-zinc-300">{L2_STR.comfort[locale]}</h3>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={`rounded-lg border p-2 text-[11px] font-bold ${ZONE_CELL[comfort.zone].cls}`}>{ZONE_CELL[comfort.zone][locale]}</div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-[11px]">
          <span className="text-zinc-400">
            {L2_STR.volume[locale]} <BadgeChip level={comfort.volumeBadge} kind="volume" />
          </span>
          <span className="text-zinc-400">
            {L2_STR.pain[locale]} <BadgeChip level={comfort.painBadge} kind="pain" />
          </span>
        </div>
      </div>

      <label className="mb-2 block text-[11px] font-bold text-zinc-500">
        {L2_STR.selectedSite[locale]}: <span className="font-mono text-cyan-400">{site ? (locale === 'ar' ? site.labelAr : site.labelEn) : siteId}</span>
        <select
          data-testid="comfort-site"
          value={siteId}
          onChange={(e) => onSite(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
        >
          {BODY_SITES.map((s) => (
            <option key={s.siteId} value={s.siteId}>
              {locale === 'ar' ? s.labelAr : s.labelEn}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block text-[11px] font-bold text-zinc-500">
          {L2_STR.volume[locale]}: <span className="font-mono text-cyan-400">{volumeMl.toFixed(2)} mL</span>
          <input
            type="range"
            min={0}
            max={10}
            step={0.25}
            value={volumeMl}
            data-testid="comfort-volume"
            onChange={(e) => onVolume(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="block text-[11px] font-bold text-zinc-500">
          {L2_STR.pain[locale]}: <span className="font-mono text-cyan-400">{painScore}/10</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={painScore}
            data-testid="comfort-pain"
            onChange={(e) => onPain(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
      </div>

      <div className="mb-2">
        <span className="text-[10px] font-bold text-zinc-500">{L2_STR.advisories[locale]}</span>
        {comfort.advisories.length === 0 ? (
          <p className="text-[11px] text-lime-400">{L2_STR.none[locale]}</p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-[11px] text-amber-300">
            {comfort.advisories.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        )}
      </div>

      <details className="mt-2 text-[10px] text-zinc-500" data-testid="evidence-drawer">
        <summary className="cursor-pointer font-bold text-cyan-400">ⓘ {L2_STR.evidenceDrawer[locale]}</summary>
        <ul className="mt-1 space-y-1" dir="ltr">
          {comfort.evidence.map((e, i) => (
            <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
              <span className="text-zinc-400">{e.evidenceId}</span> · {e.confidence}
              {e.note && <div className="text-zinc-500">{e.note}</div>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

/* ---- LEVEL 2: personal logger (0–10, avg last 5, healing 7d/14d) --------- */

function PersonalLogger({
  log,
  onAdd,
  daysSince,
  onDays,
  locale,
}: {
  log: number[];
  onAdd: (v: number) => void;
  daysSince: number;
  onDays: (d: number) => void;
  locale: 'ar' | 'en';
}) {
  const [value, setValue] = useState(5);
  const avg = averageRecent(log);
  const healing = healingStatus(daysSince);
  const hCls = healing.state === 'optimal' ? 'text-lime-400' : healing.state === 'minimum-met' ? 'text-amber-400' : 'text-red-400';
  const hLabel = locale === 'ar' ? healing.messageAr : healing.messageEn;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h3 className="mb-3 text-xs font-black text-zinc-300">{L2_STR.logger[locale]}</h3>
      <div className="mb-3 flex items-end gap-2">
        <label className="text-[11px] font-bold text-zinc-500">
          {L2_STR.pain[locale]}
          <input
            type="number"
            min={0}
            max={10}
            step={1}
            value={value}
            data-testid="pain-input"
            onChange={(e) => setValue(Math.max(0, Math.min(10, Math.round(Number(e.target.value) || 0))))}
            className="mt-1 w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white font-mono"
          />
        </label>
        <button
          type="button"
          data-testid="pain-add"
          onClick={() => onAdd(value)}
          className="rounded-lg bg-lime-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-lime-400"
        >
          {L2_STR.addLog[locale]}
        </button>
        <div className="ml-auto text-end">
          <span className="block text-[10px] text-zinc-500">{L2_STR.avg5[locale]}</span>
          <span data-testid="pain-average" className="font-mono text-sm font-bold text-cyan-400">
            {avg === null ? '—' : avg.toFixed(2)}
          </span>
        </div>
      </div>

      <label className="mb-2 block text-[11px] font-bold text-zinc-500">
        {L2_STR.daysSince[locale]}: <span className="font-mono text-cyan-400">{daysSince}</span>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={daysSince}
          data-testid="days-since"
          onChange={(e) => onDays(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
        <span className="block text-[10px] text-zinc-500">{L2_STR.healing[locale]}</span>
        <span data-testid="healing-state" className={`text-[11px] font-bold ${hCls}`}>
          {hLabel}
        </span>
      </div>
    </div>
  );
}

function Tool036Supreme() {
  const [locale, setLocale] = useState<'ar' | 'en'>('en');
  const [compounds, setCompounds] = useState<CompoundInput[]>([DEFAULT_COMPOUND]);
  const [sitesText, setSitesText] = useState(DEFAULT_SITES);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tab, setTab] = useState<'core' | 'sites' | 'comfort'>('core');
  const [selectedSite, setSelectedSite] = useState('ventro-l');
  const [comfortVolume, setComfortVolume] = useState(1.0);
  const [painScore, setPainScore] = useState(0);
  const [painLog, setPainLog] = useState<number[]>([]);
  const [daysSince, setDaysSince] = useState(7);
  const [ganttOverride, setGanttOverride] = useState<Record<number, string>>({});
  const isRtl = locale === 'ar';
  const T = (k: keyof typeof L1_STR) => L1_STR[k][locale];
  const days = locale === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  const inputs = useMemo(() => ({ compounds, rotation_sites: parseSites(sitesText) }), [compounds, sitesText]);
  const parsed = useMemo(() => ChronoPlanInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? planChronoInjectionSchedule(parsed.data) : null), [parsed]);

  const updateCompound = (index: number, patch: Partial<CompoundInput>) =>
    setCompounds((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const addCompound = () => setCompounds((p) => (p.length >= 8 ? p : [...p, { ...DEFAULT_COMPOUND }]));

  const next = useMemo(() => {
    if (!result || result.shots.length === 0) return null;
    const minDay = Math.min(...result.shots.map((s) => s.day));
    return result.shots.find((s) => s.day === minDay) ?? null;
  }, [result]);

  const T2 = (k: 'core' | 'sites' | 'comfort') => L2_STR.tabs[k][locale];

  /* LEVEL 2 — 12-week rotation plan + 7-day floor / 14-day warning validation */
  const planSites = useMemo(() => {
    const s = parseSites(sitesText)
      .map((x) => x.toLowerCase())
      .filter((x) => BODY_SITES.some((b) => b.siteId === x));
    return s.length > 0 ? s : ['ventro-l', 'ventro-r'];
  }, [sitesText]);

  const weeks = useMemo(() => buildRotationPlan(planSites, [], 12), [planSites]);
  const violations = useMemo(
    () =>
      validateRotation(
        weeks.flatMap((w) => w.entries.map((e) => ({ siteId: e.site, dayIndex: w.weekIndex * 7 + e.day }))),
      ),
    [weeks],
  );
  const gantt = useMemo(() => ganttRows(weeks), [weeks]);

  /* LEVEL 3 — chart series is plain JSON so the recharts chunk stays lazy */
  const chartData: ChartPoint[] = useMemo(() => {
    const first = compounds[0];
    return accumulationChartSeries(
      ESTER_PROFILES['testosterone-enanthate'],
      { weeklyDoseMg: first?.weekly_dose_mg ?? 200, injectionsPerWeek: first?.injections_per_week ?? 2 },
      12,
    );
  }, [compounds]);

  const swapGantt = (i: number, j: number) => {
    if (i === j || j < 0 || j >= gantt.length) return;
    setGanttOverride((prev) => {
      const a = prev[i] ?? gantt[i].siteId;
      const b = prev[j] ?? gantt[j].siteId;
      return { ...prev, [i]: b, [j]: a };
    });
  };

  /* LEVEL 3 — export. Zero extra libraries: FHIR as a JSON Blob, PDF via native print. */
  const exportFhir = (r: ChronoResult | null) => {
    if (!r) return;
    const bundle = buildFhirBundle(r, { patientRef: 'Patient/self' });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tool-036-fhir-bundle.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">CHRONO-INJECT OS</h1>
        <div className="flex items-center gap-2">
          <span
            data-testid="ar-badge"
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400"
            title={L2_STR.arComingSoon[locale]}
          >
            {L2_STR.arBadge[locale]} · {L2_STR.arComingSoon[locale]}
          </span>
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-300">
        {L1_STR.educational[locale]}
      </p>

      <div role="tablist" className="mb-4 grid grid-cols-3 gap-2" data-testid="tabs">
        {(['core', 'sites', 'comfort'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            data-testid={`tab-${k}`}
            onClick={() => setTab(k)}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-bold ${tab === k ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
          >
            {T2(k)}
          </button>
        ))}
      </div>

      {tab === 'core' && (
        <>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{T('compounds')}</h2>
      <div className="space-y-2 mb-3">
        {compounds.map((c, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={c.name_en} onChange={(e) => updateCompound(i, { name_en: e.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="Name" />
            <label className="text-[10px] text-zinc-500">mg/wk
              <input type="number" min={1} max={5000} value={c.weekly_dose_mg} onChange={(e) => updateCompound(i, { weekly_dose_mg: Number(e.target.value) || 1 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">mg/mL
              <input type="number" step={1} min={1} max={500} value={c.concentration_mg_ml} onChange={(e) => updateCompound(i, { concentration_mg_ml: Number(e.target.value) || 1 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">inj/wk
              <input type="number" step={1} min={1} max={7} value={c.injections_per_week} onChange={(e) => updateCompound(i, { injections_per_week: Math.max(1, Math.min(7, Math.round(Number(e.target.value) || 1))) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <span className="text-[10px] text-zinc-600 self-center">{siteCeilingMl(parseSites(sitesText)[0] ?? 'gluteal-L').ceilingMl} mL max/site</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={addCompound} disabled={compounds.length >= 8} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {T('addCompound')}</button>

      <label className="block text-xs font-bold text-zinc-500 mb-4">{isRtl ? 'مواقع الحقن' : 'Rotation sites'}
        <input value={sitesText} onChange={(e) => setSitesText(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" placeholder="gluteal-L, gluteal-R, deltoid-L, deltoid-R" />
      </label>

      {!parsed.success && (
        <p className="mb-3 text-xs font-bold text-red-400">⚠ {T('noneYet')}</p>
      )}

      {result && result.shots.length > 0 && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40">
              <span className="text-[10px] text-zinc-400 block">{T('total')}</span>
              <span className="text-xl font-bold text-lime-400 font-mono">{result.total_volume_ml_per_week.toFixed(2)}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{T('busiest')}</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{days[result.busiest_day]}</span>
            </div>
          </div>

          <h3 className="text-xs font-black text-zinc-300 mb-2">{T('next')}</h3>
          {next && (
            <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
              <span className="text-cyan-200 text-sm font-bold">{days[next.day]} · {next.site} · {next.volume_ml.toFixed(2)} mL</span>
            </div>
          )}

          <h3 className="text-xs font-black text-zinc-300 mb-2">{T('guard')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            {(['green', 'yellow', 'red'] as const).map((z) => (
              <div key={z} className={`rounded-lg border p-2 text-[11px] font-bold ${ZONE_CELL[z].cls}`}>
                {ZONE_CELL[z][locale]}
              </div>
            ))}
          </div>

          <h3 className="text-xs font-black text-zinc-300 mb-2 mt-4">{T('weekly')}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-2" dir="ltr">
            {result.shots.map((s, i) => {
              const evidence = classifyVolumeZone(s.volume_ml, s.site).evidence;
              return (
                <li key={i} className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-300">{days[s.day]}</span>
                    <span className="text-zinc-400">{s.compound_name}</span>
                    <span className="font-mono text-cyan-400">{s.dose_mg} mg / {s.volume_ml.toFixed(2)} mL</span>
                    <span className="text-zinc-500 font-mono">{s.site}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${ZONE_CELL[s.zone].chip}`}>{s.zone}</span>
                  </div>
                  <EvidenceNote evidence={evidence} locale={locale} />
                </li>
              );
            })}
          </ul>

          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">{isRtl ? 'تنبيهات' : 'Warnings'}</span>
              <ul className="space-y-0.5 text-xs text-amber-300">{result.warnings.map((w, i) => (<li key={i}>• {w.message}</li>))}</ul>
            </div>
          )}

          {result.redFlags.length > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 mt-3">
              <span className="text-[10px] font-bold text-red-400 block mb-1">{isRtl ? 'راية حمراء' : 'Red Flags'}</span>
              <ul className="space-y-0.5 text-xs text-red-300">
                {result.redFlags.map((f, i) => (<li key={i}>• {locale === 'ar' ? f.messageAr : f.messageEn}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="w-full mb-4 px-4 py-2 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
      >
        {T('advanced')}
      </button>
      {showAdvanced && (
        <p className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-[11px] text-zinc-400">
          {T('advancedNote')}
        </p>
      )}
        </>
      )}

      {tab === 'sites' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h3 className="mb-1 text-xs font-black text-zinc-300">{L2_STR.bodyMap[locale]}</h3>
            <p className="mb-3 text-[11px] text-zinc-500">{L2_STR.bodyMapNote[locale]}</p>
            <BodyMap2D selected={selectedSite} onSelect={setSelectedSite} locale={locale} />
            <p className="mt-2 text-center text-[11px] text-zinc-400">
              {L2_STR.selectedSite[locale]}: <span className="font-mono text-cyan-400">{selectedSite}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h3 className="mb-2 text-xs font-black text-zinc-300">{L2_STR.rotation[locale]}</h3>
            <RotationTable weeks={weeks} violations={violations} locale={locale} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h3 className="mb-1 text-xs font-black text-zinc-300">{L2_STR.gantt[locale]}</h3>
            <p className="mb-2 text-[11px] text-zinc-500">{L2_STR.ganttNote[locale]}</p>
            <Gantt rows={gantt} override={ganttOverride} onSwap={swapGantt} locale={locale} />
          </div>
        </div>
      )}

      {tab === 'comfort' && (
        <div className="space-y-4">
          <ComfortPanel
            volumeMl={comfortVolume}
            siteId={selectedSite}
            painScore={painScore}
            locale={locale}
            onVolume={setComfortVolume}
            onSite={setSelectedSite}
            onPain={setPainScore}
          />

          <PersonalLogger
            log={painLog}
            onAdd={(v) => setPainLog((p) => [...p, v])}
            daysSince={daysSince}
            onDays={setDaysSince}
            locale={locale}
          />

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h3 className="mb-2 text-xs font-black text-zinc-300">{L2_STR.chart[locale]}</h3>
            <LazyAccumulationChart
              data={chartData}
              label={locale === 'ar' ? 'التراكم النسبي' : 'Relative level'}
              locale={locale}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-testid="export-pdf"
              onClick={exportPdf}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700"
            >
              {L2_STR.exportPdf[locale]}
            </button>
            <button
              type="button"
              data-testid="export-fhir"
              onClick={() => exportFhir(result)}
              disabled={!result}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
            >
              {L2_STR.exportFhir[locale]}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] text-zinc-600 flex flex-col gap-1">
        <span className="text-amber-400 font-bold">{L1_STR.educational[locale]}</span>
        <span>{L1_STR.sources[locale]}: {result ? result.provenance.length : 0}</span>
      </div>
    </div>
  );
}

export default function Tool036InjectionSchedule() {
  return SUPREME_ON ? <Tool036Supreme /> : <Tool036V1 />;
}
