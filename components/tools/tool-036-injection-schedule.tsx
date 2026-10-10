'use client';
/** Tool #036 — Injection Schedule Planner (dynamic UI, GPT2 spec). useMemo
 * instant recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { planInjectionSchedule } from '@/lib/tools/engines/tool-036-injection-schedule';
import { buildInjectionScheduleOutput } from '@/lib/tools/adapters/tool-036-injection-schedule';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { InjectionScheduleInputSchema } from '@/lib/tools/schemas/tool-036-injection-schedule';
import i18nJson from '@/i18n/tool-036-injection-schedule.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-036-injection-schedule';
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

export default function Tool036InjectionSchedule() {
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
