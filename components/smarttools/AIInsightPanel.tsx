'use client';
/**
 * components/smarttools/AIInsightPanel.tsx — contextual AI explainer panel.
 *
 * Calls POST /api/smarttools/ai/explain (server-side, zod-validated). With no
 * live provider configured the endpoint answers deterministically and the
 * panel shows it explicitly ('deterministic' source badge) — the user is never
 * misled about who produced the text (SPEC §19: AI limitations stated).
 * Health-data privacy: by default NO computed results are sent — the panel
 * explains the tool itself; a parent can opt into passing engine findings.
 */
import React, { useState } from 'react';

interface Props {
  toolSlug: string;
  /** Optional engine-derived findings (buildAiContext subset) — opt-in only. */
  findings?: Array<{ code: string; labelAr: string; labelEn: string; value: string; severity: string }>;
  provenanceLine?: string;
}

type Source = 'model' | 'deterministic';

export default function AIInsightPanel({ toolSlug, findings, provenanceLine }: Props) {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [explanation, setExplanation] = useState('');
  const [source, setSource] = useState<Source | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const isRtl = locale === 'ar';

  const explain = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/smarttools/ai/explain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ toolSlug, locale, context: { provenanceLine, findings } }),
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
  };

  const toggle = (l: 'ar' | 'en') => {
    setLocale(l);
    if (state === 'done') void explain(); // re-ask in the new locale
  };

  return (
    <section
      className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5"
      aria-label={isRtl ? 'لوحة الذكاء الاصطناعي' : 'AI insight panel'}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-black text-zinc-900 dark:text-white">
          {isRtl ? '✨ مساعد تفسير النتائج (AI)' : '✨ AI Results Explainer'}
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => toggle('ar')} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${locale === 'ar' ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => toggle('en')} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${locale === 'en' ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>EN</button>
        </div>
      </div>

      {state === 'idle' && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          {isRtl
            ? 'شرح آمن مبني على نتائج المحرك فقط — لا اختراع أرقام ولا تشخيص. لا تُرسل بياناتك الصحية لأي طرف خارجي.'
            : 'A safe explainer grounded ONLY in engine values — no invented numbers, no diagnosis. Your health data is never sent to third parties.'}
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs font-bold text-red-500 mb-3">
          {isRtl ? 'تعذر إكمال الشرح الآن — حاول مرة أخرى.' : 'Could not complete the explanation — please try again.'}
        </p>
      )}
      {state === 'done' && (
        <div aria-live="polite">
          <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{explanation}</p>
          <p className="mt-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
            {source === 'model'
              ? isRtl ? 'المصدر: نموذج ذكاء اصطناعي (خاضع لقواعد صارمة)' : 'Source: AI model (strictly constrained)'
              : isRtl ? 'المصدر: شرح حتمي آمن (بدون نموذج خارجي)' : 'Source: safe deterministic explainer (no external model)'}
          </p>
          <p className="mt-1 text-[10px] text-red-500/90 dark:text-red-400/90">{disclaimer}</p>
        </div>
      )}

      <button
        type="button"
        onClick={explain}
        disabled={state === 'loading'}
        className="mt-3 px-4 py-2 text-xs font-bold rounded-lg bg-gold-500 hover:bg-gold-400 text-zinc-950 transition disabled:opacity-50"
      >
        {state === 'loading'
          ? (isRtl ? 'جاري التحضير...' : 'Preparing...')
          : state === 'done'
            ? (isRtl ? 'إعادة الشرح' : 'Re-explain')
            : (isRtl ? 'اشرح لي هذه الأداة' : 'Explain this tool')}
      </button>
    </section>
  );
}
