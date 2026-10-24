import { z } from 'zod';

export const EMERGENCY_CHECKLIST_REVIEWED_AT = '2026-10-24';
export const EMERGENCY_CHECKLIST_RULESET_VERSION = 'acep-know-when-to-go-reviewed-2026-10-24-v1';

export const EMERGENCY_CHECKLIST_SOURCES = [
  {
    id: 'acep-know-when-to-go',
    organization: 'American College of Emergency Physicians (ACEP)',
    title: 'Know When to Go',
    url: 'https://www.emergencyphysicians.org/article/know-when-to-go/know-when-to-go-overview',
    sourceKind: 'primary professional association guidance',
  },
  {
    id: 'medlineplus-recognizing-emergencies',
    organization: 'U.S. National Library of Medicine — MedlinePlus',
    title: 'Recognizing medical emergencies',
    url: 'https://medlineplus.gov/ency/article/001927.htm',
    sourceKind: 'supporting reference; attributes warning signs to ACEP',
  },
] as const;

export type EmergencyAgeGroup = 'adult' | 'child';
export type EmergencyAnswer = 'yes' | 'no' | 'unsure';

export interface EmergencyWarningSign {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface EmergencyRulePack {
  version: string;
  reviewedAt: string;
  sources: typeof EMERGENCY_CHECKLIST_SOURCES;
  flags: Record<EmergencyAgeGroup, EmergencyWarningSign[]>;
}

/** Concise paraphrases of ACEP's published adult and pediatric warning signs. */
export const EMERGENCY_WARNING_RULES: EmergencyRulePack = {
  version: EMERGENCY_CHECKLIST_RULESET_VERSION,
  reviewedAt: EMERGENCY_CHECKLIST_REVIEWED_AT,
  sources: EMERGENCY_CHECKLIST_SOURCES,
  flags: {
    adult: [
      { id: 'adult_breathing_difficulty', labelAr: 'صعوبة التنفس أو ضيق النفس', labelEn: 'Difficulty breathing or shortness of breath' },
      { id: 'adult_chest_upper_abdominal_pressure', labelAr: 'ألم أو ضغط في الصدر أو أعلى البطن يستمر دقيقتين أو أكثر', labelEn: 'Chest or upper-abdominal pain or pressure lasting two minutes or more' },
      { id: 'adult_faint_dizzy_weak_vision', labelAr: 'إغماء أو دوار أو ضعف مفاجئ أو تغيّر في الرؤية', labelEn: 'Fainting, sudden dizziness or weakness, or a change in vision' },
      { id: 'adult_choking', labelAr: 'اختناق', labelEn: 'Choking' },
      { id: 'adult_head_or_spine_injury', labelAr: 'إصابة في الرأس أو العمود الفقري', labelEn: 'Head or spine injury' },
      { id: 'adult_serious_injury', labelAr: 'إصابة خطرة، مثل حادث شديد أو حرق أو استنشاق دخان أو شبه غرق أو جرح عميق أو كبير', labelEn: 'Serious injury, such as a major crash, burn, smoke inhalation, near drowning, or a deep or large wound' },
      { id: 'adult_poison_ingestion', labelAr: 'ابتلاع مادة سامة', labelEn: 'Ingestion of a poisonous substance' },
      { id: 'adult_speech_difficulty', labelAr: 'صعوبة في الكلام', labelEn: 'Difficulty speaking' },
      { id: 'adult_mental_status_change', labelAr: 'ارتباك أو تغيّر في الحالة الذهنية أو سلوك غير معتاد أو صعوبة الإيقاظ', labelEn: 'Confusion, a mental-status or behavior change, or difficulty waking' },
      { id: 'adult_sudden_or_severe_pain', labelAr: 'ألم مفاجئ أو شديد في أي مكان', labelEn: 'Sudden or severe pain anywhere' },
      { id: 'adult_uncontrolled_bleeding', labelAr: 'نزيف لا يمكن إيقافه', labelEn: 'Bleeding that cannot be stopped' },
      { id: 'adult_persistent_vomiting_diarrhea', labelAr: 'قيء أو إسهال شديد أو مستمر', labelEn: 'Severe or persistent vomiting or diarrhea' },
      { id: 'adult_blood_cough_or_vomit', labelAr: 'سعال أو قيء مصحوب بدم', labelEn: 'Coughing up or vomiting blood' },
      { id: 'adult_self_or_other_harm_thoughts', labelAr: 'أفكار أو مشاعر تتعلق بإيذاء النفس أو شخص آخر', labelEn: 'Thoughts or feelings about harming yourself or another person' },
      { id: 'adult_unusual_abdominal_pain', labelAr: 'ألم بطني غير معتاد', labelEn: 'Unusual abdominal pain' },
    ],
    child: [
      { id: 'child_headache_or_vomit_after_head_injury', labelAr: 'صداع شديد أو قيء، خصوصًا بعد إصابة الرأس', labelEn: 'Severe headache or vomiting, especially after a head injury' },
      { id: 'child_uncontrolled_bleeding', labelAr: 'نزيف لا يمكن إيقافه', labelEn: 'Bleeding that cannot be stopped' },
      { id: 'child_unsteady_or_cannot_stand', labelAr: 'تعذر الوقوف أو عدم اتزان المشي', labelEn: 'Unable to stand or unsteady walking' },
      { id: 'child_unconscious', labelAr: 'فقدان الوعي', labelEn: 'Unconsciousness' },
      { id: 'child_abnormal_or_difficult_breathing', labelAr: 'تنفس غير طبيعي أو صعب', labelEn: 'Abnormal or difficult breathing' },
      { id: 'child_blue_purple_gray_skin', labelAr: 'لون الجلد أو الشفتين أزرق أو أرجواني أو رمادي', labelEn: 'Skin or lips look blue, purple, or gray' },
      { id: 'child_feeding_or_eating_difficulty', labelAr: 'صعوبة في الأكل أو الرضاعة', labelEn: 'Difficulty eating or feeding' },
      { id: 'child_persistent_increasing_severe_pain', labelAr: 'ألم متزايد أو شديد أو مستمر', labelEn: 'Increasing, severe, or persistent pain' },
      { id: 'child_fever_behavior_or_stiffness', labelAr: 'حمى مع تغيّر في السلوك، خصوصًا مع صداع شديد مفاجئ أو تغيّر ذهني أو تيبس الرقبة أو الظهر', labelEn: 'Fever with a behavior change, especially with sudden severe headache, mental change, or neck or back stiffness' },
      { id: 'child_significant_behavior_alertness_change', labelAr: 'تغيّر ملحوظ في السلوك أو اليقظة، مثل الارتباك أو قلة الاستجابة أو النعاس الزائد أو التهيج أو الخمول', labelEn: 'Significant behavior or alertness change, such as confusion, reduced response, unusual sleepiness, irritability, or lethargy' },
      { id: 'child_seizure', labelAr: 'تشنج', labelEn: 'Seizure' },
    ],
  },
};

const EmergencyRulePackSchema = z.object({
  version: z.string().trim().min(1),
  reviewedAt: z.string().date(),
  sources: z.array(z.object({
    id: z.string().trim().min(1), organization: z.string().trim().min(1), title: z.string().trim().min(1),
    url: z.string().url().refine((url) => url.startsWith('https://'), 'Source URL must use HTTPS'),
    sourceKind: z.string().trim().min(1),
  })).min(1),
  flags: z.object({
    adult: z.array(z.object({ id: z.string().trim().min(1), labelAr: z.string().trim().min(1), labelEn: z.string().trim().min(1) })).min(1),
    child: z.array(z.object({ id: z.string().trim().min(1), labelAr: z.string().trim().min(1), labelEn: z.string().trim().min(1) })).min(1),
  }),
}).superRefine((pack, context) => {
  const allIds = [...pack.flags.adult, ...pack.flags.child].map((flag) => flag.id);
  if (new Set(allIds).size !== allIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['flags'], message: 'Rule identifiers must be unique.' });
  }
  if (!pack.sources.some((source) => source.id === 'acep-know-when-to-go')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sources'], message: 'The ACEP primary source is required.' });
  }
});

