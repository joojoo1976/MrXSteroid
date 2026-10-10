/**
 * server/ai/contracts.ts — request/response contract for the SmartTools AI
 * explain service. Zod is the single source of truth: the HTTP boundary and
 * the runtime both validate against these schemas (fail-closed, SPEC §19).
 */
import { z } from 'zod';

export const AiFindingSchema = z.object({
  code: z.string().min(1).max(48),
  labelAr: z.string().max(96),
  labelEn: z.string().max(96),
  value: z.string().max(140),
  severity: z.string().max(24),
});

export const AiExplainRequestSchema = z.object({
  toolSlug: z.string().min(1).max(96),
  locale: z.enum(['ar', 'en']).default('en'),
  /** Optional user question — never required, never persisted. */
  question: z.string().max(600).optional(),
  /** Engine-derived context (buildAiContext output subset). The model is
   * forbidden from inventing values beyond this payload. */
  context: z
    .object({
      provenanceLine: z.string().max(600).optional(),
      findings: z.array(AiFindingSchema).max(16).optional(),
    })
    .optional(),
});

export type AiExplainRequest = z.infer<typeof AiExplainRequestSchema>;

export interface AiExplainResult {
  ok: boolean;
  /** 'model' = live provider answered; 'deterministic' = safe fallback. */
  source: 'model' | 'deterministic';
  explanation: string;
  disclaimer: string;
  locale: 'ar' | 'en';
}
