/**
 * components/tools/SafetyNotice.tsx
 * Affiche un avertissement de sécurité bilingue AR/EN avant chaque outil.
 * (SPEC §1.6 — safety-first : pas de diagnostic, renvoi médical, urgence.)
 */
'use client';

import type { SmartToolCategory } from '@/lib/tools/categories';

const HIGH_RISK: ReadonlySet<SmartToolCategory> = new Set([
  'hormonal-health',
  'medical-monitoring',
  'injection-formulation',
  'reproductive-wellbeing',
]);

export function SafetyNotice({ category }: { category: SmartToolCategory }) {
  const strong = HIGH_RISK.has(category);
  return (
    <div
      role="note"
      className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
    >
      <p className="font-bold" dir="rtl">
        تنبيه تعليمي: هذه الأداة لأغراض التثقيف وتقليل الضرر فقط — وليست تشخيصاً أو وصفة طبية. راجع مختصاً مؤهلاً قبل أي قرار.
      </p>
      <p className="mt-1" dir="ltr">
        Educational use only — not a diagnosis or prescription. Consult a qualified clinician before acting
        {strong ? ', especially on hormonal, medical or injection-related findings' : ''}.
      </p>
    </div>
  );
}

export default SafetyNotice;
