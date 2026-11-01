'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateNeuromuscularV6 } from '@/lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6';
import type { NeuromuscularInput } from '@/lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6';

const defaultInput: NeuromuscularInput = { body_weight_kg: 80 };

export default function NeuromuscularPilotTool() {
  const [input, setInput] = useState<NeuromuscularInput>(defaultInput);
  const [status, setStatus] = useState<'idle'|'partial'|'ready'|'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [resultText, setResultText] = useState('');

  const updateField = (field: keyof NeuromuscularInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : Number(value),
    }));
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    try {
      const result = calculateNeuromuscularV6(input);
      setResultText(`Explosiveness score: ${result.explosivenessScore}/100 | Strengths: ${result.strengths.join(', ')} | Weaknesses: ${result.weaknesses.join(', ')} | ${result.disclaimer}`);
      setStatus('ready');
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Calculation failed']);
      setResultText('');
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.126-neuromuscular-explosiveness-modeler"
      title="Neuromuscular Performance & Explosiveness Modeler"
      description="Heuristic explosiveness estimate from optional jump/sprint/strength tests. Not a scientifically validated performance standard."
      locale="en"
      direction="ltr"
      unitSystem="metric"
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>Body weight (kg) <input value={input.body_weight_kg ?? ''} onChange={e=>updateField('body_weight_kg', e.target.value)} /></label>
          <label>Vertical jump (cm) <input value={input.vertical_jump_cm ?? ''} onChange={e=>updateField('vertical_jump_cm', e.target.value)} /></label>
          <label>Broad jump (cm) <input value={input.broad_jump_cm ?? ''} onChange={e=>updateField('broad_jump_cm', e.target.value)} /></label>
          <label>10m sprint (s) <input value={input.sprint_10m_s ?? ''} onChange={e=>updateField('sprint_10m_s', e.target.value)} /></label>
          <label>20m sprint (s) <input value={input.sprint_20m_s ?? ''} onChange={e=>updateField('sprint_20m_s', e.target.value)} /></label>
          <label>1RM (kg) <input value={input.one_rm_kg ?? ''} onChange={e=>updateField('one_rm_kg', e.target.value)} /></label>
          <button type="button" onClick={handleCalculate}>Calculate</button>
        </div>
      }
      results={resultText ? <div data-testid="result">{resultText}</div> : null}
      explanation={<p>Score is a heuristic average of provided test ratios; missing optional tests are not treated as zero. Disclaimer applies.</p>}
    />
  );
}
