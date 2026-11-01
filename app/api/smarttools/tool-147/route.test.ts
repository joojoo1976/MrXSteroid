import { afterEach, describe, expect, it, vi } from 'vitest';

const searchMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/tools/engines/tool-147-scientific-evidence-explorer', () => ({ searchPubMedV7: searchMock }));

import { POST } from './route';

function makeRequest(body: string, headers?: HeadersInit) {
  return new Request('http://localhost/api/smarttools/tool-147', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

afterEach(() => {
  searchMock.mockReset();
});

describe('Tool 147 API route boundary', () => {
  it('rejects oversized and malformed JSON before invoking NCBI search', async () => {
    const oversized = await POST(makeRequest('{}', { 'content-length': '4097' }));
    expect(oversized.status).toBe(413);
    const malformed = await POST(makeRequest('{invalid'));
    expect(malformed.status).toBe(400);
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid query fields before invoking the engine', async () => {
    const response = await POST(makeRequest(JSON.stringify({ query: '   ', extra: true })));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'INVALID_QUERY' });
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('maps RATE_LIMITED to HTTP 429 with Retry-After', async () => {
    searchMock.mockResolvedValue({ status: 'RATE_LIMITED', reason: 'NCBI_RATE_LIMIT_REACHED', retryAfter: 2 });
    const response = await POST(makeRequest(JSON.stringify({ query: 'exercise' })));
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('2');
    await expect(response.json()).resolves.toMatchObject({ status: 'RATE_LIMITED', reason: 'NCBI_RATE_LIMIT_REACHED' });
  });

  it('maps fail-closed limiter unavailability to HTTP 503 with a 60 second retry', async () => {
    searchMock.mockResolvedValue({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
    const response = await POST(makeRequest(JSON.stringify({ query: 'exercise' })));
    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('60');
    await expect(response.json()).resolves.toMatchObject({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
  });

  it('returns validated citations with HTTP 200', async () => {
    searchMock.mockResolvedValue({
      status: 'RESULTS', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE', query: 'exercise',
      citations: [{
        pmid: '123', title: 'Study', authors: ['Author'], journal: 'Journal', publicationDate: null,
        doi: null, pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/123/',
      }],
    });
    const response = await POST(makeRequest(JSON.stringify({ query: 'exercise' })));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'RESULTS', source: 'NCBI_PUBMED', citations: [{ pmid: '123' }] });
  });
});
