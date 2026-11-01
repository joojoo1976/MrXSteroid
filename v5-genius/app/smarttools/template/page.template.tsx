
import { useState, useEffect } from 'react';
import { usePreferences } from '@/context/PreferencesContext'; // موجود عندك في E:\MrXSteroid-main\context\
import { useTranslation } from '@/i18n'; // موجود عندك
import { SuperIntelligenceOrchestratorV5 } from '@/lib/engines/core/ai-orchestrator.v5';
import { calculateNeuromuscularPerformanceV5 } from '@/lib/engines/tools/126-neuromuscular-performance.v5';
import { DynamicResultsV5 } from '@/components/smarttools/dynamic-results/DynamicResults.v5';
import { NeuromuscularRadar, BodyMap3D, VBTChart } from '@/components/smarttools/visualizations/SuperIntelligenceCharts.v5';

export default function GeniusToolPage() {
  const { language, units } = usePreferences();
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({ jumpHeight: 0, contactTime: 0, flightTime: 0, bodyMass: 0, videoUrl: '', hrvHistory: [] });
  const [result, setResult] = useState<any>(null);
  
  const orchestrator = new SuperIntelligenceOrchestratorV5();
  
  useEffect(() => {
    const run = async () => {
      const res = await orchestrator.process('neuromuscular-performance', inputs, calculateNeuromuscularPerformanceV5, { userId: 'current' });
      setResult(res);
    };
    if (inputs.jumpHeight > 0) run();
  }, [inputs]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('neuromuscular.title')}</h1>
      {/* Inputs */}
      <DynamicResultsV5 result={result} language={language} units={units} />
      {result && (
        <>
          <NeuromuscularRadar data={result.engineResult} />
          {result.visionInsights && <BodyMap3D data={result.visionInsights} />}
          {result.mlInsights && <div>ML: {result.mlInsights.profile} {result.mlInsights.confidence}</div>}
          {result.whatIfSimulator && <input type="range" onChange={(e) => setResult(result.whatIfSimulator({ contactTime: parseFloat(e.target.value) }))} />}
        </>
      )}
    </div>
  );
}
