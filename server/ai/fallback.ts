/**
 * server/ai/fallback.ts — deterministic explainer (no model, no network).
 *
 * Builds a bilingual explanation STRICTLY from the values the engine already
 * produced (findings + provenance) plus generic safety guidance. It never
 * invents numbers, cites studies, or diagnoses. This is the guaranteed
 * service level: AI features degrade to this, calculators never break.
 */
export interface FallbackToolInfo {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

const SEVERITY_NOTE_AR: Record<string, string> = {
  info: 'قيمة معلوماتية.',
  monitor: 'قيمة تستحق المتابعة الدورية.',
  important: 'قيمة مهمة — راجعها مع مختص.',
};

const SEVERITY_NOTE_EN: Record<string, string> = {
  info: 'Informational value.',
  monitor: 'Value worth periodic follow-up.',
  important: 'Important value — review with a qualified clinician.',
};

/** Max numeric tokens the deterministic text may contain when no findings are
 * supplied (generic guidance only). Guarded by a test. */
export function deterministicExplanation(input: {
  locale: 'ar' | 'en';
  tool: FallbackToolInfo;
  findings?: Array<{ labelAr: string; labelEn: string; value: string; severity: string }>;
  provenanceLine?: string;
  question?: string;
}): string {
  const { locale, tool, findings = [], provenanceLine, question } = input;
  const ar = locale === 'ar';
  const title = ar ? tool.titleAr : tool.titleEn;
  const description = ar ? tool.descriptionAr : tool.descriptionEn;

  const lines: string[] = [];
  lines.push(ar ? `هذه أداة «${title}»: ${description}.` : `This is the "${title}" tool: ${description}.`);

  if (findings.length > 0) {
    lines.push(
      ar ? 'قراءة نتائجك (كما حسبها المحرك حتميًا):' : 'Reading your results (as deterministically computed by the engine):',
    );
    for (const f of findings) {
      const label = ar ? f.labelAr : f.labelEn;
      const note = (ar ? SEVERITY_NOTE_AR : SEVERITY_NOTE_EN)[f.severity] ?? (ar ? SEVERITY_NOTE_AR.info : SEVERITY_NOTE_EN.info);
      lines.push(ar ? `- ${label}: ${f.value} — ${note}` : `- ${label}: ${f.value} — ${note}`);
    }
    if (provenanceLine) {
      lines.push(ar ? `مصدر البيانات: ${provenanceLine}.` : `Data provenance: ${provenanceLine}.`);
    }
  } else {
    lines.push(
      ar
        ? 'لم تُرسل نتائج محسوبة في هذا الطلب، لذا هذه خلاصة عامة عن كيفية استخدام الأداة: أدخل قيمك الفعلية، وسيحسب المحرك النتائج محليًا فورًا، ثم يمكن إعادة هذه الشرح مع النتائج لتفسيرها قيمةً بقيمة.'
        : 'No computed results were attached to this request, so this is general usage guidance: enter your actual inputs, the engine computes results locally and instantly, then this explainer can be re-run with the results to walk through them value by value.',
    );
  }

  if (question) {
    lines.push(
      ar
        ? 'بخصوص سؤالك: لا يجوز لهذه الخدمة الحتمية تقديم تشخيص أو جرعات جديدة؛ اعتبر مخرجات الأداة نفسها المرجع الحسابي.'
        : 'Regarding your question: this deterministic service must not diagnose or suggest new doses; treat the tool output itself as the computational reference.',
    );
  }

  lines.push(
    ar
      ? 'وضع التشغيل: شرح حتمي آمن (بدون مزود ذكاء اصطناعي نشط حاليًا).'
      : 'Operating mode: safe deterministic explainer (no live AI provider configured).',
  );

  return lines.join(' ');
}
