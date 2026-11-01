'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateBmi } from '@/lib/tools/engines/bmi.v6';
import type { BmiOutput } from '@/lib/tools/engines/bmi.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export default function BmiPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<BmiOutput | null>(null);
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'حاسبة مؤشر كتلة الجسم', description: 'احسب مؤشر كتلة الجسم من الوزن والطول.', weight: 'الوزن', height: 'الطول', calculate: 'احسب', bmi: 'مؤشر كتلة الجسم', category: 'التصنيف' }
    : { title: 'Body Mass Index Calculator', description: 'Calculate BMI from weight and height.', weight: 'Weight', height: 'Height', calculate: 'Calculate', bmi: 'BMI', category: 'Category' };
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';
  const heightUnit = unitSystem === 'metric' ? 'cm' : 'in';

  const display = (value: number, kind: 'weight' | 'height') => Number((kind === 'weight'
    ? unitSystem === 'metric' ? value : value / KG_PER_LB
    : unitSystem === 'metric' ? value : value / CM_PER_IN).toFixed(1));
  const store = (value: string, kind: 'weight' | 'height') => {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return kind === 'weight' ? (unitSystem === 'metric' ? number : number * KG_PER_LB) : (unitSystem === 'metric' ? number : number * CM_PER_IN);
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    setResult(null);
    try {
      setResult(calculateBmi({ weightKg, heightCm }));
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed';
      setErrors([isAr ? 'أدخل وزناً وطولاً موجبين وصالحين.' : message]);
      setResult(null);
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.bmi"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unitSystem}
      theme="light"
      status={status}
      warnings={[]}
      errors={errors}
      inputs={
        <div>
          <label>{labels.weight} ({weightUnit}) <input type="number" value={display(weightKg, 'weight')} onChange={(e) => setWeightKg(store(e.target.value, 'weight'))} /></label>
          <label>{labels.height} ({heightUnit}) <input type="number" value={display(heightCm, 'height')} onChange={(e) => setHeightCm(store(e.target.value, 'height'))} /></label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
        </div>
      }
      results={result ? <div data-testid="bmi-result">{labels.bmi}: {result.bmi} ({labels.category}: {isAr ? ({ underweight: 'نقص وزن', normal: 'ضمن النطاق الطبيعي', overweight: 'زيادة وزن', obese: 'سمنة' } as const)[result.category] : result.category})</div> : null}
    />
  );
}
