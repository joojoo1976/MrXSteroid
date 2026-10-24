import type { KeyFinding, ToolOutput } from '../contracts';
import type { HeuristicOutputOptions } from './tool-126-130-common';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding } from './tool-126-130-common';
import {
  EMERGENCY_WARNING_RULES,
  evaluateEmergencyChecklist,
  type EmergencyChecklistDraft,
  type EmergencyChecklistResult,
} from '../engines/tool-146-emergency-warning-signs-checklist.v6';

function resultMessage(result: EmergencyChecklistResult, ar: boolean): string {
  const statusPrefix = `${result.status} · `;
  if (result.status === 'MATCHED' || (result.status === 'PARTIAL' && result.needsUrgentHelp)) {
    return statusPrefix + (ar
      ? 'تم اختيار علامة مدرجة تستدعي رعاية عاجلة. لا تحدد الأداة السبب أو تقيس الخطورة. اتصل بخدمات الطوارئ المحلية أو اطلب رعاية طبية عاجلة الآن؛ لا تنتظر نتيجة الأداة.'
      : 'A listed urgent warning sign was selected. This tool cannot determine the cause or measure severity. Contact local emergency services or seek urgent medical care now; do not wait for a tool result.');
  }
  if (result.status === 'NO_MATCH') {
    return statusPrefix + (ar
      ? 'لم تُحدد علامة من القائمة. هذا لا يثبت أن الحالة آمنة ولا يستبعد وجود طارئ. القائمة غير شاملة؛ إذا كانت الحالة شديدة أو جديدة أو تتفاقم، اطلب المساعدة الطبية العاجلة.'
      : 'No listed warning sign was selected. This does not establish safety or rule out an emergency. The list is not exhaustive; seek urgent medical help if the situation is severe, new, or worsening.');
  }
  if (result.status === 'PARTIAL') {
    return statusPrefix + (ar
      ? 'القائمة غير مكتملة أو توجد إجابة «غير متأكد». لا تستنتج غياب الخطر. أكمل ما تستطيع، واطلب المساعدة العاجلة إذا كنت تعتقد أن الحالة قد تكون طارئة.'
      : 'The checklist is incomplete or includes an unsure answer. Do not infer that there is no risk. Complete what you can and seek urgent help if you think this may be an emergency.');
  }
  if (result.status === 'NOT_AVAILABLE') {
    return statusPrefix + (ar
      ? 'قواعد القائمة أو بيانات مصدرها غير متاحة أو غير صالحة؛ لم تُجرَ مطابقة. إذا كان هناك احتمال طارئ، اتصل بخدمات الطوارئ المحلية الآن.'
      : 'The checklist rules or source metadata are unavailable or invalid; no matching was performed. If an emergency is possible, contact local emergency services now.');
  }
  return statusPrefix + (ar
    ? `تعذر التحقق من المدخلات: ${result.errors.join('، ')}`
    : `Input validation failed: ${result.errors.join('; ')}`);
}

