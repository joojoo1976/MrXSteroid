# Tool-036 Supreme v2 — Design Document
## CHRONO-INJECT OS — AI-Powered Injection Intelligence & Site Rotation Command Center

**Doc ID:** `tool-036-supreme-v2-design`
**Version:** 2.1 (design)
**Status:** DESIGN ONLY — **no code, no registry change, no PR**
**Authored during:** HOLD
**Date:** 2026-10-17
**Supersedes:** current `tool-036-injection-schedule` (engine outputs only `TOTAL_VOLUME` + `BUSIEST_DAY`)
**Companion artifacts:**
- `docs/evidence/tool-036-evidence-table.md` (live evidence)
- `docs/design/wireframes/tool-036-wireframes.md` (ASCII + Mermaid, Mobile 375 / Desktop 1440)
- `docs/tool-036-v2-spec.md` (pseudo-spec + ≥20 test cases)
- `docs/perf/tool-036-budget.md` (LCP/JS budget)

---

## [01] Executive Summary

### Problem
The current Tool-036 is effectively a **primitive 2 mL calculator**: it splits a weekly dose and prints
`TOTAL_VOLUME` + `BUSIEST_DAY`. It:
- ignores **ester half-life** (so it cannot reason about peak/trough or missed doses),
- has a single, hard-coded site-volume guard (default `3.0 mL`) with **no evidence badge**,
- offers **no site rotation intelligence**, no healing awareness, no comfort model,
- provides **no provenance** for any number it shows,
- and collapses everything into one screen with **no performance strategy**.

### Goal
Transform it into **CHRONO-INJECT OS v2.1** — a Mobile-First, evidence-tagged, harm-reduction
tracking system that stays **under LCP budget** by revealing complexity progressively.

### The 5 gaps we fix
| # | Gap | Fix |
|---|---|---|
| G1 | No PK reasoning | **Chrono-PK engine**: half-life-aware splitter, peak/trough smoothing, accumulation model |
| G2 | Volume guard is a black box | **Volume Guard v2**: 3 zones (Green/Yellow/Red) with **Evidence Badge** + citation drawer |
| G3 | No rotation/healing logic | **Site Rotation Matrix**: 2D body map, healing status, comfort factors, 12-week plan |
| G4 | No provenance anywhere | **Evidence Drawer + `/evidence` page** driven by the live evidence table |
| G5 | Monolithic UI kills LCP | **Progressive Disclosure** in 3 levels + strict JS budget |

### Non-negotiables
- **Educational only.** Persistent footer. No prescription, no cycle advice.
- **Zero claim without source.** Every clinical/numeric value links to the evidence table.
- **8-Gate PASS only.** No "READY FOR RELEASE" language.
- **LCP < 1.5 s** on emulated Moto G4 / 4G.
- **No new runtime deps in Level 1** (no Recharts, no dnd-kit).

---

## [02] Audience — Dual Persona

| Persona | Default? | Access | Needs |
|---|---|---|---|
| **A — Individual (educational self-tracking)** | ✅ Default | Full interaction: log injections, comfort, rotation | Fast mobile UI, private local logging, plain-language safety |
| **B — Clinician (review only)** | ❌ | **Read-only** | Dense tabular view, evidence citations exposed by default, no logging controls |

### Persona Toggle behavior
- A single segmented control (Level 1 header): `Tracking` / `Clinician review`.
- **Clinician mode is read-only** — all inputs disabled; evidence badges auto-expanded.
- Persona is a **local preference** (not sent anywhere). Default = Individual.

### Persistent educational footer (both personas, all levels)
> 🇬🇧 *Educational tool only. Not medical advice. Consult a qualified clinician before injecting anything.*
> 🇸🇦 *أداة تعليمية فقط، وليست نصيحة طبية. استشر طبيبًا مؤهلاً قبل حقن أي مادة.*

Footer also renders: **Provenance line** (sources count + last-checked) and a link to `/evidence`.

---

## [03] Live Evidence Table (cross-reference)

The authoritative table lives in **`docs/evidence/tool-036-evidence-table.md`** and is the single source
of truth for the in-app **Evidence Drawer**. Summary of coverage:

| Group | Claims | Highest confidence |
|---|---|---|
| A — Ester half-lives | A01–A09 | A04 (FDA label, 8 d cypionate) |
| B — Volume limits | B01–B05 | B02/B03/B04 (CDC + StatPearls) |
| C — Site selection | C01–C04 | C04 (Ogston-Tuck 2014) |
| D — Rotation / healing | D01–D04 | D01/D02 (moderate) |
| E — Needle / gauge | E01–E03 | E01 (CDC) |
| F — Governance | F01–F03 | project policy |

