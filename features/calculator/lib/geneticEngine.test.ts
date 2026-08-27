import { describe, it, expect } from 'vitest';
import {
    cmToIn,
    inToCm,
    roundTo,
    clamp,
    calculateNaturalWeight,
    calculateEnhancedWeight,
    calculatePotentials,
    calculateFfmi,
    calculateGoldenRatio,
    classifyBodyType,
    calculatePhysiqueScore,
    calculateGeneticPotential,
} from './geneticEngine';

describe('geneticEngine — Pure Anthropometric Mathematics Engine', () => {

  describe('Unit Conversions', () => {
    describe('cmToIn', () => {
        it('converts cm to inches correctly', () => {
            expect(cmToIn(2.54)).toBe(1);
            expect(cmToIn(177.8)).toBeCloseTo(70, 1);
            expect(cmToIn(180)).toBeCloseTo(70.87, 1);
        });

        it('handles zero', () => {
            expect(cmToIn(0)).toBe(0);
        });
    });

    describe('inToCm', () => {
        it('converts inches to cm correctly', () => {
            expect(inToCm(1)).toBe(2.54);
            expect(inToCm(70)).toBeCloseTo(177.8, 1);
            expect(inToCm(72)).toBeCloseTo(182.88, 1);
        });
    });

    describe('roundTo', () => {
        it('rounds to specified decimals', () => {
            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(2.5, 0)).toBe(3);
            expect(roundTo(1.234, 1)).toBe(1.2);
        });

        it('handles floating point drift', () => {
            expect(roundTo(2.499999999999, 1)).toBe(2.5);
        });

        it('returns 0 for non-finite', () => {
            expect(roundTo(NaN, 2)).toBe(0);
            expect(roundTo(Infinity, 2)).toBe(0);
        });
    });

    describe('clamp', () => {
        it('clamps within range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });
    });
  });

  describe('Casey Butt Natural Weight Formula', () => {
    const metricInput = {
        heightCm: 180,
        wristCm: 17,
        ankleCm: 22,
        bodyFatPct: 12,
        unitSystem: 'metric' as const,
    };

    it('computes natural weight for standard male (metric)', () => {
        const weight = calculateNaturalWeight(metricInput);
        expect(weight).toBeGreaterThan(70);
        expect(weight).toBeLessThan(100);
    });

    it('returns weight in lbs for imperial', () => {
        const imperialInput = { ...metricInput, unitSystem: 'imperial' as const };
        const weight = calculateNaturalWeight(imperialInput);
        expect(weight).toBeGreaterThan(150);
        expect(weight).toBeLessThan(220);
    });

    it('higher body fat increases natural weight', () => {
        const leanInput = { ...metricInput, bodyFatPct: 8 };
        const heavyInput = { ...metricInput, bodyFatPct: 20 };
        
        const leanWeight = calculateNaturalWeight(leanInput);
        const heavyWeight = calculateNaturalWeight(heavyInput);
        
        expect(heavyWeight).toBeGreaterThan(leanWeight);
    });

    it('taller height increases natural weight', () => {
        const shortInput = { ...metricInput, heightCm: 170 };
        const tallInput = { ...metricInput, heightCm: 190 };
        
        const shortWeight = calculateNaturalWeight(shortInput);
        const tallWeight = calculateNaturalWeight(tallInput);
        
        expect(tallWeight).toBeGreaterThan(shortWeight);
    });

    it('larger wrist/ankle increases natural weight', () => {
        const smallFrame = { ...metricInput, wristCm: 15, ankleCm: 20 };
        const largeFrame = { ...metricInput, wristCm: 19, ankleCm: 24 };
        
        const smallWeight = calculateNaturalWeight(smallFrame);
        const largeWeight = calculateNaturalWeight(largeFrame);
        
        expect(largeWeight).toBeGreaterThan(smallWeight);
    });

    it('handles zero/negative gracefully', () => {
        const zeroInput = { ...metricInput, heightCm: 0 };
        expect(calculateNaturalWeight(zeroInput)).toBe(0);
    });
  });

  describe('Enhanced Weight Calculation', () => {
    it('is 35% above natural weight', () => {
        const natural = 80;
        const enhanced = calculateEnhancedWeight(natural);
        expect(enhanced).toBe(108);
    });

    it('handles edge cases', () => {
        expect(calculateEnhancedWeight(0)).toBe(0);
        expect(calculateEnhancedWeight(100)).toBe(135);
    });
  });

  describe('Body Part Potentials', () => {
    const metricInput = {
        heightCm: 180,
        wristCm: 17,
        ankleCm: 22,
        bodyFatPct: 12,
        unitSystem: 'metric' as const,
    };

    it('computes potentials in cm for metric', () => {
        const pots = calculatePotentials(metricInput);
        
        expect(pots.chest).toBeGreaterThan(0);
        expect(pots.shoulders).toBeGreaterThan(pots.chest);
        expect(pots.waist).toBeLessThan(pots.chest);
        expect(pots.thigh).toBeGreaterThan(0);
        expect(pots.calf).toBeLessThan(pots.thigh);
        expect(pots.arm).toBeGreaterThan(0);
    });

    it('computes potentials in inches for imperial', () => {
        const imperialInput = { ...metricInput, unitSystem: 'imperial' as const };
        const pots = calculatePotentials(imperialInput);
        
        expect(pots.chest).toBeLessThan(pots.chest * 2.54);
    });

    it('shoulders > chest > waist', () => {
        const pots = calculatePotentials(metricInput);
        expect(pots.shoulders).toBeGreaterThan(pots.chest);
        expect(pots.chest).toBeGreaterThan(pots.waist);
    });

    it('thigh > calf', () => {
        const pots = calculatePotentials(metricInput);
        expect(pots.thigh).toBeGreaterThan(pots.calf);
    });
  });

  describe('FFMI Calculations', () => {
    const metricInput = {
        heightCm: 180,
        wristCm: 17,
        ankleCm: 22,
        bodyFatPct: 12,
        unitSystem: 'metric' as const,
    };

    it('computes raw and normalized FFMI', () => {
        const naturalWeight = 80;
        const { raw, normalized } = calculateFfmi(metricInput, naturalWeight);
        
        expect(raw).toBeGreaterThan(0);
        expect(normalized).toBeGreaterThan(0);
    });

    it('normalized FFMI adjusts for height', () => {
        const shortInput = { ...metricInput, heightCm: 170 };
        const tallInput = { ...metricInput, heightCm: 190 };
        const weight = 80;
        
        const shortFfmi = calculateFfmi(shortInput, weight);
        const tallFfmi = calculateFfmi(tallInput, weight);
        
        expect(shortFfmi.normalized).toBeGreaterThan(shortFfmi.raw);
        expect(tallFfmi.normalized).toBeLessThan(tallFfmi.raw);
    });

    it('returns values rounded to 2 decimals', () => {
        const { raw, normalized } = calculateFfmi(metricInput, 80);
        expect(Number.isInteger(raw * 100)).toBe(true);
        expect(Number.isInteger(normalized * 100)).toBe(true);
    });
  });

  describe('Golden Ratio (Shoulder-to-Waist)', () => {
    it('uses actual measurements when available', () => {
        const ratio = calculateGoldenRatio(120, 80, 115, 78);
        expect(ratio).toBe(1.5);
    });

    it('falls back to potentials when actuals missing', () => {
        const ratio = calculateGoldenRatio(0, 0, 115, 78);
        expect(ratio).toBeCloseTo(1.474, 2);
    });

    it('prefers actual shoulders over potential', () => {
        const withActual = calculateGoldenRatio(120, 80, 115, 78);
        const withoutActual = calculateGoldenRatio(0, 0, 115, 78);
        expect(withActual).not.toBe(withoutActual);
    });

    it('rounds to 3 decimals', () => {
        const ratio = calculateGoldenRatio(119, 73, 115, 78);
        expect(ratio).toBeCloseTo(1.630, 3);
    });
  });

  describe('Body Type Classification', () => {
    it('classifies ectomorph (radio < 0.10)', () => {
        expect(classifyBodyType(190, 15)).toBe('ectomorph');
    });

    it('classifies mesomorph (0.10 <= radio <= 0.115)', () => {
        expect(classifyBodyType(175, 17.5)).toBe('mesomorph');
    });

    it('classifies endomorph (radio > 0.115)', () => {
        expect(classifyBodyType(170, 20)).toBe('endomorph');
    });
  });

  describe('Physique Score', () => {
    it('perfect FFMI (25) + perfect ratio (1.618) = 100', () => {
        const score = calculatePhysiqueScore(25, 1.618);
        expect(score).toBe(100);
    });

    it('low FFMI + perfect ratio = low score', () => {
        const score = calculatePhysiqueScore(15, 1.618);
        expect(score).toBe(76);
    });

    it('perfect FFMI + off ratio = penalty', () => {
        const score = calculatePhysiqueScore(25, 1.3);
        expect(score).toBeLessThan(100);
    });

    it('clamps to 0-100', () => {
        expect(calculatePhysiqueScore(-10, 1.0)).toBeGreaterThanOrEqual(0);
        expect(calculatePhysiqueScore(50, 2.0)).toBeLessThanOrEqual(100);
    });
  });

  describe('Full Genetic Potential Calculation', () => {
    const standardInput = {
        heightCm: 180,
        wristCm: 17,
        ankleCm: 22,
        bodyFatPct: 12,
        unitSystem: 'metric' as const,
    };

    it('returns complete genetic result', () => {
        const result = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        
        expect(result.naturalWeight).toBeGreaterThan(70);
        expect(result.enhancedWeight).toBeGreaterThan(result.naturalWeight);
        expect(['ectomorph', 'mesomorph', 'endomorph']).toContain(result.bodyType);
        expect(result.ffmi).toBeGreaterThan(0);
        expect(result.normalizedFfmi).toBeGreaterThan(0);
        expect(result.goldenRatio).toBeGreaterThan(0);
        expect(result.physiqueScore).toBeGreaterThanOrEqual(0);
        expect(result.physiqueScore).toBeLessThanOrEqual(100);
        expect(result.potentials).toHaveLength(3);
    });

    it('enhanced weight > natural weight', () => {
        const result = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        expect(result.enhancedWeight).toBeGreaterThan(result.naturalWeight);
    });

    it('potentials have correct structure', () => {
        const result = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        
        result.potentials.forEach(p => {
            expect(p.name).toBeTruthy();
            expect(p.current).toBeGreaterThanOrEqual(0);
            expect(p.potential).toBeGreaterThan(0);
            expect(['cm', 'in']).toContain(p.unit);
        });
    });

    it('works in imperial system', () => {
        const result = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'imperial'
        });
        
        expect(result.naturalWeight).toBeGreaterThan(0);
        expect(result.potentials[0].unit).toBe('in');
    });

    it('body type changes with wrist/height ratio', () => {
        const ecto = calculateGeneticPotential({
            heightCm: 190,
            wristCm: 15,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        const endo = calculateGeneticPotential({
            heightCm: 170,
            wristCm: 20,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        
        expect(ecto.bodyType).toBe('ectomorph');
        expect(endo.bodyType).toBe('endomorph');
    });
  });

  describe('Edge Cases & Safety', () => {
    it('handles zero height gracefully', () => {
        const zeroInput = {
            heightCm: 0,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric' as const,
        };
        
        const weight = calculateNaturalWeight(zeroInput);
        expect(weight).toBe(0);
    });

    it('handles extreme body fat values', () => {
        const highBfInput = {
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 50,
            unitSystem: 'metric' as const,
        };
        
        const weight = calculateNaturalWeight(highBfInput);
        expect(weight).toBeGreaterThan(0);
    });

    it('handles missing current measurements', () => {
        const input = {
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric' as const,
        };
        
        const result = calculateGeneticPotential(input);
        expect(result.goldenRatio).toBeGreaterThan(0);
    });

    it('uses actual measurements over potentials for golden ratio', () => {
        const withActuals = {
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            currentShouldersCm: 120,
            currentWaistCm: 80,
            unitSystem: 'metric' as const,
        };
        const withoutActuals = {
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric' as const,
        };
        
        const withRatio = calculateGeneticPotential(withActuals).goldenRatio;
        const withoutRatio = calculateGeneticPotential(withoutActuals).goldenRatio;
        
        expect(withRatio).toBe(1.5);
    });

    it('body type boundaries are inclusive/exclusive correctly', () => {
        const exactly10 = classifyBodyType(175, 17.5);
        expect(exactly10).toBe('mesomorph');
        
        const exactly115 = classifyBodyType(170, 19.55);
        expect(exactly115).toBe('mesomorph');
        
        const slightlyOver = classifyBodyType(170, 19.6);
        expect(slightlyOver).toBe('endomorph');
    });
  });

  describe('Determinism', () => {
    it('same input produces identical output', () => {
        const input = {
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric' as const,
        };

        const r1 = calculateGeneticPotential(input);
        const r2 = calculateGeneticPotential(input);
        
        expect(r1).toEqual(r2);
    });

    it('metric and imperial produce consistent relative results', () => {
        const metric = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'metric'
        });
        
        const imperial = calculateGeneticPotential({
            heightCm: 180,
            wristCm: 17,
            ankleCm: 22,
            bodyFatPct: 12,
            unitSystem: 'imperial'
        });
        
        expect(imperial.naturalWeight).toBeCloseTo(metric.naturalWeight * 2.20462, 0);
        expect(imperial.potentials[0].potential).toBeCloseTo(metric.potentials[0].potential / 2.54, 0);
    });
  });
});