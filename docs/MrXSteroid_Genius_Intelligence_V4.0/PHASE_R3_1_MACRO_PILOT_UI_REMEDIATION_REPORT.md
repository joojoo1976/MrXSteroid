# PHASE R3.1 — MACRO PILOT UI & ACCESSIBILITY REMEDIATION REPORT

Project: MrXSteroid Genius Intelligence V4.0  
Phase: R3.1 — Macro Pilot UI & Accessibility Remediation  
Date: 2026-11-05  
Authorization: Owner explicitly authorized R3.1 only  
Status: **COMPLETE — READY FOR R4 RE-EVALUATION**  
R5 status: NOT AUTHORIZED

## 1. Authorized Scope

Authorized files:

- `components/tools/macro-pilot.module.css`
- `components/tools/macro-pilot.tsx` — only to fix the status/accessibility behavior
- Macro-pilot-linked tests, with new specialized tests added as needed

Prohibited files and systems were not modified:

- Macro V6 engine/tests/schemas
- V4 adapter and contracts/runtime foundation
- `GeniusToolTemplateV4`
- Routes, registry, catalog
- Supabase, dependencies, providers, payments, checkout, dashboard/security-repair files
- R5 / broad rollout

## 2. Root Cause

The R3 integration moved `MacroPilotTool` from the V3 template to `GeniusToolTemplateV4`, but `components/tools/macro-pilot.module.css` was left styling only the V3 class tree.

Evidence found during R4 and reproduced before the fix:

- CSS contained `.genius-tool-template`, `.genius-tool-template__header`, `.genius-tool-template__inputs`, etc.
- CSS contained zero `.genius-tool-template-v4*` selectors.
- The pilot therefore rendered an unstyled V4 shell; Lighthouse reported six pilot input/select controls at contrast `1.09:1`.
- The V3 rule hiding the raw status chip did not apply to `.genius-tool-template-v4__status`, so raw contract text such as `partialINSUFFICIENT_FOR_SAFE_RESULT` became visible and occupied a live region.
- Mobile `@media (max-width: 40rem)` handling also targeted V3 selectors only.

Root cause: **CSS selector migration was not performed when the shell class tree changed from V3 to V4.**

## 3. Files Modified and Created

| File | Change | SHA256 |
|---|---|---|
| `components/tools/macro-pilot.module.css` | Replaced obsolete V3 selectors with the actual V4 tree; added WCAG-AA input styling, V4 cards, focus indicators, mobile/tablet rules, and pilot-only hiding of the raw V4 status region | `15F66CB3C3CAB4A394E260730C2AF8283ABACED38D76F34F6B3A143DE2745A5A` |
| `components/tools/macro-pilot.tsx` | Added `role="status" aria-live="polite"` to the existing localized domain status element | `7005D0747B8644E625339D24F1B0BEB6518695580E33CB6F27A5A230428E960D` |
| `components/tools/macro-pilot.remediation.test.tsx` | Created: 10 specialized R3.1 tests | `851F4597F0A387D425C84E9AF384158EBB51567DE37FE55D819BDA15B438E126` |
| `components/tools/macro-pilot.v4.integration.test.tsx` | Updated integration assertions for the single exposed localized status and Arabic localized announcement | `2A3F37FEC3109AA2B58D846845B2D7B6A1C31A40041E33711ACAF242221E74CA` |

No engine, adapter, contract, template, route, registry, catalog, Supabase, or dependency file was modified in R3.1.

## 4. Implementation Details

### 4.1 Raw V4 status token handling

`GeniusToolTemplateV4` cannot be modified under this authorization. The raw template status region remains in the DOM, but the pilot CSS applies `display: none` to `.genius-tool-template-v4__status`.

The existing localized Macro status element is now the exposed polite live region:

```tsx
<p data-testid="macro-status" role="status" aria-live="polite">
  {text.status[status]}
</p>
```

Visible and screen-reader text is therefore:

- English: `Inputs incomplete` / `Calculation complete` / etc.
- Arabic: `المدخلات غير مكتملة` / `اكتمل الحساب` / etc.

The raw region is removed from the accessibility tree by `display:none`. The localized region is the single exposed live status region. The DOM still contains the hidden template element; this is an intentional pilot-only boundary because the protected V4 template could not be changed.