**Hard rule:** any claim rendered in the UI without a matching evidence row is a **build-blocking defect**.
**D04 ("7 vs 14 days") ships as `Expert · Low · Heuristic`** — it has no direct citation and must say so.

> In Phase 2, `docs/evidence/tool-036-evidence-table.md` is parsed into a typed
> `EVIDENCE` map; each numeric constant in the engine imports its `evidenceId`. See `[07]`.

---

## [04] Corrected Functional Requirements (FIX 1–5)

### FIX 1 — Volume Guard v2 (3 zones + Evidence Badge)
Per single injection, per site:
| Zone | Range (mL) | Meaning | UI |
|---|---|---|---|
| 🟢 **Green** | `0 < v ≤ 2` | Common practice | neutral |
| 🟡 **Yellow** | `2 < v ≤ 5` | Extended — anatomically possible at large sites, thinner evidence | amber + **`Limited Evidence`** badge (B01) |
| 🔴 **Red** | `v > 5` | Exceeds commonly-cited adult max (B01) | red block + clinician-referral copy |
- Site-specific ceilings: deltoid ≈ 1 mL (B02/B03/B04); gluteal/vastus larger (B01).
- Every zone boundary shows an **ⓘ Evidence Badge** → opens Drawer to the exact row.
- Weekly-per-site accumulation guard retained (`≤ 3 mL/week/site` design default, evidence-tagged).

### FIX 2 — Comfort Factors + Personal Logger (no "pain prediction" score)
- **Removed:** any `0–10 pain prediction`. We do **not** predict pain.
- **Added — Comfort Factors:** the user *records* post-injection factors: soreness, swelling, bruising, leakage, numbness.
- **Personal Logger:** local history (IndexedDB/localStorage), one tap per factor.
- **Experimental badge** only after **≥ 10 logged injections** at a site; before that, show "Not enough data".
- Copy is strictly descriptive ("your recorded soreness was higher at this site"), never predictive.

### FIX 3 — Evidence Drawer + `/evidence` page
- **<EvidenceDrawer/>**: bottom sheet (mobile) / side panel (desktop). Shows the matched row(s):
  Claim · Value · Source · URL · Year · Confidence · Quote · Last Checked · Uncertainty.
- **`/smarttools/tool-036-injection-schedule/evidence`**: full rendered table, deep-linkable per claim
  (`?claim=A04`), read-only, no JS beyond hydration.
- Confidence is colour-coded (High/Moderate/Low) and **Low is always visible**, never hidden.

### FIX 4 — Persona Toggle
See `[02]`. Default Individual; Clinician is read-only and auto-expands evidence.

### FIX 5 — Progressive Disclosure (LEVEL 1 / 2 / 3)
| Level | Contents | Load strategy | Budget |
|---|---|---|---|
| **L1 — MVP Core** | Compound selector, weekly Sun/Thu list, Volume Guard v2, Next-injection card, Busiest day + Total volume, educational footer, `[Advanced ▾]` | Server component + minimal client island | **< 150 KB gz JS**, LCP < 1.5 s |
| **L2 — Advanced** | 2D Body Map **SVG** (8 → 16 sites), Comfort Factors + Personal Logger, textual 12-week rotation table | `next/dynamic` on tap; SVG ~4 KB | lazy chunk |
| **L3 — Pro Lab** | Accumulation chart, yearly heatmap, Gantt (desktop drag), PDF export | separate **tab** + `next/dynamic` + `IntersectionObserver` + Skeleton | isolated chunk |

**Feature treatment (explicit):**
- **3D → 2D SVG** body map (∅ 3D libs). Tap targets **≥ 44 px**. No hover-dependent actions on touch.
- **Gantt drag → desktop only**; on mobile a **static list with ↑/↓ reorder buttons** (one-handed).
- **AR → deleted from MVP**; show badge *"AR — Coming Soon (Lab)"*. **Zero AR libraries.**
- **Charts → `next/dynamic({ssr:false})` + `IntersectionObserver` trigger + Skeleton**; never in L1 bundle.

---

## [05] Non-Functional Requirements

### Performance (enforced — see `docs/perf/tool-036-budget.md`)
- **LCP < 1.5 s**, **TTI < 2.5 s**, **CLS < 0.1**, on emulated Moto G4 / Slow-4G.
- **First-load JS for L1 < 150 KB gz**; **no** Recharts / dnd-kit / 3D libs in the L1 bundle.
- **No horizontal scroll at 375 px.** Lighthouse Performance **> 90**.
- `next/font` (self-hosted, `display: swap`), explicit width/height on media, no layout-shifting banners.

