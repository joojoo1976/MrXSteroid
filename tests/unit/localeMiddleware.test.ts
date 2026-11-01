import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function forwardMiddlewareRequestHeaders(response: Response): Headers {
  const names = response.headers.get('x-middleware-override-headers')
    ?.split(',')
    .map((name) => name.trim())
    .filter(Boolean) ?? [];
  const headers = new Headers();
  for (const name of names) {
    const value = response.headers.get(`x-middleware-request-${name}`);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

describe('locale middleware rewrite continuity', () => {
  it('preserves an explicit /ar prefix across the rewritten request', () => {
    const original = new NextRequest('https://example.test/ar/smarttools/body-composition/tool-149-physique-trajectory-simulator', {
      headers: { 'accept-language': 'en-US,en;q=0.9' },
    });
    const firstPass = middleware(original);
    const secondPassHeaders = forwardMiddlewareRequestHeaders(firstPass);
    const rewritten = new NextRequest('https://example.test/smarttools/body-composition/tool-149-physique-trajectory-simulator', {
      headers: secondPassHeaders,
    });

    const secondPass = middleware(rewritten);

    expect(secondPass.headers.get('x-middleware-request-x-locale')).toBe('ar');
    expect(secondPass.cookies.get('mrx_locale')?.value).toBe('ar');
  });
});
