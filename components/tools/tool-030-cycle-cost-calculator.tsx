'use client';

import React, { useState, useEffect } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { runCycleCostCalculator, type CycleCostCalculatorBuildOptions } from '@/lib/tools/r6/tool-030-cycle-cost-calculator-pipeline';
import { CycleCostInputSchema, CycleCostResultSchema } from '@/lib/tools/schemas/tool-030-cycle-cost-calculator';
import i18nJson from '@/i18n/tool-030-cycle-cost-calculator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { requireTool } from '@/lib/tools/registry';

type CostLineDraft = { id: number; name_en: string; name_ar: string; total_cost_usd: number | null };

export default function Tool030CycleCostCalculator() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);
  const tool = requireTool('tool-030-cycle-cost-calculator');

  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [pctDurationWeeks, setPctDurationWeeks] = useState(4);
  const [compounds, setCompounds] = useState<CostLineDraft[]>([]);
  const [ancillaryCompounds, setAncillaryCompounds] = useState<CostLineDraft[]>([]);
  const [result, setResult] = useState<any>(null);
  const [validationError, setValidationError] = useState(false);

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: CycleCostCalculatorBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem: 'metric',
    snapshotType: 'draft',
  };

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

    setPipelineStatus('calculating');
    const pipeline = runCycleCostCalculator(validation.data, options);
    if (!pipeline.ok) {
      setResult(null);
      return;
    }
    const r = pipeline.output.result;
    setResult(r);
    setPipelineResult(pipeline.output);
    setPipelineError(null);
    setPipelineStatus('done');
    debouncedSave({ ...savedState, cycle_cost_result: r });
  };

  const displayResult = pipelineStatus === 'done' && pipelineResult ? pipelineResult.result : result;

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        {/* R6 Pipeline Status */}
        {pipelineStatus === 'calculating' && (
          <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
            <p className="font-semibold">جاري حساب التكلفة عبر R6 Pipeline…</p>
          </div>
        )}
        {pipelineStatus === 'done' && pipelineResult && (
          <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
            <p className="font-semibold text-green-100">✓ تم الحساب عبر R6 Pipeline</p>
            <p className="mt-1 text-sm text-green-200">الإجمالي: ${pipelineResult.result.grand_total_usd}</p>
            <p className="mt-1 text-sm text-green-200">التكلفة الأسبوعية: ${pipelineResult.result.cost_per_week_usd}/أسبوع</p>
            <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
          </div>
        )}
        {pipelineStatus === 'error' && pipelineError && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 text-red-100">
            <p className="font-semibold">خطأ في الحساب</p>
            <p className="mt-1 text-sm">{pipelineError}</p>
          </div>
        )}

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

        {displayResult && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.grand_total_usd}: ${displayResult.grand_total_usd}</p>
          <p className="text-zinc-500">{i18nData.cost_per_week_usd}: ${displayResult.cost_per_week_usd}/week</p>
          <p className="text-zinc-500">{i18nData.most_expensive_compound}: {displayResult.most_expensive_compound}</p>
          <p className="mt-3 text-xs text-zinc-500">{i18nData.pct_cost_estimate_notice}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {displayResult.cost_breakdown.compounds.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {displayResult.cost_breakdown.ancillaries.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {displayResult.cost_breakdown.pct.map((c: any, i: any) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}