### Accessibility
- WCAG 2.1 AA: contrast ≥ 4.5:1, focus-visible rings, full keyboard nav, `aria-live` for guard warnings.
- Respect `prefers-reduced-motion`; spring/liquid animations become instant.
- Tap targets ≥ 44×44 px.

### i18n
- **AR/EN** via existing `i18n/tool-036-injection-schedule.json`; RTL-safe layout.
- No hard-coded copy; numeric formatting locale-aware (Arabic-Indic digits optional, default Western in inputs).

### Safety
- Educational banner (persistent), Red-Flag Detector (volume/frequency/provenance), provenance line,
  no dosing advice, no "you're fine" claims — red flags always route toward clinician referral.

### SEO
- `app/smarttools/tool-036-injection-schedule/page.tsx`: metadata (title/description AR+EN), OpenGraph,
  **JSON-LD** (`SoftwareApplication` + `FAQPage` for the evidence/education content), canonical URL.

---

## [06] Wireframes

Full ASCII + Mermaid wireframes (Mobile 375 / Desktop 1440, all 3 levels) live in
**`docs/design/wireframes/tool-036-wireframes.md`** (Markdown-only, per the approved format).

---

## [07] Pseudo-Spec (signatures only — no implementation)

> **Signature-only.** No bodies. This is the contract Phase 2 must implement behind a flag.

### Layer 0 — Output builder
```ts
// lib/tools/registry.ts  (LATER — not touched now)
export type StackStatus = 'legacy' | 'layered' | 'layered-supreme'; // proposed addition

// buildToolOutput gains an opt-in v2 results shape
export function buildToolOutput(slug: ToolSlug, results: ResultsV2): ToolOutput;
```

### Layer 1 — Pure engine (`lib/tools/engines/tool-036-injection-schedule.ts`)
```ts
export type EvidenceId = string; // e.g. 'A04'
export interface EvidenceRef { evidenceId: EvidenceId; confidence: 'High'|'Moderate'|'Low'; note?: string }
export type Zone = 'green' | 'yellow' | 'red';

export interface EsterProfile {
  compoundId: string;
  nameEn: string; nameAr: string;
  halfLifeDays: number;            // from evidence table
  evidence: EvidenceRef;           // MUST be non-null
  labelApproved: boolean;          // false => 'non-clinical' badge
}

export interface DosePlanItem { compoundId: string; weeklyDoseMg: number; concentrationMgPerMl: number; injectionsPerWeek: number }
export interface PlanInput { plan: DosePlanItem[]; rotationSites: string[]; startDateISO: string }
export interface PlannedShot { day: 0|1|2|3|4|5|6; compoundId: string; doseMg: number; volumeMl: number; siteId: string; zone: Zone }

export interface PkCurvePoint { dayIndex: number; levelRel: number } // normalized, per compound
export interface AccumulationPoint { weekIndex: number; levelRel: number; steadyStateReached: boolean }

export interface ScheduleResult {
  shots: PlannedShot[];
  totalVolumeMlPerWeek: number;
  busiestDay: number;
  volumeGuard: { zone: Zone; perSite: Record<string, number>; warnings: GuardWarning[] };
  pk: { perCompound: Record<string, PkCurvePoint[]> };
  accumulation: Record<string, AccumulationPoint[]>;
  redFlags: RedFlag[];
  provenance: EvidenceRef[];       // every constant that influenced output
}

// --- pure functions (signatures only) ---
export function classifyVolumeZone(volumeMl: number, siteId: string): { zone: Zone; evidence: EvidenceRef };
export function planInjectionSchedule(input: PlanInput): ScheduleResult;
export function simulatePk(profile: EsterProfile, plan: DosePlanItem, horizonDays: number): PkCurvePoint[];
export function simulateAccumulation(profile: EsterProfile, plan: DosePlanItem, weeks: number): AccumulationPoint[];
export function detectRedFlags(result: Omit<ScheduleResult,'redFlags'|'provenance'>): RedFlag[];
export function reflowMissedDose(result: ScheduleResult, missedDay: number, profile: EsterProfile): ScheduleResult;
export function buildRotationPlan(sites: SiteId[], history: InjectionLog[], weeks = 12): RotationWeek[];
```