export function buildEmergencyChecklistOutput(input: EmergencyChecklistDraft, options: HeuristicOutputOptions): ToolOutput<EmergencyChecklistResult> {
  const result = evaluateEmergencyChecklist(input);
  const ar = options.locale === 'ar';
  const findings: KeyFinding[] = [
    scopeFinding(ar
      ? 'قائمة قواعد ثابتة وليست تشخيصًا أو تحليلًا للأعراض أو تقديرًا للاحتمال أو الخطورة، وليست بديلًا عن التقييم الطبي أو الطوارئ.'
      : 'Fixed-rule checklist only; not a diagnosis, symptom analysis, probability or severity estimate, or substitute for medical assessment or emergency care.'),
    {
      code: result.status,
      labelAr: result.status === 'MATCHED' ? 'مطابقة علامة — اطلب مساعدة عاجلة' : result.status === 'NO_MATCH' ? 'لم تُحدد علامة — لا يعني ذلك الأمان' : result.status === 'PARTIAL' ? 'القائمة غير مكتملة' : result.status === 'NOT_AVAILABLE' ? 'المطابقة غير متاحة' : 'مدخلات غير صالحة',
      labelEn: result.status === 'MATCHED' ? 'Warning sign matched — seek urgent help' : result.status === 'NO_MATCH' ? 'No listed sign selected — this does not establish safety' : result.status === 'PARTIAL' ? 'Checklist is incomplete' : result.status === 'NOT_AVAILABLE' ? 'Matching unavailable' : 'Invalid input',
      value: resultMessage(result, ar), severity: result.needsUrgentHelp ? 'important' : 'monitor',
    },
    {
      code: 'LOCAL_EMERGENCY_NUMBER', labelAr: 'رقم الطوارئ الخاص بالدولة', labelEn: 'Country-specific emergency number',
      value: ar
        ? 'NOT_AVAILABLE — لا يوجد رقم دولة موثق ومراجع مهيأ. استخدم رقم الطوارئ المحلي في موقعك؛ لا تؤخر طلب المساعدة لمعرفة الرقم داخل الأداة.'
        : 'NOT_AVAILABLE — no reviewed country-specific number is configured. Use your local emergency number; do not delay seeking help to look it up in this tool.',
      severity: 'important',
    },
    {
      code: 'RULESET_VERSION', labelAr: 'نسخة القواعد وتاريخ المراجعة', labelEn: 'Rule-set version and review date',
      value: result.rulesetVersion ? `${result.rulesetVersion} · ${result.reviewedAt}` : (ar ? 'غير متاحة' : 'Unavailable'), severity: 'info',
    },
  ];

  if ('matchedFlagIds' in result) {
    for (const flagId of result.matchedFlagIds) {
      const flag = EMERGENCY_WARNING_RULES.flags[result.ageGroup ?? input.ageGroup ?? 'adult'].find((candidate) => candidate.id === flagId);
      if (flag) findings.push({
        code: `MATCHED_${flag.id.toUpperCase()}`,
        labelAr: 'العلامة التي اختارها المستخدم', labelEn: 'User-selected warning sign',
        value: ar ? flag.labelAr : flag.labelEn, severity: 'important',
      });
    }
  }

  if (result.status === 'PARTIAL' && result.missingFlagIds.length > 0) {
    findings.push({
      code: 'INCOMPLETE_ANSWERS', labelAr: 'إجابات ناقصة أو غير مؤكدة', labelEn: 'Missing or unsure answers',
      value: ar ? `عدد العلامات غير المحسومة: ${result.missingFlagIds.length}` : `Unresolved warning signs: ${result.missingFlagIds.length}`,
      severity: 'monitor',
    });
  }
  if (result.status === 'NOT_AVAILABLE') findings.push({ code: 'RULESET_UNAVAILABLE', labelAr: 'سبب عدم الإتاحة', labelEn: 'Reason unavailable', value: result.reason, severity: 'important' });
  if (result.status === 'INVALID_INPUT') findings.push({ code: 'VALIDATION_ERRORS', labelAr: 'أخطاء التحقق', labelEn: 'Validation errors', value: result.errors.join('؛ '), severity: 'important' });

  for (const source of EMERGENCY_WARNING_RULES.sources) {
    findings.push({
      code: `SOURCE_${source.id.toUpperCase().replaceAll('-', '_')}`,
      labelAr: `المصدر: ${source.organization}`, labelEn: `Source: ${source.organization}`,
      value: `${source.title} — ${source.url}`, severity: 'info',
    });
  }
  if (ar) findings.push({ code: 'ARABIC_TRANSLATION', labelAr: 'حالة الترجمة', labelEn: 'Translation status', value: 'صياغة عربية توضيحية وليست ترجمة رسمية من ACEP.', severity: 'info' });

  return registeredHeuristicOutput(
    'tool-146-ai-safety-gate-emergency-protocol', result, findings,
    heuristicProvenance(options, 'not applicable', `Fixed rule checklist ${result.rulesetVersion ?? 'unavailable'}; explicit yes/no/unsure user answers only; no AI, diagnosis, probability, or severity model`),
    options,
  );
}
