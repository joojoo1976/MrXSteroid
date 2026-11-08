'use client';

import React, { useState } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { DynamicStateBadge, computeDynamicState } from '@/components/tools/DynamicStateBadge';
import { ResultBoxes, makeResultBoxes } from '@/components/tools/ResultBoxes';
import { calculateReconstitution } from '@/lib/tools/engines/tool-137-peptide-hormone-reconstitution-calculator';
import { ReconstitutionInputSchema } from '@/lib/tools/schemas/tool-137-peptide-hormone-reconstitution-calculator';

export default function Tool137Reconstitution() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [peptideMg, setPeptideMg] = useState('');
  const [solventMl, setSolventMl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateReconstitution> | null>(null);

  const handleCalculate = () => {
    const input = ReconstitutionInputSchema.parse({ peptideMg: parseFloat(peptideMg) || 0, solventMl: parseFloat(solventMl) || 0 });
    const r = calculateReconstitution(input);
    setResult(r);
  };

  const dynamicState = computeDynamicState(['peptideMg', 'solventMl'], { peptideMg, solventMl });

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{isRtl ? 'حساب إعادة تكوين الببتيد' : 'Peptide Reconstitution Calculator'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{isRtl ? 'حساب تركيز أساسي (mg/mL) — ليس دليلاً للجرعات' : 'Basic concentration (mg/mL) — not a dosing guide'}</p>
      </header>

      <DynamicStateBadge state={dynamicState.state} locale={isRtl ? 'ar' : 'en'} missingFields={dynamicState.missing} />

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'الببتيد (mg)' : 'Peptide (mg)'}</label>
          <input type="number" min={0} value={peptideMg} onChange={(e) => setPeptideMg(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{isRtl ? 'المذيب (mL)' : 'Solvent (mL)'}</label>
          <input type="number" min={0} value={solventMl} onChange={(e) => setSolventMl(e.target.value)} className="w-full rounded border p-2" dir="ltr" />
        </div>

        {result && (
          <div className="space-y-2">
            <div className="font-bold">{isRtl ? 'التركيز' : 'Concentration'}: {result.concentrationMgPerMl ?? 'N/A'} mg/mL</div>
            <div className="text-sm text-zinc-500">{isRtl ? 'الببتيد' : 'Peptide'}: {result.totalPeptideMg} mg | {isRtl ? 'المذيب' : 'Solvent'}: {result.totalSolventMl} mL</div>
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
            medicalAdvice: 'This is not medical advice. Consult a qualified professional before any peptide use.',
            generalAdvice: result.concentrationMgPerMl !== null ? `Concentration: ${result.concentrationMgPerMl} mg/mL` : 'Enter valid inputs',
            currentFeeling: 'NOT_AVAILABLE',
            predictions: 'NOT_AVAILABLE',
            aiCoach: 'NOT_AVAILABLE',
            top3Reasoning: result.concentrationMgPerMl !== null ? `1. Peptide: ${result.totalPeptideMg}mg | 2. Solvent: ${result.totalSolventMl}mL | 3. Concentration: ${result.concentrationMgPerMl}mg/mL` : 'NOT_AVAILABLE',
            safety: 'No dosing or preparation guidance. Educational arithmetic only.',
            whatIf: 'NOT_AVAILABLE',
            explainableAI: `Concentration = ${result.totalPeptideMg}mg / ${result.totalSolventMl}mL = ${result.concentrationMgPerMl}mg/mL`,
            uncertainty: 'NOT_AVAILABLE (no validated PK model)',
            alternativePaths: 'NOT_AVAILABLE',
            nextStepCrossTool: 'Review → Peptide Protocol Planner',
          })}
        />
      )}
    </div>
  );
}