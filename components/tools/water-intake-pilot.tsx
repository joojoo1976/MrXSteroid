'use client';

import { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateWaterIntakeV6 } from '@/lib/tools/engines/water-intake.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const activities = [1, 1.1, 1.2, 1.3, 1.4];

export default function WaterIntakePilotTool() {
  const { locale, unitSystem: unit, isRtl } = useToolDisplayPreferences();
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(1.2);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'تقدير احتياج الماء اليومي', description: 'تقدير أولي يعتمد على الوزن ومعامل نشاط مبسط.', weight: 'الوزن', activity: 'مستوى النشاط', calculate: 'احسب', result: 'التقدير اليومي', formula: 'المعادلة الأساسية 35 مل لكل كغ، مع زيادة تقديرية حسب النشاط.', invalid: 'أدخل وزناً موجباً وصحيحاً.', disclaimer: 'التقدير لا يراعي الطقس أو الحالة الصحية أو السوائل من الطعام؛ لا تستخدمه بديلاً عن إرشاد طبي.' }
    : { title: 'Daily Water Intake Estimate', description: 'A starting estimate based on body weight and a simple activity factor.', weight: 'Weight', activity: 'Activity level', calculate: 'Calculate', result: 'Estimated daily intake', formula: 'Baseline is 35 mL per kg, with an estimated activity adjustment.', invalid: 'Enter a valid positive body weight.', disclaimer: 'This estimate does not account for climate, health conditions or fluids from food; it is not medical advice.' };

  const calculate = () => {
    setError('');
    setResult(null);
    try {
      const displayWeight = Number(weight);
      const calculated = calculateWaterIntakeV6({
        weightKg: unit === 'imperial' ? displayWeight / 2.2046226218 : displayWeight,
        activityLevel,
      });
      setResult(calculated.dailyWaterLiters);
    } catch {
      setError(labels.invalid);
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.water-intake"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unit}
      status={error ? 'error' : result !== null ? 'ready' : 'idle'}
      errors={error ? [error] : []}
      inputs={
        <div className="grid gap-4">
          <label>{labels.weight} ({unit === 'metric' ? 'kg' : 'lb'})
            <input data-testid="water-weight" type="number" min="0" step="any" value={weight} onChange={(event) => setWeight(event.target.value)} />
          </label>
          <label>{labels.activity}
            <select data-testid="water-activity" value={activityLevel} onChange={(event) => setActivityLevel(Number(event.target.value))}>
              {activities.map((activity, index) => <option key={activity} value={activity}>{isAr ? ['أساسي', 'خفيف', 'متوسط', 'مرتفع', 'مرتفع جداً'][index] : ['Baseline', 'Light', 'Moderate', 'Active', 'Very active'][index]} ({activity})</option>)}
            </select>
          </label>
          <button data-testid="water-calculate" type="button" onClick={calculate}>{labels.calculate}</button>
        </div>
      }
      results={result !== null ? <p data-testid="water-result" aria-live="polite">{labels.result}: {result} L/day ({Math.round(result * 1000)} mL)</p> : null}
      explanation={<p>{labels.formula} {labels.disclaimer}</p>}
    />
  );
}
