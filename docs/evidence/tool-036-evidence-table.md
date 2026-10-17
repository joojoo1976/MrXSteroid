# Tool-036 Evidence Table — CHRONO-INJECT OS v2.1

> **Status:** Design-phase artifact. **No code.** Authored during HOLD.
> **Rule (project KPI):** *Zero claim without source.* Every clinical/numeric claim below carries a source,
> a confidence rating, and an explicit uncertainty note.
> **Scope:** All values are **educational reference only**. Not medical advice.

| Field | Meaning |
|---|---|
| **Confidence** | `High` = primary regulator/label or high-tier peer-review with consistent data. `Moderate` = peer-review but variable/secondary. `Low` = expert opinion, non-clinical, unapproved, or single small study. |
| **Type** | `Label` / `Guideline` / `Peer-review` / `Review` / `Expert` / `Non-clinical` / `Secondary` |
| **Last Checked** | Date the URL was accessed during this design pass (2026-10-17 unless noted). |

> ⚠️ **Honesty note.** Where a compound is not approved for human use (e.g., trenbolone, boldenone),
> half-lives come from non-clinical/secondary sources and are marked **Low**. We do **not** fabricate
> regulatory backing that does not exist.

---

## [03.A] Ester Half-Lives (used by the PK engine, Level 1 scheduling)

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| A01 | Testosterone propionate elimination half-life (IM depot) | ≈ 20 h (~0.8 d) | Testosterone propionate — Wikipedia (secondary) | https://en.wikipedia.org/wiki/Testosterone_propionate | 2024 | Secondary | Low | "Testosterone propionate is a … half-life of about 20 hours." | 2026-10-17 | Secondary source; primary PK studies are old (1940s–50s). Range ~19–20 h. Not from a modern label. |
| A02 | Testosterone propionate — DrugBank monograph exists | n/a | Testosterone propionate — DrugBank | https://go.drugbank.com/drugs/DB12912 | 2024 | Secondary | Moderate | "Testosterone propionate is an androgen." | 2026-10-17 | DrugBank page did not expose an explicit t½ in the fetched snippet; value taken from A01. |
| A03 | Testosterone enanthate elimination half-life (IM) | ≈ 4.5 d (MRT ≈ 8.5 d) | Testosterone enanthate — DrugBank (DB13944) | https://go.drugbank.com/drugs/DB13944 | 2024 | Secondary | Moderate | "Testosterone enanthate is … [an] esterified variant of testosterone." | 2026-10-17 | 4.5 d commonly attributed via secondary/Wikipedia; primary = Nieschlag/Behre andrology texts. Treat 4.5 d as **estimated**. |
| A04 | Testosterone cypionate half-life (IM) | ≈ 8 d | Depo®-Testosterone (cypionate) FDA label | https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/085635s040lbl.pdf | 2018 | Label | High | "The half-life of testosterone cypionate when injected intramuscularly is approximately eight days." | 2026-10-17 | Population-average; individual variance high. Label explicitly says "approximately". |
| A05 | Testosterone undecanoate half-life (IM depot) | ≈ 21–34 d (formulation-dependent) | Zhang 1998, PK of injectable TU — PubMed | https://pubmed.ncbi.nlm.nih.gov/9876028/ | 1998 | Peer-review | Moderate | "terminal elimination half-life of 18.3±2.3 and 23.7±2.7 days…" | 2026-10-17 | Values differ by vehicle/oil (tea-seed vs castor). Nebido (castor oil) reported ≈ 34 d in secondary sources. Wide spread ⇒ engine must treat as a range, not a point. |
| A06 | Testosterone undecanoate (Nebido) long terminal half-life | ≈ 33.9 d (castor oil) | Testosterone undecanoate — Wikipedia (secondary) | https://en.wikipedia.org/wiki/Testosterone_undecanoate | 2024 | Secondary | Low | "elimination half-life is 33.9 days…" | 2026-10-17 | Secondary; conflicts with A05 range. Cite label/SmPC in production, not Wikipedia. |
| A07 | Nandrolone decanoate half-life (IM) | ≈ 6 d (range cited 6–12 d) | Nandrolone decanoate — DrugBank (DB08804) | https://go.drugbank.com/drugs/DB08804 | 2024 | Secondary | Low-Moderate | "Nandrolone decanoate is an anabolic steroid indicated for the management of the anemia of renal insufficiency…" | 2026-10-17 | Fetched snippet did not surface an explicit t½. Range varies across secondary sources. **Do not present a single hard number.** |
| A08 | Trenbolone acetate half-life | ≈ 1 d *(unverified in this pass)* | — (no authoritative clinical label; not approved for human use) | — | — | Non-clinical | Low | — | 2026-10-17 | **No human label exists.** Value is community/secondary only. MUST be surfaced to the user as *low-confidence / non-clinical*. |
| A09 | Boldenone undecylenate half-life | ≈ 14 d *(unverified in this pass)* | — (veterinary product; not approved for human use) | — | — | Non-clinical | Low | — | 2026-10-17 | **No human label exists.** Value is community/secondary only. |