### 4.2 V4 styling and responsive rules

The pilot CSS now targets:

- `.genius-tool-template-v4`
- `.genius-tool-template-v4__header`
- `.genius-tool-template-v4__inputs`
- `.genius-tool-template-v4__results`
- `.genius-tool-template-v4__errors`, `__warnings`, `__envelope`, `__explanation`, `__scenarios`, `__children`
- focus-visible states for inputs, selects, buttons, result links, envelope buttons

Responsive behavior:

- `@media (max-width: 40rem)`: V4 shell becomes full-width with single-column input grid.
- `@media (min-width: 40rem) and (max-width: 64rem)`: tablet-specific card padding and full-width V4 shell.
- `.shell` keeps `overflow-x: clip`.

### 4.3 Contrast and color

Computed post-remediation values in the embedded browser:

| Element | Foreground | Background | Computed ratio |
|---|---|---|---:|
| V4 input text | `rgb(255,255,163)` | `rgb(14,5,67)` | `17.91:1` |
| V4 primary input button | `rgb(13,13,13)` | `rgb(20,255,40)` | `14.22:1` |
| Card foreground | `rgb(255,255,163)` | card token | `18.20:1` |

All sampled pilot-specific text/background pairs exceed WCAG AA (`4.5:1` for normal text).

## 5. Test-First Evidence

Before the fix, `components/tools/macro-pilot.remediation.test.tsx` was run and failed:

```text
Test Files  1 failed (1)
Tests  9 failed | 1 passed (10)
```

Failures covered V4 CSS absence, obsolete V3 selectors, missing V4 input styling/focus/mobile rules, raw hidden-status CSS, and missing localized live-region markup.

After the fix:

```text
npx vitest run components/tools/macro-pilot.remediation.test.tsx
Test Files  1 passed (1)
Tests  10 passed (10)
```

## 6. Current-Session Verification Commands and Results

All results are current-session, not historical.

| Suite | Exact command | Result | Exit | Status |
|---|---|---|---:|---|
| Macro V6 | `npx vitest run lib/tools/engines/macro.v6.test.ts` | 81/81 passed | 0 | PASS |
| Body Fat V6 | `npx vitest run lib/tools/engines/bodyfat.v6.test.ts` | 46/46 passed | 0 | PASS |
| V4 Contracts | `npx vitest run lib/engines/core/v4/contracts.v4.test.ts` | 12/12 passed | 0 | PASS |
| V4 Runtime | `npx vitest run lib/engines/core/v4/runtime.v4.test.ts` | 50/50 passed | 0 | PASS |
| V4 Macro Adapter | `npx vitest run lib/engines/core/v4/adapter.macro.v4.test.ts` | 21/21 passed | 0 | PASS |
| V4 Template | `npx vitest run components/genius-tool-template.v4.test.tsx` | 13/13 passed | 0 | PASS |
| R3.1 remediation | `npx vitest run components/tools/macro-pilot.remediation.test.tsx` | 10/10 passed | 0 | PASS |
| R3 integration | `npx vitest run components/tools/macro-pilot.v4.integration.test.tsx` | 9/9 passed | 0 | PASS |
| Macro Pilot existing | `npx vitest run components/tools/macro-pilot.test.tsx` | 15/15 passed | 0 | PASS |
| Tool validator | `npx vitest run tests/unit/validateTools.test.ts` | 5/5 passed | 0 | PASS |
| TypeScript | `npx tsc --noEmit` | No diagnostics | 0 | PASS |
| Targeted ESLint | `npx eslint --no-warn-ignored components/tools/macro-pilot.tsx components/tools/macro-pilot.remediation.test.tsx components/tools/macro-pilot.v4.integration.test.tsx components/tools/macro-pilot.module.css` | 0 errors/warnings | 0 | PASS |
| Production build | `npm run build` | `✓ Compiled successfully in 42s`; `✓ Generating static pages (502/502)` | 0 | PASS |

Combined mandatory/remediation set: `262/262 passed`.

## 7. Browser and Lighthouse Evidence

Embedded browser at approximately `474px` width, after production build:

