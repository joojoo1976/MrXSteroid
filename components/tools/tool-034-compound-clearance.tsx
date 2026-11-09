'use client';
/** Tool #034 — Single-dose fractional-decay scenario; no clinical clearance assessment. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateCompoundClearance } from '@/lib/tools/engines/tool-034-compound-clearance';
import { buildClearanceOutput } from '@/lib/tools/adapters/tool-034-compound-clearance';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ClearanceInputSchema } from '@/lib/tools/schemas/tool-034-compound-clearance';
import i18nJson from '@/i18n/tool-034-compound-clearance.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-034-compound-clearance';
interface DraftInputs { compoundName: string; halfLife: number; halfLifeSource: string; lastDoseDate: string; asOfDate: string; thresholdPercent: number }

export default function Tool034CompoundClearance() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [compoundName, setCompoundName] = useState('');
  const [halfLife, setHalfLife] = useState(Number.NaN);
  const [halfLifeSource, setHalfLifeSource] = useState('');
  const [lastDoseDate, setLastDoseDate] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [thresholdPercent, setThresholdPercent] = useState(1);
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
    if (typeof draft.inputs.halfLifeSource === 'string') setHalfLifeSource(draft.inputs.halfLifeSource);
    if (draft.inputs.lastDoseDate) setLastDoseDate(draft.inputs.lastDoseDate);
    if (draft.inputs.asOfDate) setAsOfDate(draft.inputs.asOfDate);
    if (typeof draft.inputs.thresholdPercent === 'number') setThresholdPercent(draft.inputs.thresholdPercent);
  }, []);
  const inputs = useMemo(() => ({ compound_name: compoundName, half_life_days: halfLife, half_life_source: halfLifeSource, last_dose_date: lastDoseDate, as_of_date: asOfDate, threshold_fraction: thresholdPercent / 100 }), [compoundName, halfLife, halfLifeSource, lastDoseDate, asOfDate, thresholdPercent]);
  const parsed = useMemo(() => ClearanceInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? calculateCompoundClearance(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildClearanceOutput(parsed.data, { locale, unitSystem, snapshotType: 'draft', calculatedAt: new Date().toISOString(), recordedAt: `${parsed.data.last_dose_date}T00:00:00.000Z`, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale, unitSystem]);
  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);
  useEffect(() => {
    const key = JSON.stringify(inputs) + locale + unitSystem;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { saveDraft(TOOL_SLUG, { compoundName, halfLife, halfLifeSource, lastDoseDate, asOfDate, thresholdPercent }, { locale, unitSystem, savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, locale, unitSystem, compoundName, halfLife, halfLifeSource, lastDoseDate, asOfDate, thresholdPercent]);
  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(t.save_invalid); return; }
    setIsSaving(true);
    setSaveStatus(t.saving);
    try {
      const now = new Date().toISOString();
      const output = buildClearanceOutput(parsed.data, { locale, unitSystem, snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: `${parsed.data.last_dose_date}T00:00:00.000Z`, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { clearDraft(TOOL_SLUG); setSaveStatus(t.saved); }
      else setSaveStatus(t.save_failed);
    } finally { setIsSaving(false); }
  };
  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        {locale === 'en' && <h2 className="sr-only">Single-dose Fractional Decay Scenario</h2>}
        <div className="flex gap-2">


        </div>
      </div>
      <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">{t.model_note}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-xs font-bold text-zinc-500">{t.compound_name}
          <input value={compoundName} onChange={(e) => setCompoundName(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.half_life_days}
          <input data-r6-slider="true" type="number" step={0.1} min={0.5} max={365} value={Number.isFinite(halfLife) ? halfLife : ''} onChange={(e) => setHalfLife(e.target.value === '' ? Number.NaN : Number(e.target.value))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.half_life_source}
          <input value={halfLifeSource} onChange={(e) => setHalfLifeSource(e.target.value)} maxLength={500} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
          <span className="mt-1 block font-normal">{t.add_source_note}</span>
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.threshold_percent}
          <input data-r6-slider="true" type="number" min={0.1} max={20} step={0.1} value={Number.isFinite(thresholdPercent) ? thresholdPercent : ''} onChange={(e) => setThresholdPercent(e.target.value === '' ? Number.NaN : Number(e.target.value))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.last_dose_date}
          <input type="date" value={lastDoseDate.slice(0, 10)} onChange={(e) => setLastDoseDate(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.as_of_date}
          <input type="date" aria-label={isRtl ? 'الحساب حتى تاريخ' : 'Evaluate as of'} value={asOfDate.slice(0, 10)} onChange={(e) => setAsOfDate(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {!result && <p role="status" className="mb-4 rounded-lg border border-zinc-700 p-3 text-sm text-zinc-400">{t.no_result}</p>}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.threshold_date}</span><span className="text-lg font-bold text-zinc-200 font-mono" dir="ltr">{result.threshold_date}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.days_to_threshold}</span><span className="text-xl font-bold text-zinc-200 font-mono">{result.days_to_threshold}</span></div>
          </div>
          <div className="text-xs text-zinc-300 mb-1">{t.modeled_remaining}: <output aria-label={t.modeled_remaining} className="font-mono" dir="ltr">{result.modeled_remaining_percent}%</output></div>
          <p className="mb-2 text-xs text-zinc-400">{t.source_unverified} <span dir="auto">{parsed.success ? parsed.data.half_life_source : ''}</span></p>
          <div className="text-xs text-zinc-400 mb-2">{result.threshold_reached ? t.threshold_reached : t.threshold_not_reached}</div>
          <h3 className="text-xs font-black text-zinc-300 mb-1">{t.curve}</h3>
          <ul className="space-y-1 text-xs text-zinc-400 font-mono" dir="ltr">{result.curve.map((p, i) => (<li key={i}>d{p.days_after_last_dose} · {p.date} · {p.remaining_percent}%</li>))}</ul>
          <p className="mt-3 text-xs text-zinc-400">{result.model_note}</p>
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">{t.model_details}</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition disabled:opacity-50">{isSaving ? t.saving : t.save}</button>
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>←</span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
