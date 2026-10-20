# Tool-036 — per-tool lazy-loading architecture (catch-all route)

**Branch:** `audit/tool-036-integration` (HEAD `36b46109`)
**Repo:** `E:\MrXSteroid-integration`
**Authoritative sources:**
- `docs/perf/tool-036-budget.md` — L1 initial ≤ 150 KB gz; forbidden in L1: recharts, dnd-kit, 3D/chart/PDF libs
- `docs/superpowers/plans/2026-10-18-tool-036-supreme-v3.md` — First Load JS < 150 kB
- User directive 2026-10-20 (per-tool lazy architecture, literal import paths, module-scope `dynamic`, no route-param-derived paths)

## Problem (measured, not inferred)

`/smarttools/[category]/[tool]` ships **420 kB First Load JS**. Root cause is proven by four build spikes:

| Route | First Load JS | Mechanism |
|---|---|---|
| static `import Tool036` + `<Tool036/>` | 111 kB | one tool in graph |
| `await getToolComponent('tool-036-…')` + `<C/>` | 415 kB | the loader map is in the route graph |
| client registry of 110 `dynamic(() => import(LITERAL))`; server page does **not** import the loader | **109 kB** | each tool = own async chunk |
| the real catch-all | 420 kB | `await getToolComponent(entry.slug)` (page.tsx:61) |

React's RSC client-reference collector gathers every `'use client'` module reachable through `lib/tools/loaders.ts` into the catch-all route's client chunk — all 110 tool components, on every tool page. `next/dynamic` alone does **not** fix this when the registry/loader module is statically imported by the route.

**Winning mechanism (spike-4, proven):** the catch-all page must not import or await the loader at all. It renders a **client** `ToolMount`, and the 110 `dynamic(() => import('@/components/tools/<literal>'))` declarations live at **module scope inside that client module**. Webpack then emits one async chunk per tool (`Promise.all([l.e(…)]).then(l.bind(l, id))`) and the page loads only the requested tool.

## Design

### New file: `components/smarttools/ToolMount.tsx` (`'use client'`)

- Module-scope registry `TOOL_COMPONENTS: Record<string, ToolComponent>` with **110** entries, each
  `dynamic(() => import('@/components/tools/<literal-slug>'), { loading: () => <ToolSkeleton /> })`.
- **Literal import paths only.** No template strings, no `import(computed)`.
- `export default function ToolMount({ slug }: { slug: string })`:
  - `const C = TOOL_COMPONENTS[slug];`
  - unknown slug → `<div data-testid="tool-mount-missing" />` (defensive; server already 404s)
  - else `<C />`.
- `ToolSkeleton` = `data-testid="tool-mount-skeleton"`, accessible (`aria-hidden`), matches existing skeleton styling.

The registry is **generated** from `lib/tools/loaders.ts` by a checked-in generator so the 110 entries never drift, and a regression test asserts the generator output matches the checked-in file.

### Changed: `app/smarttools/[category]/[tool]/page.tsx` (Server Component)

- **Remove** `import { getToolComponent } from '@/lib/tools/loaders'` and the `await getToolComponent(...)` call.
- **Keep** everything else exactly: `generateMetadata`, canonical, JSON-LD, breadcrumb `<nav aria-label="Breadcrumb">`, `<SafetyNotice>`, `<AIInsightPanel>`.
- Existence check: use the **catalog** (`getPublishedCatalogTools()` / `getCategoryOfSlug`) already imported — not the loader — then `notFound()` for unknown/invalid/category-mismatched slugs.
- Render `<ToolMount slug={entry.slug} />` in place of `<ToolComponent />`.

### Preserved invariants

- All 110 published tool slugs still resolve; flat routes still 308 to canonical; category mapping unchanged.
- `published`/`planned` state unchanged (catalog is untouched).
- SSR: `next/dynamic` defaults to `ssr: true`; the requested tool is server-rendered by `ToolMount`. Verified as an explicit acceptance gate (H1 present in SSR HTML).
- RTL/LTR, loading states, error handling unchanged (tool components untouched).
- `lib/tools/loaders.ts` is **kept** (used by `lib/tools/index.ts` / `preloadTools`); only the page stops importing it.

## Tasks (TDD; commit after each green)

### Task 1 — generator + registry (test first)
- **Test:** `components/smarttools/tool-mount.registry.test.ts`
  - registry source contains exactly the slugs in `lib/tools/loaders.ts` (110)
  - every entry uses a literal `import('@/components/tools/<slug>')`; no backticks/`${}` in import paths
  - `ToolMount` is `'use client'`; registry is module-scope (outside the component)
- **Implement:** `scripts/generate-tool-mount.mjs` → writes `components/smarttools/ToolMount.tsx`.
- **Commit.**

