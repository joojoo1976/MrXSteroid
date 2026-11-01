'use client';

import { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateProteinNeedsV6 } from '@/lib/tools/engines/protein-needs.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const activities = [1, 1.1, 1.2, 1.3, 1.4];

export default function ProteinNeedsPilotTool() {
  const { locale, unitSystem: unit, isRtl } = useToolDisplayPreferences();
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<'maintain' | 'bulk' | 'cut'>('maintain');
  const [activityLevel, setActivityLevel] = useState(1.2);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'تقدير احتياج البروتين', description: 'تقدير يومي مبسط حسب الوزن والهدف والنشاط.', weight: 'الوزن', goal: 'الهدف', maintain: 'المحافظة', bulk: 'زيادة الكتلة', cut: 'خفض الوزن', activity: 'مستوى النشاط', calculate: 'احسب', result: 'التقدير اليومي', formula: 'الأساس المستخدم: 1.6 غ/كغ للمحافظة، و2.0 للزيادة، و2.2 للخفض، مع تعديل بسيط للنشاط.', invalid: 'أدخل وزناً موجباً وصحيحاً.', disclaimer: 'تقدير عام؛ قد لا يلائم كل حالة صحية أو احتياج فردي.' }
    : { title: 'Protein Needs Estimate', description: 'A simple daily estimate based on body weight, goal and activity.', weight: 'Weight', goal: 'Goal', maintain: 'Maintain', bulk: 'Build muscle', cut: 'Weight loss', activity: 'Activity level', calculate: 'Calculate', result: 'Estimated daily protein', formula: 'Baseline: 1.6 g/kg for maintenance, 2.0 for muscle gain, and 2.2 for weight loss, with a small activity adjustment.', invalid: 'Enter a valid positive body weight.', disclaimer: 'General estimate; it may not fit every health condition or individual need.' };

  const calculate = () => {
    setError('');
    setResult(null);
    try {
      const displayWeight = Number(weight);
      const calculated = calculateProteinNeedsV6({
        weightKg: unit === 'imperial' ? displayWeight / 2.2046226218 : displayWeight,
        goal,
        activityLevel,
      });
      setResult(calculated.dailyProteinGrams);
    } catch {
      setError(labels.invalid);
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.protein-needs"
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
            <input data-testid="protein-weight" type="number" min="0" step="any" value={weight} onChange={(event) => setWeight(event.target.value)} />
          </label>
          <label>{labels.goal}
            <select data-testid="protein-goal" value={goal} onChange={(event) => setGoal(event.target.value as typeof goal)}>
              <option value="maintain">{labels.maintain}</option><option value="bulk">{labels.bulk}</option><option value="cut">{labels.cut}</option>
            </select>
          </label>
          <label>{labels.activity}
            <select data-testid="protein-activity" value={activityLevel} onChange={(event) => setActivityLevel(Number(event.target.value))}>
              {activities.map((activity, index) => <option key={activity} value={activity}>{isAr ? ['أساسي', 'خفيف', 'متوسط', 'مرتفع', 'مرتفع جداً'][index] : ['Baseline', 'Light', 'Moderate', 'Active', 'Very active'][index]} ({activity})</option>)}
            </select>
          </label>
          <button data-testid="protein-calculate" type="button" onClick={calculate}>{labels.calculate}</button>
        </div>
      }
      results={result !== null ? <p data-testid="protein-result" aria-live="polite">{labels.result}: {result} g/day</p> : null}
      explanation={<p>{labels.formula} {labels.disclaimer}</p>}
    />
  );
}
