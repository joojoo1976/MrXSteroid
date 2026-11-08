'use client';

import React, { useState } from 'react';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { DynamicStateBadge, computeDynamicState } from '@/components/tools/DynamicStateBadge';
import { ResultBoxes, makeResultBoxes } from '@/components/tools/ResultBoxes';
import { GeniusTooltip } from '@/components/tools/GeniusTooltip';
import { calculatePoseCoach } from '@/lib/tools/engines/tool-132-ai-pose-form-coach';
import { PoseCoachInputSchema } from '@/lib/tools/schemas/tool-132-ai-pose-form-coach';

export default function Tool132PoseCoach() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [exercise, setExercise] = useState('squat');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<ReturnType<typeof calculatePoseCoach> | null>(null);

  const handleCalculate = () => {
    const input = PoseCoachInputSchema.parse({ exercise, checklist: Object.entries(checklist).map(([item, passed]) => ({ item, passed })) });
    const r = calculatePoseCoach(input);
    setResult(r);
  };

  const dynamicState = computeDynamicState(['exercise'], { exercise });

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{isRtl ? 'مدرب وضعية التمرين' : 'AI Pose Form Coach'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{isRtl ? 'فحص شكل التمرين (قائمة تحقق، بدون تحليل فيديو)' : 'Exercise form checklist (no video analysis)'}</p>
      </header>

      <DynamicStateBadge state={dynamicState.state} locale={isRtl ? 'ar' : 'en'} missingFields={dynamicState.missing} />

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'التمرين' : 'Exercise'}</label>
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full rounded border p-2">
            <option value="squat">Squat</option>
            <option value="deadlift">Deadlift</option>
            <option value="bench">Bench Press</option>
            <option value="overhead_press">Overhead Press</option>
            <option value="row">Row</option>
          </select>
        </div>

        {result && (
          <div className="space-y-2">
            <h3 className="font-bold">{isRtl ? 'قائمة التحقق' : 'Checklist'}</h3>
            {result.checklist.map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.passed}
                  onChange={(e) => setChecklist((c) => ({ ...c, [item.item]: e.target.checked }))}
                />
                <span>{item.item}</span>
                <span className="text-xs text-zinc-400">({item.importance})</span>
              </label>
            ))}
            <GeniusTooltip label={isRtl ? 'نتيجة الشكل' : 'Form Score'} description="Form score from checklist (passed/total). NOT_AVAILABLE for video analysis." source="engine" locale={isRtl ? 'ar' : 'en'}>
              <div className="font-bold mt-2">{isRtl ? 'النتيجة' : 'Form Score'}: {result.formScore ?? 'N/A'}%</div>
            </GeniusTooltip>
            <p className="text-sm text-zinc-500">{result.personalizedCue}</p>
            <p className="text-xs text-zinc-400">{result.source}</p>
          </div>
        )}

        <button onClick={handleCalculate} className="w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700">
          {isRtl ? 'حساب' : 'Calculate'}
        </button>
      </div>

      {result && (
        <ResultBoxes
          compact={true}
          locale={isRtl ? 'ar' : 'en'}
          boxes={makeResultBoxes({
            medicalAdvice: 'This is not medical advice. Consult a qualified professional.',
            generalAdvice: `Form score: ${result.formScore ?? 'N/A'}% based on ${result.checklist.length} checklist items.`,
            currentFeeling: 'NOT_AVAILABLE',
            predictions: 'NOT_AVAILABLE',
            aiCoach: 'NOT_AVAILABLE',
            top3Reasoning: result.checklist.filter((c) => !c.passed).slice(0, 3).map((c, i) => `${i + 1}. ${c.item} (${c.importance})`).join(' | ') || 'All items passed',
            safety: 'Form check only. Does not replace professional coaching.',
            whatIf: 'NOT_AVAILABLE',
            explainableAI: `Score = passed/total = ${result.checklist.filter((c) => c.passed).length}/${result.checklist.length}`,
            uncertainty: 'NOT_AVAILABLE (no calibrated model)',
            alternativePaths: 'NOT_AVAILABLE',
            nextStepCrossTool: 'Review form → Exercise Substitution AI',
          })}
        />
      )}
    </div>
  );
}