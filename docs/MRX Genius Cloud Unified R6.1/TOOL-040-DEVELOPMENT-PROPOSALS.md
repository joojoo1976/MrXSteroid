# TOOL 040 — DEVELOPMENT PROPOSALS (10, tool-specific)

**Tool:** Tool 040 — Lipid Profile Optimizer · `mrx.tool.040-lipid-profile-optimizer`
**Source requirement:** SPEC-R6.1-6 — "10 tool-specific proposals per tool … with the explicit statement that they are not 10 execution tasks".
**Status of every entry below: PROPOSAL — NOT IMPLEMENTED.** None of them is part of the Tool 040 acceptance percentage; they are the tool's own development backlog.

These ten proposals are independent of the platform-wide 20-item implementation map in `R6.1-CLOSURE-LAYER.md` (§ "خريطة الـ 20"), which sequences platform capabilities and is not a per-tool list.

They are also independent of the Tool 039 proposals: the two tools share a pattern (a lab panel read against reference bands) but not a domain, so a proposal that only makes sense for liver enzymes — or only for lipids — is not repeated here.

**A note on the W18 boundary:** the owner decision D-08 (Option A — local, device-only storage) was granted for **Tool 039 only**. Every proposal below that would need a storage layer says so explicitly, and stays blocked until the owner opens it for this tool.

---

## P-01 · Per-laboratory reference ranges for the lipid bands

- **Purpose:** replace the tool's fixed general bands with the category table the user's own laboratory prints, so a "high" LDL at one lab is not "high" at another.
- **Inputs:** the lab's identity (manual selection for now), a versioned range file per marker (LDL, HDL, triglycerides, total cholesterol) with the unit (mg/dL), the reference date and the population band.
- **Outputs:** the band computed against the selected laboratory table; the current general band stays available as "general adult reference" for comparison.
- **Risks:** the wrong range file applied to the wrong lab (false reassurance or a false alarm); a stale range version; a laboratory that publishes in mmol/L — the bands would have to be converted, which the tool deliberately does not do today.
- **Cost:** no provider cost; one range file per laboratory, maintained manually and reviewed quarterly. No AI involvement.
- **Tests:** a golden test per range file (value → expected band); a test proving the general reference is unchanged when no laboratory is selected; a test proving a missing range file falls back to the general reference and says so; a test proving mmol/L laboratories are refused rather than silently converted.
- **Acceptance criteria:** a laboratory can be selected and every marker shows which reference was used, its date and its evidence level; no band is ever silently computed against a different reference than the one displayed.

## P-02 · Unit-mismatch guard (no conversion)

- **Purpose:** detect that a number is probably in another unit (mmol/L for a mg/dL field) and warn, instead of producing a band that is silently wrong.
- **Inputs:** the entered value, the fixed unit of the field, and a small table of plausible magnitudes per marker (LDL in mmol/L is roughly 1/38 of the mg/dL value, triglycerides roughly 1/88).
- **Outputs:** a non-blocking warning ("this value looks like it is in another unit") and the option to cancel; the value itself is **never** converted.
- **Risks:** false warnings on legitimately extreme values (a triglycerides of 600 mg/dL must not be flagged as mmol/L); a table that omits a unit used by some laboratories.
- **Cost:** zero provider cost; a static table only. No AI.
- **Tests:** unit tests for each marker's magnitude bands; a test proving the entered value is unchanged by the warning; a test proving the warning never appears for a value inside the expected magnitude; a test proving the extreme-but-valid values do not trigger it.
- **Acceptance criteria:** a mis-entered unit produces a visible warning before any band is displayed, and no automatic conversion is ever performed.

## P-03 · mmol/L as a first-class unit (with an explicit conversion)

