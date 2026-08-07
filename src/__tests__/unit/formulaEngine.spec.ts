import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '../../features/calculator/services/formulaEngine';

describe('FormulaEngine — master calculator core', () => {
    it('applies the budget modifier to the weighted result', () => {
        // bulking + beginner + 80 kg: base 400 × 1.0 + 0 = 400
        const low = FormulaEngine.calculate(FormulaEngine.getCompoundWeights('bulking', 'beginner', 80, 'low'), 1200);
        const medium = FormulaEngine.calculate(FormulaEngine.getCompoundWeights('bulking', 'beginner', 80, 'medium'), 1200);
        const high = FormulaEngine.calculate(FormulaEngine.getCompoundWeights('bulking', 'beginner', 80, 'high'), 1200);
        // 400 × 0.85 = 340, × 1.0 = 400, × 1.2 = 480
        expect(low.value).toBeCloseTo(340, 0);
        expect(medium.value).toBeCloseTo(400, 0);
        expect(high.value).toBeCloseTo(480, 0);
        // Budget must change the computed dosage (previously a no-op).
        expect(low.value).toBeLessThan(medium.value);
        expect(medium.value).toBeLessThan(high.value);
    });

    it('respects the safety cap regardless of budget', () => {
        const high = FormulaEngine.calculate(FormulaEngine.getCompoundWeights('bulking', 'pro', 120, 'high'), 1200);
        // (400 × 2 + 80) × 1.2 = 1056 < 1200 → safe, exact value.
        expect(high.isSafe).toBe(true);
        expect(high.value).toBeCloseTo(1056, 0);
    });

    it('clamps TRT to its dedicated safety cap', () => {
        // (125 × 2 + 80) × 1.0 = 330 > 250 cap → throttled.
        const r = FormulaEngine.calculate(FormulaEngine.getCompoundWeights('trt', 'pro', 120, 'medium'), 250);
        expect(r.isSafe).toBe(false);
        expect(r.value).toBe(250);
        expect(r.warning).toBeDefined();
    });
});
