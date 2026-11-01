import { describe, expect, it } from 'vitest';
import { convertWeightSystem } from './unitSystemConversion';

describe('convertWeightSystem', () => {
    it('converts metric weight to imperial display units', () => {
        expect(convertWeightSystem(80, 'metric', 'imperial')).toBe(176.4);
    });

    it('converts imperial weight to metric display units', () => {
        expect(convertWeightSystem(176.4, 'imperial', 'metric')).toBe(80);
    });

    it('keeps the input unchanged when the system does not change', () => {
        expect(convertWeightSystem(80, 'metric', 'metric')).toBe(80);
    });

    it('does not transform non-finite values', () => {
        expect(convertWeightSystem(Number.NaN, 'metric', 'imperial')).toBeNaN();
        expect(convertWeightSystem(Number.POSITIVE_INFINITY, 'metric', 'imperial')).toBe(Number.POSITIVE_INFINITY);
    });
});
