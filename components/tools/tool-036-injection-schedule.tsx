'use client';
/** Tool #036 — Injection Schedule Planner (dynamic UI, GPT2 spec). useMemo
 * instant recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { planInjectionSchedule, planChronoInjectionSchedule, classifyVolumeZone, siteCeilingMl, type EvidenceRef } from '@/lib/tools/engines/tool-036-injection-schedule';
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

function Tool036Supreme() {
  const [locale, setLocale] = useState<'ar' | 'en'>('en');
  const [compounds, setCompounds] = useState<CompoundInput[]>([DEFAULT_COMPOUND]);
  const [sitesText, setSitesText] = useState(DEFAULT_SITES);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">CHRONO-INJECT OS</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-300">
        {L1_STR.educational[locale]}
      </p>

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
