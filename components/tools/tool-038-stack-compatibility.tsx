'use client';
/** Tool #038 — Stack Compatibility Checker (dynamic UI, GPT2 spec). useMemo
 * instant recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { checkStackCompatibility, type StackCompatibilityResult } from '@/lib/tools/engines/tool-038-stack-compatibility';
import { buildStackCompatibilityOutput } from '@/lib/tools/adapters/tool-038-stack-compatibility';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { StackCompatibilityInputSchema } from '@/lib/tools/schemas/tool-038-stack-compatibility';
import i18nJson from '@/i18n/tool-038-stack-compatibility.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-038-stack-compatibility';
type Family = 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'ai' | 'serm' | 'support';
interface ItemUI { name_en: string; family: Family; weekly_dose_mg: number; hepatotoxic: boolean }
interface DraftInputs { items: ItemUI[] }

const DEFAULT_ITEM: ItemUI = { name_en: 'Testosterone Enanthate', family: 'testosterone', weekly_dose_mg: 500, hepatotoxic: false };

const VERDICT_COLOR: Record<string, string> = { compatible: 'text-lime-400 border-lime-500/40', caution: 'text-amber-400 border-amber-500/40', incompatible: 'text-red-400 border-red-500/40' };
const FLAG_COLOR: Record<string, string> = { info: 'text-zinc-400', monitor: 'text-amber-400', important: 'text-red-400' };

export default function Tool038StackCompatibility() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ items: [DEFAULT_ITEM] });
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

  const parsed = useMemo(() => StackCompatibilityInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<StackCompatibilityResult | null>(() => (parsed.success ? checkStackCompatibility(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildStackCompatibilityOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const addItem = () => setInputs((p) => (p.items.length >= 10 ? p : { ...p, items: [...p.items, { name_en: '', family: 'testosterone' as Family, weekly_dose_mg: 250, hepatotoxic: false }] }));
  const removeItem = (i: number) => setInputs((p) => (p.items.length <= 1 ? p : { ...p, items: p.items.filter((_, j) => j !== i) }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildStackCompatibilityOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } finally { setIsSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.items}</h2>
      <div className="space-y-2 mb-3">
        {inputs.items.map((it, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={it.name_en} onChange={(e) => setInputs((p) => ({ ...p, items: p.items.map((x, j) => (j === i ? { ...x, name_en: e.target.value } : x)) }))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="Name" />
            <select value={it.family} onChange={(e) => setInputs((p) => ({ ...p, items: p.items.map((x, j) => (j === i ? { ...x, family: e.target.value as ItemUI['family'] } : x)) }))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
              {['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'ai', 'serm', 'support'].map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
            <label className="text-[10px] text-zinc-500">mg/wk
              <input type="number" min={0} max={5000} value={it.weekly_dose_mg} onChange={(e) => setInputs((p) => ({ ...p, items: p.items.map((x, j) => (j === i ? { ...x, weekly_dose_mg: e.target.value === '' ? 0 : Number(e.target.value) } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
              <input type="checkbox" checked={it.hepatotoxic} onChange={(e) => setInputs((p) => ({ ...p, items: p.items.map((x, j) => (j === i ? { ...x, hepatotoxic: e.target.checked } : x)) }))} className="accent-lime-500" />hepatotoxic
            </label>
            <button type="button" onClick={() => removeItem(i)} disabled={inputs.items.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} disabled={inputs.items.length >= 10} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_item}</button>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40"><span className="text-[10px] text-zinc-400 block">{t.score}</span><span className="text-2xl font-black text-lime-400 font-mono">{result.score_0_100}/100</span></div>
            <div className={`bg-zinc-950 p-3 rounded-lg border ${VERDICT_COLOR[result.verdict] ?? 'border-zinc-800'}`}><span className="text-[10px] text-zinc-400 block">{t.verdict}</span><span className="text-xl font-bold font-mono">{result.verdict}</span></div>
          </div>
          <div className="text-xs text-zinc-400 mb-3">{t.androgen_burden}: <span className="font-mono text-cyan-400 font-bold">{result.androgen_burden_mg_per_week} mg/wk</span></div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.flags}</h3>
          {result.flags.length > 0 ? (
            <ul className="space-y-1 text-xs mb-3">
              {result.flags.map((f, i) => (
                <li key={i} className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5">
                  <span className={`font-bold ${FLAG_COLOR[f.severity] ?? 'text-zinc-300'}`}>{f.severity === 'important' ? '⚠' : f.severity === 'monitor' ? '▲' : 'ℹ'} {f.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 mb-3">—</p>
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
