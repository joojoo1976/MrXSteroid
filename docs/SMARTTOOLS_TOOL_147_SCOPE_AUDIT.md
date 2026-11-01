# SmartTool 147 — Scope and Readiness Audit

**Audit date:** 2026-10-25 (Africa/Cairo)  
**Repository snapshot:** `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`  
**Audit type:** read-only source review; no tool implementation, API request, database access, or route mutation.  
**Status:** `NOT READY TO IMPLEMENT` — user-level feature boundaries are known, but an NCBI developer contact email/configuration and deploy-safe request-throttling policy have not been evidenced.

## 1. Current identity and implementation state

| Item | Checked-out evidence | Finding |
|---|---|---|
| Application identity | `lib/tools/smartToolsCatalog10.ts:33` | Tool ID `mrx.tool.147-scientific-evidence-explorer`, slug `tool-147-scientific-evidence-explorer`, flat catalog href `/smarttools/tool-147-scientific-evidence-explorer`; status is `planned`. Preserve this identity and route. |
| Category | `lib/tools/categories.ts:222` | `platform-ai`. |
| Declared implementation paths | Catalog row at `lib/tools/smartToolsCatalog10.ts:33` | Component, engine, and schema paths are declared but absent in the checked-out tree. |
| Public route behavior | `app/smarttools/[category]/[tool]/page.tsx:10-11,22,42-61`; `lib/tools/smartToolsCatalog4.ts:55-61` | Static parameters and page lookup use `getPublishedCatalogTools()`, which filters `planned`; the dynamic page calls `notFound()` for a missing published entry. Tool 147 is not a published/usable tool today. The flat catalog href is not proof that its page resolves. |
| V7 identity candidate | `lib/engines/core/v6/tools.registry.v7.252.ts:268`; `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv` | App #147 ↔ V7 #249 `scientific-evidence-explorer` is `POSSIBLE_CONCEPTUAL_MATCH`, not a verified alias. Keep the current app ID/slug/route; owner identity review remains needed before any relabeling. |
| Existing query integration | Search across `app`, `components`, `lib`, `server`, and `package.json` | No Tool 147 implementation or NCBI E-utilities client was located. Existing unrelated PubMed citation links do not establish an API integration. |
| Developer contact configuration | Environment variable-name inspection for `NCBI`/`EUTILS` | No matching variable names were configured in the current process, and no existing project configuration contract was located. No environment values were read or exposed. |

## 2. User-approved functional boundary to carry forward

The intended tool is a literature citation finder using PubMed through NCBI E-utilities. It may retrieve and display citations that NCBI actually returns. It must not generate references, summarize study conclusions, assign evidence-quality scores, rank evidence, or produce clinical/training/nutrition/medication recommendations. An empty result or an external-service error must remain explicit; the UI must not fill gaps with generated citations or claims.

The app #147 / V7 #249 resemblance is conceptual only. No identity or route change is part of this work.

## 3. External source and proposed request contract

The primary source is PubMed via official NCBI E-utilities. NCBI's current reference says requests should include `tool` and a valid developer `email`; its usage policy recommends no more than three URL requests per second per IP and describes registration/contact expectations when usage policy violations lead to blocking. [E-utilities parameter reference](https://www.ncbi.nlm.nih.gov/books/NBK25499/), [NCBI E-utilities usage policy](https://www.ncbi.nlm.nih.gov/books/NBK25497/).

Proposed initial, intentionally narrow contract for owner review:

- User submits one explicit PubMed search query; no background search or personal-profile query.
- Server-side validation caps the query length (suggested 256 Unicode characters), rejects blank/control-character input, and caps returned citations (suggested 20). These are product limits, not NCBI limits, and should be adjusted only with a documented need.
- Use ESearch for matching PubMed IDs and ESummary for citation metadata. Display only returned PMID, title, author names as returned, journal/source, publication date/year, DOI when supplied, and canonical PubMed URL. Do not synthesize missing fields.
- Suggested error states: `PARTIAL` for incomplete query configuration; `NOT_AVAILABLE` for absent results, timeouts, 429/5xx, malformed upstream data, or missing required citation identifiers; validation errors for malformed input. Preserve a concise reason and never silently fall back to fabricated data.
- Apply request timeout, cancellation, strict response-size bounds, URL-encoded parameters, and defensive parsing. Search only after explicit submit; do not send query text to a model provider.
- Enforce NCBI's request policy. The app would make multiple E-utility requests for a single search, so per-process throttling alone cannot prove a global limit on a horizontally scaled deployment. Before implementation, identify an existing shared rate limiter/cache or approve a single-instance/other deployment constraint. Do not claim a globally enforced rate limit without such evidence.
- Do not accept or persist an end user's email as the NCBI developer contact. The `email` parameter must be the developer/organization contact specified by NCBI; pass it from server-only configuration, never expose it as a browser field.

## 4. Explicit non-goals

- No AI/LLM summarization, evidence grading, certainty score, medical advice, or recommendation.
- No citation generation, metadata completion, or invented DOI/author/journal.
- No user history, saved searches, persistent memory, cross-tool data, database writes, or tracking of query text.
- No abstract/full-text storage or proxying unless a separate scope and rights review authorizes it.
- No edits to the current application identity, route, V7 registry, or other tools.

## 5. Readiness blockers and required evidence

