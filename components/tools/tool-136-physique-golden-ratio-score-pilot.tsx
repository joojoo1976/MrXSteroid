'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculatePhysiqueV6 } from '@/lib/tools/engines/tool-136-physique-golden-ratio-score.v6';
import type { PhysiqueInput } from '@/lib/tools/engines/tool-136-physique-golden-ratio-score.v6';

const defaultInput: PhysiqueInput = {};

export default function PhysiqueGoldenRatioPilotTool() {
  const [input, setInput] = useState<PhysiqueInput>(defaultInput);
  const [status, setStatus] = useState<'idle'|'partial'|'ready'|'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [resultText, setResultText] = useState('');

  const updateField = (field: keyof PhysiqueInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : Number(value),
    }));
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    try {
      const result = calculatePhysiqueV6(input);
      if (result.status !== 'ok') {
        setResultText(`Insufficient data: no valid ratio could be calculated. Provide waist plus at least one of shoulder, chest, or arm. | ${result.disclaimer}`);
      } else {
        setResultText(`Proportion score: ${result.proportionScore}/100 | Ratios: ${Object.entries(result.ratios).map(([k,v])=>`${k}=${v}`).join(', ') || 'none'} | Strengths: ${result.strengths.join(', ')} | Weaknesses: ${result.weaknesses.join(', ')} | ${result.disclaimer}`);
      }
      setStatus('ready');
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Calculation failed']);
      setResultText('');
      setStatus('error');
    }
  };

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.136-physique-golden-ratio-score"
      title="Physique Proportion & Golden Ratio Score"
      description="Heuristic proportion score from circumference ratios. Not a scientifically validated standard."
      locale="en"
      direction="ltr"
      unitSystem="metric"
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>Shoulder (cm) <input value={input.shoulder_cm ?? ''} onChange={e=>updateField('shoulder_cm', e.target.value)} /></label>
          <label>Chest (cm) <input value={input.chest_cm ?? ''} onChange={e=>updateField('chest_cm', e.target.value)} /></label>
          <label>Waist (cm) <input value={input.waist_cm ?? ''} onChange={e=>updateField('waist_cm', e.target.value)} /></label>
          <label>Hips (cm) <input value={input.hips_cm ?? ''} onChange={e=>updateField('hips_cm', e.target.value)} /></label>
          <label>Arm (cm) <input value={input.arm_cm ?? ''} onChange={e=>updateField('arm_cm', e.target.value)} /></label>
          <label>Thigh (cm) <input value={input.thigh_cm ?? ''} onChange={e=>updateField('thigh_cm', e.target.value)} /></label>
          <label>Calf (cm) <input value={input.calf_cm ?? ''} onChange={e=>updateField('calf_cm', e.target.value)} /></label>
          <button type="button" onClick={handleCalculate}>Calculate</button>
        </div>
      }
      results={resultText ? <div data-testid="result">{resultText}</div> : null}
      explanation={<p>Score is a heuristic average of available ratio comparisons; missing measurements are not treated as zero. Only shoulder, chest, and arm vs waist are used; hips, thigh, calf are not used in score. Disclaimer applies.</p>}
    />
  );
}