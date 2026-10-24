'use client';

import { useMemo, useState } from 'react';
import {
  EMERGENCY_CHECKLIST_REVIEWED_AT,
  EMERGENCY_CHECKLIST_RULESET_VERSION,
  EMERGENCY_WARNING_RULES,
  inspectEmergencyChecklistDraft,
  type EmergencyAgeGroup,
  type EmergencyAnswer,
  type EmergencyChecklistDraft,
} from '@/lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6';
import { buildEmergencyChecklistOutput } from '@/lib/tools/adapters/tool-146-emergency-warning-signs-checklist';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

const inputClass = 'accent-amber-400';

export default function Tool146EmergencyWarningSignsChecklist() {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [ageGroup, setAgeGroup] = useState<EmergencyAgeGroup | null>(null);
  const [answers, setAnswers] = useState<Record<string, EmergencyAnswer | null>>({});
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const flags = useMemo(
    () => ageGroup ? EMERGENCY_WARNING_RULES.flags[ageGroup] : [],
    [ageGroup],
  );
  const explicitlyMatchedFlags = flags.filter((flag) => answers[flag.id] === 'yes');
  const draft = useMemo<EmergencyChecklistDraft>(() => ({
    ageGroup,
    answers: flags.map((flag) => ({ flagId: flag.id, answer: answers[flag.id] ?? null })),
  }), [ageGroup, answers, flags]);
  const draftState = useMemo(() => inspectEmergencyChecklistDraft(draft), [draft]);
  const input = ageGroup !== null && draftState.status !== 'INVALID_INPUT' ? draft : null;
  const { output, calculate, reset } = useExplicitToolOutput<EmergencyChecklistDraft, ReturnType<typeof buildEmergencyChecklistOutput>['result']>(input);
  const clearResult = () => reset();

  const answerLabel = (answer: EmergencyAnswer) => answer === 'yes'
    ? tr('نعم', 'Yes')
    : answer === 'no' ? tr('لا', 'No') : tr('غير متأكد', 'Not sure');

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-black text-white">{tr('قائمة إشارات الطوارئ', 'Emergency Warning Signs Checklist')}</h1>
      <div className="flex gap-2"><button type="button" onClick={() => { clearResult(); setLocale('ar'); }}>عربي</button><button type="button" onClick={() => { clearResult(); setLocale('en'); }}>EN</button></div>
    </header>

    <section className="space-y-2 rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-100" aria-live="polite">
      <p className="font-bold">{tr('هذه قائمة قواعد ثابتة وليست تشخيصًا أو تحليلًا للأعراض أو تقديرًا للخطورة.', 'This is a fixed-rule checklist, not a diagnosis, symptom analysis, or severity estimate.')}</p>
      <p>{tr('القائمة غير شاملة ولا تستبدل التقييم الطبي أو خدمات الطوارئ. إذا كنت تعتقد أن الحالة طارئة، اطلب المساعدة المحلية فورًا ولا تنتظر إكمال القائمة.', 'This list is not exhaustive and does not replace medical assessment or emergency services. If you think this may be an emergency, seek local help now; do not wait to complete the checklist.')}</p>
      {locale === 'ar' && <p>{tr('الصياغة العربية ترجمة توضيحية لهذه الأداة وليست ترجمة رسمية من ACEP.', 'The Arabic wording is an explanatory translation for this tool, not an official ACEP translation.')}</p>}
    </section>

    <fieldset className="space-y-2 rounded-xl border border-zinc-700 p-4">
      <legend className="px-2 font-bold text-white">{tr('لمن تجيب عن القائمة؟', 'Who is this checklist about?')}</legend>
      {(['adult', 'child'] as const).map((group) => <label key={group} className="me-5 inline-flex items-center gap-2 text-sm text-zinc-200">
        <input type="radio" name="emergency-age-group" checked={ageGroup === group} onChange={() => { clearResult(); setAgeGroup(group); setAnswers({}); }} />
        {group === 'adult' ? tr('بالغ', 'Adult') : tr('طفل', 'Child')}
      </label>)}
    </fieldset>

    {ageGroup && <section className="space-y-3" aria-label={tr('علامات التحذير', 'Warning signs')}>
      {flags.map((flag, index) => <fieldset key={flag.id} className="rounded-xl border border-zinc-800 p-3">
        <legend className="max-w-full px-2 text-sm text-zinc-100">{index + 1}. {locale === 'ar' ? flag.labelAr : flag.labelEn}</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-2 py-2">
          {(['yes', 'no', 'unsure'] as const).map((answer) => <label key={answer} className="inline-flex items-center gap-2 text-xs text-zinc-300">
            <input
              className={inputClass}
              type="radio"
              name={`emergency-answer-${flag.id}`}
              aria-label={`${locale === 'ar' ? flag.labelAr : flag.labelEn}: ${answerLabel(answer)}`}
              checked={answers[flag.id] === answer}
              onChange={() => { clearResult(); setAnswers((old) => ({ ...old, [flag.id]: answer })); }}
            />
            {answerLabel(answer)}
          </label>)}
        </div>
      </fieldset>)}
    </section>}

    {explicitlyMatchedFlags.length > 0 && <section role="alert" className="space-y-2 rounded-xl border border-red-600 bg-red-950/50 p-4 text-sm text-red-100">
      <p className="font-bold">{tr('تم تحديد علامة مدرجة تستدعي رعاية عاجلة. اتصل بخدمات الطوارئ المحلية أو اطلب رعاية طبية عاجلة الآن؛ لا تنتظر إكمال القائمة أو نتيجة الأداة.', 'A listed warning sign has been selected and calls for urgent care. Contact local emergency services or seek urgent medical care now; do not wait to finish this checklist or for a tool result.')}</p>
      <p>{tr('الأداة لا تحدد السبب ولا تقيس الخطورة.', 'This tool does not identify the cause or measure severity.')}</p>
      <ul className="list-inside list-disc">{explicitlyMatchedFlags.map((flag) => <li key={flag.id}>{locale === 'ar' ? flag.labelAr : flag.labelEn}</li>)}</ul>
    </section>}

    {draftState.status === 'PARTIAL' && <p role="status" className="text-sm text-amber-300"><strong>PARTIAL</strong> · {tr('اختر الفئة العمرية ثم أجب عن كل علامة؛ استخدم «غير متأكد» إذا لم تكن متأكدًا.', 'Choose an age group and answer each sign; use “Not sure” when uncertain.')}</p>}
    {draftState.status === 'INVALID_INPUT' && <div role="alert" className="text-sm text-red-300"><strong>INVALID_INPUT</strong> · {draftState.errors.join(' · ')}</div>}

    <div className="flex gap-2">
      <button type="button" disabled={!input} onClick={() => input && calculate(input, buildEmergencyChecklistOutput, locale)} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('راجع الإجابات', 'Review answers')}</button>
      <button type="button" onClick={() => { clearResult(); setAgeGroup(null); setAnswers({}); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button>
    </div>

    {output && <ToolOutputSummary output={output} locale={locale} />}

    <section className="space-y-2 rounded-xl border border-zinc-800 p-4 text-xs text-zinc-300">
      <h2 className="font-bold text-white">{tr('مصادر القائمة ومراجعتها', 'Checklist sources and review')}</h2>
      <p>{tr('نسخة القواعد:', 'Rule-set version:')} <span dir="ltr">{EMERGENCY_CHECKLIST_RULESET_VERSION}</span> · {tr('تاريخ المراجعة:', 'Reviewed:')} <span dir="ltr">{EMERGENCY_CHECKLIST_REVIEWED_AT}</span></p>
      <p className="text-amber-200">{tr('رقم دولة محدد: NOT_AVAILABLE. استخدم رقم الطوارئ المحلي في موقعك. لم يُطلب موقعك ولم يُحدد تلقائيًا.', 'Country-specific number: NOT_AVAILABLE. Use the local emergency number where you are. Your location was not requested or detected.')}</p>
      <ul className="space-y-1">
        {EMERGENCY_WARNING_RULES.sources.map((source) => <li key={source.id}>
          <a className="text-sky-300 underline" href={source.url} target="_blank" rel="noreferrer">{source.organization}: {source.title}</a>
          <span> — {source.sourceKind}</span>
        </li>)}
      </ul>
    </section>
  </main>;
}