- **Purpose:** let a user whose laboratory reports mmol/L use the tool at all, instead of having to convert the numbers by hand before entering them.
- **Inputs:** the lipid values in mmol/L (LDL, HDL, total cholesterol) and the triglycerides in mmol/L; the triglycerides conversion is **not** the standard 1/88 and would need its own published factor.
- **Outputs:** the values converted once on input, in one central conversion function, and displayed back in the unit the user entered.
- **Risks:** **this is the one place where a conversion would exist**, so a double-conversion bug becomes possible; the triglycerides factor is commonly mis-stated; the rounding of a converted value changes which side of a band edge it falls on.
- **Cost:** zero provider cost; one central conversion table with a published source per factor.
- **Tests:** a golden test per factor with the value on both sides of a band edge; a **negative double-conversion test** proving a converted value is never converted twice; a test proving the display always shows the unit the user entered.
- **Acceptance criteria:** the conversion exists only in one central function, every factor has a published source and a date, the negative double-conversion test passes, and the display unit always matches the input unit.

## P-04 · A non-HDL and an ApoB column

- **Purpose:** give the two non-HDL measures a panel that is often printed alongside the fractions, without touching the authoritative engine.
- **Inputs:** the entered panel; the total cholesterol when present (the engine already approximates it as LDL + HDL + TG/5 when it is absent).
- **Outputs:** a clearly-labelled **derived** row for non-HDL (which the engine already computes) and an explicit note that apoB is **not** computable from this panel.
- **Risks:** the two are different measures and are often confused; a derived value shown next to a measured one could be read as measured; apoB cannot be derived from these values at all.
- **Cost:** zero provider cost; rule-based on the engine output. No AI.
- **Tests:** a test proving the derived row always carries a "derived" label; a test proving the non-HDL value equals the engine's own `non_hdl`; a test proving no apoB number is ever produced.
- **Acceptance criteria:** every derived number is visibly marked as derived and states its formula, and a measure that cannot be computed from the entered panel is named as such rather than estimated.

## P-05 · A per-marker band matrix as the what-if

- **Purpose:** replace the current three-scenario what-if (LDL 100, HDL 60, TG 150) with a matrix: every marker × {the band edges}, so the user can see which single change would move the overall band.
- **Inputs:** the current panel, the band ladder (`TOOL_040_BANDS`) and the same pipeline.
- **Outputs:** a matrix of resulting overall bands, each computed by re-running the same deterministic pipeline with one changed value.
- **Risks:** a dense grid can be read as a prediction; the escalation context (age, smoking, blood pressure) means a value that improves one marker can still leave the overall band unchanged — which is exactly the insight, but it needs stating.
- **Cost:** zero provider cost; local computation only (a few extra pipeline runs per render).
- **Tests:** a test asserting the matrix dimensions (markers × edges) and one known value per cell; a test proving every cell comes from the pipeline and not from a local formula; a test proving the "scenario, not a prediction" label is present.
- **Acceptance criteria:** every cell is reproducible from the displayed inputs, and the box keeps its explicit "arithmetic scenarios, not predictions" wording.

## P-06 · Cross-tool hand-off to Tool 039 and Tool 007 (requires W18)

- **Purpose:** carry the panel into the liver-enzyme tracker and the bloodwork analyzer instead of re-typing it, with the 90-day freshness rule applied on the way.
- **Inputs:** the entered panel and the link contract that already exists (`sourceToolId`, `targetToolId`, `mappedFields`, `freshnessRule`, `staleAction`, transfer mode `manual-reentry`).
- **Outputs:** a pre-filled target form, or a payload subject to the freshness rule (a panel older than 90 days is flagged and requires confirmation).
- **Risks:** **requires W18** — no session, no cloud sync and no payload persistence are permitted today; the two tools share the mg/dL unit but not the analytes, so only the panel date and the blood-draw context genuinely map; an incorrect mapping could carry a wrong value.
- **Cost:** no provider cost; the work is the W18 session contract plus a target-side consumer.
- **Tests:** a test asserting the mapping is unit-preserving; a test asserting a stale panel is refused or flagged; a test asserting nothing is persisted before the user confirms.
- **Acceptance criteria:** implemented only after W18 is approved, with a per-field mapping review and an explicit user confirmation before any payload moves.

## P-07 · A printable clinician summary

