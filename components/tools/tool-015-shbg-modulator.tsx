'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { calculateSHBG } from '@/lib/tools/engines/tool-015-shbg-modulator';
import { SHBGInputSchema, type SHBGInput, type SHBGResult } from '@/lib/tools/schemas/tool-015-shbg-modulator';
import { buildSHBGOutput } from '@/lib/tools/adapters/tool-015-shbg-modulator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import i18nJson from '@/i18n/tool-015-shbg-modulator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import ToolOutputSummary from './ToolOutputSummary';

type Draft = { total_testosterone_ng_dL: string; shbg_nmol_L: string; albumin_g_dL: string };
const blank: Draft = { total_testosterone_ng_dL: '', shbg_nmol_L: '', albumin_g_dL: '' };
const inputClass = 'w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white';

export default function Tool015SHBGModulator() {
  const t = useToolI18n(i18nJson);
  const { isRtl, unitSystem, locale } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(blank);
  const [result, setResult] = useState<SHBGResult | null>(null);
  const [status, setStatus] = useState<'PARTIAL' | 'INVALID' | 'CALCULATED'>('PARTIAL');
  const parsedInput = useMemo(() => SHBGInputSchema.safeParse({
    total_testosterone_ng_dL: Number(draft.total_testosterone_ng_dL),
    shbg_nmol_L: Number(draft.shbg_nmol_L),
    albumin_g_dL: Number(draft.albumin_g_dL),
  }), [draft]);
  const { output, calculate: publishOutput, reset: resetOutput } = useExplicitToolOutput<SHBGInput, SHBGResult>(
    parsedInput.success ? parsedInput.data : null,
  );

  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setStatus('PARTIAL');
    resetOutput();
  };

  const calculate = () => {
    if (Object.values(draft).some((value) => value.trim() === '')) {
      setStatus('PARTIAL');
      setResult(null);
      resetOutput();
      return;
    }
    if (!parsedInput.success) {
      setStatus('INVALID');
      setResult(null);
      resetOutput();
      return;
    }
    try {
      const next = calculateSHBG(parsedInput.data);
      setResult(next);
      setStatus('CALCULATED');
      publishOutput(parsedInput.data, (input, options) => buildSHBGOutput(input, next, options), locale, unitSystem);
    } catch (calculationError) {
      if (calculationError instanceof RangeError) {
        setResult(null);
        setStatus('INVALID');
        resetOutput();
        return;
      }
      throw calculationError;
    }
  };

  const setField = (key: keyof Draft) => (event: ChangeEvent<HTMLInputElement>) => update(key, event.target.value);
  const format = (value: number) => Number(value.toFixed(2));

  return (
    <section className="pct-timing-tool space-y-4 p-6" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="tool-015-title">
      <h1 id="tool-015-title" className="text-2xl font-bold">{t.tool_name}</h1>
      <p className="text-sm text-amber-200">{t.disclaimer}</p>
      <p className="text-xs text-zinc-400">{t.fixed_lab_units}</p>

      <label className="block space-y-1 text-sm">
        <span>{t.total_testosterone}</span>
        <input aria-label={t.total_testosterone} className={inputClass} type="number" min="0" step="any" value={draft.total_testosterone_ng_dL} onChange={setField('total_testosterone_ng_dL')} dir="ltr" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>{t.shbg}</span>
        <input aria-label={t.shbg} className={inputClass} type="number" min="0" step="any" value={draft.shbg_nmol_L} onChange={setField('shbg_nmol_L')} dir="ltr" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>{t.albumin}</span>
        <input aria-label={t.albumin} className={inputClass} type="number" min="0" step="any" value={draft.albumin_g_dL} onChange={setField('albumin_g_dL')} dir="ltr" />
      </label>

      <button type="button" onClick={calculate} className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
        {t.calculate}
      </button>

      {status !== 'CALCULATED' && (
        <p role="status" className={status === 'INVALID' ? 'text-red-400' : 'text-amber-300'}>
          {status === 'INVALID' ? t.invalid_input : t.partial_input}
        </p>
      )}

      {result && (
        <div className="space-y-2 rounded border border-zinc-700 p-4" aria-live="polite">
          <p className="font-semibold">{t.calculated_result}</p>
          <p>{t.free_testosterone}: {format(result.free_testosterone_ng_dL)} ng/dL ({format(result.free_testosterone_nmol_L)} nmol/L)</p>
          <p>{t.free_percentage}: {format(result.free_testosterone_percentage)}%</p>
          <p>{t.bioavailable}: {format(result.bioavailable_testosterone_ng_dL)} ng/dL ({format(result.bioavailable_testosterone_nmol_L)} nmol/L)</p>
          <p className="text-xs text-zinc-400">{t.formula_note}</p>
          <p className="text-xs"><a className="underline" href="https://doi.org/10.1210/jc.84.10.6079" target="_blank" rel="noreferrer">{t.source_reference}</a></p>
          <p className="text-xs"><a className="underline" href="https://doi.org/10.1210/jc.2018-00229" target="_blank" rel="noreferrer">{t.guideline_reference}</a></p>
        </div>
      )}
      {output && <ToolOutputSummary output={output} locale={locale} />}
    </section>
  );
}
