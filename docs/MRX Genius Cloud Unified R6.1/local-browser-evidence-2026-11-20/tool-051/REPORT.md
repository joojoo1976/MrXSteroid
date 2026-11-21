# Tool 051 — Local browser verification (isolated build)

- **Test date:** 2026-11-20; local session approximately 14:50–16:36 (+02:00). This is supplemental local evidence only.
- **Canonical route:** `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator`, with `/en` and `/ar` locale prefixes, served from `http://localhost:3114`.
- **Build/serve:** Next.js production build in `.local-browser-verify-20261120`, dedicated `distDir: .next-local-browser-verify`; server `next start -p 3114`. Build completed (506/506 static pages). This copy contains the existing dirty working-tree contents and is **not a clean clone**.
- **Source identity:** HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; branch `feat/r6.1-tools-041-042`; working tree dirty. Component SHA-256 `a769ede8d7b6ab94b3469105ecc6ad84824dacf77e438a4a0d781bda6d8a0b46` (`components/tools/tool-051-peptide-dosage-calculator.tsx`). Arabic i18n SHA-256 `2842e0101a5eb1f9143fa8fcedcb7c6c64674a7be0f4aafa625a56ccd8c9782f` (`i18n/tool-051-peptide-dosage-calculator.json`). New local UI test SHA-256 `d287e242e20a929afd8eb62fb7695e6650b080897861adfa24bae6d06e41ed17` (`components/tools/tool-051-peptide-dosage-calculator.test.tsx`, untracked).
- **Evidence:** separate isolated screenshots in this folder, `tool-051-*-isolated.png`. Browser viewport was tested at 390×844 and 1440×900 CSS px (one additional EN capture at 1280×800). Preview save reports desktop bitmap 1280×800 and mobile bitmap 780×1688 (DPR 2); bitmap dimensions are distinct from CSS viewport dimensions. Earlier `*-error.png` screenshots are historical evidence from port 3112, not this isolated run.

## Result — local interactive behavior passed; release gates remain open

The route hydrated and worked on port 3114. This supersedes the *environment-specific* hydration failure recorded from port 3112; it does not alter historical completion evidence, and does not establish E3/E4, clean-clone, deployment, or live-site proof.

### Verified interactions

- English/LTR and Arabic/RTL routes (`dir=ltr`/`rtl`); Arabic route displayed the plural label `حاسبة جرعة الببتيدات` and Arabic tool copy.
- Valid inputs vial strength `5`, BAC water `2`, desired dose `0.25` transitioned to `FULL`: concentration 2.5 mg/ml, dose volume 0.1 ml, U-100 draw 10 U, 20 doses per vial. Verified in EN and AR at 390×844 and 1440×900 CSS viewports.
- Invalid vial strength `100.1` produced `INVALID`, `aria-invalid=true`, an out-of-range alert, and no computed summary.
- Compact/Full controls changed between CORE-5 boxes `[2,3,7,9,12]` and all 12 boxes, while retaining valid calculations.
- At 390px, the tool root and descendants had no measured horizontal overflow/clipping. The shared secondary navigation has off-viewport links on mobile; `body.scrollWidth` measured 433 at 390px and 1600 at 1440px while `documentElement.scrollWidth` matched the viewport. This is a shared-layout/header overflow review item, not a confirmed clipping defect within the calculator.
- No route-chunk 400 or tool runtime exception observed on the isolated build. English pages attempted `/api/translate` (503, provider not configured); Arabic worked and tool behavior remained available. Historical port-3112 run separately observed external `noise.svg` HTTP 402.
- Existing local unit evidence is 11/11 for the component UI suite and 9/9 for engine/adapter/i18n (20/20 combined); these are not E3/E4 browser or clean-clone proof.

## Closure conditions still open

This does not close Tool 051. Its historical 11/31 E3+ denominator, eight E2 rows, two FAIL/E0 rows, and P-03 partial remain unchanged. Source/referral/clinical/W18 owner gates, shared gates, and authorized runtime/deployment evidence remain open. No authorized SSO, deployed Source SHA, Deployment ID, E4 evidence, owner acceptance, or clean clone was available. Preserve all historic statuses; do not promote these local results to E3/E4 or release.
