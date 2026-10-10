'use client';
/** Tool #035 — Hormone Conversion Calculator (dynamic UI, GPT2 spec). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateHormoneConversion } from '@/lib/tools/engines/tool-035-hormone-conversion';
import { buildConversionOutput } from '@/lib/tools/adapters/tool-035-hormone-conversion';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ConversionInputSchema } from '@/lib/tools/schemas/tool-035-hormone-conversion';
import i18nJson from '@/i18n/tool-035-hormone-conversion.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-035-hormone-conversion';
interface DraftInputs { weeklyTestMg: number; bodyFatPct: number; age: number; aiDose: number }

export default function Tool035HormoneConversion() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [weeklyTestMg, setWeeklyTestMg] = useState(500);
  const [bodyFatPct, setBodyFatPct] = useState(18);
  const [age, setAge] = useState(30);
  const [aiDose, setAiDose] = useState(0);
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
    if (typeof draft.inputs.weeklyTestMg === 'number') setWeeklyTestMg(draft.inputs.weeklyTestMg);
    if (typeof draft.inputs.bodyFatPct === 'number') setBodyFatPct(draft.inputs.bodyFatPct);
    if (typeof draft.inputs.age === 'number') setAge(draft.inputs.age);
    if (typeof draft.inputs.aiDose === 'number') setAiDose(draft.inputs.aiDose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const inputs = useMemo(() => ({ weekly_test_mg: weeklyTestMg, body_fat_pct: bodyFatPct, age, ai_dose_mg_per_week: aiDose }), [weeklyTestMg, bodyFatPct, age, aiDose]);
  const parsed = useMemo(() => ConversionInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? calculateHormoneConversion(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildConversionOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: '1970-01-01T00:00:00.000Z', recordedAt: '1970-01-01T00:00:00.000Z', timezone: 'UTC' });
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
      const output = buildConversionOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <label className="text-xs font-bold text-zinc-500">{t.weekly_test_mg}
          <input type="number" min={0} max={3000} value={weeklyTestMg} onChange={(e) => setWeeklyTestMg(Math.max(0, Math.min(3000, Number(e.target.value) || 0)))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.body_fat_pct}
          <input type="number" step={0.5} min={5} max={60} value={bodyFatPct} onChange={(e) => setBodyFatPct(Math.max(5, Math.min(60, Number(e.target.value) || 5)))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.age}
          <input type="number" min={18} max={90} value={age} onChange={(e) => setAge(Math.max(18, Math.min(90, Number(e.target.value) || 18)))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.ai_dose}
          <input type="number" step={0.25} min={0} max={14} value={aiDose} onChange={(e) => setAiDose(Math.max(0, Math.min(14, Number(e.target.value) || 0)))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.estimated_total_t}</span><span className="text-lg font-bold text-cyan-400 font-mono" dir="ltr">{result.estimated_total_t_ng_dl}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40"><span className="text-[10px] text-zinc-400 block">{t.estimated_e2}</span><span className="text-lg font-bold text-lime-400 font-mono" dir="ltr">{result.estimated_e2_pg_ml}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.e2_status}</span><span className="text-lg font-bold text-amber-400 font-mono" dir="ltr">{result.e2_status}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.ai_suggestion}</span><span className="text-lg font-bold text-purple-400 font-mono" dir="ltr">{result.ai_suggestion_mg_per_week}</span></div>
          </div>
          <div className="text-xs text-zinc-400 font-mono mb-2" dir="ltr">{t.test_to_e2_ratio}: {result.test_to_e2_ratio}</div>
          <ul className="space-y-1 text-xs text-amber-200/90">{result.warnings.map((w, i) => (<li key={i}>⚠ {w}</li>))}</ul>
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
