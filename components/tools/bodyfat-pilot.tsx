'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateBodyFatV6, convertBodyFatOutput } from '@/lib/tools/engines/bodyfat.v6';
import type { BodyFatInputV6, BodyFatOutputV6 } from '@/lib/tools/engines/bodyfat.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

const defaultInput: BodyFatInputV6 = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  neckCm: 38,
  waistCm: 85,
  unitSystem: 'metric',
};

export default function BodyFatPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [input, setInput] = useState<BodyFatInputV6>(defaultInput);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<BodyFatOutputV6 | null>(null);
  const [warnings, setWarnings] = useState<{ id: string; level: 'info' | 'low' | 'high' | 'critical'; message: string }[]>([]);
  const isAr = locale === 'ar';
  const units = unitSystem === 'metric'
    ? { weight: 'kg', length: 'cm' }
    : { weight: 'lb', length: 'in' };
  const labels = isAr
    ? { title: 'محلل نسبة الدهون', description: 'أداة تقدير تركيب الجسم بإصدار v6.', age: 'العمر', weight: 'الوزن', height: 'الطول', neck: 'محيط الرقبة', waist: 'محيط الخصر', calculate: 'احسب', invalidAge: 'يجب إدخال عمر موجب.', result: 'نسبة الدهون', bmr: 'الأيض الأساسي', tdee: 'الإنفاق اليومي التقديري' }
    : { title: 'Body Fat Analyzer', description: 'Body composition estimate using the v6 engine.', age: 'Age', weight: 'Weight', height: 'Height', neck: 'Neck circumference', waist: 'Waist circumference', calculate: 'Calculate', invalidAge: 'Age must be a positive number.', result: 'Body fat', bmr: 'BMR', tdee: 'Estimated TDEE' };

  const displayValue = (field: 'heightCm' | 'weightKg' | 'neckCm' | 'waistCm' | 'hipCm', value?: number) => {
    if (value === undefined || !Number.isFinite(value)) return '';
    if (unitSystem === 'metric') return value;
    return Number((field === 'weightKg' ? value / KG_PER_LB : value / CM_PER_IN).toFixed(1));
  };
  const displayedResult = result ? convertBodyFatOutput(result, unitSystem) : null;

  const updateField = (field: keyof BodyFatInputV6, value: string) => {
    const numeric = value === '' ? Number.NaN : Number(value);
    const canonical = unitSystem === 'imperial' && Number.isFinite(numeric)
      ? (field === 'weightKg' ? numeric * KG_PER_LB : field === 'heightCm' || field === 'neckCm' || field === 'waistCm' || field === 'hipCm' ? numeric * CM_PER_IN : numeric)
      : numeric;
    setInput((prev) => ({
      ...prev,
      [field]: field === 'sex' ? value : canonical,
    } as BodyFatInputV6));
  };

  const handleCalculate = async () => {
    if (!Number.isFinite(input.age) || (input.age as number) <= 0) {
      setStatus('error');
      setErrors([labels.invalidAge]);
      setResult(null);
      setWarnings([]);
      return;
    }
    setStatus('partial');
    setErrors([]);
    setResult(null);
    try {
      const { result: calculated, intelligence } = await calculateBodyFatV6({ ...input, unitSystem }, { preferences: { unitSystem, language: locale } });
      setResult(calculated);
      setWarnings(intelligence.warnings.map((w, index) => ({
        id: `warning-${index}`,
        level: w.level === 'critical' ? 'critical' : w.level === 'warning' ? 'high' : w.level === 'caution' ? 'low' : 'info',
        message: w.message,
      })));
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed';
      setErrors([locale === 'ar' && message.startsWith('Validation failed') ? 'تحقق من القيم المدخلة؛ يجب أن تكون القياسات ضمن النطاقات المقبولة.' : message]);
      setResult(null);
      setWarnings([]);
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.bodyfat"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unitSystem}
      theme="light"
      status={status}
      warnings={warnings}
      errors={errors}
      inputs={
        <div>
          <label>{labels.age}<input type="number" value={input.age ?? ''} onChange={(e) => updateField('age', e.target.value)} /></label>
          <label>{labels.weight} ({units.weight})<input type="number" value={displayValue('weightKg', input.weightKg)} onChange={(e) => updateField('weightKg', e.target.value)} /></label>
          <label>{labels.height} ({units.length})<input type="number" value={displayValue('heightCm', input.heightCm)} onChange={(e) => updateField('heightCm', e.target.value)} /></label>
          <label>{labels.neck} ({units.length})<input type="number" value={displayValue('neckCm', input.neckCm)} onChange={(e) => updateField('neckCm', e.target.value)} /></label>
          <label>{labels.waist} ({units.length})<input type="number" value={displayValue('waistCm', input.waistCm)} onChange={(e) => updateField('waistCm', e.target.value)} /></label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
        </div>
      }
      results={displayedResult ? <div data-testid="bodyfat-result">{labels.result}: {Math.round(displayedResult.bodyFatPercentage * 10) / 10}% | {labels.bmr}: {displayedResult.bmr} | {labels.tdee}: {displayedResult.tdee} | {isAr ? 'الكتلة الخالية من الدهون' : 'Lean mass'}: {displayedResult.leanBodyMassKg} {units.weight} | {isAr ? 'كتلة الدهون' : 'Fat mass'}: {displayedResult.fatMassKg} {units.weight}</div> : null}
    />
  );
}
