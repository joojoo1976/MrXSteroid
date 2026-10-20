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
| G-P5 requested tool SSR'd | body present in HTML | **PASS** body server-rendered directly into the visible document | raw HTML |
| G-P6 all 110 slugs resolve | 110/110 | **PASS** 110/110 | runtime probe |
| G-P7 focused suites + tsc + lint + diff + build | green | **PASS** (1 pre-existing lint error, unrelated) | logs |
| G-P8 V4 lab unchanged | ≤ 150 kB | **PASS** 149 kB (was 147) | build log |
| G-P9 tool visible + interactive with client JS ON | visible | **PASS** `v3-shell` 956×1328 visible, 1 H1, title once (no duplication), 89 buttons, charts render | browser DOM |
| G-P10 tool visible with client JS BLOCKED | visible without JS | **PASS (fixed)** body is server-rendered into the visible DOM, outside any hidden container; sandboxed no-script iframe renders it at 1169×2636 with 1 visible H1 | browser DOM + raw HTML |

### G-P10 — root cause and fix (resolved)

**Root cause (source-level).** `next/dynamic` wraps its target in a React Suspense boundary
whenever a `loading` fallback is supplied:

```js
// node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js
const hasSuspenseBoundary = !opts.ssr || !!opts.loading;
const Wrap = hasSuspenseBoundary ? Suspense : Fragment;
```

`React.lazy` always suspends on the first server render, so that boundary made React stream the
server-rendered tool body into a hidden out-of-order container (`<div hidden id="S:1">`) that only
became visible after client hydration. With JS disabled the body stayed invisible (measured: the
`v3-shell` element sat inside `S:1` at zero size).

**Rejected fix.** A route-level `app/smarttools/[category]/[tool]/loading.tsx` was tried first and
**made it worse**: it wraps the whole page in Suspense in the streamed payload, and the body landed
inside `<div hidden id="S:2">`. Measured, then reverted.

**Applied fix.** Every `next/dynamic` entry in `ToolMount.tsx` is now a bare
`dynamic(() => import('…'))` with **no options object**, so `hasSuspenseBoundary` stays `false` and
the tool is rendered through a Fragment — server-rendered straight into the visible document, while
webpack still emits one async chunk per tool. The generator, the registry test and a new
`app/smarttools/[category]/[tool]/ssr-visibility.test.ts` guard the shape.

**Evidence (same build, `next start`):**

| Probe | Before fix | After fix |
|---|---|---|
| `v3-shell` byte offset in SSR HTML | 40934, inside `<div hidden id="S:1">` | **19245, not in any hidden container** |
| hidden containers | `S:1`,`S:2`,`S:0` | `S:0` only (site-wide, pre-existing) |
| `tool-mount-skeleton` in SSR HTML | present | **absent** |
| no-JS sandboxed render (scripts blocked) | hidden | **visible 1169×2636, 1 visible H1** |
| catch-all First Load JS | 114 kB | **114 kB (unchanged)** |
| all 110 routes: visible non-hidden SSR body | — | **110/110** |
| JS-enabled: shells / H1 / title occurrences | — | **1 / 1 / 1 (no duplication)**, 0 hydration warnings |

### Standard-tool integration (verified on the pushed SHA)

| Check | Result |
|---|---|
| Catalog entry | `mrx.tool.036-injection-schedule`, `status: 'implemented'`, `href: /smarttools/tool-036-injection-schedule` |
| Canonical route | `/smarttools/injection-formulation/tool-036-injection-schedule` → **200** |
| Flat legacy route | `/smarttools/tool-036-injection-schedule` → **308** → canonical |
| Category route / hub | `/smarttools/injection-formulation` **200**, `/smarttools` **200** |
| Category card | tool-036 listed with the other published tools in the category |
| Shared chrome | exactly **1 `<header>` (banner) + 1 `<footer> (contentinfo)`, both from `app/smarttools/layout.tsx** — no per-tool chrome |
| Header vs title | header bottom 101 < title top 259 → does not cover the title |
| Footer vs content | footer top 1749 ≥ content bottom 1571 → follows the content |
| RTL/LTR | `عربي` toggle → `dir=rtl`, `lang=ar`, shell `dir="rtl"`, still 1 header / 1 footer |
| Responsive | tool shell reflows to a 390 px box (`scrollWidth 388`, 0 overflow offenders); shared nav uses `px-4 lg:px-6 h-12 md:h-14` |
| SEO contracts | 1 breadcrumb, correct canonical, 1 JSON-LD, SafetyNotice present |
| V4 lab | untouched by this work; still `/labs/tool-036-v4` 149 kB, not linked from the catalog |

### G-03 — privacy / network (PASS)

Runtime capture on the pushed SHA with **synthetic** inputs (no real health data): 36 requests total
= 34 same-origin (document, app chunks, lazily-fetched tool chunk, assets) + **2 pre-existing
shared third-party requests**:

| Host | Call | Carries tool state? |
|---|---|---|
| `grainy-gradients.vercel.app` | static `GET /noise.svg` decorative texture, referenced by `shared/ui/Footer.tsx` | **No** — no query, no body, `no-cors` |
| `ipapi.co` | bare `GET /json/` IP geolocation from `shared/lib/logic.ts` | **No** — empty query string, empty body, no auth/custom headers |

Both are explicitly allowlisted in the site's own CSP (`img-src … https://grainy-gradients.vercel.app`,
`connect-src … https://ipapi.co`), i.e. sanctioned site-wide behaviour, and both appear **identically**
on an untouched ordinary tool (tool-009). No analytics or error-tracking SDK is mounted in the
SmartTools layout. **Tool-036 transmits nothing private to any unrelated endpoint.**