### Task 2 — page switch (test first)
- **Test:** `app/smarttools/[category]/[tool]/page.test.ts` (contract)
  - page source does **not** import `getToolComponent` / `@/lib/tools/loaders`
  - page renders `<ToolMount slug={entry.slug} />`
  - metadata/canonical/JSON-LD/breadcrumb/SafetyNotice/AIInsightPanel still present
- **Implement:** edit the page.
- **Commit.**

### Task 3 — bundle gate (evidence)
- Build; record `First Load JS` for the catch-all (target < 150 kB) and `/labs/tool-036-v4` (must stay 147 kB).
- Inspect `app-build-manifest.json`: catch-all page chunk < ~30 kB gz; no tool-impl markers; recharts absent.
- Runtime: for a non-chart tool and a chart tool, capture initial `<script src>` set; assert recharts absent initially; assert only the selected tool's chunk is fetched.
- SSR: assert the requested tool's `v3-shell` + H1 present in raw HTML.
- **Commit only if all gates pass.**

### Task 4 — regression + full verification
- Focused suites: `lib/tools/loaders.test.ts`, Tool-036 V3 suites, V4 suites, recharts lazy tests, adapters `tool-036-040-batch.test.ts`, catalog/SEO contracts.
- `npx tsc --noEmit`, `git diff --check`, production build.
- Full suite **separately** (never concurrent with builds).
- Do **not** push until local verification succeeds.

## Acceptance gates

| Gate | Target | Result | Evidence |
|---|---|---|---|
| G-P1 catch-all First Load JS | < 150 kB (from 420 kB) | **PASS** 114 kB | build log |
| G-P2 unrelated tool code absent from page chunk | 0 impl markers | **PASS** 0/10 markers | chunk decompile |
| G-P3 only selected tool chunk fetched | 1 tool chunk | **PASS** 2–3 lazy chunks, not in initial set | network capture |
| G-P4 recharts absent initially (non-chart) | 0 | **PASS** | network capture |
| G-P5 requested tool SSR'd | body present in HTML | **PASS (with caveat)** streamed into the Suspense payload; **not visible until hydration** — see G-P10 | raw HTML |
| G-P6 all 110 slugs resolve | 110/110 | **PASS** 110/110 | runtime probe |
| G-P7 focused suites + tsc + lint + diff + build | green | **PASS** (1 pre-existing lint error, unrelated) | logs |
| G-P8 V4 lab unchanged | ≤ 150 kB | **PASS** 149 kB (was 147) | build log |
| G-P9 tool visible + interactive with client JS ON | visible | **PASS** on the pushed SHA (localhost prod build): `v3-shell` 956×1328 visible, skeleton gone after hydration, 93 buttons; `hpta-recovery` RTL-Arabic H1 visible with 6 recharts containers / 44 `<svg>`; no duplicate content | browser DOM |
| G-P10 tool visible with client JS BLOCKED | visible without JS | **FAIL (regression)** — body streams into React's hidden `<div id="S:n" hidden>` container and is only unhidden by hydration; with JS blocked/absent the body stays invisible. Pre-fix static render was visible with JS disabled. Escalated, not silently accepted. | browser DOM (localhost + Vercel Preview) |

### G-P9 / G-P10 detail (honest disclosure)

- **G-P9 (normal operation, hydration ON)** — verified on the **exact pushed SHA** via
  `next start -p 3160`: tool-036 renders `data-testid="v3-shell"` at **956×1328 visible**
  (`hiddenAncestor:false`), the `tool-mount-skeleton` is **removed after hydration**, 19 `h2`,
  93 interactive buttons; `hpta-recovery` renders a visible RTL-Arabic `h1` with 6 recharts
  containers and 44 `<svg>`. `visibleH1Count === 1` and the title appears exactly once in
  visible text → **no duplicated content**.
- **G-P10 (hydration OFF)** — **regression versus pre-fix.** The tool now mounts through a
  `next/dynamic` + Suspense boundary, so the server streams the body into a `hidden` React
  container (`<div id="S:1" hidden>`) that client hydration unhides. If client JS never runs
  (browser JS disabled, a CSP block, or a script error) the body stays **invisible**. Pre-fix, the
  body was statically server-rendered into the visible DOM and was visible with zero JS.
  Observed live on the Vercel Preview *and* on a pre-existing Preview (same mechanism: Vercel
  deployment protection rewrites subresources through `vercel.com/sso-api`, which the site's own
  CSP blocks → no JS → no hydration). Raw evidence in `t036-remediation-plan.md`.
- React's `<div id="S:n" hidden>` containers **persist (hidden, inert) even when hydration
  succeeds**; that is standard React 19 out-of-order streaming and is **not** by itself evidence of
  failure. The distinguishing tests are whether the *live* element is visible
  (`getBoundingClientRect`) and whether the skeleton is gone.

## Blocker handling
If any gate cannot be met within the authorized boundary (integration branch only, no engine/payment changes), stop, preserve the tree, and report the exact authorization required — do not weaken a gate.
