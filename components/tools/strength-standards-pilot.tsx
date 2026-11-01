'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateStrengthStandards } from '@/lib/tools/engines/strength-standards.v6';
import type { StrengthStandardsInput } from '@/lib/tools/engines/strength-standards.v6';
import type { StrengthStandardsOutput } from '@/lib/tools/engines/strength-standards.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;

const defaultInput: StrengthStandardsInput = { liftKg: 100, bodyWeightKg: 80, sex: 'male' };

export default function StrengthStandardsPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [input, setInput] = useState<StrengthStandardsInput>(defaultInput);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<StrengthStandardsOutput | null>(null);
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'معايير القوة', description: 'قارن الرفعة بوزن الجسم باستخدام نسبة حسابية عامة.', lift: 'الرفعة', bodyWeight: 'وزن الجسم', sex: 'الجنس', male: 'ذكر', female: 'أنثى', calculate: 'احسب', ratio: 'النسبة', levels: { beginner: 'مبتدئ', novice: 'أساسي', intermediate: 'متوسط', advanced: 'متقدم', elite: 'نخبة' } }
    : { title: 'Strength Standards', description: 'Compare a lift to body weight using a general ratio.', lift: 'Lift', bodyWeight: 'Body weight', sex: 'Sex', male: 'Male', female: 'Female', calculate: 'Calculate', ratio: 'Ratio', levels: { beginner: 'beginner', novice: 'novice', intermediate: 'intermediate', advanced: 'advanced', elite: 'elite' } };
  const unit = unitSystem === 'metric' ? 'kg' : 'lb';

  const updateField = (field: keyof StrengthStandardsInput, value: string) => {
    const numeric = Number(value);
    const canonical = field !== 'sex' && unitSystem === 'imperial' ? numeric * KG_PER_LB : numeric;
    setInput((prev) => ({
      ...prev,
      [field]: field === 'sex' ? value : canonical,
    } as StrengthStandardsInput));
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    setResult(null);
    try {
      setResult(calculateStrengthStandards(input));
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed';
      setErrors([isAr ? 'أدخل أوزاناً موجبة وصالحة.' : message]);
      setResult(null);
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.strength-standards"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unitSystem}
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>{labels.lift} ({unit}) <input type="number" value={unitSystem === 'metric' ? input.liftKg : Number((input.liftKg / KG_PER_LB).toFixed(1))} onChange={(e) => updateField('liftKg', e.target.value)} /></label>
          <label>{labels.bodyWeight} ({unit}) <input type="number" value={unitSystem === 'metric' ? input.bodyWeightKg : Number((input.bodyWeightKg / KG_PER_LB).toFixed(1))} onChange={(e) => updateField('bodyWeightKg', e.target.value)} /></label>
          <label>{labels.sex}
            <select value={input.sex} onChange={(e) => updateField('sex', e.target.value)}>
              <option value="male">{labels.male}</option>
              <option value="female">{labels.female}</option>
            </select>
          </label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
        </div>
      }
      results={result ? <div data-testid="strength-standards-result">{labels.ratio}: {result.ratio} — {labels.levels[result.level]}</div> : null}
      explanation={
        <p>Ratio = lift / body weight. This is a general strength-to-body-weight ratio classification, not a lift-specific standard. Level thresholds: male [0.5,1.0,1.5,2.0], female [0.25,0.5,0.75,1.0] for novice/intermediate/advanced/elite.</p>
      }
    />
  );
}
