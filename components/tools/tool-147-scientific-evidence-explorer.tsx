'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-147-scientific-evidence-explorer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import {
  PubMedSearchResponseSchema,
  type PubMedSearchResponse,
} from '@/lib/tools/schemas/tool-147-scientific-evidence-explorer';

export default function Tool147ScientificEvidenceExplorer() {
  const t = useToolI18n(i18nJson);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PubMedSearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState(false);

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || busy) return;
    setBusy(true);
    setRequestError(false);
    setResult(null);
    try {
      const response = await fetch('/api/smarttools/tool-147', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        cache: 'no-store',
      });
      const payload: unknown = await response.json();
      if ([200, 429, 503].includes(response.status)) {
        const parsed = PubMedSearchResponseSchema.safeParse(payload);
        if (parsed.success) {
          setResult(parsed.data);
          return;
        }
      }
      setRequestError(true);
    } catch {
      setRequestError(true);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResult(null);
    setRequestError(false);
  };

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{t.scope_note}</p>
      <p className="mb-5 rounded bg-zinc-100 p-3 text-sm">{t.ncbi_notice}</p>

      <form onSubmit={search} className="space-y-3">
        <label className="block text-sm font-medium">
          {t.query_label}
          <textarea value={query} onChange={(event) => setQuery(event.target.value)} maxLength={256} rows={3}
            className="mt-1 w-full rounded border p-3" required />
        </label>
        <p className="text-xs text-zinc-500">{t.query_privacy}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" disabled={busy || !query.trim()}
            className="rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-50">
            {busy ? t.searching : t.search}
          </button>
          <button type="button" onClick={clear} disabled={busy}
            className="rounded border px-4 py-3 font-medium disabled:opacity-50">{t.clear}</button>
        </div>
      </form>

      {requestError && <p role="alert" className="mt-5 rounded border border-red-300 p-3 text-sm">{t.request_error}</p>}

      {result?.status === 'RATE_LIMITED' && (
        <p role="status" className="mt-5 rounded border border-amber-300 p-3 text-sm">
          {t.rate_limited} ({result.retryAfter} {t.seconds})
        </p>
      )}
      {result?.status === 'NOT_AVAILABLE' && (
        <p role="alert" className="mt-5 rounded border border-red-300 p-3 text-sm">
          {result.reason === 'NCBI_LIMITER_UNAVAILABLE' ? t.limiter_unavailable : t.not_available}
          {result.retryAfter ? ` (${result.retryAfter} ${t.seconds})` : ''}
        </p>
      )}
      {result?.status === 'NO_RESULTS' && <p role="status" className="mt-5 rounded border p-3 text-sm">{t.no_results}</p>}
      {result?.status === 'PARTIAL' && <p role="status" className="mt-5 rounded border border-amber-300 p-3 text-sm">{t.partial_results} ({result.omittedRecords})</p>}

      {(result?.status === 'RESULTS' || result?.status === 'PARTIAL') && (
        <section aria-labelledby="tool-147-results-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-147-results-heading" className="font-semibold">{t.results}: {result.citations.length}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t.source_ncbi}</p>
          <ol className="mt-4 space-y-4">
            {result.citations.map((citation) => (
              <li key={citation.pmid} className="rounded bg-zinc-50 p-4">
                <h4 className="font-medium">
                  <a href={citation.pubmedUrl} target="_blank" rel="noreferrer" className="underline">{citation.title}</a>
                </h4>
                <p className="mt-2 text-sm text-zinc-700">{citation.authors.join(', ') || t.authors_unavailable}</p>
                <p className="mt-1 text-sm text-zinc-600">{citation.journal || t.journal_unavailable}{citation.publicationDate ? ` · ${citation.publicationDate}` : ''}</p>
                <p className="mt-1 text-xs text-zinc-500">PMID: {citation.pmid}{citation.doi ? ` · DOI: ${citation.doi}` : ''}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
