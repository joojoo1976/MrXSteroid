import { describe, expect, it } from 'vitest';
import {
    calculateHcgSermProtocol,
    calculateSuppressionScore,
    resolveSermSelection,
} from './hcg-serm-protocol';

describe('Tool #005 Layer 1 Engine — HCG & SERM Protocol Generator', () => {
    describe('calculateSuppressionScore', () => {
        it('calculates mild suppression for short low-dose cycles', () => {
            const { sScore, severity } = calculateSuppressionScore(
                [{ catalogId: 'anavar', weeklyDoseMg: 50 }],
                4,
            );
            expect(sScore).toBeLessThan(3.0);
            expect(severity).toBe('mild');
        });

        it('calculates moderate suppression for standard testosterone cycle', () => {
            const { sScore, severity } = calculateSuppressionScore(
                [{ catalogId: 'testosterone', weeklyDoseMg: 500 }],
                12,
            );
            expect(sScore).toBeGreaterThanOrEqual(3.0);
            expect(sScore).toBeLessThanOrEqual(7.0);
            expect(severity).toBe('moderate');
        });

        it('calculates severe suppression for heavy nandrolone/trenbolone stack', () => {
            const { sScore, severity } = calculateSuppressionScore(
                [
                    { catalogId: 'testosterone', weeklyDoseMg: 500 },
                    { catalogId: 'trenbolone', weeklyDoseMg: 400 },
                    { catalogId: 'nandrolone', weeklyDoseMg: 400 },
                ],
                20,
            );
            expect(sScore).toBeGreaterThan(7.0);
            expect(severity).toBe('severe');
        });
    });

    describe('resolveSermSelection', () => {
        it('auto-switches to Nolvadex if gynecomastia history is present', () => {
            const res = resolveSermSelection('clomid', {
                ocularSensitivity: false,
                moodSensitivity: false,
                jointPain: false,
                gynoHistory: true,
            });
            expect(res.selectedSermId).toBe('nolvadex');
            expect(res.isAutoSwitched).toBe(true);
            expect(res.autoSwitchReasonKey).toBe('auto_switch_nolvadex');
        });

        it('auto-switches to Enclomiphene if ocular sensitivity is present with Clomid', () => {
            const res = resolveSermSelection('clomid', {
                ocularSensitivity: true,
                moodSensitivity: false,
                jointPain: false,
                gynoHistory: false,
            });
            expect(res.selectedSermId).toBe('enclomiphene');
            expect(res.isAutoSwitched).toBe(true);
            expect(res.autoSwitchReasonKey).toBe('auto_switch_enclomiphene');
        });

        it('respects user choice when no contraindications exist', () => {
            const res = resolveSermSelection('toremifene', {
                ocularSensitivity: false,
                moodSensitivity: false,
                jointPain: false,
                gynoHistory: false,
            });
            expect(res.selectedSermId).toBe('toremifene');
            expect(res.isAutoSwitched).toBe(false);
        });
    });

    describe('calculateHcgSermProtocol full pipeline', () => {
        it('requires HCG priming for severe testicular atrophy', () => {
            const result = calculateHcgSermProtocol({
                compounds: [{ catalogId: 'testosterone', weeklyDoseMg: 500 }],
                cycleWeeks: 12,
                testicularStatus: 'severe_atrophy',
                preferredSerm: 'auto_select',
                sideEffects: { ocularSensitivity: false, moodSensitivity: false, jointPain: false, gynoHistory: false },
                bodyWeightKg: 85,
            });

            expect(result.hcgRequired).toBe(true);
            expect(result.phases.some((p) => p.phaseNumber === 0)).toBe(true);
            expect(result.phases.find((p) => p.phaseNumber === 0)?.durationWeeks).toBe(3);
        });

        it('omits HCG priming for mild cycle with normal testicular status', () => {
            const result = calculateHcgSermProtocol({
                compounds: [{ catalogId: 'anavar', weeklyDoseMg: 50 }],
                cycleWeeks: 6,
                testicularStatus: 'normal',
                preferredSerm: 'auto_select',
                sideEffects: { ocularSensitivity: false, moodSensitivity: false, jointPain: false, gynoHistory: false },
                bodyWeightKg: 80,
            });

            expect(result.hcgRequired).toBe(false);
            expect(result.phases.some((p) => p.phaseNumber === 0)).toBe(false);
            expect(result.phases.length).toBe(3); // Kickstart, Stabilization, Weaning
        });
    });
});
