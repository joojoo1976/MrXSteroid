'use client';
/** Tool #106 - Glycogen Supercompensation & Water Retention Modeler (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { calcGlycogenModel, type GlycogenInput, type GlycogenResult } from '@/lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { GlycogenInputSchema } from '@/lib/tools/schemas/tool-106-glycogen-supercompensation-water-modeler';
import i18nJson from '@/i18n/tool-106-glycogen-supercompensation-water-modeler.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-106-glycogen-supercompensation-water-modeler';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const LOAD_OPTIONS = ['low', 'medium', 'high'];
const LOAD_LABEL: Record<string, string> = { low: 'train_low', medium: 'train_medium', high: 'train_high' };

interface DraftInputs {
  body_weight_kg: number;
  lean_mass_kg: number;
  training_load: string;
  target_carbs_g_per_kg: number;
  days: number;
  baseline_glycogen_g: number;
}


export default function Tool106GlycogenModeler() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    body_weight_kg: 82,
    lean_mass_kg: 70,
    training_load: 'medium',
    target_carbs_g_per_kg: 8,
    days: 3,
    baseline_glycogen_g: 120,
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

  const parsed = useMemo(() => GlycogenInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<GlycogenResult | null>(() => (parsed.success ? calcGlycogenModel(parsed.data as GlycogenInput) : null), [parsed]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.body_weight}
          <input type="number" min={35} max={220} step={1} value={inputs.body_weight_kg} onChange={(e) => setInputs((p) => ({ ...p, body_weight_kg: Number(e.target.value || 82) }))} className={INP} />
        </label>
        <label className={LBL}>{t.lean_mass}
          <input type="number" min={18} max={160} step={1} value={inputs.lean_mass_kg} onChange={(e) => setInputs((p) => ({ ...p, lean_mass_kg: Number(e.target.value || 70) }))} className={INP} />
        </label>
        <label className={LBL}>{t.training_load}
          <select value={inputs.training_load} onChange={(e) => setInputs((p) => ({ ...p, training_load: e.target.value }))} className={SEL}>
            {LOAD_OPTIONS.map((l) => (<option key={l} value={l}>{t[LOAD_LABEL[l]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.carbs_per_kg}
          <input type="number" min={4} max={16} step={0.5} value={inputs.target_carbs_g_per_kg} onChange={(e) => setInputs((p) => ({ ...p, target_carbs_g_per_kg: Number(e.target.value || 8) }))} className={INP} />
        </label>
        <label className={LBL}>{t.days}
          <input type="number" min={1} max={7} step={1} value={inputs.days} onChange={(e) => setInputs((p) => ({ ...p, days: Number(e.target.value || 3) }))} className={INP} />
        </label>
        <label className={LBL}>{t.baseline}
          <input type="number" min={0} max={200} step={5} value={inputs.baseline_glycogen_g} onChange={(e) => setInputs((p) => ({ ...p, baseline_glycogen_g: Number(e.target.value || 120) }))} className={INP} />
        </label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.glycogen_total} value={`${result.total_glycogen_g} g`} />
              <Metric label={t.water} value={`${result.water_retention_liters} L`} />
              <Metric label={t.carb_budget_day} value={`${result.carb_budget_per_day_g} g/kg`} />
              <Metric label={t.glycogen_ceiling} value={`${result.muscle_glycogen_g} g`} />
              <Metric label={t.carbs_total} value={`${result.total_carb_g} g`} />
              <Metric label={t.gi_risk} value={result.gi_risk} />
            </div>
            <div className="mt-3 text-[11px] text-zinc-300">
              <p className="font-black text-amber-300 mb-1">{t.gi_notes}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.gi_notes.map((n) => (<li key={n}>{n}</li>))}
              </ul>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}
