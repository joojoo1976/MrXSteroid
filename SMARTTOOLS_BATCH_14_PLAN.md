# SmartTools Batch 14 Plan — Tool 111 parity for tools 131–136

Status: `COMPLETE — TOOLS 131, 133–136 VERIFIED; TOOL 132 PROVIDER-GATED`.

## Source audit

- Catalog 10 already contains all six identities. Tools 131, 132, 134 and 135 have no route component, schema or engine. Tools 133 and 136 have basic engines, schemas, pilot components and flat-to-category redirects, but no shared registry/Page/legacy route identities; their current catalog status is implemented for 133/136 and planned for the others.
- Tool 133 currently parses a JSON textarea, uses fabricated default set values, stores result as `any`, displays inline output, and calls its deterministic engine without schema validation or canonical provenance/output.
- Tool 136 has default circumference values, uses `any`, doesn't block calculation with insufficient inputs, and displays non-localized inline output. Its current ratio targets are heuristic aesthetics, not validated health standards.
- The existing `future/vision.ts` includes a MediaPipe browser path but falls back to realistic fabricated stub analysis and contains logging/`any`. It cannot safely substantiate an AI/vision pose coach. Tool 132 will not call it or claim vision analysis; this identity remains blocked pending a real evaluated provider and truthful failure behavior.
- Tool 131 can provide a transparent user-selected constant-rate body-composition scenario, not an outcome prediction. Tool 134 can compare user-entered range-of-motion values, not diagnose mobility conditions. Tool 135 can filter a finite exercise substitution library by movement/equipment constraints; it cannot assess an injury or prescribe rehabilitation.

## Scope

- Implement tools 131, 134 and 135 as bounded deterministic scenario/rule tools with explicit limits and schema validation.
- Upgrade tools 133 and 136 to the Batch 10–13 typed ToolOutput, explicit calculate/reset, no-fabricated-input, bilingual, unit-appropriate, and shared-summary pattern.
- Register usable identities 131, 133, 134, 135 and 136 with stable canonical routes while preserving catalog IDs and existing flat redirects.
- Add engine/adapter/registry/route tests and DOM tests for the implemented tools; keep Tool 132 inventory marked blocked/unimplemented.

## Gates and non-goals

- Do not use the existing vision stub; do not represent manual data as image/video analysis or actual AI.
- No database writes, migrations, production access, new AI provider, medical diagnosis, injury treatment advice, fabricated inputs, commit, push or deployment.
- Keep missing/invalid measurements unknown; do not turn absence into zero or a calibrated confidence score.
- Tool 131 projections remain user-selected mathematical scenarios with explicit constant-rate and lean-mass assumptions, not predictions.
- Tool 135 gives movement/equipment alternatives and a stop/escalation message when user reports pain, not a return-to-training decision.
- Run focused tests, `validate-tools`, TypeScript, targeted lint and build; document browser/accessibility evidence separately.
