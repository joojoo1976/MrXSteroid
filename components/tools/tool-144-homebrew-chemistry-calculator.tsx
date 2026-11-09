'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MassVolumeDensityInputSchema, type MassVolumeDensityInput } from '@/lib/tools/schemas/tool-144-homebrew-chemistry-calculator';
import type { MassVolumeDensityResult } from '@/lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6';
import { MASS_UNITS, VOLUME_UNITS, DENSITY_UNITS, MASS_TO_GRAMS, VOLUME_TO_MILLILITERS, DENSITY_TO_GRAMS_PER_MILLILITER } from '@/lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6';
import { buildMassVolumeDensityOutput } from '@/lib/tools/adapters/tool-144-homebrew-chemistry-calculator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type SolveFor = 'mass' | 'volume' | 'density';
type Draft = Record<string, string>;
type MassUnit = (typeof MASS_UNITS)[number];
type VolumeUnit = (typeof VOLUME_UNITS)[number];
type DensityUnit = (typeof DENSITY_UNITS)[number];
const defaultUnit = (kind: 'mass' | 'volume' | 'density', system: 'metric' | 'imperial'): string => {
  if (system === 'metric') return kind === 'mass' ? 'g' : kind === 'volume' ? 'mL' : 'kg/m3';
  return kind === 'mass' ? 'lb' : kind === 'volume' ? 'US fl oz' : 'lb/ft3';
};
const initialForSystem = (system: 'metric' | 'imperial'): Draft => ({ mass: '', massUnit: defaultUnit('mass', system), volume: '', volumeUnit: defaultUnit('volume', system), density: '', densityUnit: defaultUnit('density', system), densitySource: '', densityTemperatureC: '', resultUnit: defaultUnit('density', system) });
function convertValue(value: string, fromFactor: number, toFactor: number): string {
  if (value.trim() === '') return '';
  const converted = Number(value) * fromFactor / toFactor;
  return Number.isFinite(converted) ? String(Number(converted.toPrecision(10))) : '';
}
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const massNames: Record<string, [string, string]> = { kg: ['كجم', 'kg'], g: ['جم', 'g'], mg: ['ملجم', 'mg'], lb: ['رطل', 'lb'], oz: ['أونصة', 'oz'] };
const volumeNames: Record<string, [string, string]> = { m3: ['م³', 'm³'], L: ['لتر', 'L'], mL: ['مل', 'mL'], cm3: ['سم³', 'cm³'], 'US gal': ['جالون أمريكي', 'US gal'], 'US fl oz': ['أونصة سائلة أمريكية', 'US fl oz'], in3: ['بوصة مكعبة', 'in³'], ft3: ['قدم مكعبة', 'ft³'] };
const densityNames: Record<string, [string, string]> = { 'kg/m3': ['كجم/م³', 'kg/m³'], 'g/L': ['جم/لتر', 'g/L'], 'mg/mL': ['ملجم/مل', 'mg/mL'], 'kg/L': ['كجم/لتر', 'kg/L'], 'g/mL': ['جم/مل', 'g/mL'], 'g/cm3': ['جم/سم³', 'g/cm³'], 'lb/ft3': ['رطل/قدم³', 'lb/ft³'], 'lb/US gal': ['رطل/جالون أمريكي', 'lb/US gal'], 'oz/US fl oz': ['أونصة/أونصة سائلة أمريكية', 'oz/US fl oz'] };

