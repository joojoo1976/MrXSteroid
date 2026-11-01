import type { KeyFinding, ToolOutput } from '../contracts';
import { calculateExerciseSubstitutions, type ExerciseSubstitutionInput, type ExerciseSubstitutionResult } from '../engines/tool-135-exercise-substitution-ai.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

const exerciseNames: Record<string, [string, string]> = {
  box_squat: ['قرفصاء إلى صندوق بوزن الجسم', 'Bodyweight box squat'], goblet_squat: ['قرفصاء دمبل أمامي', 'Goblet squat'], machine_leg_press: ['ضغط أرجل على جهاز', 'Machine leg press'],
  hip_bridge: ['جسر الورك', 'Hip bridge'], dumbbell_romanian_deadlift: ['رفعة رومانية بالدمبل', 'Dumbbell Romanian deadlift'], cable_pull_through: ['سحب كابل بين الساقين', 'Cable pull-through'],
  incline_push_up: ['ضغط مائل بوزن الجسم', 'Incline push-up'], dumbbell_floor_press: ['ضغط دمبل أرضي', 'Dumbbell floor press'], machine_chest_press: ['ضغط صدر على جهاز', 'Machine chest press'],
  band_row: ['سحب مطاطي', 'Band row'], one_arm_dumbbell_row: ['سحب دمبل بذراع واحدة', 'One-arm dumbbell row'], cable_row: ['سحب كابل', 'Cable row'],
  bodyweight_march: ['مشي في المكان بوزن الجسم', 'Bodyweight march'], farmer_carry: ['مشي المزارع بالدمبل', 'Dumbbell farmer carry'],
};
export function buildExerciseSubstitutionOutput(input: ExerciseSubstitutionInput, options: HeuristicOutputOptions): ToolOutput<ExerciseSubstitutionResult> {
  const result = calculateExerciseSubstitutions(input);
  const ar = options.locale === 'ar';
  const statusMessage = result.status === 'pain_requires_stop'
    ? (ar ? 'لا تستخدم هذه القائمة للتدرب رغم الألم. أوقف الحركة واطلب تقييمًا من مختص مؤهل.' : 'Do not use this rule list to train through pain. Stop the movement and seek assessment from a qualified professional.')
    : result.alternatives.length
      ? (ar ? 'الخيارات تطابق نمط الحركة والمعدات المحددة فقط؛ تحقق من الراحة والتقنية.' : 'Options match only the selected movement and equipment; verify comfort and technique.')
      : (ar ? 'لا يوجد خيار مسجل يطابق المرشحات المحددة.' : 'No listed option matches the selected filters.');
  const findings: KeyFinding[] = [
    { code: 'ALTERNATIVES', labelAr: 'خيارات تطابق المرشحات', labelEn: 'Options matching filters', value: result.alternatives.map((name) => exerciseNames[name]?.[ar ? 0 : 1] ?? name).join('، ') || (ar ? 'لا توجد خيارات مطابقة' : 'No matching options'), severity: result.status === 'pain_requires_stop' ? 'important' : 'info' },
    { code: 'STATUS', labelAr: 'حالة الأداة', labelEn: 'Tool status', value: statusMessage, severity: result.status === 'pain_requires_stop' ? 'important' : 'monitor' },
    scopeFinding(ar ? 'قواعد ثابتة فقط؛ لا يوجد ذكاء اصطناعي أو تقييم إصابة.' : result.disclaimer),
  ];
  return registeredHeuristicOutput('tool-135-exercise-substitution-ai', result, findings, heuristicProvenance(options, 'not applicable', 'Static movement-pattern and user-selected equipment rules; no AI model or injury assessment is used'), options);
}
