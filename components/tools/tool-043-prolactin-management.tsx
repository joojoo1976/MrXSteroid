'use client';
/** Tool #043 — Prolactin Management Pro (dynamic UI). useMemo instant recompute,
 * Zod validation, auto-draft, Bio-Dashboard save, AR/EN, prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageProlactin, type ProlactinResult } from '@/lib/tools/engines/tool-043-prolactin-management';
import { buildProlactinOutput } from '@/lib/tools/adapters/tool-043-prolactin-management';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ProlactinInputSchema } from '@/lib/tools/schemas/tool-043-prolactin-management';
import i18nJson from '@/i18n/tool-043-prolactin-management.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-043-prolactin-management';
type Symptom = 'libido_loss' | 'edema' | 'galactorrhea' | 'mood_low';
const SYMPTOMS: Symptom[] = ['libido_loss', 'edema', 'galactorrhea', 'mood_low'];
interface DraftInputs { prolactin_ng_ml: number; uses_19_nor: boolean; weekly_cabergoline_mcg: number; symptoms: Symptom[] }

const BAND_COLOR: Record<string, string> = { normal: 'text-lime-400', borderline: 'text-amber-400', high: 'text-orange-400', 'very-high': 'text-red-400' };
const ACTION_AR: Record<string, string> = { none: 'لا شيء', monitor: 'راقب', start_low: 'ابدأ بجرعة منخفضة', adjust: 'عدّل الجرعة', pause: 'أوقف مؤقتًا', seek_physician: 'راجع طبيبًا' };
const SYMPTOM_AR: Record<Symptom, string> = { libido_loss: 'انخفاض الرغبة', edema: 'وذمة', galactorrhea: 'إفراز الحلمة', mood_low: 'اكتئاب مزاج' };

export default function Tool043ProlactinManagement() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ prolactin_ng_ml: 18, uses_19_nor: true, weekly_cabergoline_mcg: 0, symptoms: [] });
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

  const parsed = useMemo(() => ProlactinInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<ProlactinResult | null>(() => (parsed.success ? manageProlactin(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildProlactinOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const toggleSymptom = (s: DraftInputs['symptoms'][number]) => setInputs((p) => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter((x) => x !== s) : [...p.symptoms, s] }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildProlactinOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.prolactin}
          <input type="number" min={0.5} max={200} step={0.1} value={inputs.prolactin_ng_ml} onChange={(e) => setInputs((p) => ({ ...p, prolactin_ng_ml: num(e.target.value, 0.5) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.caber_dose}
          <input type="number" min={0} max={1000} step={125} value={inputs.weekly_cabergoline_mcg} onChange={(e) => setInputs((p) => ({ ...p, weekly_cabergoline_mcg: num(e.target.value, 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.uses_19_nor} onChange={(e) => setInputs((p) => ({ ...p, uses_19_nor: e.target.checked }))} className="accent-lime-500" />{t.uses_19nor}
        </label>
      </div>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.symptoms}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {SYMPTOMS.map((s) => (
          <button key={s} type="button" onClick={() => toggleSymptom(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${inputs.symptoms.includes(s) ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'}`}>{isRtl ? (SYMPTOM_AR[s] ?? s) : s}</button>
        ))}
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.band}</span><span className={`text-xl font-bold font-mono ${BAND_COLOR[result.band] ?? 'text-zinc-300'}`}>{result.band}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.suggested}</span><span className="text-xl font-bold font-mono text-cyan-400">{result.suggested_weekly_mcg} mcg</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.action}</span><span className="text-sm font-bold text-white">{isRtl ? (ACTION_AR[result.action] ?? result.action) : result.action}</span></div>
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-red-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-red-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
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