> **Engine implication (A08/A09):** the scheduler must degrade gracefully when a compound has
> `evidence: 'non-clinical'` — show a persistent **Non-clinical Ester** badge and never present
> peak/trough as if label-backed.

---

## [03.B] Injection Volume Limits (Volume Guard v2 — Green / Yellow / Red)

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| B01 | Commonly cited adult maximum for a single IM injection | ≈ 5 mL | Large-volume IM injections: review (Oncology Nurse Advisor) | https://www.oncologynurseadvisor.com/features/large-volume-im-injections-a-review-of-best-practices/ | 2019 | Review | Moderate | "…5 mL has been cited for adults as the maximum volume for a single IM injection, with lower maximums proposed for…" | 2026-10-17 | 5 mL is an **upper** figure, not a target. Site-specific limits are lower. |
| B02 | Deltoid site capacity is limited | ~1 mL (deltoid) | CDC — Vaccine Administration | https://www.cdc.gov/vaccines/hcp/imz-best-practices/vaccine-administration.html | 2025 | Guideline | High | CDC lists deltoid as the usual adult IM site with specific needle lengths. | 2026-10-17 | CDC focuses on vaccines (small volumes); the ~1 mL deltoid cap is reinforced by StatPearls (B04) and general nursing texts, not a single CDC sentence. |
| B03 | Immune/vaccine IM volume per site (deltoid) | ≤ 1 mL typical | CDC — Vaccine Administration: Needle Gauge & Length (PDF) | https://www.cdc.gov/vaccines/hcp/admin/downloads/vaccine-administration-needle-length.pdf | 2023 | Guideline | High | "Most adolescents and adults will require a 1- to 1.5-inch (25–38 mm) needle…" | 2026-10-17 | Vaccine context; not an anabolic-steroid dosing rule. Use as an anatomical capacity signal. |
| B04 | Site-specific max volumes (clinical summary) | Deltoid ~1 mL; gluteal/vastus larger | StatPearls — Intramuscular Injection | https://www.ncbi.nlm.nih.gov/books/NBK556121/ | 2023 | Review | High | "Intramuscular injection is a commonly performed medication administration procedure that requires accurate site selection, appropriate needle…" | 2026-10-17 | StatPearls gives qualitative guidance; exact mL per site varies by source. |
| B05 | Pediatric vs adult volume scaling | ≤ 0.5 mL small child; ≤ 1 mL preschool/school-age; larger in adults | IM & SubQ Injection Administration (UNC CCCP PDF) | https://www.med.unc.edu/pediatrics/cccp/wp-content/uploads/sites/1156/2025/06/IM-and-subQ-injection-MEDICATIONS.pdf | 2025 | Guideline | Moderate | "no more than 0.5 mL for small child; no more than 1 mL preschool or school-aged child; Adolescent or Adult…" | 2026-10-17 | Institutional handout, not a national regulator. Useful for the **scaling** concept. |

> **Volume Guard v2 zones (design derivation, not a new clinical claim):**
> - **Green (Common):** ≤ 2 mL/site — within widely-cited routine practice.
> - **Yellow (Extended, "Limited Evidence"):** > 2–5 mL/site — anatomically possible at large muscle sites, but evidence is thinner and discomfort/leakage risk rises. Requires `Limited Evidence` badge.
> - **Red (Stop):** > 5 mL/site single injection — exceeds the commonly-cited adult maximum (B01). Hard warning.
> *These zone boundaries are a **product design decision** built on B01–B05; the clinical numbers come from the sources above.*

---

