import { afterEach, describe, expect, it, vi } from 'vitest';

const searchMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/tools/engines/tool-249-evidence-explorer.v7', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/tools/engines/tool-249-evidence-explorer.v7')>(),
  searchEvidenceV7: searchMock,
}));

import { POST } from './route';

function makeRequest(body: string, headers?: HeadersInit) {
  return new Request('http://localhost/api/smarttools/tool-249', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

afterEach(() => searchMock.mockReset());

describe('Tool 249 API route boundary', () => {
  it('rejects oversized and malformed JSON before invoking PubMed search', async () => {
    const oversizedByHeader = await POST(makeRequest('{}', { 'content-length': '4097' }));
    const oversizedByBody = await POST(makeRequest(JSON.stringify({ query: 'x'.repeat(4100) })));
    const malformed = await POST(makeRequest('{invalid'));
    expect(oversizedByHeader.status).toBe(413);
    expect(oversizedByBody.status).toBe(413);
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
    await expect(response.json()).resolves.toMatchObject({ status: 'RATE_LIMITED' });
  });

  it('preserves fail-closed limiter retry metadata on HTTP 503', async () => {
    searchMock.mockResolvedValue({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
    const response = await POST(makeRequest(JSON.stringify({ query: 'exercise' })));
    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('60');
    await expect(response.json()).resolves.toMatchObject({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
  });

  it('returns the validated PubMed result with HTTP 200', async () => {
    searchMock.mockResolvedValue({ status: 'NO_RESULTS', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE', query: 'exercise', citations: [] });
    const response = await POST(makeRequest(JSON.stringify({ query: 'exercise' })));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'NO_RESULTS', source: 'NCBI_PUBMED' });
  });
});
