'use client';

import React, { useState } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { DynamicStateBadge, computeDynamicState } from '@/components/tools/DynamicStateBadge';
import { ResultBoxes, makeResultBoxes } from '@/components/tools/ResultBoxes';
import { GeniusTooltip } from '@/components/tools/GeniusTooltip';
import { calculateDensity } from '@/lib/tools/engines/tool-138-raw-powder-density-oil-formulation-engine';
import { DensityInputSchema } from '@/lib/tools/schemas/tool-138-raw-powder-density-oil-formulation-engine';

export default function Tool138Density() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [massG, setMassG] = useState('');
  const [volumeMl, setVolumeMl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateDensity> | null>(null);

  const handleCalculate = () => {
    const input = DensityInputSchema.parse({ massG: parseFloat(massG) || 0, volumeMl: parseFloat(volumeMl) || 0 });
    const r = calculateDensity(input);
    setResult(r);
  };

  const dynamicState = computeDynamicState(['massG', 'volumeMl'], { massG, volumeMl });

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{isRtl ? 'حساب كثافة المسحوق' : 'Raw Powder Density Calculator'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{isRtl ? 'حساب كثافة أساسي (g/mL) — ليس دليلاً لل製剤' : 'Basic density (g/mL) — not a formulation guide'}</p>
      </header>

      <DynamicStateBadge state={dynamicState.state} locale={isRtl ? 'ar' : 'en'} missingFields={dynamicState.missing} />

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'الكتلة (g)' : 'Mass (g)'}</label>
          <input type="number" min={0} value={massG} onChange={(e) => setMassG(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'الحجم (mL)' : 'Volume (mL)'}</label>
          <input type="number" min={0} value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
        </div>

        {result && (
          <div className="space-y-2">
            <GeniusTooltip label={isRtl ? 'الكثافة' : 'Density'} description="Density = mass g / volume mL. From engine." source="engine" locale={isRtl ? 'ar' : 'en'}>
              <div className="font-bold">{isRtl ? 'الكثافة' : 'Density'}: {result.densityGPerMl ?? 'N/A'} g/mL</div>
            </GeniusTooltip>
            <div className="text-sm text-zinc-500">{isRtl ? 'الكتلة' : 'Mass'}: {result.massG} g | {isRtl ? 'الحجم' : 'Volume'}: {result.volumeMl} mL</div>
            <p className="text-xs text-zinc-400">{result.scope_notice}</p>
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
            generalAdvice: result.densityGPerMl !== null ? `Density: ${result.densityGPerMl} g/mL` : 'Enter valid inputs',
            currentFeeling: 'NOT_AVAILABLE',
            predictions: 'NOT_AVAILABLE',
            aiCoach: 'NOT_AVAILABLE',
            top3Reasoning: result.densityGPerMl !== null ? `1. Mass: ${result.massG}g | 2. Volume: ${result.volumeMl}mL | 3. Density: ${result.densityGPerMl}g/mL` : 'NOT_AVAILABLE',
            safety: 'No formulation or safety guidance. Educational arithmetic only.',
            whatIf: 'NOT_AVAILABLE',
            explainableAI: `Density = ${result.massG}g / ${result.volumeMl}mL = ${result.densityGPerMl}g/mL`,
            uncertainty: 'NOT_AVAILABLE (no validated density model)',
            alternativePaths: 'NOT_AVAILABLE',
            nextStepCrossTool: 'Review → Homebrew Chemistry',
          })}
        />
      )}
    </div>
  );
}