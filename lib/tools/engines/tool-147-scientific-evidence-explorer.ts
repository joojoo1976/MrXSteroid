import {
  PubMedSearchInputSchema,
  PubMedSearchResponseSchema,
  PubMedCitationSchema,
  type PubMedCitation,
  type PubMedSearchInput,
  type PubMedSearchResponse,
} from '../schemas/tool-147-scientific-evidence-explorer';
import { acquireNcbiEutilsPermit } from '@/lib/ncbi/eutils-rate-limit';

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_REQUIRED_EMAIL = 'support@mrxsteroid.com';
const NCBI_REQUIRED_TOOL = 'MrXSteroid_Tool147_v6';
const MAX_CITATIONS = 20;
const MAX_RESPONSE_BYTES = 1_000_000;
const REQUEST_TIMEOUT_MS = 8_000;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) throw new Error('NCBI_RESPONSE_TOO_LARGE');
  if (!response.body) return JSON.parse(await response.text()) as unknown;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('NCBI_RESPONSE_TOO_LARGE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown;
}

function parseCitation(pmid: string, raw: unknown): PubMedCitation | null {
  if (!isRecord(raw) || typeof raw.title !== 'string' || !raw.title.trim()) return null;
  const authorRows = Array.isArray(raw.authors) ? raw.authors : [];
  const authors = authorRows
    .flatMap((author) => isRecord(author) && typeof author.name === 'string' ? [author.name] : [])
    .slice(0, 100);
  const articleIds = Array.isArray(raw.articleids) ? raw.articleids : [];
  const doiRow = articleIds.find((item) => isRecord(item) && item.idtype === 'doi' && typeof item.value === 'string');
  const journal = typeof raw.fulljournalname === 'string' ? raw.fulljournalname
    : typeof raw.source === 'string' ? raw.source : null;
  const publicationDate = typeof raw.pubdate === 'string' ? raw.pubdate : null;
  const citation = {
    pmid,
    title: raw.title,
    authors,
    journal,
    publicationDate,
    doi: isRecord(doiRow) && typeof doiRow.value === 'string' ? doiRow.value : null,
    pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
  const parsed = PubMedCitationSchema.safeParse(citation);
  return parsed.success ? parsed.data : null;
}

function unavailable(reason: 'NCBI_CONFIGURATION_MISSING' | 'NCBI_UPSTREAM_UNAVAILABLE' | 'NCBI_RESPONSE_INVALID') {
  return PubMedSearchResponseSchema.parse({ status: 'NOT_AVAILABLE', reason }) as PubMedSearchResponse;
}

async function requestNcbi(url: URL, fetchImpl: typeof fetch): Promise<unknown | PubMedSearchResponse> {
  const permit = await acquireNcbiEutilsPermit();
  if (permit.status === 'RATE_LIMITED') {
    return PubMedSearchResponseSchema.parse({
      status: 'RATE_LIMITED',
      reason: 'NCBI_RATE_LIMIT_REACHED',
      retryAfter: permit.retryAfter,
    });
  }
  if (permit.status === 'NOT_AVAILABLE') {
    return PubMedSearchResponseSchema.parse({
      status: 'NOT_AVAILABLE',
      reason: 'NCBI_LIMITER_UNAVAILABLE',
      retryAfter: 60,
    });
  }

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) return unavailable('NCBI_UPSTREAM_UNAVAILABLE');
    return await readBoundedJson(response);
  } catch {
    return unavailable('NCBI_UPSTREAM_UNAVAILABLE');
  }
}

function isUnavailable(value: unknown): value is PubMedSearchResponse {
  return isRecord(value) && (value.status === 'NOT_AVAILABLE' || value.status === 'RATE_LIMITED');
}

/** Search PubMed and display only citation fields returned by NCBI. */
export async function searchPubMedV7(input: PubMedSearchInput, fetchImpl: typeof fetch = fetch): Promise<PubMedSearchResponse> { return searchPubMedWithIdentity(input, fetchImpl, NCBI_REQUIRED_TOOL); }

export async function searchPubMedWithIdentity(input: PubMedSearchInput, fetchImpl: typeof fetch = fetch, requiredTool: string): Promise<PubMedSearchResponse> {
  const validated = PubMedSearchInputSchema.parse(input);
  const email = process.env.NCBI_EMAIL?.trim();
  const tool = process.env.NCBI_TOOL?.trim();
  if (email !== NCBI_REQUIRED_EMAIL || tool !== requiredTool) return unavailable('NCBI_CONFIGURATION_MISSING');

  const common = new URLSearchParams({ tool, email, retmode: 'json' });
  const apiKey = process.env.NCBI_API_KEY?.trim();
  if (apiKey) common.set('api_key', apiKey);

  const searchUrl = new URL(`${NCBI_BASE_URL}/esearch.fcgi`);
  for (const [key, value] of common) searchUrl.searchParams.set(key, value);
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('term', validated.query);
  searchUrl.searchParams.set('retmax', String(MAX_CITATIONS));

  const searchPayload = await requestNcbi(searchUrl, fetchImpl);
  if (isUnavailable(searchPayload)) return searchPayload;
  if (!isRecord(searchPayload) || !isRecord(searchPayload.esearchresult) || !Array.isArray(searchPayload.esearchresult.idlist)) {
    return unavailable('NCBI_RESPONSE_INVALID');
  }
  const ids = [...new Set(searchPayload.esearchresult.idlist.filter((id): id is string => typeof id === 'string' && /^\d+$/.test(id)))].slice(0, MAX_CITATIONS);
  if (ids.length === 0) {
    return PubMedSearchResponseSchema.parse({ status: 'NO_RESULTS', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE', query: validated.query, citations: [] });
  }

  const summaryUrl = new URL(`${NCBI_BASE_URL}/esummary.fcgi`);
  for (const [key, value] of common) summaryUrl.searchParams.set(key, value);
  summaryUrl.searchParams.set('db', 'pubmed');
  summaryUrl.searchParams.set('id', ids.join(','));
  const summaryPayload = await requestNcbi(summaryUrl, fetchImpl);
  if (isUnavailable(summaryPayload)) return summaryPayload;
  if (!isRecord(summaryPayload)) return unavailable('NCBI_RESPONSE_INVALID');
  const summaryRecords = summaryPayload.result;
  if (!isRecord(summaryRecords)) return unavailable('NCBI_RESPONSE_INVALID');

  const citations = ids.flatMap((id) => {
    const parsed = parseCitation(id, summaryRecords[id]);
    return parsed ? [parsed] : [];
  });
  if (citations.length === 0) return unavailable('NCBI_RESPONSE_INVALID');
  if (citations.length !== ids.length) {
    return PubMedSearchResponseSchema.parse({
      status: 'PARTIAL', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE', query: validated.query,
      citations, omittedRecords: ids.length - citations.length,
    });
  }
  return PubMedSearchResponseSchema.parse({
    status: 'RESULTS', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE', query: validated.query, citations,
  });
}



