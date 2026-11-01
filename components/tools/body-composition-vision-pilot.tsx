'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateBodyCompositionVisionV6 } from '@/lib/tools/engines/body-composition-vision.v6';
import type { BodyCompositionVisionV6Input, BodyCompositionVisionV6Result } from '@/lib/tools/engines/body-composition-vision.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

const defaultInput: BodyCompositionVisionV6Input = {
  sex: 'male',
  heightCm: 180,
  neckCm: 38,
  waistCm: 85,
  weightKg: 80,
};

export default function BodyCompositionVisionPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [input, setInput] = useState<BodyCompositionVisionV6Input>(defaultInput);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<BodyCompositionVisionV6Result | null>(null);
  const isAr = locale === 'ar';
  const units = unitSystem === 'metric' ? { weight: 'kg', length: 'cm' } : { weight: 'lb', length: 'in' };
  const labels = isAr
    ? { title: 'تقدير تركيب الجسم', description: 'تقدير يدوي لمحيطات الجسم بطريقة البحرية الأمريكية؛ ليس تحليلاً للصور ولا نصيحة طبية.', sex: 'الجنس', male: 'ذكر', female: 'أنثى', height: 'الطول', neck: 'محيط الرقبة', waist: 'محيط الخصر', hip: 'محيط الورك', weight: 'الوزن', calculate: 'احسب', required: 'يجب أن تكون قياسات الطول والرقبة والخصر والوزن موجبة وصالحة.', hipRequired: 'قياس الورك مطلوب لهذه المعادلة عند اختيار أنثى.', waistGreater: 'يجب أن يكون الخصر أكبر من الرقبة.', bodyFat: 'نسبة الدهون', leanMass: 'الكتلة الخالية من الدهون', fatMass: 'كتلة الدهون', bmi: 'مؤشر كتلة الجسم', disclaimer: 'تقدير إرشادي من قياسات المحيط بطريقة البحرية الأمريكية؛ ليس تصويراً ولا تشخيصاً ولا نصيحة طبية.' }
    : { title: 'Body Composition Estimator', description: 'Manual circumference-based estimate using the U.S. Navy method; not image analysis or medical advice.', sex: 'Sex', male: 'Male', female: 'Female', height: 'Height', neck: 'Neck', waist: 'Waist', hip: 'Hip', weight: 'Weight', calculate: 'Calculate', required: 'Height, neck, waist and weight must be finite positive measurements.', hipRequired: 'Hip measurement is required for this equation when female is selected.', waistGreater: 'Waist must be greater than neck.', bodyFat: 'Body fat', leanMass: 'Lean mass', fatMass: 'Fat mass', bmi: 'BMI', disclaimer: 'Heuristic estimate from circumference measurements (U.S. Navy method). Not imaging, diagnosis, or medical advice.' };

  const displayValue = (field: 'heightCm' | 'neckCm' | 'waistCm' | 'hipCm' | 'weightKg', value?: number) => {
    if (value === undefined) return '';
    if (unitSystem === 'metric') return value;
    const shown = field === 'weightKg' ? value / KG_PER_LB : value / CM_PER_IN;
    return Number.isFinite(shown) ? Number(shown.toFixed(1)) : '';
  };

  const updateField = (field: keyof BodyCompositionVisionV6Input, value: string) => {
    const numeric = value === '' ? undefined : Number(value);
    const canonical = numeric !== undefined && unitSystem === 'imperial'
      ? (field === 'weightKg' ? numeric * KG_PER_LB : numeric * CM_PER_IN)
      : numeric;
    setInput((prev) => ({
      ...prev,
      [field]: field === 'sex' ? value : canonical,
    } as BodyCompositionVisionV6Input));
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    setResult(null);
    if (!Number.isFinite(input.heightCm) || input.heightCm <= 0 ||
        !Number.isFinite(input.neckCm) || input.neckCm <= 0 ||
        !Number.isFinite(input.waistCm) || input.waistCm <= 0 ||
        !Number.isFinite(input.weightKg) || input.weightKg <= 0) {
      setErrors([labels.required]);
      setResult(null);
      setStatus('error');
      return;
    }
    if (input.sex === 'female' && (!input.hipCm || !Number.isFinite(input.hipCm) || input.hipCm <= 0)) {
      setErrors([labels.hipRequired]);
      setResult(null);
      setStatus('error');
      return;
    }
    if (input.waistCm <= input.neckCm) {
      setErrors([labels.waistGreater]);
      setResult(null);
      setStatus('error');
      return;
    }
    try {
      setResult(calculateBodyCompositionVisionV6(input));
      setStatus('ready');
    } catch (error) {
      const message = isAr ? 'تعذر إجراء الحساب؛ تحقق من القياسات المدخلة.' : error instanceof Error ? error.message : 'Calculation failed';
      setErrors([message]);
      setResult(null);
      setStatus('error');
    }
  };

  const resultText = result ? (() => {
    const massFactor = unitSystem === 'metric' ? 1 : 1 / KG_PER_LB;
    const categories = isAr
      ? { essential: 'أساسي', athletic: 'رياضي', fitness: 'لياقة', average: 'متوسط', obese: 'سمنة' }
      : { essential: 'essential', athletic: 'athletic', fitness: 'fitness', average: 'average', obese: 'obese' };
    return `${labels.bodyFat}: ${result.bodyFatPercent}% | ${labels.leanMass}: ${(result.leanMassKg * massFactor).toFixed(1)} ${units.weight} | ${labels.fatMass}: ${(result.fatMassKg * massFactor).toFixed(1)} ${units.weight} | ${labels.bmi}: ${result.bmi} | ${isAr ? 'الفئة' : 'Category'}: ${categories[result.category as keyof typeof categories]} | ${labels.disclaimer}`;
  })() : '';
  const warnings = result?.clamped ? [{ id: 'bf-clamped', level: 'high' as const, message: isAr ? 'تم حصر تقدير الدهون ضمن المجال الحسابي المدعوم من 3% إلى 60%.' : 'Body fat estimate was clamped to the supported 3–60% range.' }] : [];

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.108-ai-body-composition-vision-engine"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unitSystem}
      theme="light"
      status={status}
      errors={errors}
      warnings={warnings}
      inputs={
        <div>
          <label>{labels.sex}
            <select value={input.sex} onChange={(e) => updateField('sex', e.target.value)}>
              <option value="male">{labels.male}</option>
              <option value="female">{labels.female}</option>
            </select>
          </label>
          <label>{labels.height} ({units.length}) <input type="number" value={displayValue('heightCm', input.heightCm)} onChange={(e) => updateField('heightCm', e.target.value)} /></label>
          <label>{labels.neck} ({units.length}) <input type="number" value={displayValue('neckCm', input.neckCm)} onChange={(e) => updateField('neckCm', e.target.value)} /></label>
          <label>{labels.waist} ({units.length}) <input type="number" value={displayValue('waistCm', input.waistCm)} onChange={(e) => updateField('waistCm', e.target.value)} /></label>
          {input.sex === 'female' && (
            <label>{labels.hip} ({units.length}) <input type="number" value={displayValue('hipCm', input.hipCm)} onChange={(e) => updateField('hipCm', e.target.value)} /></label>
          )}
          <label>{labels.weight} ({units.weight}) <input type="number" value={displayValue('weightKg', input.weightKg)} onChange={(e) => updateField('weightKg', e.target.value)} /></label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
        </div>
      }
      results={resultText ? <div data-testid="body-composition-result">{resultText}</div> : null}
      explanation={
        <p>{labels.disclaimer}</p>
      }
    />
  );
}
