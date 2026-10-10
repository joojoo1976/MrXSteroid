/**
 * server/ai/explain.ts — SmartTools AI explain runtime (server-only).
 *
 * Contract (SPEC §19 AI governance + user directive §11):
 *  - Only PUBLISHED tools are explainable (planned roadmap entries 404).
 *  - The prompt embeds ONLY engine-derived values; the model is instructed to
 *    never invent numbers, diagnoses, citations or doses.
 *  - Any provider failure degrades to the deterministic explainer — the
 *    calculators and this endpoint never depend on the model being up.
 *  - Nothing about the caller's health inputs is persisted or logged here.
 */
import { getPublishedCatalogTools } from '../../lib/tools/smartToolsCatalog4';
import type { AiExplainRequest, AiExplainResult } from './contracts';
import { deterministicExplanation } from './fallback';
import { createAiProviderFromEnv, type AiProvider } from './provider';

export class AiExplainError extends Error {
  constructor(readonly code: 'TOOL_NOT_FOUND') {
    super(code);
    this.name = 'AiExplainError';
  }
}

const DISCLAIMER_AR = 'تعليمي فقط وليس تشخيصًا أو وصفة طبية — القرار النهائي لمختص مؤهل، وفي الحالات العاجلة اتصل بخدمات الطوارئ المحلية.';
const DISCLAIMER_EN = 'Informational only — not medical advice, diagnosis or a prescription. For urgent situations contact local emergency services or a qualified clinician.';

function buildSystemPrompt(locale: 'ar' | 'en'): string {
  const ar = locale === 'ar';
  return [
    ar
      ? 'أنت مساعد تفسير لأدوات SmartTools. استخدم القيم المزوّدة فقط؛ يُمنع اختلاق أرقام أو مراجع أو تشخيصات أو جرعات جديدة. اكتب بالعربية الفصحى المبسطة في 120-220 كلمة نصًا عاديًا، واجعل كل تفسير مرتبطًا بالقيم المعطاة.'
      : 'You explain SmartTools engine output. Use ONLY the provided values; never invent numbers, citations, diagnoses or doses. Answer in English, 120-220 words, plain text, with each statement traceable to the provided values.',
    'Safety: for urgent/red-flag symptoms always direct to local emergency services or a qualified clinician. Never replace emergency care. Never fabricate scientific claims beyond the provided context.',
  ].join(' ');
}

function buildUserPrompt(req: AiExplainRequest, tool: { titleAr: string; titleEn: string; bookContext?: { chapterAr: string; chapterEn: string; topicAr: string; topicEn: string } }): string {
  const ar = req.locale === 'ar';
  const parts: string[] = [];
  parts.push((ar ? 'الأداة: ' : 'Tool: ') + (ar ? tool.titleAr : tool.titleEn));
  if (tool.bookContext) {
    const chapter = ar ? tool.bookContext.chapterAr : tool.bookContext.chapterEn;
    const topic = ar ? tool.bookContext.topicAr : tool.bookContext.topicEn;
    if (chapter && topic) parts.push((ar ? 'مرجع الكتاب السياقي: ' : 'Book reference: ') + `${chapter} — ${topic}`);
  }
  if (req.context?.provenanceLine) parts.push((ar ? 'مصدر البيانات: ' : 'Data provenance: ') + req.context.provenanceLine);
  for (const f of req.context?.findings ?? []) {
    parts.push((ar ? 'نتيجة' : 'Finding') + ` [${f.code}] ${ar ? f.labelAr : f.labelEn} = ${f.value} (${f.severity})`);
  }
  if (req.question) parts.push((ar ? 'سؤال المستخدم: ' : 'User question: ') + req.question);
  parts.push(ar ? 'اشرح النتائج أعلاه قيمةً بقيمة دون أي أرقام جديدة.' : 'Explain the provided values only; do not invent any numbers.');
  return parts.join('\n');
}

export async function explainRequest(
  req: AiExplainRequest,
  deps?: { provider?: AiProvider | null },
): Promise<AiExplainResult> {
  const tool = getPublishedCatalogTools().find((t) => t.slug === req.toolSlug);
  if (!tool) throw new AiExplainError('TOOL_NOT_FOUND');

  const ar = req.locale === 'ar';
  const provider = deps?.provider !== undefined ? deps.provider : createAiProviderFromEnv();
  const toolInfo = {
    titleAr: tool.titleAr,
    titleEn: tool.titleEn,
    descriptionAr: tool.descriptionAr,
    descriptionEn: tool.descriptionEn,
  };

  if (provider) {
    try {
      const explanation = await provider.complete(buildSystemPrompt(req.locale), buildUserPrompt(req, tool));
      return { ok: true, source: 'model', explanation, disclaimer: ar ? DISCLAIMER_AR : DISCLAIMER_EN, locale: req.locale };
    } catch (e) {
      // Never surface provider internals; degrade gracefully (no sensitive logging).
      console.warn('[ai-explain] provider unavailable, deterministic fallback used:', e instanceof Error ? e.message : e);
    }
  }

  return {
    ok: true,
    source: 'deterministic',
    explanation: deterministicExplanation({
      locale: req.locale,
      tool: toolInfo,
      findings: req.context?.findings,
      provenanceLine: req.context?.provenanceLine,
      question: req.question,
    }),
    disclaimer: ar ? DISCLAIMER_AR : DISCLAIMER_EN,
    locale: req.locale,
  };
}
