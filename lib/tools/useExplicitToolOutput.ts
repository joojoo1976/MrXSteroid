'use client';

import { useState } from 'react';
import type { Locale, ToolOutput, UnitSystem } from './contracts';

export interface ExplicitOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: 'draft';
  calculatedAt: string;
  recordedAt: string;
}

type OutputBuilder<I, O> = (input: I, options: ExplicitOutputOptions) => ToolOutput<O>;

/** Store a result only after a deliberate calculate action and hide it when inputs change. */
export function useExplicitToolOutput<I, O>(currentInput: I | null) {
  const [calculation, setCalculation] = useState<{ signature: string; output: ToolOutput<O> } | null>(null);
  const signature = currentInput === null ? null : JSON.stringify(currentInput);
  const output = calculation && signature === calculation.signature ? calculation.output : null;

  const calculate = (input: I, builder: OutputBuilder<I, O>, locale: Locale, unitSystem: UnitSystem = 'metric') => {
    const calculatedAt = new Date().toISOString();
    setCalculation({
      signature: JSON.stringify(input),
      output: builder(input, { locale, unitSystem, snapshotType: 'draft', calculatedAt, recordedAt: calculatedAt }),
    });
  };

  const reset = () => setCalculation(null);
  return { output, calculate, reset };
}
