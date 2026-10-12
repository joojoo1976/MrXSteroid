'use client';
/** Tool #102 - Subcutaneous vs. Intramuscular PK Modeler (dynamic UI).
 * Educational absorption/site-geometry model only - never a dosing protocol. */
import React, { useEffect, useMemo, useState } from 'react';
import { calculateSubqVsIm, type SubqVsImResult, type SiteAnatomy } from '@/lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { SubqVsImInputSchema } from '@/lib/tools/schemas/tool-102-subcutaneous-vs-intramuscular-pk-modeler';
import i18nJson from '@/i18n/tool-102-subcutaneous-vs-intramuscular-pk-modeler.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-102-subcutaneous-vs-intramuscular-pk-modeler';

const SITE_OPTIONS: { value: SiteAnatomy; labelKey: 'site_abd' | 'site_thigh' | 'site_vg' | 'site_delt' }[] = [
  { value: 'abdomen', labelKey: 'site_abd' },
  { value: 'thigh', labelKey: 'site_thigh' },
  { value: 'ventrogluteal', labelKey: 'site_vg' },
  { value: 'deltoid', labelKey: 'site_delt' },
];

interface DraftInputs {
  dose_mg: number;
  concentration_mg_ml: number;
  site_anatomy: string;
  elimination_half_life_days: number;
  injection_interval_days: number;
}

const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

export default function Tool102SubqVsIm() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    dose_mg: 250,
    concentration_mg_ml: 250,
    site_anatomy: 'ventrogluteal',
    elimination_half_life_days: 4.5,
    injection_interval_days: 7,
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

  const parsed = useMemo(() => SubqVsImInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<SubqVsImResult | null>(() => (parsed.success ? calculateSubqVsIm(parsed.data) : null), [parsed]);

  return (
    <div className='mx-auto max-w-5xl px-4 py-6' dir={isRtl ? 'rtl' : 'ltr'}>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h1 className='text-2xl font-black text-zinc-900 dark:text-white'>{t.tool_name}</h1>
        <div className='flex gap-2'>
          <button type='button' onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type='button' onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-4'>
        <label className={LBL}>{t.dose}
          <input type='number' min={1} max={3000} value={inputs.dose_mg} onChange={(e) => setInputs((p) => ({ ...p, dose_mg: Number(e.target.value || 1) }))} className={INP} />
        </label>
        <label className={LBL}>{t.conc}
          <input type='number' min={5} max={300} value={inputs.concentration_mg_ml} onChange={(e) => setInputs((p) => ({ ...p, concentration_mg_ml: Number(e.target.value || 5) }))} className={INP} />
        </label>
        <label className={LBL}>{t.site}
          <select value={inputs.site_anatomy} onChange={(e) => setInputs((p) => ({ ...p, site_anatomy: e.target.value }))} className={SEL}>
            {SITE_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.half_life}
          <input type='number' min={0.5} max={30} step={0.5} value={inputs.elimination_half_life_days} onChange={(e) => setInputs((p) => ({ ...p, elimination_half_life_days: Number(e.target.value || 0.5) }))} className={INP} />
        </label>
        <label className={LBL}>{t.interval}
          <input type='number' min={0.5} max={30} step={0.5} value={inputs.injection_interval_days} onChange={(e) => setInputs((p) => ({ ...p, injection_interval_days: Number(e.target.value || 0.5) }))} className={INP} />
        </label>
      </div>

      {!parsed.success && (<p className='mb-3 text-xs font-bold text-red-400'>{t.invalid}</p>)}

      {result && (
        <div className='space-y-4'>
          <div className='rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5'>
            <h2 className='text-sm font-black text-lime-400 mb-3'>{t.results}</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <Metric label={t.volume_ml} value={`${result.volume_ml} ml`} />
              <Metric label={t.faster_peak} value={result.faster_peak_route} />
              <Metric label={t.higher_peak} value={result.higher_peak_route} />
              <Metric label={t.conc} value={`${result.concentration_mg_ml} mg/ml`} />
            </div>
            <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <RouteCard title={t.subcutaneous} r={result.subcutaneous} labels={{ peak: t.peak_h, at_interval: t.at_interval, accum: t.accum, limit: t.limit }} />
              <RouteCard title={t.intramuscular} r={result.intramuscular} labels={{ peak: t.peak_h, at_interval: t.at_interval, accum: t.accum, limit: t.limit }} />
            </div>
          </div>
          <div className='rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200'>
            <p className='font-black mb-1'>⚠ {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className='mt-4 text-[11px] text-zinc-500'>{t.disclaimer}</p>
    </div>
  );
}

function RouteCard({ title, r, labels }: { title: string; r: import('@/lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler').RouteComparison; labels: { peak: string; at_interval: string; accum: string; limit: string } }) {
  return (
    <div className='rounded-lg bg-zinc-950 border border-zinc-800 p-3'>
      <div className='text-xs font-black text-lime-400 mb-2'>{title}</div>
      <dl className='text-[11px] text-zinc-300 space-y-1 font-mono'>
        <div className='flex justify-between'><dt>{labels.peak}</dt><dd>{r.peak_absorption_hours} h</dd></div>
        <div className='flex justify-between'><dt>{labels.at_interval}</dt><dd>{r.concentration_at_interval}</dd></div>
        <div className='flex justify-between'><dt>{labels.accum}</dt><dd>×{r.steady_state_accumulation_factor}</dd></div>
        <div className='flex justify-between'><dt>{labels.limit}</dt><dd className={r.volume_within_limit ? 'text-lime-400' : 'text-red-400'}>{r.site_volume_limit_ml} ml {r.volume_within_limit ? '✓' : '✗'}</dd></div>
      </dl>
      {r.education_flags.length > 0 && (
        <ul className='mt-2 list-disc list-inside text-[10px] text-amber-300 space-y-0.5'>{r.education_flags.map((f) => <li key={f} className='font-mono'>{f}</li>)}</ul>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg bg-zinc-950 border border-zinc-800 p-2'>
      <div className='text-[9px] text-zinc-500 font-bold uppercase'>{label}</div>
      <div className='text-sm text-lime-400 font-mono font-black'>{value}</div>
    </div>
  );
}

