'use client';

import { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateBmrTdeeV6 } from '@/lib/tools/engines/bmr-tdee.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const activityOptions = [
  { value: 1.2, en: 'Sedentary', ar: 'قليل الحركة' },
  { value: 1.375, en: 'Light', ar: 'نشاط خفيف' },
  { value: 1.55, en: 'Moderate', ar: 'نشاط متوسط' },
  { value: 1.725, en: 'Active', ar: 'نشاط مرتفع' },
  { value: 1.9, en: 'Very active', ar: 'نشاط مرتفع جداً' },
];

export default function BmrTdeePilotTool() {
  const { locale, unitSystem: unit, isRtl } = useToolDisplayPreferences();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [result, setResult] = useState<ReturnType<typeof calculateBmrTdeeV6> | null>(null);
  const [error, setError] = useState('');
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'حاسبة معدل الأيض والاحتياج اليومي', description: 'تقدير BMR وTDEE بمعادلة Mifflin–St Jeor.', weight: 'الوزن', height: 'الطول', age: 'العمر', sex: 'الجنس', male: 'ذكر', female: 'أنثى', activity: 'مستوى النشاط', calculate: 'احسب', bmr: 'معدل الأيض الأساسي', tdee: 'الإنفاق اليومي التقديري', formula: 'BMR = 10 × الوزن + 6.25 × الطول − 5 × العمر، مع ثابت الجنس. TDEE = BMR × معامل النشاط.', units: 'النظام', invalid: 'أدخل قيماً موجبة وصحيحة لكل الحقول.' }
    : { title: 'BMR / TDEE Calculator', description: 'Estimate BMR and TDEE with the Mifflin–St Jeor equation.', weight: 'Weight', height: 'Height', age: 'Age', sex: 'Sex', male: 'Male', female: 'Female', activity: 'Activity level', calculate: 'Calculate', bmr: 'Basal metabolic rate', tdee: 'Estimated daily expenditure', formula: 'BMR = 10 × weight + 6.25 × height − 5 × age, with the sex constant. TDEE = BMR × activity factor.', units: 'Units', invalid: 'Enter valid positive values for every field.' };

  const calculate = () => {
    setError('');
    setResult(null);
    const displayWeight = Number(weight);
    const displayHeight = Number(height);
    try {
      const calculated = calculateBmrTdeeV6({
        weightKg: unit === 'imperial' ? displayWeight / 2.2046226218 : displayWeight,
        heightCm: unit === 'imperial' ? displayHeight * 2.54 : displayHeight,
        age: Number(age),
        sex,
        activityLevel,
      });
      setResult(calculated);
    } catch {
      setError(labels.invalid);
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.bmr-tdee"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unit}
      status={error ? 'error' : result ? 'ready' : 'idle'}
      errors={error ? [error] : []}
      inputs={
        <div className="grid gap-4">
          <label>{labels.weight} ({unit === 'metric' ? 'kg' : 'lb'})
            <input data-testid="bmr-weight" type="number" min="0" step="any" value={weight} onChange={(event) => setWeight(event.target.value)} />
          </label>
          <label>{labels.height} ({unit === 'metric' ? 'cm' : 'in'})
            <input data-testid="bmr-height" type="number" min="0" step="any" value={height} onChange={(event) => setHeight(event.target.value)} />
          </label>
          <label>{labels.age}
            <input data-testid="bmr-age" type="number" min="0" step="1" value={age} onChange={(event) => setAge(event.target.value)} />
          </label>
          <label>{labels.sex}
            <select data-testid="bmr-sex" value={sex} onChange={(event) => setSex(event.target.value as 'male' | 'female')}>
              <option value="male">{labels.male}</option><option value="female">{labels.female}</option>
            </select>
          </label>
          <label>{labels.activity}
            <select data-testid="bmr-activity" value={activityLevel} onChange={(event) => setActivityLevel(Number(event.target.value))}>
              {activityOptions.map((option) => <option key={option.value} value={option.value}>{isAr ? option.ar : option.en} ({option.value})</option>)}
            </select>
          </label>
          <button data-testid="bmr-calculate" type="button" onClick={calculate}>{labels.calculate}</button>
        </div>
      }
      results={result ? <div data-testid="bmr-result" aria-live="polite"><p>{labels.bmr}: {result.bmrKcal} kcal/day</p><p>{labels.tdee}: {result.tdeeKcal} kcal/day</p></div> : null}
      explanation={<p>{labels.formula} {isAr ? 'هذه قيمة تقديرية وليست وصفة طبية أو قياساً مباشراً للأيض.' : 'This is an estimate, not medical advice or a direct metabolic measurement.'}</p>}
    />
  );
}
