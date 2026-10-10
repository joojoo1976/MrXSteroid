'use client';
/** Tool #037 — Side Effect Probability Calculator (dynamic UI, GPT2 spec).
 * useMemo instant recompute, Zod validation, auto-draft via shared adapter,
 * standard Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateSideEffectProbability, type SideEffectRiskResult } from '@/lib/tools/engines/tool-037-side-effect-probability';
import { buildSideEffectProbabilityOutput } from '@/lib/tools/adapters/tool-037-side-effect-probability';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { SideEffectRiskInputSchema } from '@/lib/tools/schemas/tool-037-side-effect-probability';
import i18nJson from '@/i18n/tool-037-side-effect-probability.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-037-side-effect-probability';
type Family = 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'other';
const FAMILIES: Family[] = ['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'other'];
interface CompoundUI { name_en: string; family: Family; weekly_dose_mg: number; reference_dose_mg: number }
interface DraftInputs { compounds: CompoundUI[]; age: number; body_fat_pct: number; cycle_weeks: number; uses_ai: boolean; uses_liver_support: boolean }

const DEFAULT_COMPOUND: CompoundUI = { name_en: 'Testosterone Enanthate', family: 'testosterone', weekly_dose_mg: 500, reference_dose_mg: 500 };
const DEFAULTS: DraftInputs = { compounds: [DEFAULT_COMPOUND], age: 30, body_fat_pct: 18, cycle_weeks: 12, uses_ai: false, uses_liver_support: true };

const LEVEL_COLOR: Record<string, string> = { low: 'text-lime-400', moderate: 'text-amber-400', high: 'text-red-400' };

export default function Tool037SideEffectProbability() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>(DEFAULTS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((prev) => ({ ...prev, ...draft.inputs }));
  }, []);

  const parsed = useMemo(() => SideEffectRiskInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<SideEffectRiskResult | null>(() => (parsed.success ? calculateSideEffectProbability(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildSideEffectProbabilityOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale]);

  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);

  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, locale]);

  const updateCompound = (index: number, patch: Partial<CompoundUI>) => {
    setInputs((prev) => ({ ...prev, compounds: prev.compounds.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  };
  const addCompound = () => setInputs((p) => (p.compounds.length >= 8 ? p : { ...p, compounds: [...p.compounds, { ...DEFAULT_COMPOUND }] }));
  const removeCompound = (i: number) => setInputs((p) => (p.compounds.length <= 1 ? p : { ...p, compounds: p.compounds.filter((_, j) => j !== i) }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildSideEffectProbabilityOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.compounds}</h2>
      <div className="space-y-2 mb-3">
        {inputs.compounds.map((c, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={c.name_en} onChange={(e) => updateCompound(i, { name_en: e.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="Name" />
            <select value={c.family} onChange={(e) => updateCompound(i, { family: e.target.value as Family })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
              {FAMILIES.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
            <label className="text-[10px] text-zinc-500">mg/wk
              <input type="number" min={1} max={5000} value={c.weekly_dose_mg} onChange={(e) => updateCompound(i, { weekly_dose_mg: num(e.target.value, 1) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">ref mg/wk
              <input type="number" min={1} max={5000} value={c.reference_dose_mg} onChange={(e) => updateCompound(i, { reference_dose_mg: num(e.target.value, 1) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <button type="button" onClick={() => removeCompound(i)} disabled={inputs.compounds.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addCompound} disabled={inputs.compounds.length >= 8} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_compound}</button>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.age}
          <input type="number" min={18} max={90} value={inputs.age} onChange={(e) => setInputs((p) => ({ ...p, age: Math.round(num(e.target.value, 18)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.body_fat_pct} %
          <input type="number" min={5} max={60} value={inputs.body_fat_pct} onChange={(e) => setInputs((p) => ({ ...p, body_fat_pct: num(e.target.value, 5) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.cycle_weeks}
          <input type="number" min={1} max={52} value={inputs.cycle_weeks} onChange={(e) => setInputs((p) => ({ ...p, cycle_weeks: Math.round(num(e.target.value, 1)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.uses_ai} onChange={(e) => setInputs((p) => ({ ...p, uses_ai: e.target.checked }))} className="accent-lime-500" />{t.uses_ai}
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.uses_liver_support} onChange={(e) => setInputs((p) => ({ ...p, uses_liver_support: e.target.checked }))} className="accent-lime-500" />{t.uses_liver_support}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="mb-4">
            <span className="text-[10px] text-zinc-400 block">{t.overall_burden}</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-amber-400 font-mono">{result.overall_burden_pct.toFixed(0)}%</span>
              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${Math.min(100, result.overall_burden_pct)}%` }} /></div>
            </div>
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.risks}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-3">
            {result.risks.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5">
                <span className="font-bold text-zinc-300">{r.effect}</span>
                <span className={`font-mono font-bold ${LEVEL_COLOR[r.level] ?? 'text-zinc-400'}`}>{r.probability_pct.toFixed(1)}% · {r.level}</span>
              </li>
            ))}
          </ul>
          {result.mitigations.length > 0 && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-cyan-400 block mb-1">{t.mitigations}</span>
              <ul className="space-y-0.5 text-xs text-cyan-300">{result.mitigations.map((m, i) => (<li key={i}>• {m}</li>))}</ul>
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