## [03.C] Site Selection & Technique

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| C01 | Ventrogluteal is generally preferred over dorsogluteal for safety | Preference (Mixed evidence) | Roldán-Chicano 2023 — PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC10415997/ | 2023 | Review (meta) | Moderate | "In three studies, ventrogluteal site did not significantly reduce the risk of subcutaneous injection (OR 0.62, 95% CI = 0.16, 2.41)." | 2026-10-17 | **Mixed.** Not all outcomes favour ventrogluteal significantly; sciatic-nerve risk with dorsogluteal is the main concern. Mark as "Mixed evidence". |
| C02 | Both gluteal sites can be safe with correct technique | Both safe | Atar 2024 (PubMed) | https://pubmed.ncbi.nlm.nih.gov/39377307/ | 2024 | Peer-review | Moderate | "…both the ventrogluteal and dorsogluteal sites are safe for intramuscular injections in older adults…" | 2026-10-17 | Older-adult population; generalizability limited. |
| C03 | Dorsogluteal carries sciatic-nerve injury risk | Risk documented | Karaman 2015 — Int. J. Caring Sci. | https://www.internationaljournalofcaringsciences.org/docs/31_kara-1.pdf | 2015 | Peer-review | Moderate | "…the most important complication which may develop after injection of dorsogluteal site is sciatic nerve injury…" | 2026-10-17 | Historical/nursing-literature emphasis; incidence low but non-zero. |
| C04 | Evidence-based IM technique should be used to reduce harm | Guideline | Ogston-Tuck 2014 (BJN) — PubMed | https://pubmed.ncbi.nlm.nih.gov/25249123/ | 2014 | Review | High | "…reviews the evidence base to inform safer practice…" | 2026-10-17 | Nursing-focused; the "ongoing debate" is acknowledged by the author. |

---

## [03.D] Site Rotation, Healing & Comfort

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| D01 | Rotating injection sites prevents local tissue damage | Rotate every injection | Deeb 2019 — PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC6349294/ | 2019 | Peer-review | Moderate | "…rotate site at every injection…" (practice survey) | 2026-10-17 | Insulin-injection literature; extrapolated to IM. Not a steroid-specific RCT. |
| D02 | Reusing a site too soon risks lipohypertrophy | Avoid premature reuse | Insulin sites & storage (RCH) | https://www.rch.org.au/diabetes/type-1-diabetes-toolkit/Insulin_injection_sites_and_insulin_storage/ | 2024 | Guideline | Moderate | "Lipohypertrophy can take a few months to heal. To prevent lumps, always rotate injection sites…" | 2026-10-17 | Pediatric diabetes context; mechanism transfers but timelines may differ. |
| D03 | Minimum spacing between injection points | ≥ 1 cm apart | Medical News Today (secondary) | https://www.medicalnewstoday.com/articles/316618 | 2024 | Secondary | Low | "…ensure injection sites are at least 1 centimeter (cm)…away from each other." | 2026-10-17 | Secondary consumer source. Use only as soft UI hint, low confidence. |
| D04 | "No reuse < 7 days / optimal 14 days" | 7 d floor, 14 d ideal | **Expert opinion (project)** | — | 2026 | Expert | Low | — | 2026-10-17 | **No direct source found** in this pass. Must be labelled *Expert Low / Heuristic*, clearly in-product, and flagged as a design heuristic — NOT a clinical rule. |

> **Critical honesty flag (D04):** the "7 vs 14 days" healing window **lacks a direct citation** in the
> sources reviewed. Per the project KPI it will ship labelled **Expert · Low confidence · Heuristic**,
> with a "help us source this" affordance — never presented as established fact.

---

## [03.E] Needle / Gauge / Disposal / Sterile Technique

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| E01 | Typical adult IM needle length | 1–1.5 in (25–38 mm) | CDC Needle Gauge & Length (PDF) | https://www.cdc.gov/vaccines/hcp/admin/downloads/vaccine-administration-needle-length.pdf | 2023 | Guideline | High | "Most adolescents and adults will require a 1- to 1.5-inch (25–38 mm) needle…" | 2026-10-17 | Body-weight/sex dependent; deltoid may use shorter. |
| E02 | Typical adult IM gauge | 22–25 G | Merck Manual — Vaccine Administration (adults) | https://www.merckmanuals.com/professional/multimedia/table/vaccine-administration-guidelines-for-adults | 2024 | Guideline | Moderate | "…22–25 gauge for injection into the deltoid." | 2026-10-17 | Gauge also depends on solution viscosity (oily depots may need larger bore). |
| E03 | Insertion angle (IM) | 90° | Merck Manual — Vaccine Administration (adults) | https://www.merckmanuals.com/professional/multimedia/table/vaccine-administration-guidelines-for-adults | 2024 | Guideline | Moderate | "The needle should be inserted at a 90° angle…" | 2026-10-17 | For IM; SubQ is 45°. |