export const EmergencyChecklistDraftSchema = z.object({
  ageGroup: z.enum(['adult', 'child']).nullable(),
  answers: z.array(z.object({ flagId: z.string().trim().min(1), answer: z.enum(['yes', 'no', 'unsure']).nullable() }).strict()),
}).strict();

export type EmergencyChecklistDraft = z.infer<typeof EmergencyChecklistDraftSchema>;
export type EmergencyDraftState =
  | { status: 'PARTIAL'; missingFlagIds: string[]; matchedFlagIds: string[] }
  | { status: 'INVALID_INPUT'; errors: string[] }
  | { status: 'FULL'; input: EmergencyChecklistDraft & { ageGroup: EmergencyAgeGroup }; matchedFlagIds: string[] };

export interface EmergencyNumberResolution {
  status: 'NOT_AVAILABLE';
  countryCode: string | null;
  reason: string;
}

export type EmergencyChecklistResult =
  | { status: 'MATCHED'; ageGroup: EmergencyAgeGroup; matchedFlagIds: string[]; needsUrgentHelp: true; emergencyNumber: EmergencyNumberResolution; rulesetVersion: string; reviewedAt: string }
  | { status: 'NO_MATCH'; ageGroup: EmergencyAgeGroup; matchedFlagIds: []; needsUrgentHelp: false; emergencyNumber: EmergencyNumberResolution; rulesetVersion: string; reviewedAt: string }
  | { status: 'PARTIAL'; ageGroup: EmergencyAgeGroup | null; missingFlagIds: string[]; matchedFlagIds: string[]; needsUrgentHelp: boolean; emergencyNumber: EmergencyNumberResolution; rulesetVersion: string; reviewedAt: string }
  | { status: 'INVALID_INPUT'; errors: string[]; needsUrgentHelp: false; emergencyNumber: EmergencyNumberResolution; rulesetVersion: string; reviewedAt: string }
  | { status: 'NOT_AVAILABLE'; reason: string; needsUrgentHelp: false; emergencyNumber: EmergencyNumberResolution; rulesetVersion: null; reviewedAt: null };

