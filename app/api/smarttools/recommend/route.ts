/**
 * app/api/smarttools/recommend/route.ts — grounded recommendations (SPEC §10, §11).
 * Public, rate-limited, catalogue-only (never invents tools).
 */
import { NextResponse } from 'next/server';
import { clientIp, enforceRateLimit } from '@/lib/ratelimit';
import { recommendTools } from '@/lib/ai/recommend';
import { toHierarchicalHref } from '@/lib/tools/categories';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limit = await enforceRateLimit(`ai-recommend:${clientIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').slice(0, 300);
  const n = Math.min(10, Math.max(1, Number(searchParams.get('limit') ?? '5') || 5));

  const results = recommendTools(q, n).map((r) => ({
    ...r,
    href: toHierarchicalHref(r.slug) ?? r.href,
  }));

  return NextResponse.json({ query: q, count: results.length, results });
}
