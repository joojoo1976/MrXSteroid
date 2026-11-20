# MRX_255_SAFETY_AND_PRIVACY_MATRIX.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

Safety is not yet domain-specific across the catalog. Tool-010 is a release-blocking safety issue. 53 record-only tools include medical, hormonal, reproductive, and cardiovascular topics but perform no calculation and must not be presented as risk assessors. 204 implemented tools lack a `<main>` landmark, and shared SafetyNotice language is not locale-aware.

## 2. Tool-010 release-blocking safety issue

- Unsafe text at component lines 105, 141, 142 recommends aromatase inhibitor support/therapy and medical review.
- Stale AI copy at lines 158 and 191 claims Supabase Edge Function availability.
- “Estimated estradiol equivalent” is reported in milligrams, which is not a clinically meaningful unit.
- Engine file is types only; calculation is inline and untestable.
- No typed input schema, ARIA, `<main>`, disclaimer, or source provenance.
- Publicly routable and sitemap-visible; no auth/feature gate in `middleware.ts`.
- Production deployment status is NOT VERIFIED.
- Minimum safe containment: unpublish or hard-gate the tool, remove medical advice and stale AI copy, relabel or remove the invalid unit, and add regression tests. No code change is authorized until the owner approves.

## 3. Safety contract requirements

Each tool must define:

- intended use and non-use;
- sensitive data;
- conditions where no recommendation is allowed;
- when warnings are required;
- when calculation must be refused;
- scientific limits;
- user data protection;
- no external transmission of sensitive data without consent and owner authorization;
- no health data storage without policy and consent;
- no unproven medical recommendation;
- no uncalibrated confidence.

## 4. Record-only safety classification

The 53 record-only tools are classified in `MRX_255_RECORD_ONLY_TOOL_CLASSIFICATION.md`:

- A: needs a real engine (4 tools);
- B: should be relabeled as honest records/logs (13 tools);
- C: needs a verified source before rebuild (6 tools);
- D: should be suspended or redesigned because calculation would be unsafe or unsupported (30 tools).

Medical/hormonal/reproductive/cardiovascular record-only tools must not be converted into calculators without validated sources and safety review.

## 5. Privacy and AI requirements

- Health, hormone, medication, and biometric data are sensitive.
- AI receives only typed findings and provenance, max 16 findings.
- Results and questions require explicit consent.
- The explain endpoint does not persist data.
- Provider failure degrades to deterministic explanation.
- No external provider, subscription, or recurring cost without owner authorization.

## 6. Shared safety defects

1. `SafetyNotice.tsx` lines 24 and 27 always render Arabic and English with fixed `dir`.
2. Breadcrumb in `app/smarttools/[category]/[tool]/page.tsx` lines 72 and 74 uses `titleEn` in both locales.
3. Metadata in the same route uses English-only title/description.
4. 204 implemented tools lack `<main>`.
5. 166 implemented tools lack ARIA affordances.

## 7. Owner decision required

Approve tool-010 containment, record-only classification, shared safety fixes, and any data/privacy policy before implementation.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