export function validateEmergencyRulePack(pack: unknown): pack is EmergencyRulePack {
  return EmergencyRulePackSchema.safeParse(pack).success;
}

export function resolveLocalEmergencyNumber(countryCode: string | null): EmergencyNumberResolution {
  if (!countryCode) return { status: 'NOT_AVAILABLE', countryCode: null, reason: 'No country was selected; use your local emergency number.' };
  return { status: 'NOT_AVAILABLE', countryCode, reason: 'No country-specific number with a reviewed official source is configured; use your local emergency number.' };
}

function resultForIncomplete(
  ageGroup: EmergencyAgeGroup | null,
  missingFlagIds: string[],
  matchedFlagIds: string[],
  emergencyNumber: EmergencyNumberResolution,
  pack: EmergencyRulePack,
): EmergencyChecklistResult {
  return { status: 'PARTIAL', ageGroup, missingFlagIds, matchedFlagIds, needsUrgentHelp: matchedFlagIds.length > 0, emergencyNumber, rulesetVersion: pack.version, reviewedAt: pack.reviewedAt };
}

/** Validates explicit answers and performs exact yes/no matching only. */
export function inspectEmergencyChecklistDraft(raw: unknown, pack: unknown = EMERGENCY_WARNING_RULES): EmergencyDraftState {
  if (!validateEmergencyRulePack(pack)) return { status: 'INVALID_INPUT', errors: ['The emergency rule pack or its source metadata is invalid.'] };
  const parsed = EmergencyChecklistDraftSchema.safeParse(raw);
  if (!parsed.success) return { status: 'INVALID_INPUT', errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`) };
  const input = parsed.data;
  if (input.ageGroup === null) {
    if (input.answers.length > 0) return { status: 'INVALID_INPUT', errors: ['Select an age group before entering warning-sign answers.'] };
    return { status: 'PARTIAL', missingFlagIds: ['ageGroup'], matchedFlagIds: [] };
  }

  const requiredIds = pack.flags[input.ageGroup].map((flag) => flag.id);
  const enteredIds = input.answers.map((answer) => answer.flagId);
  if (new Set(enteredIds).size !== enteredIds.length || enteredIds.some((id) => !requiredIds.includes(id))) {
    return { status: 'INVALID_INPUT', errors: ['Answers contain a duplicate or unknown warning-sign identifier.'] };
  }
  const answerById = new Map(input.answers.map((answer) => [answer.flagId, answer.answer]));
  const missingFlagIds = requiredIds.filter((id) => !answerById.has(id) || answerById.get(id) === null || answerById.get(id) === 'unsure');
  const matchedFlagIds = requiredIds.filter((id) => answerById.get(id) === 'yes');
  if (missingFlagIds.length > 0) return { status: 'PARTIAL', missingFlagIds, matchedFlagIds };
  return { status: 'FULL', input: { ...input, ageGroup: input.ageGroup }, matchedFlagIds };
}

/** An explicitly missing/corrupt rule pack blocks matching and keeps generic escalation copy. */
export function evaluateEmergencyChecklist(
  raw: unknown,
  options: { rulePack?: unknown; countryCode?: string | null } = {},
): EmergencyChecklistResult {
  const rulePack = Object.prototype.hasOwnProperty.call(options, 'rulePack') ? options.rulePack : EMERGENCY_WARNING_RULES;
  const emergencyNumber = resolveLocalEmergencyNumber(options.countryCode ?? null);
  if (!validateEmergencyRulePack(rulePack)) {
    return { status: 'NOT_AVAILABLE', reason: 'The referenced emergency checklist rules or source metadata are unavailable or invalid.', needsUrgentHelp: false, emergencyNumber, rulesetVersion: null, reviewedAt: null };
  }
  const inspected = inspectEmergencyChecklistDraft(raw, rulePack);
  if (inspected.status === 'INVALID_INPUT') {
    return { status: 'INVALID_INPUT', errors: inspected.errors, needsUrgentHelp: false, emergencyNumber, rulesetVersion: rulePack.version, reviewedAt: rulePack.reviewedAt };
  }
  if (inspected.status === 'PARTIAL') {
    return resultForIncomplete(raw && typeof raw === 'object' && 'ageGroup' in raw ? (raw as EmergencyChecklistDraft).ageGroup : null, inspected.missingFlagIds, inspected.matchedFlagIds, emergencyNumber, rulePack);
  }
  if (inspected.matchedFlagIds.length > 0) {
    return { status: 'MATCHED', ageGroup: inspected.input.ageGroup, matchedFlagIds: inspected.matchedFlagIds, needsUrgentHelp: true, emergencyNumber, rulesetVersion: rulePack.version, reviewedAt: rulePack.reviewedAt };
  }
  return { status: 'NO_MATCH', ageGroup: inspected.input.ageGroup, matchedFlagIds: [], needsUrgentHelp: false, emergencyNumber, rulesetVersion: rulePack.version, reviewedAt: rulePack.reviewedAt };
}