```text
innerWidth: 474
docScrollWidth: 459
horizontalOverflow: false
formGrid: 459.826px (single column)
labelsVisible: 6
shellMaxWidth: 100%
shellPadding: 0px 8px
v4Status display: none
localized domain status: Inputs incomplete
```

After switching to Arabic in the browser:

```text
lang: ar
dir: rtl
h1: حاسبة الماكروز V6
localized domain status: المدخلات غير مكتملة
v4StatusHidden: true
```

English LTR was verified at the default browser state before switching:

```text
dir: ltr
lang: en
domain status: Inputs incomplete
```

Lighthouse (executed through the in-app browser):

```text
Accessibility: 0.90
Best Practices: 1.00
SEO: 0.83
```

Pilot-specific Lighthouse failures from R4 are eliminated:

- `color-contrast` on the six pilot inputs/selects: **not present** in the new report.
- `target-size`: not attributed to the pilot; remaining item is a site-header `Home` button obscured by fixed header spacing.

Remaining Lighthouse failures are site-wide and outside R3.1 authorization:

- Site header navigation contrast `4.04`
- Site header `Home` target size
- Footer `heading-order`
- Missing document `main` landmark
- Missing meta description

Axe itself was not run because `axe-core` is not installed and dependency installation is prohibited. Lighthouse accessibility was run as the available audit.

Screen-reader review: **NOT RUN**.

Full keyboard traversal: **NOT RUN**. Automated button focus tests pass, and focus-visible CSS is present for inputs/selects/buttons/links.

Actual 375px viewport emulation: **NOT RUN** — the in-app browser cannot set the viewport without adding a dependency. The embedded browser width (`474px`) plus CSS source/media-query tests were used as the responsive evidence.

## 8. Duplicate UI / Status Verification

- No V3 shell class remains in the DOM (`document.querySelectorAll('.genius-tool-template').length` = 0).
- One V4 shell exists.
- One `h1` exists in the pilot integration test and one V4 template section in jsdom.
- The raw V4 status region is hidden from visual and accessibility output by `display:none`.
- The localized domain status is the exposed `role="status" aria-live="polite"` region.

Note: the raw V4 status element remains in the DOM because `GeniusToolTemplateV4` is explicitly protected. It is visually and accessibly removed by the authorized pilot CSS.

## 9. Non-Interference Verification

- Macro V6: unchanged; 81/81 tests pass.
- Body Fat V6: unchanged; 46/46 tests pass.
- V4 contracts/runtime/template: unchanged; 75/75 V4 foundation tests pass after the change.
- Route `/smarttools/nutrition/macro`: unchanged; still renders `MacroPilotTool`.
- Registry/catalog: unchanged.
- Supabase and database: untouched.
- Dependencies: none installed.
- Temporary build log and browser screenshots/audits remain in session temp, not the repository.

## 10. Rollback

To roll back R3.1 only:

1. Restore `components/tools/macro-pilot.module.css` from its R3/R4-remediated predecessor if R3 should remain.
2. Restore `components/tools/macro-pilot.tsx` to remove the localized live-region attributes if required.
3. Delete `components/tools/macro-pilot.remediation.test.tsx`.
4. Restore `components/tools/macro-pilot.v4.integration.test.tsx` to the R4-adjusted assertions.
5. No database/route/registry/catalog rollback is required.

## 11. Remaining Risks and Limitations

1. The raw V4 status element remains in the DOM because the V4 template cannot be modified; hiding is implemented pilot-side.
2. Actual 375px viewport emulation was not executed.
3. Screen-reader review and full keyboard traversal were not executed.
4. SEO score remains `0.83` due site-wide meta description; out of scope.
5. Site-wide accessibility defects remain and are outside R3.1 authorization.
6. V4 shell text is English-only by design before R5; domain-specific Arabic/label content is localized, and the exposed live status is localized.

## 12. Final R3.1 Decision

**R3.1 REMEDIATION COMPLETE.**

The pilot-specific R4 accessibility and styling failures have been resolved and are supported by current tests, browser checks, computed WCAG contrast ratios, and a fresh Lighthouse audit.

This does not authorize R5. Proceed only to owner-reviewed R4 re-evaluation.
