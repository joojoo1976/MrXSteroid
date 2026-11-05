import { describe, expect, it } from 'vitest';
import {
    buildWeeklyActivity,
    countThisWeek,
    countUniqueTools,
    formatMemberSince,
    getInitials,
    groupToolUsage,
    isNutritionOrTrainingTool,
    phaseFromCustomGoals,
    type DashboardHistoryRow,
} from './dashboard-utils';

const now = new Date('2026-11-05T12:00:00.000Z');

function row(overrides: Partial<DashboardHistoryRow>): DashboardHistoryRow {
    return {
        id: overrides.id ?? 'row',
        tool: overrides.tool ?? 'macro',
        title: overrides.title ?? 'Macro Calculator',
        inputs: {},
        result: {},
        created_at: overrides.created_at ?? now.toISOString(),
    };
}

describe('dashboard-utils', () => {
    it('builds seven day buckets and counts only recent rows', () => {
        const buckets = buildWeeklyActivity(
            [
                row({ id: 'a', created_at: now.toISOString() }),
                row({ id: 'b', created_at: '2026-11-04T09:00:00.000Z' }),
                row({ id: 'old', created_at: '2026-01-01T09:00:00.000Z' }),
                row({ id: 'bad', created_at: 'not-a-date' }),
            ],
            'en',
            now,
        );

        expect(buckets).toHaveLength(7);
        expect(buckets.reduce((total, bucket) => total + bucket.count, 0)).toBe(2);
        expect(countThisWeek([row({})], now)).toBe(1);
    });

    it('groups and orders tool usage without inventing rows', () => {
        const groups = groupToolUsage([
            row({ id: '1', tool: 'macro' }),
            row({ id: '2', tool: 'macro' }),
            row({ id: '3', tool: 'bodyfat', title: 'Body Fat' }),
        ]);

        expect(groups).toEqual([
            { tool: 'macro', label: 'Macro Calculator', count: 2 },
            { tool: 'bodyfat', label: 'Body Fat', count: 1 },
        ]);
        expect(groupToolUsage([])).toEqual([]);
    });

    it('counts unique tools only', () => {
        expect(
            countUniqueTools([
                row({ id: '1', tool: 'macro' }),
                row({ id: '2', tool: 'macro' }),
                row({ id: '3', tool: 'bodyfat' }),
            ]),
        ).toBe(2);
        expect(countUniqueTools([])).toBe(0);
    });

    it('has safe fallbacks for names, dates and phases', () => {
        expect(getInitials('George Mourice', 'g@example.com')).toBe('GM');
        expect(getInitials(null, 'owner@example.com')).toBe('OW');
        expect(getInitials(null, null)).toBe('MX');
        expect(formatMemberSince(null)).toBe('—');
        expect(formatMemberSince('bad-date')).toBe('—');
        expect(phaseFromCustomGoals({ currentPhase: 'bulking' })).toBe('bulking');
        expect(phaseFromCustomGoals({ currentPhase: 'unknown' })).toBe('cutting');
        expect(phaseFromCustomGoals(null)).toBe('cutting');
    });

    it('detects nutrition and training rows without matching everything', () => {
        expect(isNutritionOrTrainingTool('macro')).toBe(true);
        expect(isNutritionOrTrainingTool('progress tracker')).toBe(true);
        expect(isNutritionOrTrainingTool('bloodwork')).toBe(false);
    });
});
