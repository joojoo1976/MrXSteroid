import { z } from 'zod';
import { PubMedSearchResponseSchema, type PubMedSearchResponse } from '../schemas/tool-147-scientific-evidence-explorer';
import { searchPubMedWithIdentity } from './tool-147-scientific-evidence-explorer';
export const EvidenceExplorerV7Schema = z.object({ query: z.string().trim().min(1).max(300) }).strict();
export type EvidenceExplorerV7Input = z.infer<typeof EvidenceExplorerV7Schema>;
export function recordEvidenceQuery(raw: unknown) { return { status: 'RECORDED' as const, resultType: 'USER_PROVIDED' as const, entry: EvidenceExplorerV7Schema.parse(raw), disclaimer: 'No retrieval occurs unless the configured V7 identity and fail-closed limiter are available.' }; }
export async function searchEvidenceV7(raw: EvidenceExplorerV7Input, fetchImpl: typeof fetch = fetch): Promise<PubMedSearchResponse> { const input = EvidenceExplorerV7Schema.parse(raw); return PubMedSearchResponseSchema.parse(await searchPubMedWithIdentity(input, fetchImpl, process.env.NCBI_TOOL_249?.trim() || 'MrXSteroid_Tool249_v7')); }