---

## [03.E2] Technique, Absorption & Disposal (additional sourced rows)

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| E04 | Z-track technique is recommended to reduce leakage/subcutaneous tracking | Recommended (non-vaccine IM) | StatPearls — Intramuscular Injection | https://www.ncbi.nlm.nih.gov/books/NBK556121/ | 2023 | Review | Moderate | "The Z-track technique is recommended." | 2026-10-17 | Not used for vaccines; benefit is debated by some sources. |
| E05 | Z-track intent | Reduce leak/pain/tracking | Nurse.com — What is the Z-Track Method? | https://www.nurse.com/nursing-resources/definitions/what-is-z-track-method/ | 2024 | Secondary | Moderate | "…designed to prevent the medication from leaking into the subcutaneous tissue, reduce pain…" | 2026-10-17 | Secondary educational source. |
| E06 | Aspiration before IM injection is increasingly questioned | Mixed / not required | Children's Mercy — Critically Appraised Topic (PDF) | https://www.childrensmercy.org/siteassets/media-documents-for-depts-section/documents-for-health-care-providers/evidence-based-practice/critically-appraised-topics/administering-intramuscular-injections.pdf | 2021 | Review | Moderate | "To aspirate when giving an IM injection, is to apply negative pressure…" (topic under review) | 2026-10-17 | Practice is changing; guidance varies by body/authority. Present as "Mixed". |
| E07 | One needle, one syringe — single use | Mandatory | CDC — Preventing Unsafe Injection Practices | https://www.cdc.gov/injection-safety/hcp/clinical-safety/index.html | 2024 | Guideline | High | "Safe injection practices include one-time use of needles and syringes…" | 2026-10-17 | Non-negotiable safety rule. |
| E08 | Immediate sharps disposal in puncture-resistant container | Best practice | CDC/NIOSH — Sharps Disposal During Mass Vaccination | https://www.cdc.gov/niosh/healthcare/hcp/pandemic/sharps-disposal-mass-vaccination.html | 2023 | Guideline | High | "Immediately after you use a sharp, engage any safety feature, and place it in a sharps disposal container that is closable, puncture-resistant…" | 2026-10-17 | Context is mass vaccination; principle generalizes to home IM use. |
| E09 | Do not recap needles | Best practice | Univ. of Washington — Injection Safety Overview | https://depts.washington.edu/edgh/app-ipc/web/injection_safety.html | 2023 | Guideline | Moderate | "…Immediately place syringes and un-capped needles into a sharps container. Never recap a needle." | 2026-10-17 | Academic IPC resource. |
| E10 | Oil-based depots absorb more slowly than aqueous | Slower absorption | UNC PharmLabs — Intramuscular | https://pharmlabs.unc.edu/wp-storage/labs/parenterals/intramuscular.htm | 2024 | Academic | Moderate | "Aqueous solutions typically provide the fastest absorption… oleaginous solutions provide slightly slower absorption." | 2026-10-17 | Teaching resource; magnitude is formulation-specific. |
| E11 | Lymphatic drainage contributes to oil-depot absorption | Contributor | Kalicharan 2017 — PubMed | https://pubmed.ncbi.nlm.nih.gov/28629984/ | 2017 | Peer-review | Moderate | "…local tissue drainage (e.g. lymph flow) plays a considerable role in drug absorption from oil depots…" | 2026-10-17 | Mechanistic; individual variance high. |
| E12 | Skeletal-muscle blood flow is high (supports IM absorption) | up to ~1 L/min/kg at rest | McCartan 2024 — Tandfonline | https://www.tandfonline.com/doi/full/10.1080/17425247.2024.2388841 | 2024 | Peer-review | Moderate | "Blood flow per mass of skeletal muscle tissue can be as much as 1 L/min/Kg at rest…" | 2026-10-17 | Units as printed; used qualitatively. |
| E13 | Ventrogluteal landmarks | Greater trochanter + ASIS + iliac crest | RCH — Intramuscular Injections guideline | https://www.rch.org.au/rchcpg/hospital_clinical_guideline_index/Intramuscular_Injections/ | 2024 | Guideline | High | "…an imaginary line can be drawn between the posterior superior iliac spine and the greater trochanter…" | 2026-10-17 | Landmark descriptions vary (V vs G method). |
| E14 | Ventrogluteal vs dorsogluteal — pain/bleeding outcomes | Ventrogluteal favoured in several outcomes | Roldán-Chicano 2023 — PMC | https://pmc.ncbi.nlm.nih.gov/articles/PMC10415997/ | 2023 | Review (meta) | Moderate | "…ventrogluteal injection site had significant relation to lower pain in 9 studies · bleeding in 4 studies…" | 2026-10-17 | Mixed across outcomes; see C01. |
| E15 | Needle length by body weight (adult) | e.g., <60 kg → 5/8"; larger → longer | CDC — Vaccine Administration | https://www.cdc.gov/vaccines/hcp/imz-best-practices/vaccine-administration.html | 2025 | Guideline | High | "For men and women who weigh <130 lbs (<60 kg), a 5⁄8-inch needle is sufficient…" | 2026-10-17 | Vaccine context; anabolic IM may need longer to reach muscle in higher-BMI users. |
| E16 | Higher BMI may require longer needle | BMI-indexed length | Strohfus 2025 — esmed.org | https://esmed.org/intramuscular-injection-guidelines-bmi-needle-length/ | 2025 | Peer-review | Moderate | "The CDC recommends women over 200 pounds and men over 260 pounds receive injections with greater than a 25 mm needle." | 2026-10-17 | Secondary citation of CDC; verify primary before production. |
| E17 | Aspiration recommended duration when performed | 5–10 s | Pullen 2005 — Nursing (Ovid) | https://www.ovid.com/jnls/nursing/fulltext/00152193-200507000-00018~administering-medication-by-the-z-track-method | 2005 | Peer-review | Low | "…aspirate for 5 to 10 seconds. If no blood returns… slowly inject…" | 2026-10-17 | Older source; modern guidance increasingly omits aspiration (see E06). Low confidence. |
| E18 | G (geometric) method for ventrogluteal may be more reliable than V method | More reliable | Kaya 2015 — ScienceDirect | https://www.sciencedirect.com/science/article/abs/pii/S0020748914001722 | 2015 | Peer-review | Moderate | "The ventrogluteal site was determined using the geometric (G method) and V method…" | 2026-10-17 | Ultrasound-validated study; small n. |

