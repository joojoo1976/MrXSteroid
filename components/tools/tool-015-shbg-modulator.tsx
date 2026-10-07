import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-015-shbg-modulator.json';

export default function Tool015SHBGModulator() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [input, setInput] = useState({
    total_testosterone_ng_dL: 600,
    shbg_nmol_L: 40,
    sex: 'male' as 'male' | 'female',
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.shbg_result) setResult(savedState.shbg_result);
  }, [savedState]);

  const calculate = () => {
    const r = calculateSHBG(input as any);
    setResult(r);
    debouncedSave({ ...savedState, shbg_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Total Testosterone (ng/dL):</label> <input type="number" value={input.total_testosterone_ng_dL} onChange={(e) => setInput({...input, total_testosterone_ng_dL: parseFloat(e.target.value)})} min="50" max="2000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">SHBG (nmol/L):</label> <input type="number" value={input.shbg_nmol_L} onChange={(e) => setInput({...input, shbg_nmol_L: parseFloat(e.target.value)})} min="1" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Sex:</label> <select value={input.sex} onChange={(e) => setInput({...input, sex: e.target.value})} className="w-full rounded border p-2" dir="ltr"><option value="male">Male</option><option value="female">Female</option></select></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Calculate Free T'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.shbg}: {result.shbg_nmol_L} nmol/L</p>
          <p className="text-zinc-500">{i18nData.shbg_reference_range}: {result.shbg_reference_range[0]}-{result.shbg_reference_range[1]} nmol/L</p>
          <p className="text-zinc-600">{i18nData.free_testosterone}: {result.free_testosterone_ng_dL} ng/dL</p>
          <p className="text-zinc-500">{i18nData.percentage}: {result.free_testosterone_percentage}%</p>
          <p className="text-zinc-500">{i18nData.bioavailable}: {result.bioavailable_testosterone_ng_dL} ng/dL</p>
          <p className="text-zinc-600">{i18nData.interpretation}: {result.interpretation}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}