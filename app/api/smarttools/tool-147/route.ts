import { NextResponse } from 'next/server';
import { searchPubMedV7 } from '@/lib/tools/engines/tool-147-scientific-evidence-explorer';
import {
  PubMedSearchInputSchema,
  PubMedSearchResponseSchema,
} from '@/lib/tools/schemas/tool-147-scientific-evidence-explorer';

const MAX_REQUEST_BYTES = 4096;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: 'REQUEST_TOO_LARGE' }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'REQUEST_TOO_LARGE' }, { status: 413 });
    }
    body = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = PubMedSearchInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_QUERY' }, { status: 400 });
  }

  const result = PubMedSearchResponseSchema.parse(await searchPubMedV7(parsed.data));
  if (result.status === 'RATE_LIMITED') {
    return NextResponse.json(result, { status: 429, headers: { 'Retry-After': String(result.retryAfter) } });
  }
  if (result.status === 'NOT_AVAILABLE') {
    const headers = result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : undefined;
    return NextResponse.json(result, { status: 503, headers });
  }
  return NextResponse.json(result, { status: 200 });
}
