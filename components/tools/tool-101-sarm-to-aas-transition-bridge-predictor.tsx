'use client';
/** Tool #101 - SARM-to-AAS Transition & Bridge Predictor (dynamic UI).
 * Educational PK elimination model only - never a dosing/transition protocol. */
import React, { useEffect, useMemo, useState } from 'react';
import { calculateSarmToAasTransition, type SarmToAasTransitionResult } from '@/lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { SarmToAasTransitionInputSchema } from '@/lib/tools/schemas/tool-101-sarm-to-aas-transition-bridge-predictor';
import i18nJson from '@/i18n/tool-101-sarm-to-aas-transition-bridge-predictor.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-101-sarm-to-aas-transition-bridge-predictor';

const SARM_OPTIONS = [
  { value: 'ostarine_mk2866', labelKey: 'sarm_ostarine' as const },
  { value: 'ligandrol_lgd4033', labelKey: 'sarm_ligandrol' as const },
  { value: 'rad140_testolone', labelKey: 'sarm_rad140' as const },
  { value: 'andarine_s4', labelKey: 'sarm_andarine' as const },
  { value: 'yk11', labelKey: 'sarm_yk11' as const },
  { value: 'cardarine_gw501516', labelKey: 'sarm_cardarine' as const },
];

const ESTER_OPTIONS = [
  { value: 'testosterone_propionate', labelKey: 'ester_tp' as const },
  { value: 'masteron_propionate', labelKey: 'ester_mast' as const },
  { value: 'trenbolone_acetate', labelKey: 'ester_tren' as const },
  { value: 'testosterone_enanthate', labelKey: 'ester_te' as const },
  { value: 'testosterone_cypionate', labelKey: 'ester_tc' as const },
  { value: 'sustanon_250', labelKey: 'ester_sust' as const },
  { value: 'nandrolone_decanoate', labelKey: 'ester_deca' as const },
  { value: 'testosterone_undecanoate', labelKey: 'ester_tu' as const },
];

const SEV_OPTIONS = [
  { value: 'mild', labelKey: 'sev_mild' as const },
  { value: 'moderate', labelKey: 'sev_mod' as const },
  { value: 'severe', labelKey: 'sev_severe' as const },
];

interface DraftInputs {
  sarm_compound: string;
  sarm_use_weeks: number;
  suppression_severity: string;
  prior_aas_use: boolean;
  target_aas_ester: string;
  has_current_bloodwork: boolean;
}

export default function Tool101SarmToAasTransition() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [inputs, setInputs] = useState<DraftInputs>({
    sarm_compound: "ostarine_mk2866",
    sarm_use_weeks: 12,
    suppression_severity: "moderate",
    prior_aas_use: false,
    target_aas_ester: "testosterone_enanthate",
    has_current_bloodwork: false,
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === "ar";

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: "metric", savedAt: new Date().toISOString() }),
      AUTO_DRAFT_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const parsed = useMemo(() => SarmToAasTransitionInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<SarmToAasTransitionResult | null>(
    () => (parsed.success ? calculateSarmToAasTransition(parsed.data) : null),
    [parsed],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale("ar")} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === "ar" ? "bg-lime-500 text-slate-950" : "bg-zinc-800 text-zinc-300"}`}>عربي</button>
          <button type="button" onClick={() => setLocale("en")} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === "en" ? "bg-lime-500 text-slate-950" : "bg-zinc-800 text-zinc-300"}`}>EN</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.sarm}
          <select value={inputs.sarm_compound} onChange={(e) => setInputs((p) => ({ ...p, sarm_compound: e.target.value }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {SARM_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weeks}
          <input type="number" min={1} max={104} value={inputs.sarm_use_weeks} onChange={(e) => setInputs((p) => ({ ...p, sarm_use_weeks: Number(e.target.value || 1) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.severity}
          <select value={inputs.suppression_severity} onChange={(e) => setInputs((p) => ({ ...p, suppression_severity: e.target.value }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {SEV_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.ester}
          <select value={inputs.target_aas_ester} onChange={(e) => setInputs((p) => ({ ...p, target_aas_ester: e.target.value }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {ESTER_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-[11px] text-zinc-300">
          <label className="flex items-center gap-2"><input type="checkbox" checked={inputs.prior_aas_use} onChange={(e) => setInputs((p) => ({ ...p, prior_aas_use: e.target.checked }))} /> {t.prior_aas}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={inputs.has_current_bloodwork} onChange={(e) => setInputs((p) => ({ ...p, has_current_bloodwork: e.target.checked }))} /> {t.bloodwork}</label>
        </div>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">⚠  {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label={t.washout} value={`${result.sarm_washout_days} d`} />
              <Metric label={t.recovery} value={`${result.expected_hpta_recovery_weeks} w`} />
              <Metric label={t.risk_tier} value={result.transition_risk_tier} />
              <Metric label={t.resid_day30} value={`${result.sarm_residual_percent_day_30}%`} />
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[11px] text-zinc-300">
                <thead><tr className="text-zinc-500"><th className="text-start p-1">{t.day}</th><th className="text-start p-1">{t.phase}</th><th className="text-start p-1">{t.residual}</th></tr></thead>
                <tbody>
                  {result.transition_timeline.map((s) => (
                    <tr key={s.day_offset} className="border-t border-zinc-800">
                      <td className="p-1 font-mono">+{s.day_offset}</td>
                      <td className="p-1">{s.phase}</td>
                      <td className="p-1 font-mono">{s.sarm_residual_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">⚠  {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
          {result.education_flags.length > 0 && (
            <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
              {result.education_flags.map((f) => <li key={f} className="font-mono">{f}</li>)}
            </ul>
          )}
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}

