'use client';

import React, { useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateTrainingLoadAcwrV6 } from '@/lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6';
import type { AcwrInput } from '@/lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6';

const defaultSessions = Array.from({ length: 28 }, (_, i) => ({
  date: new Date(Date.now() - (27 - i) * 86400000).toISOString().slice(0, 10),
  load: 50,
}));

export default function TrainingLoadPilotTool() {
  const [text, setText] = useState(JSON.stringify(defaultSessions));
  const [status, setStatus] = useState<'idle'|'partial'|'ready'|'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [resultText, setResultText] = useState('');

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    let sessions: AcwrInput['sessions'];
    try {
      sessions = JSON.parse(text);
    } catch {
      setErrors(['Invalid JSON']);
      setResultText('');
      setStatus('error');
      return;
    }
    try {
      const result = calculateTrainingLoadAcwrV6({ sessions });
      if (!result.sufficientData) {
        setResultText(`Insufficient data | Acute: ${result.acuteLoad} | Chronic: ${result.chronicLoad} | ACWR: not available | ${result.disclaimer}`);
      } else {
        setResultText(`Acute: ${result.acuteLoad} | Chronic: ${result.chronicLoad} | ACWR: ${result.acwr} | Band: ${result.band} | ${result.disclaimer}`);
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
      toolId="mrx.tool.128-training-load-acute-chronic-ratio"
      title="Training Load Balance & Acute-to-Chronic Ratio"
      description="ACWR monitoring from session loads. Not a standalone injury prediction or safety guarantee."
      locale="en"
      direction="ltr"
      unitSystem="metric"
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>Sessions JSON <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} cols={40} /></label>
          <button type="button" onClick={handleCalculate}>Calculate</button>
        </div>
      }
      results={resultText ? <div data-testid="result">{resultText}</div> : null}
      explanation={<p>Acute load is recent 7-day load; chronic load is 28-day average. ACWR is a monitoring indicator, not an injury predictor.</p>}
    />
  );
}
