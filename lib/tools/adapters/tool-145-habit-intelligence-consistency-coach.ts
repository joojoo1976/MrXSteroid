import type { KeyFinding, ToolOutput } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { calculateHabitConsistencyV6, type HabitConsistencyInput, type HabitConsistencyResult } from '../engines/tool-145-habit-intelligence-consistency-coach.v6';
import type { HeuristicOutputOptions } from './tool-126-130-common';

export function buildHabitConsistencyOutput(input: HabitConsistencyInput, options: HeuristicOutputOptions): ToolOutput<HabitConsistencyResult> {
  const result = calculateHabitConsistencyV6(input);
  const ar = options.locale === 'ar';
  const findings: KeyFinding[] = [
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: ar ? 'تلخيص حسابي لمربعات أسبوع واحد أدخلها المستخدم. لا يقيس جودة العادة أو أسبابها ولا يحفظ البيانات.' : 'Arithmetic summary of one user-entered week. It does not assess habit quality or causes and does not save data.', severity: 'important' },
    { code: 'WEEKLY_COMPLETION', labelAr: 'نسبة الإنجاز في البيانات المدخلة', labelEn: 'Completion rate in entered data', value: `${result.weeklyRate}% (${result.totalCompleted}/${result.totalTracked})`, severity: 'info' },
    { code: 'HABIT_BREAKDOWN', labelAr: 'تفصيل العادات', labelEn: 'Habit breakdown', value: result.habits.map((habit) => `${habit.name}: ${habit.completedDays}/7 · ${habit.weeklyRate}% · ${ar ? 'التتابع الحالي' : 'current streak'} ${habit.currentStreak}`).join('؛ '), severity: 'info' },
  ];
  const tool = requireTool('tool-145-habit-intelligence-consistency-coach');
  return buildToolOutput({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt,
    locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType,
    accessTier: tool.accessTier, result,
    provenance: { source: 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: 'completed days per 7-day week', measurementMethod: 'User-marked habit days summarized with deterministic counts; no AI model is called', confidence: null, dataQuality: 'not_assessed' },
    keyFindings: findings, seoLinks: buildSeoLinks(tool),
  });
}
