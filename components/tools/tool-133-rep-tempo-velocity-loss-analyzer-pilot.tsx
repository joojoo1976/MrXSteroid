'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateVelocityV6 } from '@/lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6';
import type { VelocityInput } from '@/lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6';

const defaultSets = [
  { set_number: 1, reps: 5, weight_kg: 100, avg_velocity_m_s: 0.8, tempo: 2 },
  { set_number: 2, reps: 5, weight_kg: 100, avg_velocity_m_s: 0.64, tempo: 2.1 },
];

export default function VelocityPilotTool() {
  const [text, setText] = useState(JSON.stringify(defaultSets));
  const [status, setStatus] = useState<'idle'|'partial'|'ready'|'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [resultText, setResultText] = useState('');

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    let sets: VelocityInput['sets'];
    try {
      sets = JSON.parse(text);
    } catch {
      setErrors(['Invalid JSON']);
      setResultText('');
      setStatus('error');
      return;
    }
    try {
      const result = calculateVelocityV6({ sets });
      setResultText(`Velocity loss (between sets): ${result.velocityLossPercent}% | Tempo consistency: ${result.tempoConsistency} | Fatigue: ${result.fatigueIndicator} | ${result.recommendations.join('; ')} | ${result.disclaimer}`);
      setStatus('ready');
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Calculation failed']);
      setResultText('');
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.133-rep-tempo-velocity-loss-analyzer"
      title="Rep Tempo & Velocity Loss Analyzer"
      description="Velocity loss between sets and tempo consistency. Not a medical diagnosis."
      locale="en"
      direction="ltr"
      unitSystem="metric"
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>Sets JSON <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} cols={50} /></label>
          <button type="button" onClick={handleCalculate}>Calculate</button>
        </div>
      }
      results={resultText ? <div data-testid="result">{resultText}</div> : null}
      explanation={<p>Velocity loss is calculated between first and last available set velocities, not within-rep velocity. Tempo consistency only when tempo data present.</p>}
    />
  );
}
