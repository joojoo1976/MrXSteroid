'use client';
/** Tool #122 - RPE / RIR to 1RM Dynamic Velocity Modeler (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import type { VelocityInput, VelocityResult } from '@/lib/tools/engines/tool-122-rpe-rir-1rm-velocity-modeler';
import { buildVelocityOutput } from '@/lib/tools/adapters/tool-122-rpe-rir-1rm-velocity-modeler';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { VelocityInputSchema } from '@/lib/tools/schemas/tool-122-rpe-rir-1rm-velocity-modeler';
import i18nJson from '@/i18n/tool-122-rpe-rir-1rm-velocity-modeler.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-122-rpe-rir-1rm-velocity-modeler';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

interface DraftVelocityPoint {
  weight_kg: number;
  velocity_m_s: number;
}

interface DraftInputs {
  target_weight_kg: number;
  target_velocity_m_s: number;
  target_rpe: number;
  target_rir: number;
  velocity_profile: DraftVelocityPoint[];
}

const DEFAULT_PROFILE: DraftVelocityPoint[] = [
  { weight_kg: 60, velocity_m_s: 0.8 },
  { weight_kg: 80, velocity_m_s: 0.6 },
  { weight_kg: 100, velocity_m_s: 0.4 },
];
const KG_PER_LB = 1 / 2.20462;

export default function Tool122RPE_RIR_Velocity() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    target_weight_kg: 100,
    target_velocity_m_s: 0.3,
    target_rpe: 8,
    target_rir: 2,
    velocity_profile: [...DEFAULT_PROFILE],
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale, unitSystem]);

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };
  const displayWeight = (kg: number) => Number((unitSystem === 'metric' ? kg : kg / KG_PER_LB).toFixed(1));
  const storeWeight = (value: number) => Number((unitSystem === 'metric' ? value : value * KG_PER_LB).toFixed(3));
  const massUnit = unitSystem === 'metric' ? 'kg' : 'lb';

  const updateProfile = (index: number, field: keyof DraftVelocityPoint, value: unknown) => {
    setInputs((p) => {
      const newProfile = [...p.velocity_profile];
      newProfile[index] = { ...newProfile[index], [field]: value } as DraftVelocityPoint;
      return { ...p, velocity_profile: newProfile };
    });
  };

  const addProfile = () => {
    setInputs((p) => ({ ...p, velocity_profile: [...p.velocity_profile, { weight_kg: 0, velocity_m_s: 0 }] }));
  };

  const removeProfile = (index: number) => {
    if (inputs.velocity_profile.length <= 2) return;
    setInputs((p) => ({ ...p, velocity_profile: p.velocity_profile.filter((_, i) => i !== index) }));
  };

  const parsed = useMemo(() => VelocityInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<VelocityInput, VelocityResult>(validInput);
  const result = output?.result ?? null;

  const resultContent = result ? (
      <div className="space-y-4">
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
        <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Metric label={t.estimated_1rm} value={`${displayWeight(result.estimated_1rm_kg)} ${massUnit}`} />
            <Metric label={t.method} value={t[`method_${result.estimation_method}`]} />
            <Metric label={locale === 'ar' ? 'تصنيف ملاءمة النموذج' : 'Model fit category'} value={t[`conf_${result.confidence}`]} />
          </div>

          {result.velocity_based_1rm !== undefined && (
            <Metric label={t.velocity_1rm} value={`${displayWeight(result.velocity_based_1rm)} ${massUnit}`} />
          )}
          {result.rpe_based_1rm !== undefined && (
            <Metric label={t.rpe_1rm} value={`${displayWeight(result.rpe_based_1rm)} ${massUnit}`} />
          )}
          {result.rir_based_1rm !== undefined && (
            <Metric label={t.rir_1rm} value={`${displayWeight(result.rir_based_1rm)} ${massUnit}`} />
          )}

          <h3 className="text-xs font-black text-zinc-400 mb-2">{t.lvp_equation}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
              <div className="text-zinc-500 font-bold">{t.slope}</div>
              <div className="text-lime-400 font-mono font-black">{result.lvp_equation.slope}</div>
            </div>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
              <div className="text-zinc-500 font-bold">{t.intercept}</div>
              <div className="text-lime-400 font-mono font-black">{result.lvp_equation.intercept}</div>
            </div>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
              <div className="text-zinc-500 font-bold">{t.r_squared}</div>
              <div className="text-lime-400 font-mono font-black">{result.lvp_equation.r_squared}</div>
            </div>
          </div>

          <h3 className="text-xs font-black text-zinc-400 mb-2">{t.mvt}</h3>
          <Metric label={t.mvt_label} value={`${result.mv_threshold_m_s} m/s`} />

          {result.flags.length > 0 && (
            <div className="mt-3 text-[11px] text-amber-300">
              <p className="font-black mb-1">{t.flags_title}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.flags.map((f) => <li key={f}>{t[f] || f}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
          <p className="font-black mb-1">&#9888; {t.scope_title}</p>
          <p>{t.scope_text}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.target_set}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <label className={LBL}>{t.target_weight} ({massUnit})
          <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={displayWeight(inputs.target_weight_kg)} onChange={(e) => updateInput('target_weight_kg', storeWeight(Number(e.target.value || (unitSystem === 'metric' ? 100 : 220.5))))} className={INP} />
        </label>
        <label className={LBL}>{t.target_velocity}
          <input data-r6-slider="true" type="number" min={0.01} max={3} step={0.01} value={inputs.target_velocity_m_s} onChange={(e) => updateInput('target_velocity_m_s', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.target_rpe}
          <input data-r6-slider="true" type="number" min={1} max={10} step={1} value={inputs.target_rpe} onChange={(e) => updateInput('target_rpe', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.target_rir}
          <input data-r6-slider="true" type="number" min={0} max={10} step={1} value={inputs.target_rir} onChange={(e) => updateInput('target_rir', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.velocity_profile}</h2>
      <div className="space-y-2 mb-4">
        {inputs.velocity_profile.map((vp, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className={LBL}>{t.weight} ({massUnit})
              <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={displayWeight(vp.weight_kg)} onChange={(e) => updateProfile(idx, 'weight_kg', storeWeight(Number(e.target.value || (unitSystem === 'metric' ? 60 : 132.3))))} className={INP} />
            </label>
            <label className={LBL}>{t.velocity}
              <input data-r6-slider="true" type="number" min={0.01} max={3} step={0.01} value={vp.velocity_m_s} onChange={(e) => updateProfile(idx, 'velocity_m_s', Number(e.target.value || 0.5))} className={INP} />
            </label>
            {inputs.velocity_profile.length > 2 && (
              <button type="button" onClick={() => removeProfile(idx)} className="self-end text-red-400 hover:text-red-300 text-xs px-2 py-1">{t.remove}</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addProfile} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_point}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildVelocityOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب النتيجة' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ target_weight_kg: 100, target_velocity_m_s: 0.3, target_rpe: 8, target_rir: 2, velocity_profile: [...DEFAULT_PROFILE] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة الضبط' : 'Reset'}</button>
      </div>

      {resultContent}
      {output && <ToolOutputSummary output={output} locale={locale} />}

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