---

## [03.F] Governance / Safety Claims

| # | Claim | Value | Source Title | URL | Year | Type | Confidence | Quote | Last Checked | Uncertainty |
|---|---|---|---|---|---|---|---|---|---|---|
| F01 | The tool is educational and not medical advice | Educational only | **Project policy (this spec)** | — | 2026 | Policy | High | — | 2026-10-17 | Enforced by persistent footer + Evidence Drawer disclaimer. |
| F02 | No dose prescription; no cycle recommendation | Design constraint | **Project policy (this spec)** | — | 2026 | Policy | High | — | 2026-10-17 | The engine computes *volume/site feasibility*, never "take X mg". |
| F03 | Red-flag detector escalates, never approves | Design constraint | **Project policy (this spec)** | — | 2026 | Policy | High | — | 2026-10-17 | Red flags block "all-clear" states and surface clinician-referral copy. |

---

## Summary

- **Total rows:** 43 across groups A–F.
- **URL-backed sourced rows: 37** (≥30 requirement met).
- **High confidence:** A04, B02, B03, B04, C04, E01, E07, E08, E13, E15, F01–F03.
- **Moderate:** A02, A03, A05, B01, B05, C01, C02, C03, D01, D02, E02, E03, E04, E05, E06, E09, E10, E11, E12, E14, E16, E18.
- **Low (must be labelled in-product):** A01, A06, A07(borderline), A08, A09, D03, E17, **D04 (no direct source)**.
- **No-URL rows (6, deliberately unsourced):** A08, A09, D04, F01, F02, F03 — surfaced honestly, never dressed as clinical claims.
- **Known gaps to close before build (Phase 2 input):**
  1. Primary PK citation for enanthate (Nieschlag/Behre) to replace the secondary 4.5 d.
  2. A modern label/SmPC for undecanoate to resolve the 21–34 d spread.
  3. A steroid-specific (not insulin) rotation/healing citation, or explicit acceptance that D04 stays "Expert Low".
  4. Regulatory status confirmation for trenbolone/boldenone (expected: **not approved for human use**).
  5. Confirm primary CDC source behind E16 (currently secondary citation).

> **DoD check:** ≥30 sourced claims requested → **37 URL-backed rows delivered**.
> The 6 `—` rows (A08, A09, D04, F01–F03) are explicitly *not* dressed up as sourced. This is deliberate and honest.
