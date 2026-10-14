// lib/shared/test-utils-part2.ts
/**
 * lib/shared/test-utils-part2.ts
 * Shared Test Utilities - Part 2: DOM and Advanced assertions
 */

import type { EngineOutput } from './adapter-contract';

/**
 * Assert no NaN or Infinity in DOM text content
 */
export function expectNoNaNInDOM(container: HTMLElement): void {
  const text = container.textContent || '';
  if (text.includes('NaN') || text.includes('Infinity')) {
    throw new Error(`DOM contains NaN or Infinity: ${text.slice(0, 200)}`);
  }
}

/**
 * Assert determinism: identical inputs produce byte-identical outputs
 */
export function expectDeterministic<T>(
  fn: (input: unknown) => unknown,
  input: unknown,
  iterations = 2
): void {
  const first = JSON.stringify(fn(input));
  for (let i = 1; i < iterations; i++) {
    const next = JSON.stringify(fn(input));
    if (first !== next) {
      throw new Error(`Non-deterministic output on iteration ${i + 1}`);
    }
  }
}

/**
 * Assert monotonic relationship between input and output
 */
export function expectMonotonic<
  Input extends number,
  Output extends number
>(
  fn: (input: Input) => Output,
  inputs: Input[],
  direction: 'increasing' | 'decreasing'
): void {
  const outputs = inputs.map(fn);
  
  for (let i = 1; i < outputs.length; i++) {
    if (direction === 'increasing') {
      if (outputs[i] <= outputs[i - 1]) {
        throw new Error(
          `Expected increasing: ${inputs[i - 1]} -> ${outputs[i - 1]}, ${inputs[i]} -> ${outputs[i]}`
        );
      }
    } else {
      if (outputs[i] >= outputs[i - 1]) {
        throw new Error(
          `Expected decreasing: ${inputs[i - 1]} -> ${outputs[i - 1]}, ${inputs[i]} -> ${outputs[i]}`
        );
      }
    }
  }
}

/**
 * Assert bounds are respected
 */
export function expectWithinBounds(
  value: number,
  min: number,
  max: number,
  label = 'value'
): void {
  if (value < min || value > max) {
    throw new Error(`${label} = ${value} is outside bounds [${min}, ${max}]`);
  }
}

/**
 * Assert no division by zero in a computation
 * (Static analysis helper - documents that denom is constant)
 */
export function assertNoDivisionByZero(
  denominator: number,
  operation: string
): void {
  if (denominator === 0) {
    throw new Error(`Division by zero in ${operation}`);
  }
}

/**
 * Create test input generator for hostile inputs
 */
export function generateHostileInputs(): Record<string, unknown>[] {
  return [
    { weeksOnCycle: NaN, weeklyDoseMg: Infinity, bodyFatPct: -Infinity },
    { weeksOnCycle: 'invalid', weeklyDoseMg: 'text', bodyFatPct: {} },
    { weeksOnCycle: null, weeklyDoseMg: undefined, bodyFatPct: [] },
    { weeksOnCycle: -1, weeklyDoseMg: -500, bodyFatPct: -10 },
    { weeksOnCycle: 999, weeklyDoseMg: 99999, bodyFatPct: 999 },
    {}, // completely empty
  ];
}

/**
 * Generate all valid combinations for combinatorial testing
 */
export function generateAllCombinations<T extends Record<string, unknown>>(
  fields: Record<string, unknown[]>
): Array<Record<string, unknown>> {
  const keys = Object.keys(fields);
  const values = keys.map(k => fields[k]);
  
  const combinations: Array<Record<string, unknown>> = [];
  const total = values.reduce((a, b) => a * b.length, 1);
  
  for (let i = 0; i < total; i++) {
    const combo: Record<string, unknown> = {};
    let remainder = i;
    for (let j = 0; j < keys.length; j++) {
      const vals = values[j];
      combo[keys[j]] = vals[remainder % vals.length];
      remainder = Math.floor(remainder / vals.length);
    }
    combinations.push(combo);
  }
  
  return combinations;
}