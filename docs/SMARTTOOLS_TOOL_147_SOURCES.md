# SmartTools Tool 147 — Source and Service Notes

## Scope

Tool 147 searches PubMed through NCBI E-utilities and renders citation metadata returned by NCBI. It does not summarize study findings, grade evidence or study quality, or give health, training, nutrition, or medication recommendations. It does not synthesize, invent, or complete citations. Search text is submitted to NCBI only when the visitor submits the form; the application does not persist search history.

## Identity and request parameters

- Application identity remains `mrx.tool.147-scientific-evidence-explorer`, slug `tool-147-scientific-evidence-explorer`, and canonical route `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`.
- This implementation does not map, merge, alias, or redirect to V7 identity #249. Existing app identities and routes remain distinct.
- E-utilities requests use `email=support@mrxsteroid.com` and `tool=MrXSteroid_Tool147_v6` from server environment variables. A missing value makes the service unavailable instead of sending an unidentified request.
- `NCBI_API_KEY` is optional and read only by the server engine. It must never be exposed to client code or returned in API responses.
- Search uses ESearch (`db=pubmed`, `retmode=json`, `retmax=20`) followed by ESummary for the returned IDs. The query is trimmed, required, limited to 256 characters, and control characters are rejected.

## Shared request limiting

Every E-utilities fetch obtains a permit from Upstash Redis using the same key `global:ncbi:eutils`. An atomic Redis script uses Redis server time and a sorted set to enforce an exact rolling 1,000 ms window of at most three calls, shared across application instances using the existing Upstash REST URL and token. The limit applies separately to ESearch and ESummary. No in-memory fallback or per-instance limiter is used.

If the limiter is not configured, cannot be constructed, or cannot verify a decision, no E-utilities fetch is made. The engine returns `NOT_AVAILABLE`, reason `NCBI_LIMITER_UNAVAILABLE`, and `retryAfter: 60`. A verified limit denial returns `RATE_LIMITED` with `retryAfter`.

## Returned data and failure handling

Displayed fields are only those present in NCBI ESummary: PMID, title, author names, journal, publication date, DOI, and a canonical PubMed record URL. Results are capped at 20. Requests have an eight-second timeout and response bodies are bounded to 1 MB. Invalid, oversized, incomplete, or unavailable upstream responses do not produce generated citations.

## Sources

- NCBI E-utilities documentation: <https://www.ncbi.nlm.nih.gov/books/NBK25501/>
- NCBI E-utilities usage guidance: <https://www.ncbi.nlm.nih.gov/books/NBK25497/>
- PubMed: <https://pubmed.ncbi.nlm.nih.gov/>
- Upstash rate-limit algorithms: <https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms>

NCBI may update its services and usage guidance. Recheck official documentation when changing parameters or request volume. The result set is a search result, not a complete literature review.
