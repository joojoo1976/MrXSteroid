import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const permitMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ncbi/eutils-rate-limit', () => ({ acquireNcbiEutilsPermit: permitMock }));

import { searchPubMedV7 } from './tool-147-scientific-evidence-explorer';
import { getPublishedCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { getCategoryOfSlug } from '@/lib/tools/categories';
import { getToolComponent } from '@/lib/tools/loaders';

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
}

describe('Tool 147 PubMed citation search', () => {
  it('resolves the legacy Tool 146 slug through the generic SmartTools loader', async () => {
    await expect(getToolComponent('tool-146-ai-safety-gate-emergency-protocol')).resolves.toBeTypeOf('function');
  });

  it('publishes the unchanged app identity on its hierarchical platform-ai route', () => {
    const tool = getPublishedCatalogTools().find((entry) => entry.slug === 'tool-147-scientific-evidence-explorer');
    expect(tool).toMatchObject({
      toolId: 'mrx.tool.147-scientific-evidence-explorer',
      href: '/smarttools/platform-ai/tool-147-scientific-evidence-explorer',
    });
    expect(getCategoryOfSlug('tool-147-scientific-evidence-explorer')).toBe('platform-ai');
  });

  it('resolves the published component through the SmartTools loader', async () => {
    await expect(getToolComponent('tool-147-scientific-evidence-explorer')).resolves.toBeTypeOf('function');
  });

  beforeEach(() => {
    process.env.NCBI_EMAIL = 'support@mrxsteroid.com';
    process.env.NCBI_TOOL = 'MrXSteroid_Tool147_v6';
    delete process.env.NCBI_API_KEY;
    permitMock.mockReset();
    permitMock.mockResolvedValue({ status: 'ALLOWED' });
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it('does not call NCBI if the global limiter is unavailable', async () => {
    permitMock.mockResolvedValue({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
    const fetchMock = vi.fn();
    await expect(searchPubMedV7({ query: 'exercise' }, fetchMock as typeof fetch)).resolves.toEqual({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed when the required NCBI contact identity is missing or altered', async () => {
    process.env.NCBI_EMAIL = 'someone@example.com';
    const fetchMock = vi.fn();
    await expect(searchPubMedV7({ query: 'exercise' }, fetchMock as typeof fetch)).resolves.toMatchObject({
      status: 'NOT_AVAILABLE', reason: 'NCBI_CONFIGURATION_MISSING',
    });
    expect(permitMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns RATE_LIMITED without an upstream call when the global limit is exceeded', async () => {
    permitMock.mockResolvedValue({ status: 'RATE_LIMITED', retryAfter: 1 });
    const fetchMock = vi.fn();
    await expect(searchPubMedV7({ query: 'exercise' }, fetchMock as typeof fetch)).resolves.toEqual({ status: 'RATE_LIMITED', reason: 'NCBI_RATE_LIMIT_REACHED', retryAfter: 1 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('limits each NCBI call and returns only citation metadata supplied by NCBI', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ esearchresult: { idlist: ['12345'] } }))
      .mockResolvedValueOnce(jsonResponse({ result: { '12345': {
        title: 'A returned title', authors: [{ name: 'A. Author' }], fulljournalname: 'Example Journal',
        pubdate: '2025', articleids: [{ idtype: 'doi', value: '10.1234/example' }],
      } } }));
    const result = await searchPubMedV7({ query: 'exercise and recovery' }, fetchMock as typeof fetch);
    expect(result).toMatchObject({ status: 'RESULTS', source: 'NCBI_PUBMED', resultOrigin: 'EXTERNAL_SOURCE' });
    expect(result.status === 'RESULTS' && result.citations[0]).toMatchObject({ pmid: '12345', title: 'A returned title', authors: ['A. Author'], doi: '10.1234/example' });
    expect(permitMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(firstUrl.searchParams.get('email')).toBe('support@mrxsteroid.com');
    expect(firstUrl.searchParams.get('tool')).toBe('MrXSteroid_Tool147_v6');
    expect(firstUrl.searchParams.get('term')).toBe('exercise and recovery');
    expect(firstUrl.searchParams.has('api_key')).toBe(false);
  });

  it('uses an optional server-side API key in both E-utilities requests', async () => {
    process.env.NCBI_API_KEY = 'server-test-key';
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ esearchresult: { idlist: ['12345'] } }))
      .mockResolvedValueOnce(jsonResponse({ result: { '12345': { title: 'Title', authors: [] } } }));
    await searchPubMedV7({ query: 'exercise' }, fetchMock as typeof fetch);
    for (const call of fetchMock.mock.calls) expect(new URL(String(call[0])).searchParams.get('api_key')).toBe('server-test-key');
  });

  it('stops before ESummary if the second global permit is denied', async () => {
    permitMock.mockResolvedValueOnce({ status: 'ALLOWED' }).mockResolvedValueOnce({ status: 'RATE_LIMITED', retryAfter: 1 });
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ esearchresult: { idlist: ['12345'] } }));
    await expect(searchPubMedV7({ query: 'exercise' }, fetchMock as typeof fetch)).resolves.toMatchObject({ status: 'RATE_LIMITED', retryAfter: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed queries before rate-limit or network access', async () => {
    const fetchMock = vi.fn();
    await expect(searchPubMedV7({ query: '  ' }, fetchMock as typeof fetch)).rejects.toThrow();
    expect(permitMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