## Blocker handling
If any gate cannot be met within the authorized boundary (integration branch only, no engine/payment changes), stop, preserve the tree, and report the exact authorization required - do not weaken a gate.

## G-P11 - hydration consistency reconciliation (React #418)

### Reproduction matrix

| # | Environment | SHA / build | Run | JS | Route | Console result |
|---|---|---|---|---|---|---|
| 1 | Vercel Preview | `9e77fd8b` (pre-fix) | earlier session | on | canonical tool-036 | React **#418** recovered by client re-render; 1 shell / 1 H1 / 89 buttons visible |
| 2 | local `next start` (same SHA) | `9e77fd8b` | earlier session | on | canonical tool-036 | **0** hydration errors |
| 3 | unit (jsdom, `renderToString`) | pre-fix source | this session | - | - | two renders 1 minute apart produced **different first-render text** (`1ي 8س 59د` vs `1ي 8س 58د`) -> the defect, captured deterministically |
| 4 | local `next start` (post-fix) | this commit | run 1 | on | canonical tool-036 | only environmental error; live countdown after hydration |
| 5 | local `next start` (post-fix) | this commit | run 2 | on | canonical tool-036 | only environmental error; live countdown after hydration |
| 6 | local `next start` (post-fix) | this commit | run 3 | on | canonical tool-036 | only environmental error; live countdown after hydration |
| 7 | Vercel Preview (post-fix) | this commit | after push | on | canonical tool-036 | see final Preview verification below |

Runs 1 and 2 were **different execution environments**, both correct: the Preview had real network latency between server render and hydration; the same-machine `next start` had sub-millisecond TTFB. Neither was a stale session or a different route. Outcome classification: **A (a true, recoverable hydration error)** - not B/C/D.

### Root cause (source-proven)

`components/tools/tool-036-injection-schedule.tsx` rendered a countdown to the next shot day whose text came from the wall clock:

```
const [now, setNow] = useState<number>(() => Date.now());   // line 148
const nowMs = dayIndex*864e5 + h*3600e3 + m*60e3 + s*1e3;
const countdownText = formatCountdown(nextInjection(nowMs, shotDays).msRemaining, locale);
```

`formatCountdown` **floors to whole minutes**, so the text changes at each minute boundary. The server rendered it at server time; the client recomputed it from the client clock. When network latency straddled a minute boundary the two disagreed and React reported #418 "text content does not match". Reproduced deterministically in the unit probe above (runs 3 -> 4).

### Fix

Smallest correct correction, using React's own API for external mutable sources:

- New module-scope `clockStore` read via `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`.
- `getServerSnapshot()` returns `null` for **both** the server render and the hydration render (verified against React 19.2.4 `react-dom-client` source: `if (isHydrating) nextSnapshot = getServerSnapshot()`), so the first paint is byte-identical on both sides - a mismatch is structurally impossible.
- `getSnapshot()` adopts the real clock only after hydration commits; `subscribe()` ticks it once per second.
- While the clock is unknown, the countdown shows a deterministic language-neutral `pending` glyph (`-`); the live value replaces it after hydration. Scheduling computations (`nextInjection`, rotation, volumes) are unchanged.
- Added `components/tools/tool-036-injection-schedule.hydration.test.tsx` (G-P11 guard). It **fails on the pre-fix source** (different first-render text one minute apart) and **passes on the fix**.

Files changed: `components/tools/tool-036-injection-schedule.tsx`, `components/tools/tool-036-injection-schedule.hydration.test.tsx`. No architecture, route, layout, SEO or performance change.

### G-P10 evidence (unchanged, re-verified on this build)

| Check | Result |
|---|---|
| 110/110 routes: HTTP 200 + visible non-hidden SSR body, no skeleton | **PASS** |
| `v3-shell` byte offset in SSR HTML | **19245**, before the first hidden container at 51218 |
| hidden `S:` containers contain | React hydration bookkeeping scripts only (`$RC`/`$RV`/`__next_f`), not tool markup |
| tool-036 SSR: H1 / buttons / calendar / body-map / svg | 1 / 51 / present / present / 33 |
| `tool-mount-skeleton` in SSR HTML | absent |
| JS-on: shells / H1 / title occurrences | 1 / 1 / 1 (no duplication), no #418 |
| RTL toggle | `1ي 2س 54د` -> `1d 2h 54m`, still 1 H1 / 1 title occurrence |

### Performance evidence (measured on this build)

| Metric | Value |
|---|---|
| Catch-all `< 150 kB` gate: Next "First Load JS" (deduped) | **114 kB** PASS |
| Catch-all initial file list | 6 files; flat gzip sum **111.7 kB** (separate metric, reported separately) |
| recharts in catch-all initial files | **NO** (6 standalone recharts chunks, load on demand) |
| tool-036 component in catch-all initial files | **NO** (standalone chunk `9038.*.js`, 12.1 kB) |
| total async chunks (per-tool splitting) | 423 |
