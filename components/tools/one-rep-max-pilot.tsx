'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { runOrm, type OrmBuildOptions } from '@/lib/tools/r6/one-rep-max-pipeline';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;

export default function OneRepMaxPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [weightKg, setWeightKg] = useState(80);
  const [reps, setReps] = useState(5);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ oneRepMaxKg: number } | null>(null);
  const [provenance, setProvenance] = useState<{ unit: string; confidence: number | null; dataQuality: string } | null>(null);
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'مقدر الوزن الأقصى لتكرار واحد', description: 'تقدير لمرة واحدة باستخدام معادلة إيپلي.', weight: 'الوزن', reps: 'التكرارات', calculate: 'احسب', result: 'الوزن الأقصى لتكرار واحد' }
    : { title: 'One-Rep Max Estimator', description: 'One-repetition maximum estimate using the Epley equation.', weight: 'Weight', reps: 'Reps', calculate: 'Calculate', result: 'Estimated one-rep max' };
  const unit = unitSystem === 'metric' ? 'kg' : 'lb';
  const shownWeight = Number((unitSystem === 'metric' ? weightKg : weightKg / KG_PER_LB).toFixed(1));

  const options: OrmBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale,
    unitSystem,
    snapshotType: 'draft',
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    setResult(null);
    setProvenance(null);
    const pipelineResult = runOrm({ weightKg, reps }, options);
    if (pipelineResult.ok) {
      setResult(pipelineResult.output.result);
      setProvenance(pipelineResult.output.provenance);
      setStatus('ready');
    } else {
      const message = pipelineResult.error instanceof Error ? pipelineResult.error.message : 'Calculation failed';
      setErrors([isAr ? 'أدخل وزناً موجباً وعدداً صحيحاً موجباً من التكرارات.' : message]);
      setResult(null);
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.one-rep-max"
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
          <label>{labels.weight} ({unit}) <input type="number" value={shownWeight} onChange={(e) => { const value = Number(e.target.value); setWeightKg(unitSystem === 'metric' ? value : value * KG_PER_LB); }} /></label>
          <label>{labels.reps} <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} /></label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
        </div>
      }
      results={
        result ? (
          <div data-testid="orm-result">
            {labels.result}:{' '}
            {Number(
              unitSystem === 'metric'
                ? result.oneRepMaxKg
                : result.oneRepMaxKg / KG_PER_LB
            ).toFixed(1)}
            {unit}
            {provenance && (
              <span>
                {isAr ? ' (المصدر: ' : ' (source: '}
                {provenance.unit}
                {isAr ? ', الثقة: ' : ', confidence: '}
                {(provenance.confidence ?? 0).toFixed(2)}
                {isAr ? ')' : ')'}
              </span>
            )}
          </div>
        ) : null
      }
    />
  );
}
