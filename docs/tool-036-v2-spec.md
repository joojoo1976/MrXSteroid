# Tool-036 v2 — Technical Spec (Pseudo-Spec + Test Cases)

**Status:** DESIGN ONLY (no implementation). **Depends on:** `docs/design/tool-036-supreme-v2-design.md`.
**Rule:** signatures only below; **no function bodies**. Phase 2 implements behind `NEXT_PUBLIC_TOOL036_V2=off`.

---

## 1. Scope & boundaries

| In scope (design) | Out of scope (explicit) |
|---|---|
| Pure engine contract + tests | Any runtime implementation |
| Zod schema shape | Registry edits (Phase 2) |
| Adapter I/O shape | Deploy / merge / production |
| Component split + budgets | #112–#115 |
| Evidence wiring | Telemetry / server storage |

---

## 2. Engine contract (Layer 1, pure — no I/O, no `Date.now()`)

```ts
// Types
export type EvidenceId = string;                         // 'A04'
export type Confidence = 'High' | 'Moderate' | 'Low';
export interface EvidenceRef { evidenceId: EvidenceId; confidence: Confidence; note?: string }
export type Zone = 'green' | 'yellow' | 'red';
export type SiteId = 'gluteal-L'|'gluteal-R'|'deltoid-L'|'deltoid-R'|'vastus-L'|'vastus-R'|string;

export interface EsterProfile {
  compoundId: string; nameEn: string; nameAr: string;
  halfLifeDays: number; labelApproved: boolean; evidence: EvidenceRef;
}
export interface DosePlanItem { compoundId: string; weeklyDoseMg: number; concentrationMgPerMl: number; injectionsPerWeek: 1|2|3|4|5|6|7 }
export interface PlanInput { plan: DosePlanItem[]; rotationSites: SiteId[]; startDateISO: string }
export interface PlannedShot { day: 0|1|2|3|4|5|6; compoundId: string; doseMg: number; volumeMl: number; siteId: SiteId; zone: Zone }
export interface GuardWarning { siteId: SiteId; kind: 'zone-yellow'|'zone-red'|'weekly-cap'|'site-ceiling'; evidence: EvidenceRef }
export interface PkCurvePoint { dayIndex: number; levelRel: number }
export interface AccumulationPoint { weekIndex: number; levelRel: number; steadyStateReached: boolean }
export interface RedFlag { code: string; messageEn: string; messageAr: string; evidence?: EvidenceRef }
export interface ScheduleResult {
  shots: PlannedShot[]; totalVolumeMlPerWeek: number; busiestDay: number;
  volumeGuard: { perSite: Record<SiteId, number>; warnings: GuardWarning[] };
  pk: Record<string, PkCurvePoint[]>;
  accumulation: Record<string, AccumulationPoint[]>;
  redFlags: RedFlag[]; provenance: EvidenceRef[];
}

// Signatures ONLY (no bodies)
export function classifyVolumeZone(volumeMl: number, siteId: SiteId): { zone: Zone; evidence: EvidenceRef };
export function siteCeilingMl(siteId: SiteId): { ceilingMl: number; evidence: EvidenceRef };
export function planInjectionSchedule(input: PlanInput, profiles: Record<string, EsterProfile>): ScheduleResult;
export function simulatePk(profile: EsterProfile, item: DosePlanItem, horizonDays: number): PkCurvePoint[];
export function simulateAccumulation(profile: EsterProfile, item: DosePlanItem, weeks: number): AccumulationPoint[];
export function detectRedFlags(partial: Omit<ScheduleResult,'redFlags'|'provenance'>): RedFlag[];
export function reflowMissedDose(result: ScheduleResult, missedDay: number, profile: EsterProfile): ScheduleResult;
export function buildRotationPlan(sites: SiteId[], logs: InjectionLog[], weeks?: number): RotationWeek[];
export function collectProvenance(result: Omit<ScheduleResult,'provenance'>): EvidenceRef[];
```

**Purity invariants:** deterministic; no `Date.now()`, no `Math.random()`, no network, no DB; `startDateISO` is the only time source.

---

## 3. Constants (with mandatory evidence)

| Constant | Value | evidenceId | Confidence |
|---|---|---|---|
| Deltoid ceiling | ~1 mL | B02 | High |
| Extended upper (large sites) | 5 mL | B01 | Moderate |
| Weekly per-site cap (design default) | 3 mL | *(design heuristic)* | — |
| Reuse floor (design heuristic) | 7 days | D04 | **Low (Expert)** |
| Optimal reuse gap (design heuristic) | 14 days | D04 | **Low (Expert)** |
| Zone green→yellow | 2 mL | B01–B05 | Moderate |

