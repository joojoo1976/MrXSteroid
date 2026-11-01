import { describe, expect, it } from 'vitest';
import { calculateGenericRatio } from './tool-241-solvent-ratio.v7';
import { convertAnalysisUnit } from './tool-242-unit-conversion.v7';
import { recordOilNote } from './tool-243-carrier-oil.v7';
import { calculateGenericYield } from './tool-244-purity-yield.v7';
import { recordStorageNote } from './tool-245-storage-stability.v7';

describe('SmartTools 241–245 constrained arithmetic and records', () => {
  it('241 calculates a plain numeric ratio and states its formula', () => {
    const result = calculateGenericRatio({ a: 6, b: 3 });
    expect(result.ratio).toBe(2);
    expect(result.formula).toBe('a / b');
    expect(result.limitations.join(' ')).toMatch(/No solvent/);
  });

  it('241 rejects zero or negative denominators and unknown fields', () => {
    expect(() => calculateGenericRatio({ a: 2, b: 0 })).toThrow();
    expect(() => calculateGenericRatio({ a: 2, b: -1 })).toThrow();
    expect(() => calculateGenericRatio({ a: 2, b: 1, solvent: 'x' })).toThrow();
  });

  it('242 converts mass units using its explicit whitelist', () => {
    const result = convertAnalysisUnit({ value: 1000, fromUnit: 'mg', toUnit: 'g' });
    expect(result.value).toBe(1);
    expect(result.dimension).toBe('mass');
  });

  it('242 converts US customary volume and length units', () => {
    expect(convertAnalysisUnit({ value: 1, fromUnit: 'cup', toUnit: 'mL' }).value).toBeCloseTo(236.5882, 4);
    expect(convertAnalysisUnit({ value: 12, fromUnit: 'in', toUnit: 'ft' }).value).toBe(1);
  });

  it('242 converts temperature with offsets in both directions', () => {
    expect(convertAnalysisUnit({ value: 32, fromUnit: 'F', toUnit: 'C' }).value).toBe(0);
    expect(convertAnalysisUnit({ value: 0, fromUnit: 'C', toUnit: 'F' }).value).toBe(32);
    expect(convertAnalysisUnit({ value: -459.67, fromUnit: 'F', toUnit: 'C' }).value).toBe(-273.15);
  });

  it('242 converts pressure units and permits zero readings', () => {
    expect(convertAnalysisUnit({ value: 1, fromUnit: 'bar', toUnit: 'kPa' }).value).toBe(100);
    expect(convertAnalysisUnit({ value: 0, fromUnit: 'Pa', toUnit: 'kPa' }).value).toBe(0);
  });

  it('242 rejects incompatible dimensions, negative physical quantities, and sub-absolute-zero temperatures', () => {
    expect(() => convertAnalysisUnit({ value: 2, fromUnit: 'kg', toUnit: 'L' })).toThrow(/same physical dimension/);
    expect(() => convertAnalysisUnit({ value: -2, fromUnit: 'kg', toUnit: 'g' })).toThrow(/Negative values/);
    expect(() => convertAnalysisUnit({ value: -274, fromUnit: 'C', toUnit: 'F' })).toThrow(/absolute zero/);
  });

  it('242 rejects arbitrary conversion factors and malformed inputs', () => {
    expect(() => convertAnalysisUnit({ value: 2, factor: 3, unit: 'custom' })).toThrow();
    expect(() => convertAnalysisUnit({ value: Number.NaN, fromUnit: 'kg', toUnit: 'g' })).toThrow();
    expect(() => convertAnalysisUnit({ value: 2, fromUnit: 'kg', toUnit: 'g', source: 'extra' })).toThrow();
  });

  it('243 records a bounded user observation without making viscosity claims', () => {
    const result = recordOilNote({ note: '  observation  ' });
    expect(result.status).toBe('RECORDED');
    expect(result.entry.note).toBe('observation');
    expect(result.limitations.join(' ')).toMatch(/viscosity estimate/);
  });

  it('243 rejects empty, oversized, or extra data', () => {
    expect(() => recordOilNote({ note: ' ' })).toThrow();
    expect(() => recordOilNote({ note: 'x'.repeat(401) })).toThrow();
    expect(() => recordOilNote({ note: 'ok', oil: 'castor' })).toThrow();
  });

  it('244 returns the generic ratio and percentage with explicit unit assumption', () => {
    const result = calculateGenericYield({ input: 8, output: 2 });
    expect(result.ratio).toBe(0.25);
    expect(result.ratioPercent).toBe(25);
    expect(result.limitations.join(' ')).toMatch(/matching units assumed/);
  });

  it('244 rejects nonpositive inputs and negative outputs', () => {
    expect(() => calculateGenericYield({ input: 0, output: 2 })).toThrow();
    expect(() => calculateGenericYield({ input: 4, output: -2 })).toThrow();
  });

  it('245 records a user storage observation without evaluating stability', () => {
    const result = recordStorageNote({ note: 'Recorded at 20 C' });
    expect(result.status).toBe('RECORDED');
    expect(result.limitations.join(' ')).toMatch(/no stability/);
  });

  it('245 rejects empty, oversized, or extra data', () => {
    expect(() => recordStorageNote({ note: '' })).toThrow();
    expect(() => recordStorageNote({ note: 'x'.repeat(401) })).toThrow();
    expect(() => recordStorageNote({ note: 'ok', stability: 'stable' })).toThrow();
  });
});