### Layer 2 — Schema (`lib/tools/schemas/tool-036-injection-schedule.ts`)
```ts
// Zod (strict). AR/EN. Every numeric field paired with evidenceId where clinical.
export const EvidenceRefSchema: z.ZodType<EvidenceRef>;
export const PlanInputSchema: z.ZodType<PlanInput>;
export const ScheduleResultSchema: z.ZodType<ScheduleResult>;
export const InjectionLogSchema: z.ZodType<InjectionLog>;
```

### Layer 3 — Adapter (draft / submitted / dashboard)
```ts
// lib/tools/adapters/tool-036-injection-schedule.ts
export function toDraft(input: PlanInput): ToolLogDraft;
export function toSubmitted(result: ScheduleResult): ToolLogSubmitted;
export function toDashboard(logs: ToolLogSubmitted[]): DashboardModel;
```

### Layer 4 — Components (progressive)
```ts
// Level 1 (always): components/tools/tool-036/level1/*.tsx
// Level 2 (lazy):   components/tools/tool-036/level2/*.tsx  (dynamic)
// Level 3 (tab):    components/tools/tool-036/level3/*.tsx  (dynamic, isolated)
// Shared:          components/tools/tool-036/shared/EvidenceDrawer.tsx, PersonaToggle.tsx, Footer.tsx
```

### Level 3 — upgraded UX (per approved fixes)
```ts
// 2D SVG (no 3D libs)
export function BodyMap2D(props: { sites: SiteStatus[]; onSelect(id: SiteId): void }): JSX.Element;
// Drag on desktop only
export function GanttDesktop(props: { plan: PlannedShot[]; onReorder(from:number,to:number): void }): JSX.Element;
// Mobile reorder (one-handed)
export function RotationListMobile(props: { plan: PlannedShot[]; onMove(i:number, dir:-1|1): void }): JSX.Element;
```

---

## [08] Data Model, State & Feature Flag

### Local-first state
| Data | Store | Notes |
|---|---|---|
| Plan input (compounds, sites) | URL params + `localStorage` | shareable, resumable |
| Injection log (comfort, site, time) | `IndexedDB` (fallback `localStorage`) | **never transmitted** in v2.1 |
| Persona | `localStorage` | default `individual` |
| Evidence cache | static build artifact | read-only |

### Feature flag
```
NEXT_PUBLIC_TOOL036_V2 = off | on        # default: off
```
- Flag **OFF** ⇒ existing v1 UI is byte-for-byte unchanged.
- Flag **ON** ⇒ Level 1 renders; Levels 2–3 lazy.
- Rollout order: `on` on preview branch only → internal review → then (separate approval) production.

### Registry / interface change (Phase 2 — NOT now)
- `lib/tools/registry.ts`: extend `StackStatus` union with `'layered-supreme'`.
- `lib/tools/validation.ts:116`: extend the `'layered'` guard so `'layered-supreme'` also requires a
  resolvable `smarttoolsSlug` **and** an evidence-table reference.
- `lib/tools/smartToolsCatalog6.ts`: tool-036 entry `stackStatus: 'layered' → 'layered-supreme'` and
  `resultsVersion: 2`.
- **Blast radius:** any consumer of `StackStatus` (validation, index re-exports, tests). Enumerated in
  `docs/tool-036-v2-spec.md`.

---

## [09] Component Split Plan, Rollout & Test Spec

### Component split (mobile-first)
```
tool-036/
├─ page.tsx (RSC)                        # metadata + JSON-LD + shell, no chart libs
├─ level1/
│  ├─ CompoundSelector.tsx   (client, small)
│  ├─ WeeklyList.tsx         (server-rendered, RSC-friendly)
│  ├─ VolumeGuardBadge.tsx   (client)
│  ├─ NextInjectionCard.tsx  (client)
│  └─ SummaryRow.tsx         (RSC)
├─ level2/ (dynamic)
│  ├─ BodyMap2D.tsx          (SVG, ~4 KB)
│  ├─ ComfortFactors.tsx
│  ├─ PersonalLogger.tsx
│  └─ RotationTable.tsx
├─ level3/ (dynamic, isolated chunk / separate tab)
│  ├─ AccumulationChart.tsx  (Recharts, ssr:false)
│  ├─ YearlyHeatmap.tsx
│  ├─ GanttDesktop.tsx       (dnd-kit, desktop only)
│  └─ PdfExport.tsx
└─ shared/
   ├─ EvidenceDrawer.tsx
   ├─ PersonaToggle.tsx
   └─ EducationalFooter.tsx
```

### Phased rollout (each phase = its own PR, after HOLD lift)
1. **P1 — Level 1 + engine + schema + evidence wiring** (flag on preview only).
2. **P2 — Level 2** (body map, comfort logger, rotation table).
3. **P3 — Level 3** (charts, heatmap, Gantt, PDF) + `/evidence` page.

