'use client';

import React, { useState, useEffect } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateCycleCost, type CycleCostResult, type CompoundCost } from '@/lib/tools/engines/tool-030-cycle-cost-calculator';
import { CycleCostInputSchema, CycleCostResultSchema } from '@/lib/tools/schemas/tool-030-cycle-cost-calculator';
import i18nJson from '@/i18n/tool-030-cycle-cost-calculator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

type CostLineDraft = Omit<CompoundCost, 'total_cost_usd'> & { total_cost_usd: number | null };

export default function Tool030CycleCostCalculator() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [pctDurationWeeks, setPctDurationWeeks] = useState(4);
  const [compounds, setCompounds] = useState<CostLineDraft[]>([]);
  const [ancillaryCompounds, setAncillaryCompounds] = useState<CostLineDraft[]>([]);
  const [result, setResult] = useState<CycleCostResult | null>(null);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    const savedResult = CycleCostResultSchema.safeParse(savedState?.cycle_cost_result);
    if (savedResult.success) setResult(savedResult.data);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: CostLineDraft = {
      id: Date.now() + compounds.length,
      name_en: '',
      name_ar: '',
      total_cost_usd: null,
    };
    setCompounds(prev => [...prev, newCompound]);
  };

  const addAncillary = () => {
    const newAnc: CostLineDraft = {
      id: Date.now() + ancillaryCompounds.length,
      name_en: '',
      name_ar: '',
      total_cost_usd: null,
    };
    setAncillaryCompounds(prev => [...prev, newAnc]);
  };

  const calculate = () => {
    const input = {
      cycle_weeks: cycleWeeks,
      compounds,
      pct_duration_weeks: pctDurationWeeks,
      ancillary_compounds: ancillaryCompounds,
    };
    const validation = CycleCostInputSchema.safeParse(input);
    if (!validation.success) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    const r = calculateCycleCost(validation.data);
    setResult(r);
    debouncedSave({ ...savedState, cycle_cost_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" htmlFor="tool-030-cycle-duration" dir={i18nData.dir}>{i18nData.cycle_duration_weeks}</label> <input data-r6-slider="true" id="tool-030-cycle-duration" type="number" value={cycleWeeks} onChange={(e) => setCycleWeeks(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" htmlFor="tool-030-pct-duration" dir={i18nData.dir}>{i18nData.pct_duration_weeks}</label> <input data-r6-slider="true" id="tool-030-pct-duration" type="number" value={pctDurationWeeks} onChange={(e) => setPctDurationWeeks(parseInt(e.target.value, 10))} min="1" max="26" className="w-full rounded border p-2" dir="ltr" aria-invalid={validationError} aria-describedby={validationError ? 'tool-030-validation-error' : undefined} /></div>
        {validationError && <p id="tool-030-validation-error" role="alert" className="text-sm text-red-700">{i18nData.invalid_input}</p>}
        <fieldset className="space-y-3">
          <legend className="font-medium">{i18nData.compounds}</legend>
          {compounds.map((compound, index) => <div key={compound.id} className="grid gap-2 sm:grid-cols-3">
            <label className="text-sm">{i18nData.item_name_en}<input className="w-full rounded border p-2" value={compound.name_en} onChange={(event) => setCompounds((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, name_en: event.target.value } : item))} /></label>
            <label className="text-sm">{i18nData.item_name_ar}<input className="w-full rounded border p-2" dir="rtl" value={compound.name_ar} onChange={(event) => setCompounds((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, name_ar: event.target.value } : item))} /></label>
            <label className="text-sm">{i18nData.entered_cost_usd}<input data-r6-slider="true" type="number" min="0" max="10000" step="0.01" className="w-full rounded border p-2" value={compound.total_cost_usd ?? ''} onChange={(event) => setCompounds((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, total_cost_usd: event.target.value === '' ? null : Number(event.target.value) } : item))} /></label>
          </div>)}
          <button type="button" onClick={addCompound} className="w-full rounded bg-green-600 py-2 text-white" disabled={isPending || compounds.length >= 6}>{i18nData.add_compound}</button>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="font-medium">{i18nData.ancillary_items}</legend>
          {ancillaryCompounds.map((item, index) => <div key={item.id} className="grid gap-2 sm:grid-cols-3">
            <label className="text-sm">{i18nData.item_name_en}<input className="w-full rounded border p-2" value={item.name_en} onChange={(event) => setAncillaryCompounds((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, name_en: event.target.value } : current))} /></label>
            <label className="text-sm">{i18nData.item_name_ar}<input className="w-full rounded border p-2" dir="rtl" value={item.name_ar} onChange={(event) => setAncillaryCompounds((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, name_ar: event.target.value } : current))} /></label>
            <label className="text-sm">{i18nData.entered_cost_usd}<input data-r6-slider="true" type="number" min="0" max="10000" step="0.01" className="w-full rounded border p-2" value={item.total_cost_usd ?? ''} onChange={(event) => setAncillaryCompounds((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, total_cost_usd: event.target.value === '' ? null : Number(event.target.value) } : current))} /></label>
          </div>)}
          <button type="button" onClick={addAncillary} className="w-full rounded bg-green-600 py-2 text-white" disabled={isPending || ancillaryCompounds.length >= 10}>{i18nData.add_item}</button>
        </fieldset>
        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || compounds.length === 0}> {isPending ? i18nData.calculating : i18nData.calculate_cost} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nData.saving}</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.grand_total_usd}: ${result.grand_total_usd}</p>
          <p className="text-zinc-500">{i18nData.cost_per_week_usd}: ${result.cost_per_week_usd}/week</p>
          <p className="text-zinc-500">{i18nData.most_expensive_compound}: {result.most_expensive_compound}</p>
          <p className="mt-3 text-xs text-zinc-500">{i18nData.pct_cost_estimate_notice}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.compounds.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.ancillaries.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.pct.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}

