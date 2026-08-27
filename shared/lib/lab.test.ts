import { describe, it, expect } from 'vitest';
import {
    roundTo,
    formatLabNumber,
    formatRange,
    getActiveRange,
    convertLabValueSystem,
    evaluateLabValue,
    isLow,
    isHigh,
    isNormal,
    clamp,
} from './lab';

describe('Smart Lab Reference — Pure Medical Mathematics Engine', () => {

  describe('Precision Helpers', () => {
    describe('roundTo', () => {
        it('rounds to specified decimals', () => {
            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(2.5, 0)).toBe(3);
            expect(roundTo(1.234, 1)).toBe(1.2);
        });

        it('handles floating point artifacts', () => {
            expect(roundTo(2.499999999999, 1)).toBe(2.5);
            expect(roundTo(1.005, 2)).toBe(1.01);
        });

        it('returns value for zero decimals', () => {
            expect(roundTo(3.7, 0)).toBe(4);
            expect(roundTo(3.2, 0)).toBe(3);
        });
    });

    describe('formatLabNumber', () => {
        it('formats with specified decimals', () => {
            expect(formatLabNumber(3.14159, 2)).toBe('3.14');
            expect(formatLabNumber(2.5, 1)).toBe('2.5');
            expect(formatLabNumber(100, 0)).toBe('100');
        });

        it('strips trailing zeros', () => {
            expect(formatLabNumber(2.50, 2)).toBe('2.5');
            expect(formatLabNumber(3.00, 2)).toBe('3');
            expect(formatLabNumber(1.2300, 4)).toBe('1.23');
        });

        it('handles non-finite values', () => {
            expect(formatLabNumber(NaN, 2)).toBe('—');
            expect(formatLabNumber(Infinity, 2)).toBe('—');
            expect(formatLabNumber(-Infinity, 2)).toBe('—');
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

  describe('Range Selection', () => {
    const mockTest = {
        id: 'test_total_testosterone',
        category: 'hormones' as const,
        name: { en: 'Total Testosterone', ar: 'التستوستيرون الكلي' },
        description: { en: '', ar: '' },
        range: {
            si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
            us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
            siToUs: 28.818,
            usToSi: 0.03470,
        },
        high: { causes: [], symptoms: [], advice: [] },
        low: { causes: [], symptoms: [], advice: [] },
        keywords: [],
    };

    describe('getActiveRange', () => {
        it('returns SI range for metric system', () => {
            const range = getActiveRange(mockTest, 'metric');
            expect(range.min).toBe(8.64);
            expect(range.max).toBe(34.7);
            expect(range.unit).toBe('nmol/L');
            expect(range.decimals).toBe(2);
        });

        it('returns US range for imperial system', () => {
            const range = getActiveRange(mockTest, 'imperial');
            expect(range.min).toBe(240);
            expect(range.max).toBe(1000);
            expect(range.unit).toBe('ng/dL');
            expect(range.decimals).toBe(0);
        });
    });

    describe('formatRange', () => {
        it('formats range with unit for metric', () => {
            const result = formatRange(mockTest, 'metric');
            expect(result).toBe('8.64 – 34.7 nmol/L');
        });

        it('formats range with unit for imperial', () => {
            const result = formatRange(mockTest, 'imperial');
            expect(result).toBe('240 – 1000 ng/dL');
        });
    });
  });

  describe('Unit Conversion (siToUs / usToSi)', () => {
    const mockProfile = {
        si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
        us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
        siToUs: 28.818,
        usToSi: 0.03470,
    };

    describe('convertLabValueSystem', () => {
        it('converts SI → US using siToUs', () => {
            const result = convertLabValueSystem(10, 'metric', 'imperial', mockProfile);
            expect(result).toBeCloseTo(288.18, 1);
        });

        it('converts US → SI using usToSi', () => {
            const result = convertLabValueSystem(500, 'imperial', 'metric', mockProfile);
            expect(result).toBeCloseTo(17.35, 1);
        });

        it('returns same value for same system', () => {
            expect(convertLabValueSystem(10, 'metric', 'metric', mockProfile)).toBe(10);
            expect(convertLabValueSystem(500, 'imperial', 'imperial', mockProfile)).toBe(500);
        });

        it('handles non-finite values', () => {
            expect(convertLabValueSystem(NaN, 'metric', 'imperial', mockProfile)).toBe(NaN);
            expect(convertLabValueSystem(Infinity, 'metric', 'imperial', mockProfile)).toBe(Infinity);
        });

        it('works for different test profiles', () => {
            // Estradiol: pg/mL → pmol/L (factor ~3.671)
            const estradiolProfile = {
                si: { min: 37, max: 250, unit: 'pmol/L', decimals: 1 },
                us: { min: 10, max: 68, unit: 'pg/mL', decimals: 1 },
                siToUs: 0.272,
                usToSi: 3.671,
            };

            const pgml = 30;
            const pmol = convertLabValueSystem(pgml, 'imperial', 'metric', estradiolProfile);
            expect(pmol).toBeCloseTo(110.1, 0);

            const pmolVal = 150;
            const pgmlBack = convertLabValueSystem(pmolVal, 'metric', 'imperial', estradiolProfile);
            expect(pgmlBack).toBeCloseTo(40.8, 1);
        });
    });

    describe('Bidirectional consistency', () => {
        it('SI → US → SI returns original value', () => {
            const original = 15.5;
            const us = convertLabValueSystem(original, 'metric', 'imperial', mockProfile);
            const back = convertLabValueSystem(us, 'imperial', 'metric', mockProfile);
            expect(back).toBeCloseTo(original, 1);
        });

        it('US → SI → US returns original value', () => {
            const original = 500;
            const si = convertLabValueSystem(original, 'imperial', 'metric', mockProfile);
            const back = convertLabValueSystem(si, 'metric', 'imperial', mockProfile);
            expect(back).toBeCloseTo(original, 0);
        });
    });
  });

  describe('Value Evaluation (Low / Normal / High)', () => {
    const mockProfile = {
        si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
        us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
        siToUs: 28.818,
        usToSi: 0.03470,
    };

    describe('evaluateLabValue', () => {
        it('returns normal for value within SI range', () => {
            const result = evaluateLabValue(15, 'metric', mockProfile);
            expect(result.status).toBe('normal');
            expect(result.position).toBeGreaterThan(0);
            expect(result.position).toBeLessThan(1);
        });

        it('returns low for value below SI range', () => {
            const result = evaluateLabValue(5, 'metric', mockProfile);
            expect(result.status).toBe('low');
            expect(result.position).toBeLessThanOrEqual(0);
        });

        it('returns high for value above SI range', () => {
            const result = evaluateLabValue(50, 'metric', mockProfile);
            expect(result.status).toBe('high');
            expect(result.position).toBeGreaterThanOrEqual(1);
        });

        it('returns normal for value within US range', () => {
            const result = evaluateLabValue(500, 'imperial', mockProfile);
            expect(result.status).toBe('normal');
        });

        it('returns low for value below US range', () => {
            const result = evaluateLabValue(100, 'imperial', mockProfile);
            expect(result.status).toBe('low');
        });

        it('returns high for value above US range', () => {
            const result = evaluateLabValue(1500, 'imperial', mockProfile);
            expect(result.status).toBe('high');
        });

        it('handles non-finite values', () => {
            const result = evaluateLabValue(NaN, 'metric', mockProfile);
            expect(result.status).toBe('normal');
            expect(result.ratio).toBe(0);
            expect(result.position).toBe(0);
        });

        it('position is 0 at min boundary', () => {
            const result = evaluateLabValue(8.64, 'metric', mockProfile);
            expect(result.position).toBeCloseTo(0, 5);
        });

        it('position is 1 at max boundary', () => {
            const result = evaluateLabValue(34.7, 'metric', mockProfile);
            expect(result.position).toBeCloseTo(1, 5);
        });

        it('position is 0.5 at midpoint', () => {
            const mid = (8.64 + 34.7) / 2;
            const result = evaluateLabValue(mid, 'metric', mockProfile);
            expect(result.position).toBeCloseTo(0.5, 1);
        });
    });

    describe('Status helpers', () => {
        it('isLow identifies low status', () => {
            expect(isLow('low')).toBe(true);
            expect(isLow('normal')).toBe(false);
            expect(isLow('high')).toBe(false);
        });

        it('isHigh identifies high status', () => {
            expect(isHigh('high')).toBe(true);
            expect(isHigh('normal')).toBe(false);
            expect(isHigh('low')).toBe(false);
        });

        it('isNormal identifies normal status', () => {
            expect(isNormal('normal')).toBe(true);
            expect(isNormal('low')).toBe(false);
            expect(isNormal('high')).toBe(false);
        });
    });
  });

  describe('Edge Cases & Safety', () => {
    describe('Degenerate ranges', () => {
        it('handles min >= max gracefully', () => {
            const degenerateProfile = {
                si: { min: 10, max: 10, unit: 'nmol/L', decimals: 1 },
                us: { min: 288, max: 288, unit: 'ng/dL', decimals: 0 },
                siToUs: 28.8,
                usToSi: 0.0347,
            };

            const result = evaluateLabValue(10, 'metric', degenerateProfile);
            expect(result.status).toBe('normal');
            // safeMax = min + 1 = 11, so ratio = 10/11
            expect(result.ratio).toBeCloseTo(0.909, 2);
        });
    });

    describe('Boundary precision', () => {
        it('handles values exactly at boundaries', () => {
            const profile = {
                si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
                us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
                siToUs: 28.818,
                usToSi: 0.03470,
            };

            // Exactly at min
            const atMin = evaluateLabValue(8.64, 'metric', profile);
            expect(atMin.status).toBe('normal');
            expect(atMin.position).toBeCloseTo(0, 5);

            // Exactly at max
            const atMax = evaluateLabValue(34.7, 'metric', profile);
            expect(atMax.status).toBe('normal');
            expect(atMax.position).toBeCloseTo(1, 5);
        });

        it('handles just below min → low', () => {
            const profile = {
                si: { min: 10, max: 20, unit: 'nmol/L', decimals: 1 },
                us: { min: 288, max: 576, unit: 'ng/dL', decimals: 0 },
                siToUs: 28.8,
                usToSi: 0.0347,
            };

            expect(evaluateLabValue(9.99, 'metric', profile).status).toBe('low');
        });

        it('handles just above max → high', () => {
            const profile = {
                si: { min: 10, max: 20, unit: 'nmol/L', decimals: 1 },
                us: { min: 288, max: 576, unit: 'ng/dL', decimals: 0 },
                siToUs: 28.8,
                usToSi: 0.0347,
            };

            expect(evaluateLabValue(20.01, 'metric', profile).status).toBe('high');
        });
    });

    describe('Multiple biomarker profiles', () => {
        it('works for Estradiol (pg/mL ↔ pmol/L)', () => {
            const estradiol = {
                si: { min: 37, max: 250, unit: 'pmol/L', decimals: 1 },
                us: { min: 10, max: 68, unit: 'pg/mL', decimals: 1 },
                siToUs: 0.272,
                usToSi: 3.671,
            };

            // 30 pg/mL = 110 pmol/L (within normal range)
            const si = convertLabValueSystem(30, 'imperial', 'metric', estradiol);
            expect(si).toBeCloseTo(110.1, 0);

            const evalResult = evaluateLabValue(110.1, 'metric', estradiol);
            expect(evalResult.status).toBe('normal'); // Above 37
        });

        it('works for SHBG (nmol/L only)', () => {
            const shbg = {
                si: { min: 15, max: 70, unit: 'nmol/L', decimals: 1 },
                us: { min: 15, max: 70, unit: 'nmol/L', decimals: 1 }, // Same units
                siToUs: 1,
                usToSi: 1,
            };

            const result = evaluateLabValue(50, 'metric', shbg);
            expect(result.status).toBe('normal');
        });

        it('works for Prolactin (mIU/L → ng/mL)', () => {
            const prolactin = {
                si: { min: 100, max: 400, unit: 'mIU/L', decimals: 0 },
                us: { min: 4.7, max: 18.8, unit: 'ng/mL', decimals: 1 },
                siToUs: 0.047,
                usToSi: 21.277,
            };

            const ngml = convertLabValueSystem(200, 'metric', 'imperial', prolactin);
            expect(ngml).toBeCloseTo(9.4, 1);
        });
    });
  });

  describe('Real-world Testosterone Examples', () => {
    const testosterone = {
        si: { min: 8.64, max: 34.7, unit: 'nmol/L', decimals: 2 },
        us: { min: 240, max: 1000, unit: 'ng/dL', decimals: 0 },
        siToUs: 28.818,
        usToSi: 0.03470,
    };

    it('typical male on TRT (600 ng/dL = 20.8 nmol/L)', () => {
        const nmol = convertLabValueSystem(600, 'imperial', 'metric', testosterone);
        expect(nmol).toBeCloseTo(20.8, 1);
        const evalResult = evaluateLabValue(nmol, 'metric', testosterone);
        expect(evalResult.status).toBe('normal');
    });

    it('suppressed male post-cycle (150 ng/dL = 5.2 nmol/L)', () => {
        const nmol = convertLabValueSystem(150, 'imperial', 'metric', testosterone);
        expect(nmol).toBeCloseTo(5.2, 1);
        const evalResult = evaluateLabValue(nmol, 'metric', testosterone);
        expect(evalResult.status).toBe('low');
    });

    it('supraphysiological on blast (1500 ng/dL = 52 nmol/L)', () => {
        const nmol = convertLabValueSystem(1500, 'imperial', 'metric', testosterone);
        expect(nmol).toBeCloseTo(52.05, 1);
        const evalResult = evaluateLabValue(nmol, 'metric', testosterone);
        expect(evalResult.status).toBe('high');
    });

    it('typical male natural (600 ng/dL / 21 nmol/L)', () => {
        const ngdl = 600;
        const nmol = convertLabValueSystem(ngdl, 'imperial', 'metric', testosterone);
        expect(nmol).toBeCloseTo(20.8, 1);
    });
  });

  describe('Hormone Panel Conversions', () => {
    it('LH (mIU/L ↔ mIU/L - same units)', () => {
        const lh = {
            si: { min: 1.5, max: 9.3, unit: 'mIU/L', decimals: 1 },
            us: { min: 1.5, max: 9.3, unit: 'mIU/L', decimals: 1 },
            siToUs: 1,
            usToSi: 1,
        };
        expect(convertLabValueSystem(5, 'metric', 'imperial', lh)).toBe(5);
    });

    it('FSH (mIU/L ↔ mIU/L - same units)', () => {
        const fsh = {
            si: { min: 1.5, max: 12.4, unit: 'mIU/L', decimals: 1 },
            us: { min: 1.5, max: 12.4, unit: 'mIU/L', decimals: 1 },
            siToUs: 1,
            usToSi: 1
        };
        expect(convertLabValueSystem(7, 'imperial', 'metric', fsh)).toBe(7);
    });

    it('Prolactin (mIU/L ↔ ng/mL)', () => {
        const prolactin = {
            si: { min: 100, max: 400, unit: 'mIU/L', decimals: 0 },
            us: { min: 4.7, max: 18.8, unit: 'ng/mL', decimals: 1 },
            siToUs: 0.047,
            usToSi: 21.277,
        };
        expect(convertLabValueSystem(200, 'metric', 'imperial', prolactin)).toBeCloseTo(9.4, 1);
        expect(convertLabValueSystem(10, 'imperial', 'metric', prolactin)).toBeCloseTo(212.8, 0);
    });
  });
});