- **Purpose:** give the user a one-page summary they can bring to a consultation — the CSV export is machine-readable but not consultable.
- **Inputs:** the entered panel, the panel date, the band per marker, the non-HDL, the freshness verdict, the safety flags and the next actions.
- **Outputs:** a printable page (a print stylesheet and/or a PDF generated in the browser) with the date, the values, the units, the band edges and the disclaimer.
- **Risks:** a printed page could outlive the data and be mistaken for a lab report; no server-side generation means no archive; a printed summary of a stale panel could be read as current.
- **Cost:** zero provider cost if generated in the browser; no storage.
- **Tests:** a test asserting the printable view contains every entered value, the band edge and the disclaimer; a test asserting the freshness verdict appears on the printed page; a test asserting no data leaves the browser.
- **Acceptance criteria:** the printed summary carries the same values as the screen, states the panel date and its freshness, is explicitly labelled as an educational summary and not a lab report, and never leaves the device.

## P-08 · A medication-aware caveat that never changes a band

- **Purpose:** let a user note that they are on a lipid-lowering treatment, so the safety box can point at the prescriber's plan — without the tool changing a single band.
- **Inputs:** an optional yes/no for "on a lipid-lowering treatment" and an optional free-text note limited to a fixed length.
- **Outputs:** one additional line in box 7 saying that the tool cannot judge the effect of a treatment and that the prescriber's plan governs.
- **Risks:** a free-text field is medical personal data and could contain PII; the line must never be read as advice to start, stop or change a medicine; it must not change the band or the escalation.
- **Cost:** no provider cost while the data stays in the browser tab; any future persistence is blocked by W18 (and D-08 does not cover this tool).
- **Tests:** a test proving the line never changes the band or the overall escalation; a test proving the free text is length-limited and never sent anywhere; a test proving no medication instruction is ever produced.
- **Acceptance criteria:** the line is optional, framed as "you reported this", never used to change a band, and never phrased as an instruction about a medicine.

## P-09 · A trend across panels (no persistence)

- **Purpose:** let the user compare the current panel with an earlier one **inside the same tab**, so a direction ("your LDL is lower than the panel from three months ago") can be shown without any storage.
- **Inputs:** an optional second panel, entered by hand in the current tab, plus the two panel dates.
- **Outputs:** the direction of change per marker, computed in the browser, with the two dates beside it.
- **Risks:** the two panels may come from different laboratories and different units; the second panel is entered by hand and can be mistyped; the data must not be persisted, so the comparison disappears with the tab.
- **Cost:** zero provider cost; local computation only.
- **Tests:** a test asserting the direction across an equal, a higher and a lower value; a test asserting the two dates are always shown next to the direction; a test asserting nothing is persisted or sent; a test asserting the tool states that a hand-entered panel can be mistyped.
- **Acceptance criteria:** the comparison is optional, shows both dates, is clearly labelled as based on hand-entered values, and no trend survives the tab.

## P-10 · A fasting / non-fasting aware reading

- **Purpose:** let the user record whether the panel was drawn fasting, because triglycerides in particular are read differently in the two states.
- **Inputs:** an optional fasting yes/no, plus the panel date that already exists.
- **Outputs:** one line in box 4 stating the fasting state, and a note in box 3 that the general categories do not distinguish the two states.
- **Risks:** it would be tempting to change the band for a non-fasting panel — the general reference categories do not support that, and the engine owns the banding; a mis-entered fasting state would then be misleading.
- **Cost:** zero provider cost; one extra field and its copy.
- **Tests:** a test proving the fasting state never changes a band or the overall escalation; a test proving the note appears only when the field was answered; a test proving the field is optional and the tool still works without it.
- **Acceptance criteria:** the fasting state is optional, never changes a band, is stated as a limitation of the reference categories, and the tool never claims it is more accurate than the general categories.

---

**Not part of the acceptance percentage.** These ten items are proposals. The acceptance percentage in `TOOL-040-ACCEPTANCE.md` is computed only from the 123-row atomic ledger and counts only what is implemented and proven.
