import { describe, expect, it } from 'vitest';
import { calculateHabitConsistencyV6, HabitConsistencyInputSchema } from './tool-145-habit-intelligence-consistency-coach.v6';

describe('tool 145 weekly habit consistency', () => {
  it('counts completion rate and current/longest streak deterministically', () => {
    const result = calculateHabitConsistencyV6({ habits: [{ name: 'Walk', completed: [true, true, false, true, true, true, true] }] });
    expect(result.weeklyRate).toBe(86);
    expect(result.habits[0]).toMatchObject({ completedDays: 6, currentStreak: 4, longestStreak: 4 });
    expect(calculateHabitConsistencyV6({ habits: [{ name: 'Walk', completed: [true, true, false, true, true, true, true] }] })).toEqual(result);
  });

  it('rejects duplicate names and malformed week lengths', () => {
    expect(HabitConsistencyInputSchema.safeParse({ habits: [{ name: 'Walk', completed: Array(7).fill(false) }, { name: 'walk', completed: Array(7).fill(false) }] }).success).toBe(false);
    expect(HabitConsistencyInputSchema.safeParse({ habits: [{ name: 'Walk', completed: [true] }] }).success).toBe(false);
  });
});