> Any constant with no `evidenceId` must be typed as `designHeuristic: true` and rendered with an
> "Expert · Low" badge. **No silent clinical constants.**

---

## 4. Adapter contract (Layer 3)

```ts
export function toDraft(input: PlanInput): ToolLogDraft;                 // status: 'draft'
export function toSubmitted(r: ScheduleResult): ToolLogSubmitted;        // status: 'submitted'
export function toDashboard(items: ToolLogSubmitted[]): DashboardModel;  // aggregated view
```

- `toDraft` never persists clinical output; only inputs.
- `toSubmitted` embeds `provenance[]` verbatim.

---

## 5. Registry / validation change (Phase 2 — enumerated blast radius)

```ts
// lib/tools/registry.ts
export type StackStatus = 'legacy' | 'layered' | 'layered-supreme';
```
Consumers to update in the same PR:
1. `lib/tools/registry.ts` — type + tool-036 entry.
2. `lib/tools/validation.ts:116` — extend `=== 'layered'` guard to include `'layered-supreme'` (+ evidence requirement).
3. `lib/tools/index.ts:45` — re-export unchanged (type widens automatically).
4. `lib/tools/smartToolsCatalog6.ts` — tool-036 `stackStatus` + `resultsVersion: 2`.
5. Tests that assert exhaustive `StackStatus` switches (search + update).
6. `docs/tool-stack.md` — document the new tier.

---

## 6. Test cases (≥ 20) — engine-first (TDD order)

> Written test-first in Phase 2. IDs map to the design doc §09.

| # | Given | When | Then |
|---|---|---|---|
| T01 | 1 compound, 2 inj/wk | `planInjectionSchedule` | exactly 2 shots/week |
| T02 | weekly 200 mg, 2 inj | plan | each shot = 100 mg; volume = dose/conc |
| T03 | volume 1.0 mL, deltoid | `classifyVolumeZone` | `green` |
| T04 | volume 2.5 mL, gluteal | `classifyVolumeZone` | `yellow` + `Limited Evidence` ref (B01) |
| T05 | volume 6.0 mL | `classifyVolumeZone` | `red` + block warning |
| T06 | volume 1.5 mL, deltoid | plan | `site-ceiling` warning (B02 ≈ 1 mL) |
| T07 | 2×2 mL same site in a week | plan | `weekly-cap` warning (> 3 mL) |
| T08 | ester half-life 0.8 d | schedule | EOD cadence proposed |
| T09 | ester half-life 4.5 d | schedule | 2×/week cadence proposed |
| T10 | any profile | `simulatePk` | level ≥ 0 and non-increasing between shots |
| T11 | enanthate, 8 weeks | `simulateAccumulation` | `steadyStateReached === true` |
| T12 | undecanoate (long t½) | `simulateAccumulation` | flatter curve than enanthate |
| T13 | weekly total high | `detectRedFlags` | flag raised (volume) |
| T14 | same site reused < 7 d | `detectRedFlags` | rotation flag raised |
| T15 | one missed day | `reflowMissedDose` | subsequent shots shift deterministically |
| T16 | non-clinical ester | plan | `labelApproved:false` ⇒ non-clinical badge, no label claim |
| T17 | any result | `collectProvenance` | non-empty, every clinical constant present |
| T18 | same input twice | plan | outputs deep-equal (determinism) |
| T19 | dose −10 / inj 9 | `PlanInputSchema` | validation error |
| T20 | shot with `evidenceId: ''` | `ScheduleResultSchema` | validation error |
| T21 | v == 2.0 | zone | `green` (boundary) |
| T22 | v == 5.0 | zone | `yellow` (boundary) |
| T23 | 12-week plan, 4 sites | `buildRotationPlan` | no site reused < 7 d (heuristic, labelled Low) |
| T24 | `stackStatus:'layered-supreme'`, no evidence | validation | fails (negative test) |
| T25 | L1 bundle build | budget check | < 150 KB gz && no chart lib in graph |

**Acceptance for Phase 1 PR:** T01–T25 green, 8-Gate PASS, budget report attached, flag default **off**.

---

## 7. Definition of Done (Phase 1)

- [ ] Engine tests T01–T25 green.
- [ ] Bilingual (AR/EN) Zod schemas strict.
- [ ] Level 1 component responsive (375/1440), no horizontal scroll.
- [ ] SEO metadata + JSON-LD present.
- [ ] `/evidence` drawer wired to `docs/evidence/tool-036-evidence-table.md`.
- [ ] Budget: L1 < 150 KB gz, LCP < 1.5 s emulated Moto G4.
- [ ] Feature flag default off; v1 unchanged when off.
- [ ] No claim without a resolvable evidence row.
