'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAIInsightContext } from '@/components/smarttools/AIInsightContext';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

interface Finding {
  code: string;
  labelAr: string;
  labelEn: string;
  value: string;
  severity: string;
}

interface Props {
  toolSlug: string;
  findings?: Finding[];
  provenanceLine?: string;
}

type Source = 'model' | 'deterministic';

export default function AIInsightPanel({ toolSlug, findings: providedFindings, provenanceLine: providedProvenance }: Props) {
  const { locale, isRtl } = useToolDisplayPreferences();
  const toolContext = useAIInsightContext();
  const contextual = toolContext?.current?.toolSlug === toolSlug ? toolContext.current : null;
  const findings = providedFindings ?? contextual?.findings;
  const provenanceLine = providedProvenance ?? contextual?.provenanceLine;
  const hasResults = Boolean(findings?.length);
  const [includeResults, setIncludeResults] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [explanation, setExplanation] = useState('');
  const [question, setQuestion] = useState('');
  const [questionConsent, setQuestionConsent] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [source, setSource] = useState<Source | null>(null);
  const [disclaimer, setDisclaimer] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/api/smarttools/ai/explain', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('capability_unavailable');
        return response.json() as Promise<{ configured?: unknown }>;
      })
      .then((payload) => { if (active) setProviderConfigured(payload.configured === true); })
      .catch(() => { if (active) setProviderConfigured(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setIncludeResults(false);
    setExplanation('');
    setQuestion('');
    setQuestionConsent(false);
    setSubmittedQuestion('');
    setSource(null);
    setDisclaimer('');
    setState('idle');
  }, [findings, provenanceLine, toolSlug]);

  const explain = useCallback(async () => {
    setState('loading');
    setSubmittedQuestion(question.trim());
    try {
      const context = includeResults && hasResults
        ? { provenanceLine, findings }
        : undefined;
      const res = await fetch('/api/smarttools/ai/explain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ toolSlug, locale, context, question: question.trim() || undefined }),
      });
      if (!res.ok) throw new Error('http_' + res.status);
      const json: { ok: boolean; source: Source; explanation: string; disclaimer: string } = await res.json();
      if (!json.ok) throw new Error('not_ok');
      setExplanation(json.explanation);
      setSource(json.source);
      setDisclaimer(json.disclaimer);
      setState('done');
    } catch {
      setState('error');
    }
  }, [findings, hasResults, includeResults, locale, provenanceLine, question, toolSlug]);

  const modeLabel = useMemo(() => {
    if (providerConfigured === true) return isRtl ? 'مزود نموذج حي مضبوط' : 'Live model provider configured';
    if (providerConfigured === false) return isRtl ? 'لا يوجد مزود نموذج حي؛ سيُستخدم الشرح الحتمي' : 'No live model provider; deterministic explanation will be used';
    return isRtl ? 'حالة مزود النموذج غير متاحة' : 'Model provider status unavailable';
  }, [isRtl, providerConfigured]);

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70" aria-label={isRtl ? 'لوحة الذكاء الاصطناعي' : 'AI insight panel'}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-black text-zinc-900 dark:text-white">{isRtl ? '✨ مساعد تفسير النتائج' : '✨ AI results explainer'}</h2>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400" role="status">{modeLabel}</span>
      </div>

      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {isRtl
          ? 'يشرح المساعد الأداة أو النتائج التي تختار مشاركتها. لا يغيّر الحسابات ولا يشخّص ولا يقدّم علاجًا. إرسال النتائج أو نص السؤال يحتاج موافقتك.'
          : 'The assistant explains the tool or results you choose to share. It does not change calculations, diagnose, or provide treatment. Sending results or question text requires your consent.'}
      </p>

      {hasResults && (
        <label className="mb-3 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <input className="mt-0.5" type="checkbox" checked={includeResults} onChange={(event) => setIncludeResults(event.target.checked)} />
          <span>{isRtl
            ? 'أوافق على إرسال ملخص النتائج ومصدرها إلى خادم MrXSteroid لتفسيرها. إذا كان مزود نموذج خارجي مفعلاً، فستُرسل إليه هذه البيانات أيضًا. لا تُحفظ هذه البيانات بواسطة نقطة الشرح.'
            : 'I agree to send a summary of these results and their provenance to the MrXSteroid server for explanation. If an external model provider is enabled, this data will also be sent there. The explain endpoint does not persist this data.'}</span>
        </label>
      )}

      {providerConfigured === true ? (
        <label className="mb-3 block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <span className="mb-1 block">{includeResults && hasResults
            ? (isRtl ? 'اسأل عن الأداة أو طريقة الحساب أو النتائج التي وافقت على مشاركتها' : 'Ask about the tool, its method, or results you agreed to share')
            : (isRtl ? 'اسأل عن الأداة أو طريقتها؛ لن تُرسل نتائج هذه الصفحة' : 'Ask about the tool or method; this page’s results will not be sent')}</span>
          <textarea
            value={question}
            onChange={(event) => { setQuestion(event.target.value.slice(0, 600)); setQuestionConsent(false); }}
            maxLength={600}
            rows={3}
            dir={isRtl ? 'rtl' : 'ltr'}
            placeholder={isRtl ? 'اكتب سؤالك هنا (اختياري)' : 'Type your question here (optional)'}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-gold-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {question.trim() && (
            <span className="mt-2 flex items-start gap-2 font-normal text-zinc-600 dark:text-zinc-300">
              <input className="mt-0.5" type="checkbox" checked={questionConsent} onChange={(event) => setQuestionConsent(event.target.checked)} />
              <span>{isRtl
                ? 'أوافق على إرسال نص سؤالي إلى خادم MrXSteroid، وقد يُرسل إلى مزود النموذج الخارجي عند تفعيله. لا تضع اسمك أو بيانات تعريفية في السؤال.'
                : 'I agree to send my question text to the MrXSteroid server and, if enabled, the external model provider. Do not include your name or identifying details.'}</span>
            </span>
          )}
        </label>
      ) : providerConfigured === false ? (
        <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-6 text-amber-800 dark:text-amber-200">
          {isRtl
            ? 'الأسئلة الحرة تتطلب مزود نموذج حي. هذا غير مضبوط حاليًا؛ يمكنك طلب شرح حتمي لوظيفة الأداة أو نتائجها دون اعتباره إجابة ذكاء اصطناعي.'
            : 'Free-form questions require a live model provider, which is not configured. You can still request a deterministic explanation of the tool or its results; it is not an AI answer.'}
        </p>
      ) : null}

      {state === 'error' && <p className="mb-3 text-xs font-bold text-red-500">{isRtl ? 'تعذر إكمال الشرح الآن — حاول مرة أخرى.' : 'Could not complete the explanation — please try again.'}</p>}
      {state === 'done' && (
        <div aria-live="polite">
          {submittedQuestion && <p className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">{submittedQuestion}</p>}
          <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-300">{explanation}</p>
          <p className="mt-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
            {source === 'model'
              ? (isRtl ? 'المصدر: إجابة نموذج ذكاء اصطناعي حي' : 'Source: live AI model response')
              : (isRtl ? 'المصدر: شرح حتمي؛ لم يُستخدم نموذج حي' : 'Source: deterministic explanation; no live model used')}
          </p>
          <p className="mt-1 text-[10px] text-red-500/90 dark:text-red-400/90">{disclaimer}</p>
        </div>
      )}

      <button type="button" onClick={explain} disabled={state === 'loading' || (Boolean(question.trim()) && !questionConsent)} className="mt-3 rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-gold-400 disabled:opacity-50">
        {state === 'loading'
          ? (isRtl ? 'جارٍ التحضير...' : 'Preparing...')
          : state === 'done'
            ? (isRtl ? 'إعادة الشرح' : 'Explain again')
            : question.trim()
              ? (isRtl ? 'أرسل السؤال' : 'Ask assistant')
              : includeResults && hasResults
                ? (isRtl ? 'اشرح نتائجي' : 'Explain my results')
                : (isRtl ? 'اشرح لي هذه الأداة' : 'Explain this tool')}
      </button>
    </section>
  );
}
