# TOOL 039 — REQUIREMENT LEDGER CHANGE LOG

**Ledger:** `docs/MRX Genius Cloud Unified R6.1/tool-039-requirements.csv` (123 rows × 14 columns)
**Calculator:** `docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs` (regenerates this log's figures)
**Versions referenced below**
- `VERSION-PUBLISHED-2026-11-11-A` — the source snapshot deployed as **Vercel deployment `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67`** (created `2026-11-11T17:18:15Z`, preview target). Evidence set **A** = the browser run and the three screenshots taken **against that deployment**. **Superseded** by `VERSION-PUBLISHED-2026-11-12-B`.
- `VERSION-WORKTREE-2026-11-11-B` — the working tree after the owner's second review (adds the legibility row, evidence repairs, two copy refinements, two new tests). **Not deployed** in that round — no new deployment was authorised then.
- `VERSION-PUBLISHED-2026-11-12-B` — the working tree after the owner's third review (the illustration-visibility fix, the phone-stack legibility fix and the step-numbering fix), deployed as **Vercel deployment `dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689`** (created `2026-11-12T00:35:39+02:00`, preview target). Evidence set **B** = the browser run and the four screenshots taken **against that deployment**.

---

## Round 1 — first rebuild of the ledger (2026-11-11, before the published deployment)

| Action | Requirement ID(s) | Reason |
|---|---|---|
| Added (split from the ambiguous generic row) | `ACC-5.5.1` … `ACC-5.5.11` | The owner required the ACCEPTANCE §5.5 bullets to be independently provable instead of covered by one generic "visual" row |
| Added | `SPEC-6.6-SLIDER`, `SPEC-6.7-TOOLTIP`, `SPEC-7.1-CHART`, `SPEC-7.2-ARROWS`, `SPEC-7.4-ILLUSTRATION`, `SPEC-15-A11Y` | The owner required the visual requirements to be traceable to SPEC §6.6 / §6.7 / §7.1 / §7.2 / §7.4 / §15 |
| Modified (scope narrowed, not downgraded) | `LAYER-VISUAL-512` | Its own scope is the 12-box visual structure; the graphics/tooltips/accessibility now live in the rows above. The row keeps PASS/E3 and points to the new rows |
| Added | `LAYER-20MAP-03-TENANT` | The implementation-map row mixed two independent legs (cross-tool contract, tenant isolation). The tenant leg is NOT_APPLICABLE for this tool (no persistence, no transfer) and is registered in the system register |
| Added | `LAYER-GENIUS12-12-RATING` | The rating/comment half of box 12 is an independent requirement from the C5 half (which stays PASS in `LAYER-GENIUS12-12`) |
| Status change | `LAYER-GENIUS12-11` NOT_AVAILABLE → **BLOCKED** | The owner required that an applicable requirement which is unavailable stays incomplete and is recorded as blocked by a pending decision (W18), not as "not available" |
| Status change | `SPEC-R6.1-2.d` NOT_APPLICABLE → **PASS** | The "debounced result engine" attribute is now implemented (120 ms debounce, one calculation per burst) instead of being excluded |
| Status change | `SPEC-R6.1-2.h` PARTIAL → **PASS** | The cross-tool link contract object (sourceToolId/targetToolId/mappedFields/freshnessRule/staleAction) is implemented with transfer mode `manual-reentry` |
| Status change | `LAYER-20MAP-03` PARTIAL → **PASS** | Same as above for the cross-tool leg |
| Status change | `ACC-R6.1-3.d` PARTIAL → **PASS** (E3 → E4) | Mobile/desktop rendering is now verified in a real browser at 390×844 and 1440×900, with screenshots |
| Status change | `ACC-R6.1-3.a` PARTIAL → **PASS** (E3 → E4) | The published deployment is verified at HTTP level and its runtime log contains no 5xx entry |
| Evidence upgraded (E2 → E3) | `SPEC-R6.1-6.a`, `ACC-R6.1-3.j`, `ACC-R6.1-4.b`, `ACC-R6.1-4.c`, `LAYER-NODELETE` | The owner rejected file-level evidence (E2) as success proof; a re-runnable test now proves each of these five rows |
| Evidence refreshed (text only) | `SPEC-R6.1-1.b`, `SPEC-R6.1-3.d`, `SPEC-R6.1-6.b`, `ACC-R6.1-2.g2` | Stale counters and a stale "remains PARTIAL" note inside an evidence cell were corrected; no status, level or ID changed |

**Effect on the figure:** 104 rows → 121 rows; applicable 75 → 92; complete 62 → 90; **62/75 = 84.93% → 90/92 = 97.83%**.

---

## Round 2 — owner's second review (2026-11-11, `VERSION-WORKTREE-2026-11-11-B`)

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Added (OPEN row)** | `ACC-5.5.7-LEGIBILITY` | The owner: "لا تعتبر ACC-5.5.7 دليلًا على قابلية قراءة الرسم؛ قياس overflow لا يثبت legibility". The row is anchored to SPEC §15 ("responsive desktop/mobile behaviour", "charts have accessible names, descriptions and equivalent data table") and ACCEPTANCE §5.5 ("Mobile/desktop layouts are usable"). **Status B=FAIL, E=E4**: the check was executed in real Chrome at 390×844 and the diagram text renders at **4.61 px** (scale 0.419), below the 12 px readable threshold, while the numbered text equivalent renders at 12 px. Required evidence for closure is stated in the row (an HTML/CSS flow layout, a vertically stacking SVG under 480 px, or text that stays ≥ 12 px after scaling). The fix is a tool change and is **not applied** in this round |
| Modified (scope narrowed) | `ACC-5.5.7` | Its evidence now proves exactly what it shows — layout, reachability of every visual element, and no horizontal overflow at 390 px — and explicitly no longer claims diagram legibility (that is the new row) |
| Modified (evidence repaired) | `SPEC-R6.1-3.d` | The cited test proved only the AR/EN translation, not "correct, tested and accessible". The row now cites the i18n parity result **plus** the new CORE-5 content test and the keyboard/browser a11y evidence |
| Modified (evidence repaired) | `SPEC-R6.1-3.g` | The cited test proved only the cross-tool links. The row now also cites the published screenshot (progress indicator "48/268" + breadcrumb), the HTTP 200 on the registry href, and the shell file that renders breadcrumb/progress/prev-next/tooltips |
| Modified (evidence repaired) | `SPEC-R6.1-2.f` | One test proved only part of the claim; the row now cites the C1 test, the C2 test, the new CORE-5 content test and the C4 sources test (MVO, UnitUsed, FormulaUsed, Uncertainty, Evidence) |
| Modified (evidence repaired) | `ACC-R6.1-3.b` | The "timezone" leg was only implicit; a dedicated DST/timezone-free test was added and is now cited |
| Modified (evidence repaired) | `ACC-R6.1-3.a` | Stale test counters (72) replaced with the current figures (61 targeted / 319 wider) and the runtime-log evidence |
| Modified (evidence repaired) | `ACC-R6.1-1.b` | States exactly what the calculator enforces (E-level present, URI present, no PASS counted below E3) and that the NOT_FOUND/SPECIFIED rules are enforced by the calculator rather than by a separate test |
| Modified (evidence repaired) | `SPEC-R6.1-3.e` | Explains how the global measurement panel is respected (the slider field is a unitless integer; the global `unitSystem` is still carried in the envelope) |
| Modified (evidence repaired) | `ACC-R6.1-4.b` | States the tool slice of the acceptance package and that the E5 part (independent audit) is the owner's step and is not claimed by the developer |
| Modified (evidence refreshed) | `LAYER-TOOL111-CHARTS` | Stale "47-file run" counter refreshed |
| Data repair | 16 rows | The `evidence_uri` cell of 16 rows contained a comma and had been written unquoted, producing 15 cells instead of 14. The cells were merged and the file re-quoted; `LEDGER_INTEGRITY: OK` confirms 14 columns on every row |

**Effect on the figure:** 121 rows → **122 rows**; applicable 92 → **93**; complete 90 (unchanged); **97.83% → 90/93 = 96.77%**.
The denominator moved because the owner required the legibility gap to be represented by its own applicable row instead of being absorbed into a passing row.

---

## Round 3 — owner's third review (2026-11-11, `VERSION-WORKTREE-2026-11-11-B`)

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Text restored** | `ACC-5.5.7` | Round 2 had narrowed the wording of the original requirement. The owner required the full original text to be preserved. The row now reads, unchanged: *"Mobile and desktop layouts are usable (ACCEPTANCE_CRITERIA.md 5.5, SPEC 15)"* |
| **Mapping documented (no drop, no double count)** | `ACC-5.5.7` + `ACC-5.5.7-LEGIBILITY` | The applicability cell now states the split explicitly: part (a) layout + reachability + no horizontal overflow (evidenced in `ACC-5.5.7`), part (b) legibility of the diagram text (evidenced in `ACC-5.5.7-LEGIBILITY`). Each part is counted once; while part (b) is FAIL the original requirement is **not** closed. The same mapping is written in the acceptance file §8b |
| **Threshold provenance documented** | `ACC-5.5.7-LEGIBILITY` | The 12 px figure is an **internal engineering criterion** of the check script, not an R6.1 rule — no R6.1 paragraph specifies a minimum font size. The row now says so and rests the failure on the measured 4.61 px and on the 390 px screenshot, not on an attributed R6.1 clause |
| **Counts unified** | `SPEC-R6.1-1.a`, `SPEC-R6.1-1.b`, `ACC-R6.1-3.a`, `ACC-R6.1-3.c`, `LAYER-TOOL111-CHARTS` | The owner found a conflict between "61/319" and "50 files / 321 tests". Both runs were re-executed and the exact figures are now cited everywhere: **Scope 1 = 6 test files, 81 tests, 81 passed** (component 33 · visual component 17 · pipeline 8 · contract 13 · engine 3 · acceptance-evidence 7) and **Scope 2 = 50 test files, 321 tests, 321 passed**. The stale "61" and "319" figures are gone; no PASS status was changed on the basis of a total |
| Files changed | — | No tool file, engine, schema, registry or catalogue was modified in this round. The only changes are to the ledger, the acceptance template/file, the change log and the preview index |

**Effect on the figure:** unchanged — 122 rows · 93 applicable · 90 complete · **90 / 93 = 96.77%**.

---

## Round 4 — authorized legibility fix (2026-11-11, `VERSION-WORKTREE-2026-11-11-C`)

**Owner authorization:** "OWNER AUTHORIZATION — TOOL 039 LEGIBILITY FIX ONLY" — scope limited to `ACC-5.5.7-LEGIBILITY`, no deployment without a separate authorization.

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Status change FAIL → PASS** | `ACC-5.5.7-LEGIBILITY` | The authorized fix was implemented and re-measured in a real browser at 390×844: the desktop SVG is hidden at that width and the phone stack renders all **5/5** steps with the smallest **visible** diagram text at **12.00 px** (largest 13.00 px) and **0** horizontal overflow. Evidence: `evidence/tool-039/legibility-390.json` + `evidence/tool-039/legibility-390.png`. The same check measured 4.61 px (FAIL) before the fix |
| **Evidence updated** | `ACC-5.5.7` | The row now states that part (a) (layout, reachability, no overflow) is proved here and part (b) (legibility) is proved in `ACC-5.5.7-LEGIBILITY` — the original requirement text is unchanged and each part is counted once |
| **Counts refreshed** | `SPEC-R6.1-1.a`, `ACC-R6.1-3.a`, `ACC-R6.1-3.c` | New runs after the fix: **scope 1 = 6 test files, 83 tests, 83 passed** (visual component 19) and **scope 2 = 50 test files, 323 tests, 323 passed** |
| Files changed | — | `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` (phone stack + desktop SVG kept), `components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx` (+2 tests), `docs/.../tool-039-legibility-check.mjs` (measures the *visible* text, captures a screenshot), `evidence/tool-039/legibility-390.{json,png}` |

**What the fix does NOT change:** the five steps and their meaning (one data source `diagramSteps`), the SVG and its connectors on desktop, any pipeline/engine value or unit, hover/focus/touch/Escape/close behaviour, AR/EN and RTL/LTR, the accessible names and the equivalent data table.

**Effect on the figure:** 122 rows · 93 applicable · **91 complete** · **91 / 93 = 97.85%**.
Two rows remain open and blocked by the owner: `LAYER-GENIUS12-11` (History) and `LAYER-GENIUS12-12-RATING` (rating) — both require W18.

---

## Round 5 — History & Context Integration + illustration-visibility fix (2026-11-12, `VERSION-PUBLISHED-2026-11-12-B`)

**Owner instruction:** "تعليمات ملزمة: History & Context Integration" — the founding instructions and the whole chronological record had to be re-read from the primary sources, the task pipeline rebuilt, and the open requirement — *"الرسم التوضيحي الجديد غير ظاهر في النسخة التي راجعتها"* (the new illustration is not visible in the version I reviewed) — traced and closed with real browser evidence on the **published** preview.

**Owner authorization for this round:** *"Approved — Preview Deployment Only."* — a new Tool 039 Preview deployment from the local working tree, with no commit/push/merge/rebase, no production deploy, no protection change and no Supabase/DB/RLS/W18 work; the browser tests had to be re-run **on the published preview URL itself**.

### The defect, traced end-to-end

| Chain link | Finding |
|---|---|
| Visual component | `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` exists and renders the diagram — **it was correct all along** |
| Import / export | `tool-039-liver-enzyme-tracker.tsx` imported it correctly — **correct** |
| Tool 039 page | The route resolves through `app/smarttools/[category]/[tool]/page.tsx` → `getToolComponent` → the same component — **correct** |
| **Conditional rendering** | **ROOT CAUSE.** The whole visual section was rendered only under `resultStatus === 'FULL' && output && parsedInput`. On first load the tool is EMPTY, so **the page had no diagram at all** |
| Build output | `next build` succeeded — the build was never the problem |
| Preview deployment | The published deployment served the pre-fix build: its server-rendered HTML contained **0** occurrences of `data-r6-visual` / `data-r6-illustration` / `data-r6-illustration-text` / `data-r6-illustration-mobile` / `data-r6-diagram-step` |
| Actual browser display | The owner saw no illustration — consistent with the conditional gate, and the pre-fix deployment was also behind the legibility fix |

### Ledger actions

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Added (new atomic row)** | `ACC-5.5.3-VISIBILITY` | The owner reported that the illustration was not visible. The requirement is split out from `ACC-5.5.3` (which covers *labelling* of an illustration) because visibility in **every** state is a separate, independently provable property. B=PASS, E=E4 |
| **Status change (implementation)** | `components/tools/tool-039-liver-enzyme-tracker.tsx`, `…visual.tsx` | The illustration (SVG + phone stack + text equivalent) is now rendered **unconditionally**; only the data-driven parts (bar/gauge, line chart, data table) stay behind a real result, so no value is ever invented (SPEC-R6.1-1.f, ACC-5.5.11) |
| **Evidence extended** | `ACC-5.5.3`, `SPEC-7.4-ILLUSTRATION`, `ACC-5.5.7`, `ACC-5.5.7-LEGIBILITY`, `SPEC-7.1-CHART`, `SPEC-7.2-ARROWS` | Each row now also cites the EMPTY-state proof and/or the re-run on the published deployment |
| **Test determinism repair** | `SPEC-7.2-ARROWS` | The two-way highlight link travels through a window event whose listener is registered by the GENIUS-12 component's effect. The test now waits for that component to be mounted before dispatching the focus event, so the assertion is **deterministic** (12 consecutive runs, 12/12 PASS) instead of depending on React effect timing |
| **Counts refreshed** | `SPEC-R6.1-1.a`, `ACC-R6.1-3.a`, `ACC-R6.1-3.c` | New runs after the fix: **scope 1 = 6 test files, 86 tests, 86 passed** (visual component 22) and **scope 2 = 50 test files, 326 tests, 326 passed** |
| Files changed | — | `components/tools/tool-039-liver-enzyme-tracker.tsx`, `components/tools/tool-039-liver-enzyme-tracker.visual.tsx`, `components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx` (+3 tests, +1 determinism repair), `docs/.../tool-039-browser-verify.mjs` (+4 checks), `docs/.../tool-039-preview-proxy.mjs` (new test helper), `evidence/tool039-fix/` and `evidence/tool039-published-fix/` (new). **No engine, schema, registry or catalogue change; no commit/push/merge/rebase** |

**Effect on the figure:** 122 rows → **123 rows** · 93 applicable → **94 applicable** · 91 complete → **92 complete** · **91 / 93 = 97.85% → 92 / 94 = 97.87%**.

The two rows still open are unchanged and still blocked by the owner: `LAYER-GENIUS12-11` (History) and `LAYER-GENIUS12-12-RATING` (rating) — both require W18.

---

## Round 6 — owner decision D-08, Option A: local device-only History + Rating (2026-11-12)

**Owner decision:** "OWNER DECISION — TOOL 039 — D-08 … أوافق على تنفيذ OPTION A — LOCAL DEVICE-ONLY STORAGE … لنطاق Tool 039 فقط" — a limited exception to the W18 blocker, Tool 039 only, no project-level W18 opening, no cloud sync, no session persistence, no shared storage between tools.

### The security finding that shaped the implementation

The owner required: "تحقّق من تنفيذ `SecureStorage` ومصدر مفتاح التشفير قبل الاعتماد عليه، ولا تعتبر وجود AES وحده إثباتًا كافيًا للأمان."

**Measured in real Chrome against the built app** (`docs/MRX Genius Cloud Unified R6.1/tool-039-secure-storage-probe.mjs`): the shared `shared/lib/secureStorage.ts` helper **writes PLAINTEXT in this application**. `config/env.ts` reads the key from `VITE_ENCRYPTION_KEY`; the build is Next.js, which inlines only `NEXT_PUBLIC_*`, so the key is absent from the client bundle (verified: the literal key value appears in no `.next/static/chunks/*.js`); therefore `env.ENCRYPTION_KEY` is `undefined` in the browser and `SecureStorage.setItem` takes its `if (!ENCRYPTION_KEY)` branch. The probe wrote `PROBE_MEDICAL_VALUE_112` and read it back **verbatim**.

**Consequence:** the shared helper is **not** used for the medical values. The tool uses a **per-installation random key** (Web Crypto `getRandomValues`, stored only in that browser profile) and encrypts the payload with AES. The browser check *"the stored blob is not readable plain text on the device"* proves it. The UI states the honest limit: client-side encryption is **not** an absolute guarantee against scripts on this origin or anyone who can read the browser profile.

### Ledger actions

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Status change BLOCKED/E0 → PASS/E3** | `LAYER-GENIUS12-11` | The History box now saves the engine result by an explicit action after an explicit consent, lists it with its date/values/units/status/age, marks it **Stale at read time** (> 90 days), deletes one or all, exports CSV, keeps a 365-day retention TTL and deletes everything when the consent is withdrawn |
| **Status change BLOCKED/E0 → PASS/E3** | `LAYER-GENIUS12-12-RATING` | The rating (1–5) and the optional comment (max 500 characters) are bound to **one** saved result id, can be edited and cleared, and follow the same consent / delete / retention rules |
| **NOT_APPLICABLE → APPLICABLE (PASS/E3)** | `SPEC-R6.1-4.f` | The tool now HAS per-user (per-device) memory and implements exactly the four properties this requirement asks for: revocable consent, view/delete/export, a TTL, and no shared memory. The cloud / per-tenant variant stays behind W18 |
| **Reason corrected (status unchanged)** | `SPEC-R6.1-5.a`, `SPEC-R6.1-5.b`, `SPEC-R6.1-5.e`, `ACC-R6.1-3.e`, `LAYER-20MAP-03-TENANT` | These rows said *"the tool stores nothing"*, which is no longer true. The **status stays NOT_APPLICABLE** and the **requirement text is unchanged**: device-local storage has no tenant scope, no server-side key, no RLS boundary, no server-side IAM and no server-side backup, so there is still nothing there to isolate, to authorise or to back up. The proof in each row is now the source scan that shows there is **no server persistence and no network call** |
| **Evidence updated** | `SPEC-R6.1-6.d` | The W18 row now records the D-08 limited exception and states what was NOT done: no database, no migration, no RLS policy, no session and no cloud storage |
| **Scope statement corrected** | `R6.1-PREVIEW-INDEX.md` | The tool is no longer "compute-and-display only" — it now has a local, device-only save path. The published preview still serves the pre-D-08 build |
| Files changed | — | New: `lib/tools/r6/tool-039-liver-enzyme-tracker-history.ts` (+test), `lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.ts` (+test), `components/tools/tool-039-liver-enzyme-tracker.history.tsx` (+test), `docs/.../tool-039-secure-storage-probe.mjs`. Modified: `components/tools/tool-039-liver-enzyme-tracker.tsx`, `…genius.tsx`, `…test.tsx`, `i18n/tool-039-liver-enzyme-tracker.json` (234 → 262 keys per locale), `docs/.../tool-039-browser-verify.mjs` (+10 checks) |

### What was NOT done (the owner's prohibitions, checked)

No migration · no Supabase write · no database change · no RLS policy · no cloud storage or cloud sync · no change to the authentication or identity system · no data storage enabled in any other tool · no commit / push / merge / rebase · no production deployment · no paid AI service and no user data sent to any external party.

**Effect on the figure:** 123 rows · 94 applicable → **95 applicable** · 92 complete → **95 complete** · **92 / 94 = 97.87% → 95 / 95 = 100.00%**.

**Both previously blocked rows are now implemented and proven at E3.** The owner decision (C) is still `PENDING` on every applicable row, and the **E4 evidence on the published preview awaits the separate deployment authorization** the owner explicitly separated from this implementation.

---

## Round 7 — E4 on the published Preview (2026-11-13)

**Owner authorization:** *"EXPLICIT OWNER AUTHORIZATION — TOOL 039: APPROVED, ONE NEW PREVIEW DEPLOYMENT ONLY"* — one Preview deployment for the final E4 verification of History and Rating/Comment after D-08. Explicitly **not** a final acceptance of Tool 039.

### The deployment

| Field | Value |
|---|---|
| Deployment ID | `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc` |
| Preview URL | https://mrxsteroid-fuvgd9qsp-georges-projects-78ef250b.vercel.app |
| Alias | `mrxsteroid-preview-tool039.vercel.app` (repointed) |
| Target / state | `preview` / READY · `productionUrl` empty |
| Created | 2026-11-12T23:55Z |
| Build log | `✓ Compiled successfully in 42s` · `✓ Generating static pages (506/506)` — no error |
| Deployed from | the local working tree, **unchanged** since the 43/43 browser run (no commit / push / merge / rebase) |
| Protection | `vercel_authentication` **unchanged** — anonymous `302` → vercel.com/login on both the deployment URL and the alias; `ssoProtection=all_except_custom_domains`; **0** protection-bypass entries |
| SHA-256 manifest | `evidence/tool039-published-d08/deploy-source-manifest.json` (10 app files, 5 test files, 5 harness files) |

### The E4 evidence, taken ON the published deployment

- **Browser suite against the published URL: 43/43 PASS** (reached through the owner's own authenticated Vercel CLI session, relayed locally by `tool-039-preview-proxy.mjs` — no protection change, no bypass secret).
- **Two independent Chrome profiles against the published deployment: PASS** — profile A consented and saved (1 entry, 2 device keys), profile B had 0 entries and 0 device keys.
- **Bundle proof:** the published client chunk `/_next/static/chunks/app/smarttools/[category]/[tool]/page-f52f77e146012c11.js` (2,559,445 bytes) carries `mrx_tool039_history_v1`, `mrx_tool039_history_key_v1`, *"Allow local storage on this device"* and *"Withdraw consent and delete the stored data"* — the published build really contains the implementation.
- **Screenshots** (published deployment): `tool-039-empty-1440.png`, `tool-039-desktop-1440.png`, `tool-039-history-1440.png`, `tool-039-history-390.png`, `tool-039-mobile-390.png`, `tool-039-arabic-rtl-1440.png`.

### Ledger actions — only the two D-08 rows moved

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Evidence level E3 → E4** | `LAYER-GENIUS12-11`, `LAYER-GENIUS12-12-RATING` | The 43 browser checks and the two-profile isolation check were re-run **against the published deployment**, so the evidence is now a live run with a build log — E4 on the R6.1 ladder. No other row, status, requirement text, applicability or C value changed |

**Effect on the figure:** unchanged — 123 rows · 95 applicable · 95 complete · **95 / 95 = 100.00%** (the E3→E4 move does not change the numerator or the denominator).

**Still open, and still the owner's alone:** the decision (C) on all 95 applicable rows (every row is `PENDING`), the conflicts C1 / C2-C8 / C5, and the final acceptance of Tool 039. The tool status stays **`OWNER_REVIEW`**. **No second deployment was created and Tool 040 was not started.**

---
## Round 8 — the OWNER DECISION: `OWNER_ACCEPTED` (2026-11-12)

**Owner decision (verbatim):** *"بعد مراجعتي للنسخة المنشورة من Tool 039، أوافق على قبولها نهائيًا. OWNER DECISION: OWNER_ACCEPTED. أعتمد نتائج التنفيذ والاختبارات والأدلة المسجلة، وحدّث قرارات المالك في سجل القبول للمتطلبات الـ95 المنطبقة وفق هذه الموافقة. أغلق Tool 039 رسميًا، واحتفظ بجميع الأدلة وسجل التغييرات كما هي."*

### What changed

| Action | Scope | Reason |
|---|---|---|
| **Owner decision (C) applied** | the **95 applicable rows**: `PENDING` → **`APPROVED`** | The owner reviewed the published Preview `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc` and approved them. Each row's evidence cell gained a pointer to the decision; **no evidence, no requirement text, no applicability, no B status and no E level was changed** |
| **Left untouched, deliberately** | the **28 NOT_APPLICABLE rows**: `C` stays `NOT_DECISIONED` | They are excluded from the denominator with a recorded proof of non-applicability, and the owner's decision was scoped to the 95 applicable rows |
| **Status recorded** | `TOOL-039-ACCEPTANCE.md`, `R6.1-PREVIEW-INDEX.md`, this log | Tool 039 is closed as `OWNER_ACCEPTED`; the acceptance conflict (§3) and the wider conflict set (§8: C1, C2/C8, C5) remain OPEN at project level — they are not Tool 039's rows |

### What was preserved exactly as it was

- The **123-row ledger** — one column changed (C on 95 rows). 123 rows · 95 applicable · 28 NOT_APPLICABLE with proof · **95 / 95 = 100.00%** · `LEDGER_INTEGRITY: OK`.
- **All evidence**: `evidence/tool039-fix/`, `evidence/tool039-published-d08/` (deployment record, SHA-256 manifest, 43/43 browser log, the two-profile isolation proof, the bundle proof, 6 screenshots), `evidence/tool039-history/`.
- **The change log rounds 1–7** — not rewritten; this round is appended.
- The published deployment and the alias; the protection (`vercel_authentication`, `ssoProtection=all_except_custom_domains`, 0 bypass entries); HEAD `5a87f3e5` with the Tool 039 work still uncommitted, as the owner instructed.

### The acceptance-evidence test was updated, not weakened

While the approval was pending, `tests/unit/tool-039-acceptance-evidence.test.ts` asserted that **no** row carried `APPROVED` and that the acceptance file did **not** claim owner approval — that was the correct guard against a developer self-approving. It now asserts the opposite of what it used to guard against, and guards the new state exactly:

- all **95** applicable rows are `APPROVED`, and **no** row is left `PENDING`;
- all **28** excluded rows are `NOT_DECISIONED` (no decision is required for a non-applicable row, and each still has a proof in the system requirement register);
- the acceptance document states `OWNER_ACCEPTED` and the scope of the decision.

**Tool 039 is closed. The next tool in sequence is Tool 040, under the R6.1 requirements, with the same implementation and verification methodology, without redoing the completed work and without changing any prior decision.**

---
## Open rows after round 8 (the complete list of non-complete applicable rows)

**NONE.** Every applicable row is B=PASS with E>=E3, and the owner decision (C) is **APPROVED** on all 95 applicable rows (owner decision 2026-11-12, Tool 039 closed as `OWNER_ACCEPTED`).

| ID | B | E | Reason | Closes with |
|---|---|---|---|---|

The two rows that were open until round 6 (`LAYER-GENIUS12-11` History and `LAYER-GENIUS12-12-RATING` Rating / comment) were implemented under owner decision D-08 (Option A) and are now PASS/E3. What remains open is the OWNER decision, not the implementation:

- the separate deployment authorization, so the E4 evidence can be taken against the published Preview;
- the conflicts C1, C2/C8 and C5 recorded in `HISTORY-CONTEXT-INTEGRATION-REPORT.md` §8.