export default function Tool144MassVolumeDensityCalculator() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [solveFor, setSolveFor] = useState<SolveFor>('density');
  const [draft, setDraft] = useState<Draft>(() => initialForSystem(unitSystem));
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const input = useMemo(() => {
    const numberOrUndefined = (value: string) => value.trim() === '' ? undefined : Number(value);
    const common = { solveFor, densityTemperatureC: numberOrUndefined(draft.densityTemperatureC) };
    let candidate: Record<string, unknown>;
    if (solveFor === 'density') candidate = { ...common, mass: numberOrUndefined(draft.mass), massUnit: draft.massUnit, volume: numberOrUndefined(draft.volume), volumeUnit: draft.volumeUnit, resultUnit: draft.resultUnit };
    else if (solveFor === 'mass') candidate = { ...common, density: numberOrUndefined(draft.density), densityUnit: draft.densityUnit, densitySource: draft.densitySource, volume: numberOrUndefined(draft.volume), volumeUnit: draft.volumeUnit, resultUnit: draft.resultUnit };
    else candidate = { ...common, density: numberOrUndefined(draft.density), densityUnit: draft.densityUnit, densitySource: draft.densitySource, mass: numberOrUndefined(draft.mass), massUnit: draft.massUnit, resultUnit: draft.resultUnit };
    const parsed = MassVolumeDensityInputSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  }, [draft, solveFor]);
  const { output, calculate, reset } = useExplicitToolOutput<MassVolumeDensityInput, MassVolumeDensityResult>(input);
  const previousUnitSystem = useRef(unitSystem);
  const resetRef = useRef(reset);
  resetRef.current = reset;
  useEffect(() => {
    if (previousUnitSystem.current === unitSystem) return;
    previousUnitSystem.current = unitSystem;
    const massUnit = defaultUnit('mass', unitSystem) as MassUnit;
    const volumeUnit = defaultUnit('volume', unitSystem) as VolumeUnit;
    const densityUnit = defaultUnit('density', unitSystem) as DensityUnit;
    setDraft((old) => ({
      ...old,
      mass: convertValue(old.mass, MASS_TO_GRAMS[old.massUnit as MassUnit], MASS_TO_GRAMS[massUnit]),
      massUnit,
      volume: convertValue(old.volume, VOLUME_TO_MILLILITERS[old.volumeUnit as VolumeUnit], VOLUME_TO_MILLILITERS[volumeUnit]),
      volumeUnit,
      density: convertValue(old.density, DENSITY_TO_GRAMS_PER_MILLILITER[old.densityUnit as DensityUnit], DENSITY_TO_GRAMS_PER_MILLILITER[densityUnit]),
      densityUnit,
      resultUnit: defaultUnit(solveFor, unitSystem),
    }));
    resetRef.current();
  }, [solveFor, unitSystem]);
  const update = (key: string, value: string) => { reset(); setDraft((old) => ({ ...old, [key]: value })); };
  const changeUnit = (key: 'massUnit' | 'volumeUnit' | 'densityUnit', value: string) => {
    reset();
    setDraft((old) => {
      if (key === 'massUnit') {
        const next = value as MassUnit;
        return { ...old, mass: convertValue(old.mass, MASS_TO_GRAMS[old.massUnit as MassUnit], MASS_TO_GRAMS[next]), massUnit: next };
      }
      if (key === 'volumeUnit') {
        const next = value as VolumeUnit;
        return { ...old, volume: convertValue(old.volume, VOLUME_TO_MILLILITERS[old.volumeUnit as VolumeUnit], VOLUME_TO_MILLILITERS[next]), volumeUnit: next };
      }
      const next = value as DensityUnit;
      return { ...old, density: convertValue(old.density, DENSITY_TO_GRAMS_PER_MILLILITER[old.densityUnit as DensityUnit], DENSITY_TO_GRAMS_PER_MILLILITER[next]), densityUnit: next };
    });
  };
  const options = solveFor === 'mass' ? MASS_UNITS : solveFor === 'volume' ? VOLUME_UNITS : DENSITY_UNITS;
  const labels = solveFor === 'mass' ? massNames : solveFor === 'volume' ? volumeNames : densityNames;
  const resultLabel = solveFor === 'mass' ? tr('وحدة الكتلة الناتجة', 'Mass output unit') : solveFor === 'volume' ? tr('وحدة الحجم الناتج', 'Volume output unit') : tr('وحدة الكثافة الناتجة', 'Density output unit');
  const labelClass = 'block text-sm text-zinc-200';
  const select = (key: string, units: readonly string[], names: Record<string, [string, string]>) => <select className={inputClass} aria-label={`${locale === 'ar' ? 'الوحدة' : 'Unit'} ${key}`} value={draft[key]} onChange={(event) => key === 'massUnit' || key === 'volumeUnit' || key === 'densityUnit' ? changeUnit(key, event.target.value) : update(key, event.target.value)}>{units.map((unit) => <option key={unit} value={unit}>{names[unit][locale === 'ar' ? 0 : 1]}</option>)}</select>;
  const numberField = (key: string, label: string, unitControl?: ReactNode, min = '0') => <label className={labelClass}>{label}<div className="grid grid-cols-[1fr_auto] gap-2"><input className={inputClass} type="number" min={min} step="any" inputMode="decimal" value={draft[key]} onChange={(event) => update(key, event.target.value)} /><div className="min-w-24">{unitControl}</div></div></label>;
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('حاسبة عامة للكتلة والحجم والكثافة', 'General Mass, Volume & Density Calculator')}</h1></header>
    <p className="text-sm text-zinc-300">{tr('حاسبة تعليمية للعلاقة ρ = m / V. أدخل قياسين لإيجاد الثالث. إذا أدخلت كثافة، اذكر مصدرها ودرجة حرارة قياسها.', 'Educational arithmetic for ρ = m / V. Enter two quantities to calculate the third. When entering density, provide its source and measurement temperature.')}</p>
    <label className={labelClass}>{tr('احسب', 'Solve for')}<select className={inputClass} value={solveFor} onChange={(event) => { const next = event.target.value as SolveFor; reset(); setSolveFor(next); setDraft((old) => ({ ...old, resultUnit: defaultUnit(next, unitSystem) })); }}><option value="density">{tr('الكثافة', 'Density')}</option><option value="mass">{tr('الكتلة', 'Mass')}</option><option value="volume">{tr('الحجم', 'Volume')}</option></select></label>
    <section className="grid gap-4 sm:grid-cols-2">
      {solveFor !== 'mass' && numberField('mass', tr('الكتلة', 'Mass'), select('massUnit', MASS_UNITS, massNames))}
      {solveFor !== 'volume' && numberField('volume', tr('الحجم', 'Volume'), select('volumeUnit', VOLUME_UNITS, volumeNames))}
      {solveFor !== 'density' && numberField('density', tr('الكثافة المدخلة', 'Entered density'), select('densityUnit', DENSITY_UNITS, densityNames))}
      {solveFor !== 'density' && <label className={labelClass}>{tr('مصدر الكثافة', 'Density source')}<input className={inputClass} maxLength={240} value={draft.densitySource} placeholder={tr('قياس أو مرجع محدد', 'Measurement or specific reference')} onChange={(event) => update('densitySource', event.target.value)} /></label>}
      <label className={labelClass}>{tr('درجة حرارة القياس', 'Measurement temperature')} ({unitSystem === 'imperial' ? '°F' : '°C'})<input data-r6-slider="true" className={inputClass} type="number" min={unitSystem === 'imperial' ? -459.67 : -273.15} max={unitSystem === 'imperial' ? 1832 : 1000} step="any" value={draft.densityTemperatureC === '' ? '' : Number((unitSystem === 'imperial' ? Number(draft.densityTemperatureC) * 9 / 5 + 32 : Number(draft.densityTemperatureC)).toFixed(4))} onChange={(event) => { const raw = event.target.value; update('densityTemperatureC', raw === '' ? '' : String(unitSystem === 'imperial' ? (Number(raw) - 32) * 5 / 9 : Number(raw))); }} /></label>
      <label className={labelClass}>{resultLabel}{select('resultUnit', options, labels)}</label>
    </section>
    {!input && <p role="alert" className="text-sm text-amber-300">{tr('أكمل الكميتين المطلوبتين والوحدات؛ عند إدخال الكثافة يلزم مصدرها وحرارة قياسها. استخدم قيماً موجبة ضمن الحدود.', 'Complete the two required quantities and units; entered density requires its source and measurement temperature. Values must be positive and within bounds.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildMassVolumeDensityOutput, locale, unitSystem)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('احسب', 'Calculate')}</button><button type="button" onClick={() => { reset(); setDraft(initialForSystem(unitSystem)); setSolveFor('density'); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
