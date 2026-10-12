'use client';
/** Tool #109 - Competition Readiness & Stage Posing OS (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { buildReadinessChecklist, type ReadinessResult } from '@/lib/tools/engines/tool-109-competition-readiness-posing-os';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { ReadinessInputSchema } from '@/lib/tools/schemas/tool-109-competition-readiness-posing-os';
import i18nJson from '@/i18n/tool-109-competition-readiness-posing-os.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-109-competition-readiness-posing-os';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';
const SEX_OPTIONS = ['male', 'female'];
const TYPE_OPTIONS = ['bodybuilding', 'physique', 'figure', 'bikini'];
const PHASE_OPTIONS = ['early', 'late', 'peak_week'];
const TAN_OPTIONS = ['none', 'auto', 'manual'];
const FMT: Record<string, string> = { bodybuilding: 'fmt_bodybuilding', physique: 'fmt_physique', figure: 'fmt_figure', bikini: 'fmt_bikini' };
const PH: Record<string, string> = { early: 'ph_early', late: 'ph_late', peak_week: 'ph_peak' };

interface DraftInputs {
  gender: string;
  show_type: string;
  experience_years: number;
  prep_phase: string;
  tan_maintenance: string;
  has_stage_photo_session: boolean;
}

export default function Tool109ReadinessOS() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    gender: 'female',
    show_type: 'physique',
    experience_years: 2,
    prep_phase: 'peak_week',
    tan_maintenance: 'auto',
    has_stage_photo_session: false,
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const parsed = useMemo(() => ReadinessInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<ReadinessResult | null>(() => (parsed.success ? buildReadinessChecklist(parsed.data) : null), [parsed]);

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
        <label className={LBL}>{t.gender}
          <select value={inputs.gender} onChange={(e) => setInputs((p) => ({ ...p, gender: e.target.value }))} className={SEL}>
            {SEX_OPTIONS.map((s) => (<option key={s} value={s}>{s === 'male' ? t.sex_male : t.sex_female}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.show_type}
          <select value={inputs.show_type} onChange={(e) => setInputs((p) => ({ ...p, show_type: e.target.value }))} className={SEL}>
            {TYPE_OPTIONS.map((s) => (<option key={s} value={s}>{t[FMT[s]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.experience_years}
          <input type="number" min={0} max={30} step={1} value={inputs.experience_years} onChange={(e) => setInputs((p) => ({ ...p, experience_years: Number(e.target.value || 2) }))} className={INP} />
        </label>
        <label className={LBL}>{t.prep_phase}
          <select value={inputs.prep_phase} onChange={(e) => setInputs((p) => ({ ...p, prep_phase: e.target.value }))} className={SEL}>
            {PHASE_OPTIONS.map((s) => (<option key={s} value={s}>{t[PH[s]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.tan_maintenance}
          <select value={inputs.tan_maintenance} onChange={(e) => setInputs((p) => ({ ...p, tan_maintenance: e.target.value }))} className={SEL}>
            {TAN_OPTIONS.map((s) => (<option key={s} value={s}>{t[s + '_none' === s ? 'tan_none' : s === 'auto' ? 'tan_auto' : 'tan_manual']}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.photo_session}
          <select value={String(inputs.has_stage_photo_session)} onChange={(e) => setInputs((p) => ({ ...p, has_stage_photo_session: e.target.value === 'true' }))} className={SEL}>
            <option value="true">{t.photo_yes}</option>
            <option value="false">{t.photo_no}</option>
          </select>
        </label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.checklist}</h2>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-[11px] text-zinc-300">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="text-start py-1">{t.when}</th>
                    <th className="text-start py-1">{t.category}</th>
                    <th className="text-start py-1">{t.item}</th>
                    <th className="text-start py-1">{t.reference}</th>
                    <th className="text-start py-1">{t.done}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.checklist.map((c) => (
                    <tr key={c.item_key} className="border-t border-zinc-800">
                      <td className="py-1 font-mono capitalize">{c.when}</td>
                      <td className="py-1 capitalize">{c.category}</td>
                      <td className="py-1">{t[c.item_key + '_label'] ?? c.item_key}</td>
                      <td className="py-1">{c.reference}</td>
                      <td className="py-1 text-right">
                        <input type="checkbox" defaultChecked={c.done} readOnly className="rounded" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-3 text-[11px]">
              <div className="flex-1 rounded bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300">
                <div className="font-black text-lime-400">{t.tier}:</div>
                <div className="font-mono">{result.readiness_tier}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">&#9888; {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

