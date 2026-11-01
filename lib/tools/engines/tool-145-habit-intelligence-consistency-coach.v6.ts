import { z } from 'zod';

export const HabitWeekSchema = z.object({
  name: z.string().trim().min(1).max(48),
  completed: z.array(z.boolean()).length(7),
});

export const HabitConsistencyInputSchema = z.object({
  habits: z.array(HabitWeekSchema).min(1).max(8),
}).superRefine(({ habits }, ctx) => {
  const normalized = habits.map((habit) => habit.name.toLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['habits'], message: 'Habit names must be unique.' });
  }
});

export type HabitConsistencyInput = z.infer<typeof HabitConsistencyInputSchema>;

export interface HabitConsistencyResult {
  totalCompleted: number;
  totalTracked: number;
  weeklyRate: number;
  habits: Array<{ name: string; completedDays: number; weeklyRate: number; currentStreak: number; longestStreak: number }>;
  method: 'completed tracked days divided by 7 tracked days per habit';
}

export function calculateHabitConsistencyV6(input: HabitConsistencyInput): HabitConsistencyResult {
  const data = HabitConsistencyInputSchema.parse(input);
  const habits = data.habits.map(({ name, completed }) => {
    let longestStreak = 0;
    let streak = 0;
    for (const done of completed) {
      streak = done ? streak + 1 : 0;
      longestStreak = Math.max(longestStreak, streak);
    }
    let currentStreak = 0;
    for (let day = completed.length - 1; day >= 0 && completed[day]; day -= 1) currentStreak += 1;
    const completedDays = completed.filter(Boolean).length;
    return { name, completedDays, weeklyRate: Math.round((completedDays / 7) * 100), currentStreak, longestStreak };
  });
  const totalCompleted = habits.reduce((sum, habit) => sum + habit.completedDays, 0);
  const totalTracked = habits.length * 7;
  return { totalCompleted, totalTracked, weeklyRate: Math.round((totalCompleted / totalTracked) * 100), habits, method: 'completed tracked days divided by 7 tracked days per habit' };
}
