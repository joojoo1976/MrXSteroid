'use client';

/**
 * US Navy circumference method — body-fat percentage estimate.
 *
 * The published formulas are calibrated for INCHES; this module accepts metric
 * circumferences (cm) and converts internally. Applying the formula directly to
 * cm values shifts the log-terms by log10(2.54) and massively overstates BF%.
 */
export type NavyGender = 'male' | 'female';

const toIn = (cm: number): number => cm / 2.54;

/**
 * @param gender   'male' | 'female'
 * @param waistCm  waist circumference (cm)
 * @param neckCm   neck circumference (cm)
 * @param hipCm    hip circumference (cm) — only used for the female formula
 * @param heightCm standing height (cm)
 * @returns clamped body-fat percentage (2–60)
 */
export const navyBodyFatPct = (
    gender: NavyGender,
    waistCm: number,
    neckCm: number,
    hipCm: number,
    heightCm: number,
): number => {
    const hIn = toIn(heightCm);
    let pct: number;
    if (gender === 'male') {
        pct =
            86.01 * Math.log10(Math.max(1, toIn(waistCm) - toIn(neckCm))) -
            70.041 * Math.log10(hIn) +
            36.76;
    } else {
        pct =
            163.205 * Math.log10(Math.max(1, toIn(waistCm) + toIn(hipCm) - toIn(neckCm))) -
            97.684 * Math.log10(hIn) -
            78.387;
    }
    return Math.max(2, Math.min(60, pct));
};
