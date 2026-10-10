'use client';
/** Tool #045 — Cycle Break Planner (dynamic UI). useMemo instant recompute,
 * Zod validation, auto-draft, Bio-Dashboard save, AR/EN, prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { planCycleBreak, type CycleBreakResult } from '@/lib/tools/engines/tool-045-cycle-break-planner';
import { buildCycleBreakOutput } from '@/lib/tools/adapters/tool-045-cycle-break-planner';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { CycleBreakInputSchema } from '@/lib/tools/schemas/tool-045-cycle-break-planner';
import i18nJson from '@/i18n/tool-045-cycle-break-planner.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-045-cycle-break-planner';
interface CompoundUI { name_en: string; half_life_days: number; suppression_factor: number }
interface DraftInputs { cycle_weeks_used: number; compounds: CompoundUI[]; wants_bloodwork: boolean }

export default function Tool045CycleBreakPlanner() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ cycle_weeks_used: 12, compounds: [{ name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 }], wants_bloodwork: true });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((prev) => ({ ...prev, ...draft.inputs }));
  }, []);

  const parsed = useMemo(() => CycleBreakInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<CycleBreakResult | null>(() => (parsed.success ? planCycleBreak(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildCycleBreakOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale]);

  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);

  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    const timer = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const updateCompound = (i: number, patch: Partial<CompoundUI>) => setInputs((p) => ({ ...p, compounds: p.compounds.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildCycleBreakOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } finally { setIsSaving(false); }
  };

  const num = (v: string, fallback: number) => (v === '' ? fallback : Number(v));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>
      <label className="block text-[10px] font-bold text-zinc-500 mb-3">{t.cycle_weeks}
        <input type="number" min={4} max={52} value={inputs.cycle_weeks_used} onChange={(e) => setInputs((p) => ({ ...p, cycle_weeks_used: Math.round(num(e.target.value, 4)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
      </label>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.compounds}</h2>
      <div className="space-y-2 mb-3">
        {inputs.compounds.map((c, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={c.name_en} onChange={(e) => updateCompound(i, { name_en: e.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder={t.name} />
            <label className="text-[10px] text-zinc-500">{t.half_life}
              <input type="number" min={0.5} max={30} step={0.5} value={c.half_life_days} onChange={(e) => updateCompound(i, { half_life_days: num(e.target.value, 0.5) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">{t.suppression}
              <input type="number" min={1} max={3} value={c.suppression_factor} onChange={(e) => updateCompound(i, { suppression_factor: Math.round(num(e.target.value, 1)) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <button type="button" onClick={() => setInputs((p) => (p.compounds.length <= 1 ? p : { ...p, compounds: p.compounds.filter((_, j) => j !== i) }))} disabled={inputs.compounds.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button type="button" onClick={() => setInputs((p) => (p.compounds.length >= 8 ? p : { ...p, compounds: [...p.compounds, { name_en: '', half_life_days: 4.5, suppression_factor: 2 }] }))} disabled={inputs.compounds.length >= 8} className="px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_compound}</button>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.wants_bloodwork} onChange={(e) => setInputs((p) => ({ ...p, wants_bloodwork: e.target.checked }))} className="accent-lime-500" />{t.bloodwork}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.clear_days}</span><span className="text-2xl font-black text-lime-400 font-mono">{result.days_to_full_clear}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.pct_window}</span><span className="text-lg font-bold font-mono text-amber-400">D+{result.pct_start_day} · {result.pct_duration_weeks}{isRtl ? 'أسابيع' : 'wk'}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.baseline}</span><span className="text-lg font-bold font-mono text-cyan-400">{result.total_weeks_to_baseline} {isRtl ? 'أسبوع' : 'wk'}</span></div>
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.milestones}</h3>
          <ol className="space-y-1 mb-3">
            {result.recovery_milestones.map((m, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs">
                <span className="font-mono font-bold text-lime-400">W{m.week}</span>
                <span className="text-zinc-300">{isRtl ? m.label_ar : m.label_en}</span>
              </li>
            ))}
          </ol>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-3">
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
