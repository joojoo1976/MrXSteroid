# TOOL 039 — DEVELOPMENT PROPOSALS (10, tool-specific)

**Tool:** Tool 039 — Liver Enzyme Tracker · `mrx.tool.039-liver-enzyme-tracker`
**Source requirement:** SPEC-R6.1-6 — "10 tool-specific proposals per tool … with the explicit statement that they are not 10 execution tasks".
**Status of every entry below: PROPOSAL — NOT IMPLEMENTED.** None of them is part of the Tool 039 acceptance percentage; they are the tool's own development backlog.

These ten proposals are independent of the platform-wide 20-item implementation map in `R6.1-CLOSURE-LAYER.md` (§ "خريطة الـ 20"), which sequences platform capabilities and is not a per-tool list.

---

## P-01 · Per-laboratory reference ranges

- **Purpose:** replace the tool's fixed adult upper limits with the range the user's own laboratory uses, so a result flagged "high" by one lab is not flagged by another.
- **Inputs:** the lab's identity (manual selection for now), a versioned range file per analyte (ALT, AST, GGT, ALP, bilirubin) with sex/age band, unit, and reference date.
- **Outputs:** a per-marker multiple computed against the selected range; the current fixed-limit multiple remains available as "generic adult reference" for comparison.
- **Risks:** wrong range file applied to the wrong lab (false reassurance or false alarm); stale range versions; a lab that publishes ranges in different units.
- **Cost:** no provider cost; one range file per laboratory, maintained manually and reviewed quarterly. No AI involvement.
- **Tests:** golden test per range file (value → expected multiple and status); a test proving the generic reference is unchanged when no lab is selected; a test proving a missing range file falls back to the generic reference and says so.
- **Acceptance criteria:** a laboratory can be selected and every marker shows which reference was used, its date and its evidence level; no result is ever silently compared against a different reference than the one displayed.

## P-02 · Unit-mismatch guard (no conversion)

- **Purpose:** detect that a number is probably in another unit (e.g. µkat/L for ALT, µmol/L for bilirubin) and warn, instead of producing a wrong multiple.
- **Inputs:** the entered value, the fixed unit for the selected marker, and a small table of plausible unit magnitudes per analyte.
- **Outputs:** a non-blocking warning ("this value looks like it is in another unit") and the option to cancel; the value itself is never converted.
- **Risks:** false warnings on legitimately extreme values; a table that omits a unit used by some laboratories.
- **Cost:** zero provider cost; a static table only. No AI.
- **Tests:** unit tests for each analyte's magnitude bands; a test proving the entered value is unchanged by the warning; a test proving the warning never appears for values inside the expected magnitude.
- **Acceptance criteria:** a mis-entered unit produces a visible warning before any result is displayed, and no automatic conversion is ever performed.

## P-03 · Symptom diary as an optional companion input

- **Purpose:** let the user record the symptoms the tool already tells them to watch for (jaundice, dark urine, pale stool, nausea, right-upper-quadrant pain), so escalation can happen earlier.
- **Inputs:** a short checklist of symptoms with an onset date, plus free text limited to a fixed length.
- **Outputs:** a "symptom flag" appended to the safety box (box 7) when symptoms coincide with a high or critical laboratory result; never a diagnosis.
- **Risks:** symptom data is medical personal data; free text could contain PII; a checklist can be mis-entered.
- **Cost:** no provider cost while the data stays in the browser tab; any future persistence is blocked by W18.
- **Tests:** a test that the flag appears only when a symptom is present AND the result is high/critical; a test that the free-text field is length-limited and never sent anywhere; a test that the tool still refuses to name a condition.
- **Acceptance criteria:** symptoms are optional, stored only in the current tab, explicitly framed as "symptoms you reported", and never used to change a laboratory status.

## P-04 · Least-squares trend instead of the two-point trend

