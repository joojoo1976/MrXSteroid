import { z } from 'zod';

export const PubMedSearchInputSchema = z.object({
  query: z.string().trim().min(1).max(256).refine(
    (value) => [...value].every((character) => {
      const code = character.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    }),
    'Control characters are not allowed.',
  ),
}).strict();

export const PubMedCitationSchema = z.object({
  pmid: z.string().regex(/^\d+$/),
  title: z.string().min(1).max(4000),
  authors: z.array(z.string().max(300)).max(100),
  journal: z.string().max(1000).nullable(),
  publicationDate: z.string().max(120).nullable(),
  doi: z.string().max(300).nullable(),
  pubmedUrl: z.string().url(),
}).strict();

export const PubMedSearchResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('RESULTS'), source: z.literal('NCBI_PUBMED'), resultOrigin: z.literal('EXTERNAL_SOURCE'), query: z.string(), citations: z.array(PubMedCitationSchema).min(1).max(20) }).strict(),
  z.object({ status: z.literal('PARTIAL'), source: z.literal('NCBI_PUBMED'), resultOrigin: z.literal('EXTERNAL_SOURCE'), query: z.string(), citations: z.array(PubMedCitationSchema).min(1).max(20), omittedRecords: z.number().int().positive() }).strict(),
  z.object({ status: z.literal('NO_RESULTS'), source: z.literal('NCBI_PUBMED'), resultOrigin: z.literal('EXTERNAL_SOURCE'), query: z.string(), citations: z.array(PubMedCitationSchema).length(0) }).strict(),
  z.object({ status: z.literal('RATE_LIMITED'), reason: z.literal('NCBI_RATE_LIMIT_REACHED'), retryAfter: z.number().int().positive() }).strict(),
  z.object({ status: z.literal('NOT_AVAILABLE'), reason: z.enum(['NCBI_LIMITER_UNAVAILABLE', 'NCBI_CONFIGURATION_MISSING', 'NCBI_UPSTREAM_UNAVAILABLE', 'NCBI_RESPONSE_INVALID']), retryAfter: z.number().int().positive().optional() }).strict(),
]);

export type PubMedSearchInput = z.infer<typeof PubMedSearchInputSchema>;
export type PubMedCitation = z.infer<typeof PubMedCitationSchema>;
export type PubMedSearchResponse = z.infer<typeof PubMedSearchResponseSchema>;
