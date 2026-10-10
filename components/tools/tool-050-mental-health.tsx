'use client';
/** Tool #050 — Mental Health Monitor (dynamic UI, GPT2 spec). useMemo instant
 * recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN, prev/next.
 * Red flags render an immediate-escalation banner — never diagnostic language. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { assessMentalHealth, type MentalHealthResult } from '@/lib/tools/engines/tool-050-mental-health';
import { buildMentalHealthOutput } from '@/lib/tools/adapters/tool-050-mental-health';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { MentalHealthInputSchema } from '@/lib/tools/schemas/tool-050-mental-health';
import i18nJson from '@/i18n/tool-050-mental-health.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-050-mental-health';
interface MoodUI { score: number; date: string }
interface DraftInputs {
  mood_scores: MoodUI[];
  sleep_hours_avg: number;
  irritability_episodes: number;
  aggression_episodes: number;
  uses_19_nor: boolean;
  red_flags: string[];
}

const today = () => new Date().toISOString().slice(0, 10);
const num = (e: React.ChangeEvent<HTMLInputElement>) => e.target.value === '' ? 0 : Number(e.target.value);
const BAND_COLOR: Record<string, string> = { stable: 'text-lime-400', watch: 'text-amber-400', concern: 'text-orange-400', critical: 'text-red-400' };

export default function Tool050MentalHealth() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    mood_scores: [{ score: 6, date: today() }, { score: 6, date: today() }, { score: 6, date: today() }],
    sleep_hours_avg: 7, irritability_episodes: 1, aggression_episodes: 0, uses_19_nor: false, red_flags: [],
  });
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

  const parsed = useMemo(() => MentalHealthInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<MentalHealthResult | null>(() => (parsed.success ? assessMentalHealth(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildMentalHealthOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const addMood = () => setInputs((p) => (p.mood_scores.length >= 30 ? p : { ...p, mood_scores: [...p.mood_scores, { score: 5, date: today() }] }));
  const toggleRedFlag = (code: string) => setInputs((p) => ({
    ...p,
    red_flags: p.red_flags.includes(code) ? p.red_flags.filter((c) => c !== code) : [...p.red_flags, code],
  }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildMentalHealthOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.mood_scores}</h2>
      <div className="space-y-2 mb-3">
        {inputs.mood_scores.map((m, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <label className="text-[10px] font-bold text-zinc-500">{t.score}
              <input type="number" min={1} max={10} value={m.score} onChange={(e) => setInputs((p) => ({ ...p, mood_scores: p.mood_scores.map((x, j) => (j === i ? { ...x, score: Math.min(10, Math.max(1, Math.round(num(e)))) } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] font-bold text-zinc-500">{t.date}
              <input type="date" value={m.date.slice(0, 10)} onChange={(e) => setInputs((p) => ({ ...p, mood_scores: p.mood_scores.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
          </div>
        ))}
      </div>
      <button type="button" onClick={addMood} disabled={inputs.mood_scores.length >= 30} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_entry}</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.sleep_hours_avg}
          <input type="number" min={0} max={14} step={0.5} value={inputs.sleep_hours_avg} onChange={(e) => setInputs((p) => ({ ...p, sleep_hours_avg: num(e) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.irritability_episodes}
          <input type="number" min={0} max={28} value={inputs.irritability_episodes} onChange={(e) => setInputs((p) => ({ ...p, irritability_episodes: Math.round(num(e)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.aggression_episodes}
          <input type="number" min={0} max={28} value={inputs.aggression_episodes} onChange={(e) => setInputs((p) => ({ ...p, aggression_episodes: Math.round(num(e)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.uses_19_nor} onChange={(e) => setInputs((p) => ({ ...p, uses_19_nor: e.target.checked }))} className="accent-lime-500" />{t.uses_19_nor}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <span className="text-[10px] font-bold text-zinc-500">{t.red_flags}:</span>
          <label className="flex items-center gap-1 text-xs text-zinc-400"><input type="checkbox" checked={inputs.red_flags.includes('self_harm_thoughts')} onChange={() => toggleRedFlag('self_harm_thoughts')} className="accent-red-500" />{t.red_flag_self_harm}</label>
          <label className="flex items-center gap-1 text-xs text-zinc-400"><input type="checkbox" checked={inputs.red_flags.includes('rage_episodes')} onChange={() => toggleRedFlag('rage_episodes')} className="accent-red-500" />{t.red_flag_rage}</label>
          <label className="flex items-center gap-1 text-xs text-zinc-400"><input type="checkbox" checked={inputs.red_flags.includes('hopelessness')} onChange={() => toggleRedFlag('hopelessness')} className="accent-red-500" />{t.red_flag_hopelessness}</label>
        </div>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          {result.escalation && (
            <div className="rounded-xl border-2 border-red-500/60 bg-red-500/20 p-4 mb-4">
              <span className="text-sm font-black text-red-400 block">🚨 {t.escalation}</span>
              <span className="text-xs text-red-300">{t.disclaimer}</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.avg_mood}</span><span className="text-2xl font-black text-white font-mono">{result.avg_mood}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.trend}</span><span className={`text-xl font-bold font-mono ${result.trend === 'improving' ? 'text-lime-400' : result.trend === 'declining' ? 'text-red-400' : 'text-zinc-300'}`}>{result.trend}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.band}</span><span className={`text-xl font-bold font-mono ${BAND_COLOR[result.band] ?? 'text-zinc-300'}`}>{result.band}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.sleep_hours_avg}</span><span className={`text-xl font-bold font-mono ${result.sleep_flag ? 'text-red-400' : 'text-lime-400'}`}>{inputs.sleep_hours_avg}h</span></div>
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-red-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-red-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
            </div>
          )}
          <p className="text-[10px] text-zinc-500">{t.disclaimer}</p>
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
