'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateEsterConversion } from '@/lib/tools/engines/tool-027-ester-conversion';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-027-ester-conversion.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool027EsterConversionCalculator() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [compoundName, setCompoundName] = useState('Testosterone');
  const [esterType, setEsterType] = useState('enanthate' as 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other');
  const [esterMg, setEsterMg] = useState(200);
  const [targetEster, setTargetEster] = useState('cypionate' as 'acetate' | 'phenylpropionate' | 'propionate' | 'decanoate' | 'undecanoate' | 'enanthate' | 'cypionate' | 'heptanoate' | 'other');
  const [showTarget, setShowTarget] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.ester_conversion_result) setResult(savedState.ester_conversion_result);
  }, [savedState]);

  const calculate = () => {
    const input = {
      compound_name: compoundName,
      ester_type: esterType,
      ester_mg: esterMg,
      target_ester: showTarget ? targetEster : undefined,
    };
    const r = calculateEsterConversion(input);
    setResult(r);
    debouncedSave({ ...savedState, ester_conversion_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound:</label> <input type="text" value={compoundName} onChange={(e) => setCompoundName(e.target.value as any)} className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Ester Type:</label> <select value={esterType} onChange={(e) => setEsterType(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="acetate">Acetate</option><option value="phenylpropionate">Phenylpropionate</option><option value="propionate">Propionate</option><option value="decanoate">Decanoate</option><option value="undecanoate">Undecanoate</option><option value="enanthate">Enanthate</option><option value="cypionate">Cypionate</option><option value="heptanoate">Heptanoate</option><option value="other">Other</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Ester Weight (mg):</label> <input type="number" value={esterMg} onChange={(e) => setEsterMg(parseInt(e.target.value as any))} min="1" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Convert to Target Ester:</label> <select value={targetEster} onChange={(e) => setTargetEster(e.target.value as any)} className="w-full rounded border p-2" dir="ltr" disabled={!showTarget}><option value="acetate">Acetate</option><option value="phenylpropionate">Phenylpropionate</option><option value="propionate">Propionate</option><option value="decanoate">Decanoate</option><option value="undecanoate">Undecanoate</option><option value="enanthate">Enanthate</option><option value="cypionate">Cypionate</option><option value="heptanoate">Heptanoate</option><option value="other">Other</option></select></div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Show Target Conversion:</label>
          <select value={showTarget ? 'true' : 'false'} onChange={(e) => setShowTarget(e.target.value as any === 'true')} className="w-full rounded border p-2" dir="ltr"><option value="true">Yes</option><option value="false">No</option></select>
        </div>
        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Convert'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.ester_mg}: {result.ester_mg}mg</p>
          <p className="text-zinc-500">{i18nData.base_hormone_mg}: {result.base_hormone_mg}mg</p>
          {result.conversion_to_target && <p className="text-zinc-500">{i18nData.conversion_to_target}: {result.conversion_to_target}mg</p>}
          <p className="text-zinc-500">{i18nData.potency_factor}: {result.potency_factor}</p>
          <p className="text-zinc-500">{i18nData.molecular_weight_adjustment}: {result.molecular_weight_adjustment}</p>
          {result.notes.length > 0 && <ul className="mt-3 space-y-1 text-sm text-zinc-600" dir="ltr"><li>{result.notes.join('</li><li>')}</li></ul>}
        </div>}
      </div>
    </div>
  );
}
