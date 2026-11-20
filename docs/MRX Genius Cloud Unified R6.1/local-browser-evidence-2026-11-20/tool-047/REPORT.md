# Tool 047 — Local browser verification (isolated build)

- **Test date:** 2026-11-20; local session approximately 14:50–16:36 (+02:00). This is supplemental local evidence only.
- **Canonical route:** `/smarttools/hormonal-health/tool-047-fertility-preservation`, with `/en` and `/ar` locale prefixes, served from `http://localhost:3114`.
- **Build/serve:** Next.js production build in `.local-browser-verify-20261120`, dedicated `distDir: .next-local-browser-verify`; server `next start -p 3114`. Build completed (506/506 static pages). This copy contains the existing dirty working-tree contents and is **not a clean clone**.
- **Source identity:** HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; branch `feat/r6.1-tools-041-042`; working tree dirty. Component SHA-256 `74d7fa11f97e683bc7ce1ea51be6fff84382414bb60627522517e02cd264bede` (`components/tools/tool-047-fertility-preservation.tsx`).
- **Evidence:** separate isolated screenshots in this folder, `tool-047-*-isolated.png`. Browser viewport was tested at 390×844 and 1440×900 CSS px. The preview save operation reports desktop bitmap 1280×800 and mobile bitmap 780×1688 (DPR 2); these are distinct from the requested CSS viewport dimensions. Earlier `*-error.png` screenshots remain historical evidence from port 3112 and are not evidence of this isolated run.

## Result — local interactive behavior passed; release gates remain open

The route hydrated and worked on port 3114. This supersedes the *environment-specific* hydration failure recorded from port 3112; it does not alter any historical completion ledger, and does not establish E3/E4, clean-clone, deployment, or live-site proof.

### Verified interactions

- English/LTR and Arabic/RTL routes (`dir=ltr`/`rtl`); the Arabic route used human-authored Arabic tool labels and output.
- Valid inputs age `30`, suppression `2`, HCG `no`, horizon `12` transitioned to `FULL`; displayed 65% estimated impact, 7-month recovery, and that it fits the horizon. Verified in EN and AR, at both 390×844 and 1440×900 CSS viewports.
- Invalid age `17` produced `INVALID`, `aria-invalid=true`, an out-of-range alert, and no computed summary.
- Compact/Full controls switched between CORE-5 boxes `[2,3,7,9,12]` and all 12 boxes; status and valid output were retained.
- At 390px, the tool root and its descendants had no measured horizontal overflow/clipping. Shared secondary navigation links extend outside the mobile viewport; `body.scrollWidth` measured 433 at 390px and 1600 at 1440px while `documentElement.scrollWidth` matched the viewport. This is a shared-layout/header overflow review item, not a confirmed clipping defect within the calculator.
- No route-chunk 400 or tool runtime exception observed on the isolated build. English route requested `/api/translate` and received 503 because no translation provider is configured; this did not prevent operation. Historical port-3112 run separately observed external `noise.svg` HTTP 402.

## Closure conditions still open

This does not close Tool 047. Approved references/clinical review, referral evidence, W18 owner decisions, and shared gates remain open in the governing R6.1 records. No authorized SSO/deployed Source SHA, E4 evidence, owner acceptance, or clean clone was available. Preserve historical ledger counts/statuses. Do not promote these local results to E3/E4 or release.
