# 5-Layer Tool Stack — Foundation (Phase 0)

Owner: George Mourice · Scope: every calculator in `mrxsteroid.com`.
Status: **implemented and verified** (type-check clean, 1042/1042 tests green).

## Layer map

| Layer | Responsibility | Location |
|-------|----------------|----------|
| 0 | Shared contracts (`ToolOutput<T>`, `DataProvenance`, findings, seoLinks) | `lib/tools/contracts.ts` |
| 0b | Canonical tool registry (slug, tier, prev/next chain) | `lib/tools/registry.ts` |
| 1 | Pure math engines (per tool) | `lib/tools/engines/<slug>.ts` |
| 2 | Zod validation boundary | `lib/tools/schemas/<slug>.ts` + shared `lib/tools/schemas/toolLogSchema.ts` |
| 3 | Persistence & AI adapter | `lib/tools/adapters/toolLogAdapter.ts` |
| 4 | Health integration / normalization | `lib/health/normalization.ts` |
| 5 | Live React UI (per tool) | `components/tools/<slug>.tsx` |

Server/HTTP surface: `server/tools/toolLogService.ts`, `app/api/tools/logs/route.ts`.
Database: `supabase/migrations/20260921120000_create_user_tool_logs.sql`.

## Snapshot semantics (spec §5)

| `snapshot_type` | Cardinality | Written when |
|-----------------|-------------|--------------|
| `draft` | 1 row per (user, tool) | debounced 1500 ms autosave (`shouldAutoDraft`) |
| `submitted_snapshot` | append-only history | "Save to Bio-Dashboard" |
| `dashboard_projection` | 1 row per (user, tool) | "Save to Bio-Dashboard" (after the snapshot) |

Enforced twice: partial unique indexes in Postgres, and `SELECT → UPDATE`
(or `23505` retry) in the service, because PostgREST cannot infer a partial index
in an `ON CONFLICT` clause.

## HTTP contract — `/api/tools/logs`

* `GET ?tool=<slug>&snapshotType=<type>&limit=<1..100>` → `{ ok, count, logs[] }`
* `POST` body = `ToolLogCommit` (`buildCommitPayload`) → `{ ok, id, toolSlug, snapshotType }`
* `DELETE ?id=<uuid>` → `200` on match, `404` for missing/foreign rows

Bearer token is mandatory on every verb; all queries are additionally scoped by
`user_id` because the service-role client bypasses RLS (IDOR defence in depth).
`422`-class payload problems are returned as `400` with per-issue `details`.

## Per-tool delivery pipeline (repeat for each tool)

1. **Phase 1** — LaTeX math spec, variables, boundaries.
2. **Phase 2** — `lib/tools/engines/<slug>.ts`: pure, no React/DB/`Date`.
3. **Phase 3** — `lib/tools/schemas/<slug>.ts` (Zod `.strict()`) + adapter wiring
   (`buildCommitPayload` / `commitDashboardSnapshot`).
4. **Phase 4** — `components/tools/<slug>.tsx`: debounced state via
   `saveDraft`/`loadDraft`, Recharts visual, metric/imperial toggle,
   AR/EN strings, and a mandatory prev/next footer built from
   `getToolNeighbors(slug)`.
5. **Phase 5** — `generateMetadata()` + JSON-LD in the page, flip the tool's
   `stackStatus` to `'layered'` in `lib/tools/registry.ts`, run
   `npx tsc --noEmit` and `npx vitest run`.

Every engine output must be produced by `buildToolOutput(slug, {...})` so the
envelope (identity, tier, prev/next links) can never drift.

## Verification

```
npx tsc --noEmit
npx vitest run
npx eslint lib/tools lib/health server/tools app/api/tools
```

Coverage added in Phase 0: `lib/tools/contracts.test.ts`,
`lib/tools/registry.test.ts` (incl. a live `app/` route-existence assertion),
`lib/tools/adapters/toolLogAdapter.test.ts`, `lib/health/normalization.test.ts`,
`tests/integration/toolLogPersistence.test.ts`.

## Known gaps / next actions

1. **Layer-5 UI tests are not wired yet.** `vitest.config.ts` has
   `environment: 'node'` and does not reference `vitest.setup.ts`, so
   `@testing-library/jest-dom` matchers are never registered and `components/**`
   is outside the `include` globs. Before the first tool UI ships, add a jsdom
   project (or per-file `// @vitest-environment jsdom`) plus
   `setupFiles: ['./vitest.setup.ts']` for that project only — the setup file
   touches `window`, so it must not run in the node project.
2. **HealthKit / Health Connect are native APIs.** They cannot be read from a
   Next.js server or Safari; ingestion must arrive via an iOS/Android shell,
   an export import, or FHIR. `lib/health/normalization.ts` already accepts all
   three behind one `HealthRecordInput` shape.
3. **`lib/tools/registry.ts` is the only source of truth for slugs.** Adding a
   page under `app/` without registering it here breaks the link-graph tests by
   design (that is the intended guardrail).
