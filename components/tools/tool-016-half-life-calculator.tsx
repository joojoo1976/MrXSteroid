'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { calculateHalfLife } from '@/lib/tools/engines/tool-016-half-life-calculator';
import { HalfLifeInputSchema, type HalfLifeInput, type HalfLifeResult } from '@/lib/tools/schemas/tool-016-half-life-calculator';
import { buildHalfLifeOutput } from '@/lib/tools/adapters/tool-016-half-life-calculator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import i18nJson from '@/i18n/tool-016-half-life-calculator.json';
import ToolOutputSummary from './ToolOutputSummary';

type CompoundDraft = { name: string; half_life_days: string; source: string };
const emptyCompound = (): CompoundDraft => ({ name: '', half_life_days: '', source: '' });
const inputClass = 'w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white';

export default function Tool016HalfLifeCalculator() {
  const t = useToolI18n(i18nJson);
  const { isRtl, locale, unitSystem } = useToolDisplayPreferences();
  const [compounds, setCompounds] = useState<CompoundDraft[]>([emptyCompound()]);
  const [remainingPercent, setRemainingPercent] = useState('5');
  const [status, setStatus] = useState<'PARTIAL' | 'INVALID' | 'CALCULATED'>('PARTIAL');
  const [result, setResult] = useState<HalfLifeResult | null>(null);

  const parsedInput = useMemo(() => HalfLifeInputSchema.safeParse({
    compounds: compounds.map((compound) => ({
      ...compound,
      half_life_days: compound.half_life_days.trim() === '' ? Number.NaN : Number(compound.half_life_days),
    })),
    remaining_percent: remainingPercent.trim() === '' ? Number.NaN : Number(remainingPercent),
  }), [compounds, remainingPercent]);
  const { output, calculate: publishOutput, reset: resetOutput } = useExplicitToolOutput<HalfLifeInput, HalfLifeResult>(
    parsedInput.success ? parsedInput.data : null,
  );

  const clearResult = () => {
    setResult(null);
    setStatus('PARTIAL');
    resetOutput();
  };

  const updateCompound = (index: number, key: keyof CompoundDraft, value: string) => {
    setCompounds((current) => current.map((compound, currentIndex) => currentIndex === index
      ? { ...compound, [key]: value }
      : compound));
    clearResult();
  };

  const calculate = () => {
    if (compounds.some((compound) => !compound.name.trim() || !compound.half_life_days.trim() || !compound.source.trim()) || !remainingPercent.trim()) {
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
      const next = calculateHalfLife(parsedInput.data);
      setResult(next);
      setStatus('CALCULATED');
      publishOutput(parsedInput.data, (input, options) => buildHalfLifeOutput(input, next, options), locale, unitSystem);
    } catch (error) {
      if (error instanceof RangeError) {
        setStatus('INVALID');
        setResult(null);
        resetOutput();
        return;
      }
      throw error;
    }
  };

  const addCompound = () => {
    if (compounds.length < 12) {
      setCompounds((current) => [...current, emptyCompound()]);
      clearResult();
    }
  };

  const removeCompound = (index: number) => {
    if (compounds.length > 1) {
      setCompounds((current) => current.filter((_, currentIndex) => currentIndex !== index));
      clearResult();
    }
  };

  const setRemaining = (event: ChangeEvent<HTMLInputElement>) => {
    setRemainingPercent(event.target.value);
    clearResult();
  };

  return (
    <section className="pct-timing-tool space-y-5 p-6" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="tool-016-title">
      <h1 id="tool-016-title" className="text-2xl font-bold">{t.tool_name}</h1>
      <p className="rounded border border-amber-500/40 bg-amber-950/20 p-3 text-sm text-amber-100">{t.scope_notice}</p>
      <p className="text-xs text-zinc-400">{t.elimination_model}</p>

      <div className="space-y-4">
        {compounds.map((compound, index) => (
          <fieldset key={index} className="space-y-3 rounded border border-zinc-700 p-4">
            <legend className="px-2 font-semibold">{t.compound} {index + 1}</legend>
            <label className="block space-y-1 text-sm" htmlFor={`tool-016-name-${index}`}>
              <span>{t.substance_name}</span>
              <input id={`tool-016-name-${index}`} className={inputClass} value={compound.name} maxLength={80} onChange={(event) => updateCompound(index, 'name', event.target.value)} />
            </label>
            <label className="block space-y-1 text-sm" htmlFor={`tool-016-half-life-${index}`}>
              <span>{t.user_half_life}</span>
              <input data-r6-slider="true" id={`tool-016-half-life-${index}`} className={inputClass} type="number" min="0" max="1000000" step="any" value={compound.half_life_days} onChange={(event) => updateCompound(index, 'half_life_days', event.target.value)} dir="ltr" />
            </label>
            <label className="block space-y-1 text-sm" htmlFor={`tool-016-source-${index}`}>
              <span>{t.source}</span>
              <input id={`tool-016-source-${index}`} className={inputClass} value={compound.source} maxLength={500} onChange={(event) => updateCompound(index, 'source', event.target.value)} />
            </label>
            {compounds.length > 1 && <button type="button" className="rounded border border-zinc-600 px-3 py-1 text-sm" onClick={() => removeCompound(index)}>{t.remove_compound}</button>}
          </fieldset>
        ))}
      </div>

      <button type="button" className="rounded border border-zinc-600 px-4 py-2" onClick={addCompound} disabled={compounds.length >= 12}>{t.add_compound}</button>

      <label className="block space-y-1 text-sm" htmlFor="tool-016-remaining">
        <span>{t.remaining_percent}</span>
        <input data-r6-slider="true" id="tool-016-remaining" className={inputClass} type="number" min="0" max="100" step="any" value={remainingPercent} onChange={setRemaining} dir="ltr" />
      </label>
      <button type="button" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={calculate}>{t.calculate}</button>

      {status !== 'CALCULATED' && (
        <p role={status === 'INVALID' ? 'alert' : 'status'} className={status === 'INVALID' ? 'text-red-300' : 'text-amber-200'}>
          {status === 'INVALID' ? t.invalid_input : t.partial_input}
        </p>
      )}

      {result && (
        <div className="space-y-4 rounded border border-zinc-700 p-4" aria-live="polite">
          <p className="font-semibold">{t.calculated}</p>
          {result.compounds.map((compound, index) => (
            <article key={`${index}-${compound.name}`} className="space-y-1 border-b border-zinc-700 pb-3 last:border-0">
              <h2 className="font-semibold">{compound.name}</h2>
              <p>{t.user_half_life}: {compound.half_life_days} {t.days}</p>
              <p>{t.time_to_threshold}: {compound.elapsed_days.toFixed(2)} {t.days}</p>
              <p>{t.threshold_label}: {compound.remaining_percent}%</p>
              <p className="text-xs text-zinc-400">{t.source}: {compound.source}</p>
            </article>
          ))}
          <ul className="list-disc space-y-1 ps-5 text-xs text-zinc-400">
            {result.assumptions.map((assumption) => <li key={assumption}>{t[assumption]}</li>)}
          </ul>
        </div>
      )}
      {output && <ToolOutputSummary output={output} locale={locale} />}
    </section>
  );
}
