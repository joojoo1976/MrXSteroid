// lib/shared/test-utils.ts
/**
 * lib/shared/test-utils.ts
 * Shared Test Utilities for SmartTools - Core assertions
 * Node environment tests
 */

import type { EngineOutput } from './adapter-contract';

/**
 * Assert that all numeric leaves of an object are finite numbers
 * Recursively checks all nested numeric properties
 */
export function expectAllFinite(obj: unknown, path = 'root'): void {
  if (obj === null || obj === undefined) return;
  
  if (typeof obj === 'number') {
    if (!Number.isFinite(obj)) {
      throw new Error(`Expected finite number at ${path}, got ${obj}`);
    }
    return;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => expectAllFinite(item, `${path}[${index}]`));
    return;
  }
  
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      expectAllFinite(value, `${path}.${key}`);
    }
    return;
  }
}

/**
 * Assert that an engine output object has all finite numeric values
 */
export function expectEngineOutputFinite<Output>(
  output: { 
    result?: Output;
    keyFindings?: Array<{ severity: string }>;
    provenance?: Record<string, unknown>;
    [key: string]: unknown;
  }
): void {
  if (output.result) expectAllFinite(output.result, 'result');
  
  if (output.keyFindings) {
    output.keyFindings.forEach((f, i) => {
      if (typeof f === 'object' && f !== null) {
        for (const [key, value] of Object.entries(f)) {
          if (typeof value === 'number' && !Number.isFinite(value)) {
            throw new Error(`Non-finite in keyFindings[${i}].${key}: ${value}`);
          }
        }
      }
    });
  }
  
  if (output.provenance) {
    for (const [key, value] of Object.entries(output.provenance)) {
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new Error(`Non-finite in provenance.${key}: ${value}`);
      }
    }
  }
}

/**
 * Assert round-trip conversion accuracy
 */
export function expectRoundTripConversion(
  original: number,
  converted: number,
  back: number,
  maxDrift = 0.5
): void {
  const drift = Math.abs(back - original);
  if (drift > maxDrift) {
    throw new Error(`Round-trip drift: ${original} -> ${converted} -> ${back} (drift: ${drift} > ${maxDrift})`);
  }
}

/**
 * Assert bidirectional conversion works for a set of values
 */
export function expectBidirectionalConversions(
  convertAtoB: (a: number) => number,
  convertBtoA: (b: number) => number,
  testValues: number[],
  maxDrift = 0.5
): void {
  for (const value of testValues) {
    const converted = convertAtoB(value);
    const back = convertBtoA(converted);
    const drift = Math.abs(back - value);
    if (drift > 0.5) {
      throw new Error(`Drift at ${value}: ${value} -> ${converted} -> ${back} (drift: ${drift})`);
    }
  }
}