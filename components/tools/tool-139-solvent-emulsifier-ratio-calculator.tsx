'use client';

import React, { useState } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { DynamicStateBadge, computeDynamicState } from '@/components/tools/DynamicStateBadge';
import { ResultBoxes, makeResultBoxes } from '@/components/tools/ResultBoxes';
import { GeniusTooltip } from '@/components/tools/GeniusTooltip';
import { calculateSolventRatio } from '@/lib/tools/engines/tool-139-solvent-emulsifier-ratio-calculator';
import { SolventRatioInputSchema } from '@/lib/tools/schemas/tool-139-solvent-emulsifier-ratio-calculator';

export default function Tool139SolventRatio() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [solventAMl, setSolventAMl] = useState('');
  const [solventBMl, setSolventBMl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateSolventRatio> | null>(null);

  const handleCalculate = () => {
    const input = SolventRatioInputSchema.parse({ solventAMl: parseFloat(solventAMl) || 0, solventBMl: parseFloat(solventBMl) || 0 });
    const r = calculateSolventRatio(input);
    setResult(r);
  };

  const dynamicState = computeDynamicState(['solventAMl', 'solventBMl'], { solventAMl, solventBMl });

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{isRtl ? 'حساب نسبة المذيب/المستحلب' : 'Solvent & Emulsifier Ratio Calculator'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{isRtl ? 'حساب نسبة أساسي (BA/BB) — ليس دليلاً لل製剤' : 'Basic ratio (BA/BB) — not a formulation guide'}</p>
      </header>

      <DynamicStateBadge state={dynamicState.state} locale={isRtl ? 'ar' : 'en'} missingFields={dynamicState.missing} />

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'المذيب A (mL)' : 'Solvent A (mL)'}</label>
          <GeniusTooltip label={isRtl ? 'المذيب A (mL)' : 'Solvent A (mL)'} description="Solvent A volume in milliliters. User input." source="static" locale={isRtl ? 'ar' : 'en'}>
            <input type="number" min={0} value={solventAMl} onChange={(e) => setSolventAMl(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
          </GeniusTooltip>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'المذيب B (mL)' : 'Solvent B (mL)'}</label>
          <input type="number" min={0} value={solventBMl} onChange={(e) => setSolventBMl(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
        </div>

        {result && (
          <div className="space-y-2">
            <GeniusTooltip label={isRtl ? 'النسبة A' : 'Ratio A'} description="Ratio A = solvent A / total. From engine." source="engine" locale={isRtl ? 'ar' : 'en'}>
              <div className="font-bold">{isRtl ? 'النسبة A' : 'Ratio A'}: {result.ratioA ?? 'N/A'} ({result.percentageA ?? 'N/A'}%)</div>
            </GeniusTooltip>
            <div className="font-bold">{isRtl ? 'النسبة B' : 'Ratio B'}: {result.ratioB ?? 'N/A'} ({result.percentageB ?? 'N/A'}%)</div>
            <div className="text-sm text-zinc-500">{isRtl ? 'المجموع' : 'Total'}: {result.totalMl} mL</div>
            <p className="text-xs text-zinc-400">{result.scope_notice}</p>
          </div>
        )}

        <GeniusTooltip label={isRtl ? 'حساب' : 'Calculate'} description="Run ratio calculation. From engine." source="engine" locale={isRtl ? 'ar' : 'en'}>
          <button onClick={handleCalculate} className="w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700">
            {isRtl ? 'حساب' : 'Calculate'}
          </button>
        </GeniusTooltip>
      </div>

      {result && (
        <ResultBoxes
          compact={true}
          locale={isRtl ? 'ar' : 'en'}
          boxes={makeResultBoxes({
            medicalAdvice: 'This is not medical advice. Consult a qualified professional.',
            generalAdvice: result.ratioA !== null ? `Ratio A: ${result.ratioA} (${result.percentageA}%) | Ratio B: ${result.ratioB} (${result.percentageB}%)` : 'Enter valid inputs',
            currentFeeling: 'NOT_AVAILABLE',
            predictions: 'NOT_AVAILABLE',
            aiCoach: 'NOT_AVAILABLE',
            top3Reasoning: result.ratioA !== null ? `1. Solvent A: ${result.percentageA}% | 2. Solvent B: ${result.percentageB}% | 3. Total: ${result.totalMl}mL` : 'NOT_AVAILABLE',
            safety: 'No formulation or safety guidance. Educational arithmetic only.',
            whatIf: 'NOT_AVAILABLE',
            explainableAI: `Ratio A = ${result.ratioA ?? 0} | Ratio B = ${result.ratioB ?? 0} | Total = ${result.totalMl}mL`,
            uncertainty: 'NOT_AVAILABLE (no validated formulation model)',
            alternativePaths: 'NOT_AVAILABLE',
            nextStepCrossTool: 'Review → Homebrew Chemistry',
          })}
        />
      )}
    </div>
  );
}