'use client';

import React, { useEffect, useRef, useState } from 'react';
import GeniusToolTemplate from '@/lib/templates/genius-tool-template';
import { calculateRestTimer } from '@/lib/tools/engines/rest-timer.v6';
import type { RestTimerInput } from '@/lib/tools/engines/rest-timer.v6';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const defaultInput: RestTimerInput = { sets: 3, intensity: 'high' };

export default function RestTimerPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [input, setInput] = useState<RestTimerInput>(defaultInput);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [targetSeconds, setTargetSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAr = locale === 'ar';
  const labels = isAr
    ? { title: 'مؤقت الراحة', description: 'احسب فترة الراحة وشغّل العد التنازلي.', sets: 'المجموعات', intensity: 'الشدة', low: 'منخفضة', moderate: 'متوسطة', high: 'مرتفعة', calculate: 'احسب', start: 'ابدأ', pause: 'إيقاف مؤقت', resume: 'استئناف', reset: 'إعادة ضبط', complete: 'اكتمل', rest: 'الراحة', invalid: 'أدخل عدداً صحيحاً موجباً من المجموعات.' }
    : { title: 'Rest Timer', description: 'Calculate a rest interval and run its countdown timer.', sets: 'Sets', intensity: 'Intensity', low: 'Low', moderate: 'Moderate', high: 'High', calculate: 'Calculate', start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', complete: 'complete', rest: 'Rest', invalid: 'Enter a positive whole number of sets.' };

  const updateField = (field: keyof RestTimerInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: field === 'intensity' ? value : Number(value),
    } as RestTimerInput));
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleCalculate = () => {
    setStatus('partial');
    setErrors([]);
    setCompleted(false);
    setRunning(false);
    clearTimer();
    try {
      const result = calculateRestTimer(input);
      setTargetSeconds(result.restSeconds);
      setRemainingSeconds(result.restSeconds);
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed';
      setErrors([isAr ? labels.invalid : message]);
      setTargetSeconds(0);
      setRemainingSeconds(0);
      setStatus('error');
    }
  };

  const start = () => {
    if (targetSeconds <= 0 || remainingSeconds <= 0) return;
    setCompleted(false);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setRemainingSeconds(targetSeconds);
  };

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setRunning(false);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [running]);

  useEffect(() => () => clearTimer(), []);

  const resultText = targetSeconds > 0
    ? `${labels.rest}: ${remainingSeconds}s / ${targetSeconds}s${completed ? ` — ${labels.complete}` : ''}`
    : '';

  return (
    <GeniusToolTemplate
      toolId="mrx.tool.rest-timer"
      title={labels.title}
      description={labels.description}
      locale={locale}
      direction={isRtl ? 'rtl' : 'ltr'}
      unitSystem={unitSystem}
      theme="light"
      status={status}
      errors={errors}
      inputs={
        <div>
          <label>{labels.sets} <input type="number" value={input.sets} onChange={(e) => updateField('sets', e.target.value)} /></label>
          <label>{labels.intensity}
            <select value={input.intensity} onChange={(e) => updateField('intensity', e.target.value)}>
              <option value="low">{labels.low}</option>
              <option value="moderate">{labels.moderate}</option>
              <option value="high">{labels.high}</option>
            </select>
          </label>
          <button type="button" onClick={handleCalculate}>{labels.calculate}</button>
          <button type="button" onClick={start} disabled={targetSeconds <= 0 || remainingSeconds <= 0 || running}>{labels.start}</button>
          <button type="button" onClick={pause} disabled={!running}>{labels.pause}</button>
          <button type="button" onClick={() => setRunning(true)} disabled={running || remainingSeconds <= 0}>{labels.resume}</button>
          <button type="button" onClick={reset} disabled={targetSeconds <= 0}>{labels.reset}</button>
        </div>
      }
      results={resultText ? <div data-testid="rest-timer-result">{resultText}</div> : null}
    />
  );
}