1. Owner confirms the app #147 ↔ V7 #249 conceptual match or provides an identity decision. Until then, preserve app #147's existing identity and route and do not label it `VERIFIED_ALIAS`.
2. Provide/approve the developer or organization contact email for server-only NCBI configuration. Keep secrets/configuration values out of source control and UI.
3. Document the deployment's shared rate-limit/caching mechanism or approve a deploy constraint that makes the NCBI per-IP request ceiling enforceable. A local in-memory limiter by itself is insufficient proof for multiple instances.
4. After these prerequisites, implementation should add mocked E-utilities adapter tests for query validation, encoding, response parsing, duplicate IDs, missing metadata, zero results, upstream timeout/429/5xx, overlong responses, and bilingual rendering. Add route/navigation tests proving planned routes are absent before the catalog status changes and present after the complete implementation lands.

## 6. Checks performed

| Check | Result |
|---|---|
| `git branch --show-current` | `main` |
| `git rev-parse HEAD` | `254ce1299bff227c54809bb7027f9b587d69c143` |
| `git status --short` | 677 rows; existing user changes preserved; no staging performed. |
| `Test-Path` for catalog-declared Tool 147 component/engine/schema and flat page | All `False`. |
| Source search for E-utilities/Tool 147 implementation | No Tool 147 client or API implementation found. |
| Environment variable names containing `NCBI` or `EUTILS` | None in current process; values were not inspected. |
| NCBI official documentation review | Complete; external browser used read-only, no E-utilities API request was made. |
| Tool 147 tests / runtime route | `NOT RUN`; implementation is absent and catalog status is planned. |

**Decision:** do not mark Tool 147 implemented or ready. The tool's bounded product behavior is defined above, but contact configuration and rate-limit deployment evidence are missing. Continue read-only audit of other tools while those prerequisites are resolved; no database, commit, push, or deployment action is authorized here.

## Current continuation addendum — 2026-10-25

The earlier audit's statement that no shared limiter had been evidenced is refined by a new source inspection:

- `lib/ratelimit.ts:2-5,9-12,41,50-68` implements Upstash Redis when the relevant server environment variables are present, with an in-memory fixed-window fallback otherwise. `package.json:31-32` declares `@upstash/ratelimit` and `@upstash/redis`.
- This is evidence that shared rate-limit infrastructure exists conditionally; it is **not yet adequate evidence of an NCBI-safe global throttle**. The configured Upstash policy is `slidingWindow(10, '1 m')`, and the fallback is 10/minute per key. That policy permits bursts above NCBI's limit of 3 URL requests/second and the fallback is process-local. No runtime environment values were read, so configured production availability is `NOT VERIFIED`.
- NCBI's official E-utilities reference is updated March 4, 2026 and says requests should include `tool` and valid `email` parameters: [parameter reference](https://www.ncbi.nlm.nih.gov/books/NBK25499/). Its usage policy recommends no more than 3 URL requests/second per IP; it distinguishes this from API-key traffic (default up to 10/second), says the developer email must be the software developer's rather than an end-user's, and requires an evident NCBI disclaimer/copyright notice in the software using E-utilities: [usage policy](https://www.ncbi.nlm.nih.gov/books/NBK25497/).
- Because each submitted search would require multiple sequential or batched NCBI requests, a future implementation needs a fail-closed shared global limiter that enforces the applicable per-egress-IP rate even under concurrent/horizontally scaled instances. Reusing the current generic limiter unchanged is insufficient. No NCBI request, API key, or integration code was added.
- Tool 147's local identity and slug remain unchanged, and the V7 match stays `POSSIBLE_CONCEPTUAL_MATCH`. Its catalog row currently has a flat planned href; when separately authorized for implementation, the established category-first routing convention requires `/smarttools/platform-ai/tool-147-scientific-evidence-explorer` with the old flat URL redirected. No route was changed in this audit.

**Current readiness:** still `NOT READY TO IMPLEMENT`. Remaining prerequisites are owner resolution of the conceptual identity, a developer/organization contact email for server-only use, and explicit approval of a global fail-closed throttle design and deployment behavior. The bounded citation-only feature scope remains as stated above.

## Current worktree correction — 2026-10-27

The preceding audit describes the earlier state and is superseded for file-presence and route observations by the current working tree. Source files now exist for the Tool 147 catalog entry and component, `/api/smarttools/tool-147` route, NCBI engine, schema, and global Upstash limiter. The catalog and registry currently declare `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`; the path is handled by the dynamic category/tool route, and no route-specific `page.tsx` exists at that nested path. This corrects the earlier flat-href observation while recording the actual routing architecture. Source inspection confirms the limiter uses the shared key `global:ncbi:eutils`, allows at most three requests per rolling one-second window, and fails closed with `NCBI_LIMITER_UNAVAILABLE` / `retryAfter: 60` when Redis is not configured or its check fails.

Presence-only environment inspection found no `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NCBI_EMAIL`, `NCBI_TOOL`, or `NCBI_API_KEY` in this process; no values were read. No live Redis or NCBI request was made, so configured production readiness and successful retrieval remain `NOT VERIFIED`. Existing limiter/route/engine tests were not run in this recount. The current App #147 ↔ V7 #249 relation remains `POSSIBLE_CONCEPTUAL_MATCH`; identity equivalence is not approved by this evidence. Tool implementation code was not changed during this audit.
