'use client';
/** Tool #034 — Compound Clearance Calculator (dynamic UI, GPT2 spec). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateCompoundClearance } from '@/lib/tools/engines/tool-034-compound-clearance';
import { buildClearanceOutput } from '@/lib/tools/adapters/tool-034-compound-clearance';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ClearanceInputSchema } from '@/lib/tools/schemas/tool-034-compound-clearance';
import i18nJson from '@/i18n/tool-034-compound-clearance.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-034-compound-clearance';
interface DraftInputs { compoundName: string; halfLife: number; lastDoseMg: number; lastDoseDate: string }
const today = () => new Date().toISOString().slice(0, 10);

export default function Tool034CompoundClearance() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [compoundName, setCompoundName] = useState('Testosterone Enanthate');
  const [halfLife, setHalfLife] = useState(4.5);
  const [lastDoseMg, setLastDoseMg] = useState(250);
  const [lastDoseDate, setLastDoseDate] = useState(today());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');
  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (!draft) return;
    if (draft.inputs.compoundName) setCompoundName(draft.inputs.compoundName);
    if (typeof draft.inputs.halfLife === 'number') setHalfLife(draft.inputs.halfLife);
    if (typeof draft.inputs.lastDoseMg === 'number') setLastDoseMg(draft.inputs.lastDoseMg);
    if (draft.inputs.lastDoseDate) setLastDoseDate(draft.inputs.lastDoseDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const inputs = useMemo(() => ({ compound_name: compoundName, half_life_days: halfLife, last_dose_mg: lastDoseMg, last_dose_date: lastDoseDate }), [compoundName, halfLife, lastDoseMg, lastDoseDate]);
  const parsed = useMemo(() => ClearanceInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? calculateCompoundClearance(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildClearanceOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: '1970-01-01T00:00:00.000Z', recordedAt: '1970-01-01T00:00:00.000Z', timezone: 'UTC' });
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
  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildClearanceOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-xs font-bold text-zinc-500">{t.compound_name}
          <input value={compoundName} onChange={(e) => setCompoundName(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.half_life_days}
          <input type="number" step={0.1} min={0.5} max={60} value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value) || 0.5)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.last_dose_mg}
          <input type="number" min={1} max={10000} value={lastDoseMg} onChange={(e) => setLastDoseMg(Number(e.target.value) || 1)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.last_dose_date}
          <input type="date" value={lastDoseDate.slice(0, 10)} onChange={(e) => setLastDoseDate(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40"><span className="text-[10px] text-zinc-400 block">{t.clearance_date}</span><span className="text-lg font-bold text-lime-400 font-mono" dir="ltr">{result.clearance_date}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.days_to_clear}</span><span className="text-xl font-bold text-cyan-400 font-mono">{result.days_to_clear}</span></div>
          </div>
          <div className="text-xs text-zinc-300 mb-1">{t.current_remaining}: <span className="font-mono" dir="ltr">{result.current_remaining_mg} mg ({result.current_remaining_percent}%)</span></div>
          <div className={`text-xs font-bold mb-2 ${result.already_clear ? 'text-lime-400' : 'text-amber-300'}`}>{result.already_clear ? `✓ ${t.already_clear}` : `… ${t.not_yet_clear}`}</div>
          <h3 className="text-xs font-black text-zinc-300 mb-1">{t.curve}</h3>
          <ul className="space-y-1 text-xs text-zinc-400 font-mono" dir="ltr">{result.curve.map((p, i) => (<li key={i}>d{p.days_after_last_dose} · {p.date} · {p.remaining_mg} mg ({p.remaining_percent}%)</li>))}</ul>
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
