import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-023-trt-optimization.json';

export default function Tool023TrTOptimizationEngine() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [age, setAge] = useState(35);
  const [bodyWeight, setBodyWeight] = useState(85);
  const [currentTotalTest, setCurrentTotalTest] = useState(400);
  const [currentFreeTest, setCurrentFreeTest] = useState(8);
  const [symptoms, setSymptoms] = useState('moderate');
  const [hematocritCurrent, setHematocritCurrent] = useState(48);
  const [e2Current, setE2Current] = useState(35);
  const [trtDuration, setTrtDuration] = useState(12);
  const [administration, setAdministration] = useState('intramuscular');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.trt_result) setResult(savedState.trt_result);
  }, [savedState]);

  const calculate = () => {
    const input = { age, body_weight_kg: bodyWeight, current_total_test_ng_dL: currentTotalTest, current_free_test_pg_mL: currentFreeTest, symptoms, hematocrit_current: hematocritCurrent, e2_current_pg_mL: e2Current, trt_duration_months: trtDuration, administration };
    const r = calculateTrtOptimization(input);
    setResult(r);
    debouncedSave({ ...savedState, trt_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} min="18" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Weight:</label> <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(parseInt(e.target.value))} min="40" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white">Calculate</button>
        {result && <p>Result: {JSON.stringify(result)}</p>}
      </div>
    </div>
  );
}