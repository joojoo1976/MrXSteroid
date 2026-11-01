'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-027-ester-conversion.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { calculateMolarMassRelationshipV7 } from '@/lib/tools/engines/tool-027-ester-conversion';
import {
  MolarMassConversionInputSchema,
  type MolarMassConversionResult,
} from '@/lib/tools/schemas/tool-027-ester-conversion';

interface Draft {
  sourceSubstanceLabel: string;
  sourceMass: string;
  sourceMassUnit: 'mg' | 'g' | 'kg';
  sourceMolarMass: string;
  sourceMolarMassSource: string;
  targetSubstanceLabel: string;
  targetMolarMass: string;
  targetMolarMassSource: string;
  targetMassUnit: 'mg' | 'g' | 'kg';
}

const EMPTY_DRAFT: Draft = {
  sourceSubstanceLabel: '',
  sourceMass: '',
  sourceMassUnit: 'g',
  sourceMolarMass: '',
  sourceMolarMassSource: '',
  targetSubstanceLabel: '',
  targetMolarMass: '',
  targetMolarMassSource: '',
  targetMassUnit: 'g',
};

function numberOrInvalid(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value);
}

export default function Tool027MolarMassRelationshipCalculator() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [result, setResult] = useState<MolarMassConversionResult | null>(null);
  const [validationError, setValidationError] = useState(false);

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setValidationError(false);
  };

  const calculate = () => {
    const parsed = MolarMassConversionInputSchema.safeParse({
      ...draft,
      sourceMass: numberOrInvalid(draft.sourceMass),
      sourceMolarMass: numberOrInvalid(draft.sourceMolarMass),
      targetMolarMass: numberOrInvalid(draft.targetMolarMass),
    });
    if (!parsed.success) {
      setValidationError(true);
      setResult(null);
      return;
    }
    try {
      setResult(calculateMolarMassRelationshipV7(parsed.data));
      setValidationError(false);
    } catch {
      setResult(null);
      setValidationError(true);
    }
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setResult(null);
    setValidationError(false);
  };

  const textField = (key: keyof Draft, label: string, type: 'text' | 'number' = 'text') => (
    <label className="block text-sm font-medium">
      {label}
      <input type={type} step={type === 'number' ? 'any' : undefined} value={draft[key] as string}
        onChange={(event) => updateDraft(key, event.target.value)}
        className="mt-1 w-full rounded border p-2" dir="ltr" />
    </label>
  );

  const unitSelect = (key: 'sourceMassUnit' | 'targetMassUnit', label: string) => (
    <label className="block text-sm font-medium">
      {label}
      <select value={draft[key]} onChange={(event) => updateDraft(key, event.target.value)} className="mt-1 w-full rounded border p-2" dir="ltr">
        <option value="mg">mg</option>
        <option value="g">g</option>
        <option value="kg">kg</option>
      </select>
    </label>
  );

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <p className="mb-6 rounded bg-zinc-100 p-3 text-sm">
        {t.method_note} <span dir="ltr">n = m / M; m₂ = n × M₂</span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded border p-4">
          <h3 className="font-semibold">{t.source_group}</h3>
          {textField('sourceSubstanceLabel', t.source_substance)}
          {textField('sourceMass', t.source_mass, 'number')}
          {unitSelect('sourceMassUnit', t.mass_unit)}
          {textField('sourceMolarMass', t.source_molar_mass, 'number')}
          {textField('sourceMolarMassSource', t.source_molar_mass_source)}
        </div>
        <div className="space-y-4 rounded border p-4">
          <h3 className="font-semibold">{t.target_group}</h3>
          {textField('targetSubstanceLabel', t.target_substance)}
          {textField('targetMolarMass', t.target_molar_mass, 'number')}
          {textField('targetMolarMassSource', t.target_molar_mass_source)}
          {unitSelect('targetMassUnit', t.output_mass_unit)}
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        {t.reference_label}: <a className="underline" href="https://goldbook.iupac.org/terms/view/12214" target="_blank" rel="noreferrer">IUPAC Gold Book — molar mass</a>
      </p>

      {validationError && <p role="alert" className="mt-4 text-sm text-red-700">{t.validation_error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={calculate} className="rounded bg-blue-700 px-4 py-3 font-medium text-white">{t.calculate}</button>
        <button type="button" onClick={reset} className="rounded border px-4 py-3 font-medium">{t.reset}</button>
      </div>

      {result && (
        <section aria-labelledby="tool-027-result-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-027-result-heading" className="font-semibold">{t.result_heading}</h3>
          <p className="mt-1 text-xs text-zinc-500">{result.resultOrigin} · {result.method}</p>
          <p className="mt-3">{t.amount_moles}: <strong dir="ltr">{formatNumber(result.amountInMoles)} mol</strong></p>
          <p className="mt-1">{t.target_mass}: <strong dir="ltr">{formatNumber(result.targetAmount)} {result.targetMassUnit}</strong></p>
          <p className="mt-3 text-sm text-zinc-600">{result.sourceSubstanceLabel}: {formatNumber(result.sourceMolarMass)} g/mol · {result.sourceMolarMassSource}</p>
          <p className="mt-1 text-sm text-zinc-600">{result.targetSubstanceLabel}: {formatNumber(result.targetMolarMass)} g/mol · {result.targetMolarMassSource}</p>
        </section>
      )}
    </section>
  );
}
