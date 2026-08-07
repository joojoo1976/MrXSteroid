import { describe, it, expect } from 'vitest';
import { navyBodyFatPct } from '../../features/calculator/lib/navyFormula';

describe('navyBodyFatPct — US Navy circumference method (metric inputs)', () => {
    it('returns a physiologically sane value for a typical lean male', () => {
        // waist 84 cm, neck 38 cm, height 180 cm → ≈ 15–16%
        const pct = navyBodyFatPct('male', 84, 38, 0, 180);
        expect(pct).toBeGreaterThan(12);
        expect(pct).toBeLessThan(20);
    });

    it('returns a sane value for a typical female (hip included)', () => {
        // waist 82 cm, hip 97 cm, neck 40 cm, height 180 cm → ≈ 24–26%
        const pct = navyBodyFatPct('female', 82, 40, 97, 180);
        expect(pct).toBeGreaterThan(20);
        expect(pct).toBeLessThan(30);
    });

    it('would massively overstate BF% if cm were fed to the inch formula — guards regression', () => {
        // Same inputs: the (fixed) inches-calibrated formula stays < 20%,
        // whereas the old cm-direct computation produced ≈ 22% for this male.
        const male = navyBodyFatPct('male', 84, 38, 0, 180);
        expect(male).toBeLessThan(20);
        // Old buggy path: 86.01·log10(84−38) − 70.041·log10(180) + 36.76 ≈ 21.8
        const buggy = 86.01 * Math.log10(84 - 38) - 70.041 * Math.log10(180) + 36.76;
        expect(male).toBeLessThan(buggy - 2);
    });

    it('clamps the output to the [2, 60] safety band', () => {
        expect(navyBodyFatPct('male', 300, 30, 0, 150)).toBeLessThanOrEqual(60);
        expect(navyBodyFatPct('female', 50, 80, 50, 250)).toBeGreaterThanOrEqual(2);
    });
});
