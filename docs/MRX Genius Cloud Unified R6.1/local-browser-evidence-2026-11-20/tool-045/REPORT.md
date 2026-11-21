# Tool 045 — Local browser verification (isolated build)

- **Test date:** 2026-11-20; local session approximately 14:50–16:36 (+02:00). This is supplemental local evidence only.
- **Canonical routes:** `/smarttools/cycle-management/tool-045-cycle-break-planner` and `/en/...`, `/ar/...` under `http://localhost:3114`.
- **Build/serve:** Next.js production build in `.local-browser-verify-20261120`, dedicated `distDir: .next-local-browser-verify`; server `next start -p 3114`. Build completed (506/506 static pages). This copy contains the existing dirty working-tree contents and is **not a clean clone**.
- **Source identity:** HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; branch `feat/r6.1-tools-041-042`; working tree dirty. Component SHA-256 `8a726e5f66a34d1635e212170a4df0a29be9ce268498a0ba28b55422fcd7fde3` (`components/tools/tool-045-cycle-break-planner.tsx`).
- **Evidence:** separate isolated screenshots in this folder, `tool-045-*-isolated.png`. Browser viewport was tested at 390×844 and 1440×900 CSS px. The preview save operation reports desktop bitmap 1280×800 and mobile bitmap 780×1688 (DPR 2); these are distinct from the requested CSS viewport dimensions. The earlier `*-error.png` is retained as historical evidence from port 3112 and is not evidence of this isolated run.

## Result — local interactive behavior passed; release gates remain open

The route hydrated and worked on port 3114. This supersedes the *environment-specific* hydration failure recorded from port 3112; it does not change any historical completion ledger, and it does not establish E3/E4, clean-clone, deployment, or live-site proof.

### Verified interactions

- English/LTR and Arabic/RTL route rendering; `dir` was `ltr`/`rtl` respectively.
- Empty state; valid input `cycle-weeks=12`, baseline bloodwork `yes`, compound `Testosterone Enanthate`, half-life `4.5`, suppression `2` transitioned to `FULL` and updated output to 23 days clearance, PCT `D+30`, 6 weeks, 15-week baseline recovery.
- Invalid input `cycle-weeks=0` produced `INVALID`, `aria-invalid=true`, an Arabic out-of-range alert, and no computed summary.
- Add-compound button created a second row; Compact/Full buttons switched between CORE-5 boxes `[2,3,7,9,12]` and all 12 boxes, preserving calculated output.
- Tested at mobile (390×844 CSS) and desktop (1440×900 CSS); no overflow was found among descendants of the tool root. The shared secondary navigation has off-viewport links on mobile and the document/body scroll extents differ (`body.scrollWidth` 433 at 390px, 1600 at 1440px while `documentElement.scrollWidth` matches viewport). Treat this as a shared-layout/header overflow review item, not a confirmed calculator-content clipping defect.
- No route-chunk 400 or uncaught tool exception observed on the isolated build. `/api/translate` returned 503 in English, with the UI reporting translation provider unavailable; tool labels remained English and Arabic routes used human-authored Arabic. Historical port-3112 run separately observed external `noise.svg` HTTP 402.

## Closure conditions still open

This does not close Tool 045. Requirements for approved references/clinical review, referral evidence, W18 owner decisions, and all shared gates remain as captured in the canonical R6.1 ledgers. No authorized SSO/deployed Source SHA, E4 evidence, owner acceptance, or clean clone was available. Preserve historical ledger counts/statuses. Do not promote these local results to E3/E4 or release.
