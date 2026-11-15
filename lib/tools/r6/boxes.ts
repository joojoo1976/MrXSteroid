/**
 * lib/tools/r6/boxes.ts
 * Pure, client-safe C1–C12 content builder for the R6.1 shell.
 *
 * Only honest content is produced:
 * - static catalog/safety/explanation copy is labelled `static`
 * - capabilities that do not exist for the tool are `not_available`
 * - no engine result is invented here
 */
export type R6BoxSource = 'engine' | 'static' | 'not_available';

export interface R6Box {
  id: string;
  title: string;
  content: string;
  source: R6BoxSource;
}

export interface R6BoxInput {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  nextSlug: string | null;
  nextTitleEn: string | null;
  nextTitleAr: string | null;
}

function na(locale: 'ar' | 'en'): string {
  return locale === 'ar' ? 'غير متاح (NOT_AVAILABLE)' : 'NOT_AVAILABLE';
}

export function buildR6Boxes(entry: R6BoxInput, locale: 'ar' | 'en'): R6Box[] {
  const isAr = locale === 'ar';
  const title = isAr ? entry.titleAr : entry.titleEn;
  const description = isAr ? entry.descriptionAr : entry.descriptionEn;
  const nextTitle =
    (isAr ? entry.nextTitleAr : entry.nextTitleEn) ??
    entry.nextSlug ??
    null;

  const c1 = isAr
    ? 'هذه الأداة تعليمية وليست نصيحة طبية. راجع مختصاً مؤهلاً قبل أي قرار.'
    : 'This tool is educational and not medical advice. Consult a qualified professional before any decision.';

  const c2 = description?.trim()
    ? description
    : isAr
      ? 'أداة حسابية ضمن Mr. X-Steroid SmartTools.'
      : 'A calculation tool inside Mr. X-Steroid SmartTools.';

  const c7 = isAr
    ? 'للاستخدام التعليمي فقط. اقرأ تنبيه السلامة أعلى الصفحة ولا تستبدل به الرعاية المهنية.'
    : 'Educational use only. Read the safety notice above; it does not replace professional care.';

  const c9 = isAr
    ? `النتيجة تُحسب بواسطة محرك حتمي من المدخلات أعلاه. لا يوجد نموذج AI مخفي في هذه الأداة (${title}).`
    : `The result is computed by a deterministic engine from the inputs above. No hidden AI model is used by ${title}.`;

  const c10 = isAr
    ? 'تعتمد الدقة على صحة المدخلات. لا توجد فترة ثقة معايرة منشورة لهذه الأداة.'
    : 'Accuracy depends on the correctness of the inputs. No calibrated confidence interval is published for this tool.';

  const c12 = nextTitle
    ? isAr
      ? `الخطوة التالية: ${nextTitle}`
      : `Next step: ${nextTitle}`
    : na(locale);

  return [
    { id: 'C1', title: 'Medical Advice', content: c1, source: 'static' },
    { id: 'C2', title: 'General Advice', content: c2, source: 'static' },
    { id: 'C3', title: 'Current Feeling', content: na(locale), source: 'not_available' },
    { id: 'C4', title: 'Predictions', content: na(locale), source: 'not_available' },
    { id: 'C5', title: 'AI Coach', content: na(locale), source: 'not_available' },
    { id: 'C6', title: 'Top-3 Reasoning', content: na(locale), source: 'not_available' },
    { id: 'C7', title: 'Safety & Warnings', content: c7, source: 'static' },
    { id: 'C8', title: 'What-If', content: na(locale), source: 'not_available' },
    { id: 'C9', title: 'Explainable AI', content: c9, source: 'static' },
    { id: 'C10', title: 'Uncertainty', content: c10, source: 'static' },
    { id: 'C11', title: 'Alternative Paths', content: na(locale), source: 'not_available' },
    { id: 'C12', title: 'Next Step / Cross-Tool', content: c12, source: nextTitle ? 'static' : 'not_available' },
  ];
}
