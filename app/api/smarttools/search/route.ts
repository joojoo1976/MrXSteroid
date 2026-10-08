import { NextResponse } from 'next/server';
import { searchTools } from '@/lib/tools/search';
import { toHierarchicalHref } from '@/lib/tools/categories';

// GET /api/smarttools/search?q=<ar|en text>&limit=<n>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20') || 20));

  const results = searchTools(q, limit).map((r) => ({
    ...r,
    href: toHierarchicalHref(r.slug) ?? r.href,
  }));

  return NextResponse.json({ query: q, count: results.length, results });
}
