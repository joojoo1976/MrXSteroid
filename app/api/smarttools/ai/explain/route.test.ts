/**
 * Integration tests for POST/GET /api/smarttools/ai/explain.
 * The network is never touched: with no OPENAI_API_KEY the route must serve
 * the deterministic fallback (fail-open service level), and provider failures
 * must degrade — not break — the endpoint.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from './route';

const req = (body: unknown) =>
  new Request('http://localhost/api/smarttools/ai/explain', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const VALID = {
  toolSlug: 'tool-037-side-effect-probability',
  locale: 'ar',
  context: {
    provenanceLine: 'source: manual · quality: medium',
    findings: [
      { code: 'OVERALL_BURDEN', labelAr: 'العبء العام', labelEn: 'Overall Burden', value: '42%', severity: 'info' },
    ],
  },
};

describe('/api/smarttools/ai/explain', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = '';
  });

  it('GET reports capability without leaking credentials', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(typeof json.configured).toBe('boolean');
    expect(JSON.stringify(json)).not.toContain('sk-');
  });

  it('200 deterministic fallback when no provider is configured', async () => {
    const res = await POST(req(VALID));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.source).toBe('deterministic');
    expect(json.explanation).toContain('42%');
    expect(json.disclaimer.length).toBeGreaterThan(20);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(req({ toolSlug: 123 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('400 on malformed JSON', async () => {
    const res = await POST(req('{not json'));
    expect(res.status).toBe(400);
  });

  it('404 for unknown tool slug', async () => {
    const res = await POST(req({ ...VALID, toolSlug: 'does-not-exist' }));
    expect(res.status).toBe(404);
  });

  it('404 for PLANNED roadmap tools (never explainable before launch)', async () => {
    const res = await POST(req({ ...VALID, toolSlug: 'tool-041-hematocrit-monitor' }));
    expect(res.status).toBe(404);
  });
});