- **Purpose:** make the "trend per 30 days" column stable when a patient has many readings, instead of first-versus-latest.
- **Inputs:** all dated readings for the same marker (already in the tool's input contract).
- **Outputs:** a regression slope per marker per 30 days, with the number of points used, shown next to the current two-point value.
- **Risks:** this changes the authoritative engine → needs an explicit owner approval; a regression over noisy data may look more confident than it is; outlier readings distort the slope.
- **Cost:** zero provider cost; trivial computation. No AI.
- **Tests:** golden tests for the slope on synthetic series (flat, rising, falling, with an outlier); a test proving the current two-point trend is still available for comparison; a regression test proving the engine's existing outputs are unchanged when the new field is absent.
- **Acceptance criteria:** the engine change is approved by the owner in writing, the new value is labelled with the number of points used, and both trend values are shown whenever they disagree.

## P-05 · Marker-by-marker what-if matrix

- **Purpose:** extend the current what-if box (which scales the highest marker only) into a matrix: every marker × {1×, 2×, 3×, 5× ULN}.
- **Inputs:** the current readings, the reference limits, and the same pipeline.
- **Outputs:** a matrix of resulting statuses, each computed by re-running the same deterministic pipeline with one changed value.
- **Risks:** a dense grid can be read as a prediction; large marker counts make the table noisy.
- **Cost:** zero provider cost; local computation only (a few extra pipeline runs per render).
- **Tests:** a test asserting the matrix dimensions (markers × scenarios) and one known value per cell; a test proving every cell is produced by the pipeline and not by a local formula; a test proving the "scenario, not a prediction" label is present.
- **Acceptance criteria:** every cell is reproducible from the displayed inputs, and the box keeps its explicit "arithmetic scenarios, not predictions" wording.

## P-06 · Cross-tool hand-off to Tool 024 (Bloodwork Interpreter)

- **Purpose:** carry the readings into the bloodwork interpreter instead of re-typing them.
- **Inputs:** the readings and the link contract that already exists for Tool 024 (`sourceToolId`, `targetToolId`, `mappedFields`, `freshnessRule`, `staleAction`, transfer mode `manual-reentry`).
- **Outputs:** a populated target form, or a pre-filled payload subject to the freshness rule (readings older than 90 days are flagged and require confirmation).
- **Risks:** **requires W18** — no session, no cloud sync, no payload persistence is permitted today; an incorrect mapping could carry a wrong unit.
- **Cost:** no provider cost; the work is the W18 session contract plus a target-side consumer.
- **Tests:** a test asserting the mapping is unit-preserving for every analyte; a test asserting stale readings are refused or flagged; a test asserting nothing is persisted before the user confirms.
- **Acceptance criteria:** implemented only after W18 is approved, with a per-analyte mapping review and an explicit user confirmation before any payload moves.

## P-07 · Printable clinician summary

- **Purpose:** give the user a one-page summary they can bring to a consultation (the CSV export is machine-readable but not consultable).
- **Inputs:** the current readings, the reference limits, the status per marker, the trend, the safety flags and the next actions.
- **Outputs:** a printable page (print stylesheet and/or generated PDF in the browser) with the date, the values, the units, the reference limits and the disclaimer.
- **Risks:** a printed page could outlive the data and be mistaken for a report; no server-side generation means no archive.
- **Cost:** zero provider cost if generated in the browser; no storage.
- **Tests:** a test asserting the printable view contains every entered reading and the disclaimer; a test asserting no data leaves the browser; a visual check of the print layout at A4 width.
- **Acceptance criteria:** the printed summary carries the same values as the screen, is explicitly labelled as an educational summary and not a lab report, and never leaves the device.

## P-08 · Explicit bilirubin/ALP pattern detection

- **Purpose:** name the liver patterns the engine already detects, so the safety box explains *why* the status escalated.
- **Inputs:** the per-marker multiples (bilirubin, ALP, ALT, AST) from the engine output.
- **Outputs:** a pattern line in box 7 (cholestatic pattern, isolated ALP elevation, transaminase-dominant pattern) with the values that produced it.
- **Risks:** pattern naming can be read as a diagnosis; the patterns must stay descriptive.
- **Cost:** zero provider cost; rule-based on engine output. No AI.
- **Tests:** a test for each pattern with the exact marker values that trigger it; a test proving no condition name is used; a test proving the pattern never changes the status (the engine owns that).
- **Acceptance criteria:** every pattern line states the values that produced it and is labelled as descriptive, never diagnostic.

## P-09 · Cycle-aware context (no persistence)

- **Purpose:** let the user attach a cycle start date in the current tab so the tool can say "this panel was drawn in week 6".
- **Inputs:** an optional cycle start date (never stored) plus the draw date.
- **Outputs:** the cycle week beside each reading, computed in the browser.
- **Risks:** cycle timing can be estimated wrongly and used to justify dosing; the data must not be persisted.
- **Cost:** zero provider cost; local computation only.
- **Tests:** a test asserting the week number across a month boundary; a test asserting the date is never persisted or sent; a test asserting the tool states the cycle start is user-provided and may be approximate.
- **Acceptance criteria:** the week is shown with its inputs, clearly labelled as user-provided, and no dosing conclusion is ever drawn from it.

## P-10 · Multi-panel intake (lipids, CBC, renal)

- **Purpose:** accept a full panel in one screen, each analyte validated by its own contract, instead of one tool per analyte group.
- **Inputs:** the existing per-analyte input contracts (unit, range, date) plus the analyte catalogue of the other tools.
- **Outputs:** one validated panel that can be routed to the matching tools (Tool 040 lipids, Tool 041 hematocrit, this tool for liver enzymes).
- **Risks:** a large form is slower to use; cross-tool routing needs W18; a unit mistake in one analyte must not block the others.
- **Cost:** zero provider cost; the work is a panel-level contract and the routing contract (which depends on W18).
- **Tests:** per-analyte validation tests reusing the existing contracts; a test proving one invalid analyte blocks only its own field; a routing test asserting the freshness rule per analyte group.
- **Acceptance criteria:** each analyte keeps its own unit, range and error message; the panel never mixes units; routing stays disabled until W18 is approved.