Each PR: tests green, 8-Gate, budget report, no production deploy without separate approval.

### Test spec (≥ 20 cases — full list in `docs/tool-036-v2-spec.md`)
Engine (pure, unit):
1. Single weekly dose ⇒ correct shots count.
2. Split across 2 days ⇒ per-shot volume halves.
3. `classifyVolumeZone` 1.0 mL on deltoid ⇒ `green`.
4. `classifyVolumeZone` 2.5 mL ⇒ `yellow` + `Limited Evidence` ref.
5. `classifyVolumeZone` 6.0 mL ⇒ `red`.
6. Deltoid ceiling enforced (≤ ~1 mL) ⇒ downgrade/target warning.
7. Per-site weekly accumulation > 3 mL ⇒ warning.
8. Half-life-aware schedule: propionate ⇒ EOD cadence.
9. Enanthate ⇒ 2×/week cadence.
10. `simulatePk` monotonic decay between shots (no negative levels).
11. `simulateAccumulation` reaches steady state within expected weeks.
12. Undecanoate long t½ ⇒ flatter accumulation curve.
13. `detectRedFlags` high weekly total ⇒ flag raised.
14. `detectRedFlags` high frequency same site ⇒ rotation flag.
15. `reflowMissedDose` shifts subsequent shots by half-life logic.
16. Non-clinical ester (trenbolone) ⇒ `non-clinical` badge + no label claim.
17. Bone-dry: every `ScheduleResult` carries non-empty `provenance`.
18. Determinism: same input ⇒ identical output (no Date.now in pure fns).
19. Zod: `PlanInputSchema` rejects negative dose / >7 injections/week.
20. Zod: `ScheduleResultSchema` rejects a shot with empty `evidenceId`.
21. Zone boundary exactness: `v == 2` ⇒ green; `v == 5` ⇒ yellow.
22. `buildRotationPlan` never reuses a site < 7 days (heuristic, **labelled Low**).
23. i18n: AR + EN keys resolve for every L1 string.
24. Registration/validation: `'layered-supreme'` requires evidence ref (negative test).
25. Performance guard (CI): L1 bundle < 150 KB gz; no chart lib in L1 graph.

---

## [10] Open Questions, Risks & HOLD-LIFT REQUEST

### Open questions
1. **Per-site weekly cap** (currently design default 3 mL/week/site) — accept as heuristic or source it?
2. **D04 (7 vs 14 days)** — ship as `Expert · Low·Heuristic`, or hold until a citation is found?
3. **Undecanoate half-life** — pin to a specific SmPC? (A05/A06 currently disagree.)
4. **`/evidence` route** — own route vs section? (affects SEO/JSON-LD structure.)
5. **Logging retention** — default local-only forever, or optional export?
6. **Clinician persona** — read-only is assumed; confirm no data-entry expectation.

### Risks
| Risk | Severity | Mitigation |
|---|---|---|
| Weak/secondary PK sources | High | Label low confidence in-product; obtain primary citations in Phase 2 |
| Scope creep (25 features) | High | Strict 3-level disclosure; level-gated PRs |
| LCP regression from charts | High | Lazy + IntersectionObserver + budget CI gate |
| Regulatory framing (steroids) | High | Educational-only, no dosing advice, clinician referral |
| `StackStatus` union ripple | Medium | Enumerate consumers; negative test #24 |

---

## HOLD-LIFT REQUEST (Phase 2 gate)

> **We are currently under HOLD:** no code, no registry change, no commit/push/merge/deploy.
> This request is *not* a deploy. It is a request to lift the **code-edit** restriction for Phase 1 only.

**Requested:**
- Allow **P1 (Level 1 + engine + schema + evidence wiring)** behind `NEXT_PUBLIC_TOOL036_V2=off` by default,
  on the preview branch, **without** touching production, `main`, or any deploy.
- Still **forbidden**: Merge to `main`, Production deploy, force-push, #112–#115.

**Pre-conditions to grant:**
- [ ] This design doc approved.
- [ ] `docs/tool-036-v2-spec.md` (pseudo-spec + 20 tests) approved.
- [ ] `docs/evidence/tool-036-evidence-table.md` reviewed (Low-confidence rows accepted as labelled).
- [ ] `docs/perf/tool-036-budget.md` accepted.
- [ ] Explicit "go" from the human partner for **P1 only**.

**Not requested:** production release, main merge, or touching #112–#115.

---

*End of design document. Educational only. Consult a clinician.*
