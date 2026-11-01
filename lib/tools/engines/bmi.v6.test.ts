import { describe, it, expect } from 'vitest';
import { calculateBmi } from './bmi.v6';

describe('bmi.v6', () => {
  it('18.5 boundary underweight/normal', () => {
    const r = calculateBmi({ weightKg: 18.5 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('normal');
  });
  it('24.9 normal', () => {
    const r = calculateBmi({ weightKg: 24.9 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('normal');
  });
  it('25 overweight', () => {
    const r = calculateBmi({ weightKg: 25 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('overweight');
  });
  it('29.9 overweight', () => {
    const r = calculateBmi({ weightKg: 29.9 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('overweight');
  });
  it('30 obese', () => {
    const r = calculateBmi({ weightKg: 30 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('obese');
  });
  it('underweight', () => {
    const r = calculateBmi({ weightKg: 16 * (1.75 * 1.75), heightCm: 175 });
    expect(r.category).toBe('underweight');
  });
  it('weight=0 throws', () => {
    expect(() => calculateBmi({ weightKg: 0, heightCm: 175 })).toThrow();
  });
  it('height=0 throws', () => {
    expect(() => calculateBmi({ weightKg: 70, heightCm: 0 })).toThrow();
  });
  it('NaN throws', () => {
    expect(() => calculateBmi({ weightKg: NaN, heightCm: 175 })).toThrow();
  });
  it('Infinity throws', () => {
    expect(() => calculateBmi({ weightKg: Infinity, heightCm: 175 })).toThrow();
  });
  it('lb/in conversion same result', () => {
    const kg = 154.3236 * 0.453592;
    const cm = 69 * 2.54;
    const r = calculateBmi({ weightKg: kg, heightCm: cm });
    expect(r.bmi).toBeCloseTo(22.7, 0.1);
  });
  it('changing weight changes bmi', () => {
    const a = calculateBmi({ weightKg: 70, heightCm: 175 }).bmi;
    const b = calculateBmi({ weightKg: 80, heightCm: 175 }).bmi;
    expect(b).toBeGreaterThan(a);
  });
});
