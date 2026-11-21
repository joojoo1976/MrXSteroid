#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-040-ledger-build.mjs
 *
 * Builds the Tool 040 acceptance ledger (tool-040-requirements.csv).
 *
 * WHY THIS SCRIPT EXISTS
 * ----------------------
 * The atomic requirement set is the SAME for every tool: it is enumerated from
 * the R6.1 sources (SPEC.md, ACCEPTANCE_CRITERIA.md, the closure layer, the
 * 20-item implementation map and the Tool 111 checklist). Tool 039 already
 * enumerated all 123 of them. Copying that set by hand would risk quietly
 * dropping or duplicating a requirement, so this script:
 *
 *   1. reads the Tool 039 ledger, which holds the same 123 atomic
 *      requirements, and keeps the REQUIREMENT TEXT verbatim;
 *   2. applies, for every row, Tool 040's OWN applicability, implementation
 *      status, evidence level, files, actual test result and closure evidence;
 *   3. writes tool-040-requirements.csv and refuses to write anything if the
 *      row set, the column set or a controlled vocabulary is broken.
 *
 * Nothing is copied from Tool 039 that is not true of Tool 040:
 *   - the owner decision D-08 (Option A: local device-only storage) was
 *     granted for TOOL 039 ONLY, so Tool 040 stores nothing: its history box
 *     and its rating box are NOT_APPLICABLE, and it has no storage layer;
 *   - every proof (test name, test count, browser check, evidence file) is
 *     Tool 040's own.
 *
 * The owner decision (column C) is APPROVED on every applicable row after the
 * owner's final decision (2026-11-13, OWNER_ACCEPTED — Tool 040 closed); the
 * developer never self-approves. The excluded rows stay NOT_DECISIONED.
 *
 * Usage: node tool-040-ledger-build.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, 'tool-039-requirements.csv');
const targetPath = join(here, 'tool-040-requirements.csv');

const HEAD = '5a87f3e5271db497a63833bb3cd1bb3df2078497';
const DATE = '2026-11-13';
const OWNER_DECISION = { date: '2026-11-13', status: 'APPROVED', label: 'OWNER_ACCEPTED' };
const EVIDENCE_PUBLISHED = 'docs/MRX Genius Cloud Unified R6.1/evidence/tool040-published';
const OWNER_DECISION_POINTER = ` | Owner decision ${OWNER_DECISION.date}: ${OWNER_DECISION.label} (after the owner reviewed the published Preview dpl_GbCvuDp19tW61fNYM43usTJhYm2r).`;

const HEADER = [
  'req_id', 'requirement', 'applicability', 'A', 'B', 'C', 'E',
  'files', 'test_result', 'verified_date', 'head', 'evidence_uri',
  'gap_next_action', 'closure_evidence',
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; }
      } else field += char;
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (char !== '\r') field += char;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

/* ── the Tool 040 facts, used by every row ───────────────────────────────── */
const FILES = {
  ui: 'components/tools/tool-040-lipid-profile-optimizer.tsx',
  visual: 'components/tools/tool-040-lipid-profile-optimizer.visual.tsx',
  genius: 'components/tools/tool-040-lipid-profile-optimizer.genius.tsx',
  uiTest: 'components/tools/tool-040-lipid-profile-optimizer.test.tsx',
  contract: 'lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts',
  contractTest: 'lib/tools/r6/tool-040-lipid-profile-optimizer-contract.test.ts',
  visualData: 'lib/tools/r6/tool-040-lipid-profile-optimizer-visual.ts',
  visualDataTest: 'lib/tools/r6/tool-040-lipid-profile-optimizer-visual.test.ts',
  pipeline: 'lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.ts',
  pipelineTest: 'lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts',
  engine: 'lib/tools/engines/tool-040-lipid-profile-optimizer.ts',
  engineTest: 'lib/tools/engines/tool-040-lipid-profile-optimizer.test.ts',
  schema: 'lib/tools/schemas/tool-040-lipid-profile-optimizer.ts',
  manifest: 'lib/tools/r6/manifest.ts',
  i18n: 'i18n/tool-040-lipid-profile-optimizer.json',
  harness: 'docs/MRX Genius Cloud Unified R6.1/tool-040-browser-verify.mjs',
  evidence: 'docs/MRX Genius Cloud Unified R6.1/evidence/tool040',
  acceptance: 'docs/MRX Genius Cloud Unified R6.1/TOOL-040-ACCEPTANCE.md',
  ledger: 'docs/MRX Genius Cloud Unified R6.1/tool-040-requirements.csv',
  proposals: 'docs/MRX Genius Cloud Unified R6.1/TOOL-040-DEVELOPMENT-PROPOSALS.md',
  crosswalk: 'docs/MRX Genius Cloud Unified R6.1/TOOL-040-GENIUS12-CROSSWALK.md',
  activation: 'docs/MRX Genius Cloud Unified R6.1/R6.1-ACTIVATION-DECISION.md',
  manifestDoc: 'docs/MRX Genius Cloud Unified R6.1/R6.1-ACTIVATION-MANIFEST.md',
  register: 'docs/MRX Genius Cloud Unified R6.1/R6.1-SYSTEM-REQUIREMENT-REGISTER.md',
  scope: 'docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv',
  tracker: 'docs/MRX Genius Cloud Unified R6.1/W01-W24-CONFLICT-TRACKER.md',
};

const BROWSER = `${FILES.evidence}/tool-040-browser-verification.json`;
const BROWSER_COUNT = '28/28';

/* ── per-row overrides ───────────────────────────────────────────────────── */
/* app   : the applicability sentence (must start with APPLICABLE or NOT_APPLICABLE)
 * B     : the implementation status
 * E     : the evidence level
 * files : the files that carry the proof
 * test  : the ACTUAL test result
 * evid  : the evidence URI
 * gap   : what is still open (never empty)
 * close : the closure evidence                                          */
const OVERRIDES = {
  'SPEC-R6.1-1.a': {
    app: 'APPLICABLE (tool slice): the tool must sit on the Math layer only and must not mix internal service taxonomies',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}; ${FILES.genius}`,
    test: "vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS (28/28 in components/tools/tool-040-lipid-profile-optimizer.test.tsx); the source scan proves the component imports the R6 pipeline, never the engine or the legacy adapter, and makes no network call",
    evid: `${FILES.acceptance}#S2`,
    gap: 'none',
    close: 'Source scan proves no engine/adapter import and no network call; the tool owns its twelve boxes (slug in R6_EXEMPT_SLUGS).',
  },
  'SPEC-R6.1-1.b': {
    app: 'APPLICABLE: Tool 040 has an authoritative V6 engine that must stay pure',
    B: 'PASS', E: 'E3',
    files: `${FILES.engine} (unmodified); ${FILES.engineTest}`,
    test: 'engine suite PASS (3/3 in lib/tools/engines/tool-040-lipid-profile-optimizer.test.ts) inside the scope-2 regression (57 test files, 406 tests, 406 passed); git status shows the engine file unmodified',
    evid: `${FILES.acceptance}#S2`,
    gap: 'none',
    close: 'git status --short lib/tools/engines/... => NONE_MODIFIED',
  },
  'SPEC-R6.1-1.c': {
    app: 'APPLICABLE: the UI must display engine results only',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}; ${FILES.pipeline}`,
    test: "vitest 'calculates through the R6 pipeline once the panel is complete' PASS + pipeline test 'matches the standalone V6 engine output exactly' PASS + pipeline test 'the contract band mirror agrees with the V6 engine' PASS (LDL, HDL and TG across their whole range)",
    evid: `${FILES.acceptance}#S2`,
    gap: 'none',
    close: 'No value is computed in the component; every number comes from output.result, and the contract mirror is asserted to agree with the engine.',
  },
  'SPEC-R6.1-1.d': {
    app: 'APPLICABLE (tool slice): the tool must not present an AI result as a calculation',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (capability contract CANNOT line)`,
    test: "vitest 'publishes the seven-part capability contract without claiming AI' PASS (CAN, CANNOT, SOURCES, WHY, COST, STOP, RESTORE all present; the contract states the tool cannot store anything and cannot prescribe)",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'Capability contract states the absence of any model; no provider is called and no token is spent.',
  },
  'SPEC-R6.1-1.e': {
    app: 'APPLICABLE: five dynamic states are mandatory for this tool',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}`,
    test: "vitest 'starts EMPTY and invents nothing' / 'stays PARTIAL until every required field is answered' / 'reports INVALID for an out-of-range value and calculates nothing' / 'rejects an impossible calendar date' PASS; the DEGRADED state is reachable when the pipeline returns an error; browser: EMPTY, PARTIAL, INVALID and FULL are all observed in a real browser (state=EMPTY / state=PARTIAL / state=INVALID / state=FULL)",
    evid: `${FILES.acceptance}#S5`,
    gap: 'none',
    close: 'The state badge shows State: Empty / Partial / Full / Invalid / Degraded, and each state has its own copy.',
  },
  'SPEC-R6.1-1.f': {
    app: 'APPLICABLE: this tool has an optional total-cholesterol field and a date that must not be invented',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}; ${FILES.contract}`,
    test: "vitest 'starts EMPTY and invents nothing' PASS (every field starts empty; a typed 0 is a real 0 and is reported INVALID, never silently ignored) + 'treats a typed zero as a real value' PASS + browser 'EMPTY state: nothing is pre-filled and nothing is invented' PASS (pre-filled values = 0)",
    evid: `${FILES.acceptance}#S2`,
    gap: 'none',
    close: 'An empty required field is PARTIAL (not answered yet); an entered-but-wrong value is INVALID. The total cholesterol is only approximated by the engine, and the UI says so.',
  },
  'SPEC-R6.1-1.g': {
    app: 'APPLICABLE: this is a lipid-profile tool, not a macro tool',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}; ${FILES.contract}`,
    test: "vitest 'stays PARTIAL until every required field is answered' PASS (the pipeline is not called until the panel, the date and the context are answered); the MVO is documented in the acceptance file",
    evid: `${FILES.acceptance}#S4`,
    gap: 'none',
    close: 'MVO = the entered lipid panel + the panel date + the context (age, smoking, blood pressure, on-cycle, weeks remaining).',
  },
  'SPEC-R6.1-2.a': {
    app: 'APPLICABLE: every tool input must carry the contract attributes',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract}; ${FILES.contractTest}`,
    test: "vitest 'describes every user-facing field with the attributes SPEC-R6.1-2 requires' PASS (10 fields, each with labelKey, helpKey, type, unit, range, required, example, dependsOn, visibilityRule) + 'fixes the unit to mg/dL and never converts' PASS",
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'dependsOn and visibilityRule are present; the contract is the single source the component reads for label, help, unit and range.',
  },
  'SPEC-R6.1-2.b': {
    app: 'APPLICABLE: the input contract must expose its own states',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}`,
    test: "vitest EMPTY/PARTIAL/FULL assertions PASS (state badge text + panel copy); browser: the state attribute was read from the DOM in all four states",
    evid: `${FILES.acceptance}#S5`,
    gap: 'none',
    close: 'The badge shows State: Empty / Partial / Full / Invalid / Degraded.',
  },
  'SPEC-R6.1-2.c': {
    app: 'APPLICABLE: the tool computes a clinical band',
    B: 'PASS', E: 'E3',
    files: `${FILES.pipeline}; ${FILES.pipelineTest}`,
    test: "vitest pipeline test 'is deterministic: the same input always produces the same output' PASS (identical result and identical keyFindings on two runs)",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Two identical runs produce identical result and keyFindings.',
  },
  'SPEC-R6.1-2.d': {
    app: 'APPLICABLE (tool slice): the result engine of this tool must be debounced, and it is implemented with a measurable window',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (TOOL_040_DEBOUNCE_MS = 120); ${FILES.ui} (debounced effect + input-signature binding)`,
    test: "vitest 'debounces the calculation: a burst of edits triggers one run' PASS (a burst of three edits inside the 120 ms window produces one primary run) + 'never lets the result of an older input be shown as the current one' PASS",
    evid: `${FILES.acceptance}#S2`,
    gap: 'none',
    close: 'The pipeline runs inside a debounced effect; the rendered result is bound to the current input signature, so a stale result is never displayed as current.',
  },
  'SPEC-R6.1-2.e': {
    app: 'APPLICABLE: mandatory for a clinical band',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}`,
    test: "vitest 'never lets the result of an older input be shown as the current one' PASS + pipeline determinism test PASS",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Memoised validation + pipeline; the result is bound to an input signature.',
  },
  'SPEC-R6.1-2.f': {
    app: 'APPLICABLE: the result envelope of this tool must expose all five',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (boxes 1, 2, 3, 4, 9)`,
    test: "vitest 'C1 carries the unit, the reference edge and an honest confidence statement' PASS (unit mg/dL, the optimal-band edge 100 / 60 / 150, the confidence declared deterministic) + 'C2 states the formula, the assumptions and the uncertainty' PASS + 'C4 publishes the sources with publisher, date, evidence level and link' PASS + box 4 lists the entered panel and the context",
    evid: `${FILES.acceptance}#S6-B`,
    gap: 'none',
    close: 'MVO=box1/box4, UnitUsed=box2/box4, FormulaUsed=box3, Uncertainty=box3, Evidence=box9.',
  },
  'SPEC-R6.1-2.g': {
    app: 'APPLICABLE: the panel values, the date and the two answers are user inputs',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}`,
    test: "vitest 'stays PARTIAL until every required field is answered' PASS (the pipeline is not called while a required answer is missing) + 'treats a typed zero as a real value' PASS",
    evid: `${FILES.acceptance}#S5`,
    gap: 'none',
    close: 'Unanswered stays unanswered until the user picks yes/no; the engine input is built only when every required field is valid.',
  },
  'SPEC-R6.1-2.h': {
    app: 'APPLICABLE (partly): the tool publishes cross-tool links in GENIUS-12 box 8, so the link must carry its freshness rule',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (TOOL_040_CROSS_TOOL_LINKS); ${FILES.genius} (box 8 renders the contract)`,
    test: "vitest contract test 'binds the cross-tool links with a freshness rule and a stale action' PASS (sourceToolId, targetToolId, mappedFields, freshnessRule, staleAction, transfer = manual-reentry on every link) + component test 'renders the cross-tool links with their freshness rule and the no-transfer statement' PASS",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none - the contract object exists without any payload transfer (transfer mode = manual-reentry, W18 still pending for automatic transfer)',
    close: 'Two links (tool-039 and tool-007) carry source, target, mapped fields, the 90-day freshness rule, the stale action and the explicit transfer mode.',
  },
  'SPEC-R6.1-2.i': {
    app: 'APPLICABLE: this tool consumes a lab panel, so the 90-day lab rule applies',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (TOOL_040_LAB_FRESHNESS_DAYS = 90, labFreshness, isRealCalendarDate); ${FILES.contractTest}`,
    test: "vitest contract test 'applies the lab freshness rule at read time' PASS (28 days fresh / 151 days stale) + 'computes the age in a timezone-free way' PASS (28 days across the 2026-03-08 spring-forward, 61 days across the 2026-11-01 autumn change, the 90/91-day boundary exact) + 'returns null for a date that is not a real calendar date' PASS",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'The freshness verdict is computed at READ TIME from the entered panel date; an impossible calendar date is rejected, never rolled over.',
  },
  'SPEC-R6.1-2.j': {
    app: 'NOT_APPLICABLE (proved by scope): a published event bus implies cross-tool payload transfer, which is blocked by W18 and prohibited by the owner directive (no session/cloud sync). This tool performs no transfer and therefore emits no event',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3 (W18 boundary)`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator as NOT_APPLICABLE; the platform event bus is tracked under G-R6.1-2/G-R6.1-3, not by this tool.',
  },
  'SPEC-R6.1-2.k': {
    app: 'APPLICABLE (tool slice): the engine performs no conversion at all, so the tool must prove the unit is passed through untouched',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (TOOL_040_LIPID_UNIT, TOOL_040_BANDS); ${FILES.pipelineTest}`,
    test: "vitest pipeline test 'applies no unit conversion: the entered mg/dL value is returned unchanged' PASS (160 mg/dL stays 160 mg/dL and lands in the very-high band - a converted value would land in another band) + 'keeps the non-HDL arithmetic in the same unit' PASS (250 - 38 = 212 mg/dL) + contract test 'fixes the unit to mg/dL and never converts' PASS",
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'Negative double-conversion test present; no conversion layer exists anywhere in the tool.',
  },
  'SPEC-R6.1-3.a': {
    app: 'APPLICABLE: this is the core UI rule for the tool page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius}`,
    test: "vitest 'renders all twelve GENIUS boxes in their fixed order' PASS (boxes 1..12) + 'shows the compact mode with the five CORE boxes' PASS (5 boxes) + 'keeps C1 identical between the compact mode and the full page' PASS (byte-for-byte) + browser 'the twelve GENIUS boxes keep their fixed order' PASS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: '12 boxes in full order; 5 boxes (2,3,7,9,12) in compact; the C1 text is compared byte-for-byte.',
  },
  'SPEC-R6.1-3.b': {
    app: 'APPLICABLE: the tool has boxes that do not apply (history and rating)',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 11, box 12 rating)`,
    test: "vitest 'keeps the history box visible with a real reason instead of hiding it' PASS (data-r6-box-source = not_applicable) + browser 'The history box stays visible with a real reason' PASS (source=not_applicable); the rating block carries data-r6-rating='not_available' and states that keeping a rating would need a storage layer the owner decision D-08 did not open for this tool",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Both non-applicable blocks render with an explicit status and a real reason; neither disappears.',
  },
  'SPEC-R6.1-3.c': {
    app: 'APPLICABLE: CORE-5 is mandatory in every mode',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (boxes 2, 3, 7, 9, 12)`,
    test: "vitest C1/C2/C3/C4/C5 assertions PASS (the unit, the reference edge and the honest confidence; the formula, the inputs, the assumptions and the uncertainty; the red flag and the referral list including the 500 mg/dL pancreatitis threshold; the publisher, the E2 level, the date and the link; the next step, what not to do and when to see a doctor)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Every CORE-5 element is asserted by a dedicated test that reads the rendered box.',
  },
  'SPEC-R6.1-3.d': {
    app: 'APPLICABLE: the rule applies to this tool\'s boxes',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius}; ${FILES.visual}; ${FILES.i18n}`,
    test: `i18n parity script: ${'230'} keys per locale, 0 missing, 0 extra, 0 empty, 0 CJK/Hangul contamination (exit 0) - the AR/EN translation is proven; correctness and structure: vitest 'renders all twelve GENIUS boxes in their fixed order' PASS (each box carries its heading and a source badge) + the CORE-5 content tests PASS; accessibility and keyboard: vitest 'flips the direction and localizes the labels in Arabic' PASS + browser 'Keyboard focus opens the tooltip' PASS and 'Escape closes the tooltip' PASS`,
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Semantic headings, aria-label / aria-invalid / role=status / role=alert, all strings in both locales.',
  },
  'SPEC-R6.1-3.e': {
    app: 'APPLICABLE (tool slice): the shared slider upgrade applies to tagged fields only',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (the age field: slider true, unitless); ${FILES.ui} (data-r6-slider on the coarse integer field)`,
    test: "vitest contract test 'offers the slider only for the coarse integer field' PASS (the slider fields are ['age']); the global unitSystem is still read from the global preferences and carried in the output envelope (the component test 'flips the direction and localizes the labels in Arabic' PASS and the source scan shows the global preferences hook)",
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'The age is unitless, so the global measurement system cannot change it; the envelope still carries the global unitSystem.',
  },
  'SPEC-R6.1-3.f': {
    app: 'APPLICABLE: lab values need decimal precision (160 vs 163) and the date must stay a date',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (slider:false + sliderReasonKey on every lipid field, the date and the two booleans)`,
    test: "vitest 'offers the slider only for the coarse integer field' PASS (slider fields = ['age']) + 'fixes the unit to mg/dL and never converts' PASS",
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'Documented decision with the reason stored in the contract for every refused field.',
  },
  'SPEC-R6.1-3.g': {
    app: 'APPLICABLE: the tool page must satisfy the Tool 111 reference checklist',
    B: 'PASS', E: 'E3',
    files: `app/smarttools/[category]/[tool]/page.tsx (breadcrumb, R6Progress, prev/next); ${FILES.genius} (box 8 cross-tool); ${FILES.ui} (prev/next navigation)`,
    test: "tool slice: vitest 'renders the cross-tool links with their freshness rule and the no-transfer statement' PASS + the registry href /smarttools/medical-monitoring/tool-040-lipid-profile-optimizer is the route the browser harness loaded successfully (HTTP 200, the page h1 present) + the desktop screenshot evidence/tool040/tool-040-desktop-1440.png shows the page with its navigation; the 'charts' sub-item is NOT_APPLICABLE in row LAYER-TOOL111-CHARTS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Charts are a separate row (LAYER-TOOL111-CHARTS) and are NOT_APPLICABLE with a published reason.',
  },
  'SPEC-R6.1-3.h': {
    app: 'APPLICABLE: the tool must not duplicate the header controls',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui} (useToolDisplayPreferences only)`,
    test: "vitest 'flips the direction and localizes the labels in Arabic' PASS; the source scan shows no language/unit toggle inside the tool",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Locale and unit system come from the global preferences context.',
  },
  'SPEC-R6.1-4.a': {
    app: 'NOT_APPLICABLE (proved by scope): Tool 040 activates no AI feature; R6.1-ACTIVATION-DECISION 3.7 forbids activating R6.1 AI features ahead of their gate sequence, and the tool declares CANNOT (no model).',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator; the platform registry is owned by G-R6.1-3.',
  },
  'SPEC-R6.1-4.b': {
    app: 'NOT_APPLICABLE (proved by scope): no AI answer is produced by this tool, so there is no RAG answer to ground, and no tenant data exists (no persistence at all)',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator; platform-level RAG is tracked under G-R6.1-3.',
  },
  'SPEC-R6.1-4.c': {
    app: 'NOT_APPLICABLE (proved by scope): no model is called by this tool, therefore no policy stage exists at the tool boundary',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'SPEC-R6.1-4.d': {
    app: 'NOT_APPLICABLE (proved by scope): there is no model, prompt or retrieval output in this tool to evaluate; the tool\'s own regression gate is the Vitest suite',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator; AI evals belong to G-R6.1-3.',
  },
  'SPEC-R6.1-4.e': {
    app: 'NOT_APPLICABLE (proved by scope): the tool makes zero provider calls, so there is no request cost to attribute',
    B: 'NOT_APPLICABLE', E: 'E3',
    files: `${FILES.ui}; ${FILES.genius}`,
    test: "the source-scan part of vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS (no fetch/axios/XMLHttpRequest in the tool source); browser 'No value is sent to any server' PASS (113 requests, all GET, none carrying a value)",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'Excluded from the denominator; the capability contract states that no provider is called and no token is spent.',
  },
  'SPEC-R6.1-4.f': {
    app: 'NOT_APPLICABLE (proved by scope, and deliberately): the owner decision D-08 (Option A - local, device-only storage) was granted for TOOL 039 ONLY. Tool 040 stores nothing at all, so there is no memory to keep, no consent to ask, no TTL and no export. The per-user memory requirement stays open for the platform behind W18',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.ui}; ${FILES.genius} (box 11 and the box 12 rating state the reason)`,
    test: "vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS (the source contains no loadDraft/saveDraft/clearDraft/commitDashboardSnapshot/buildAiContext, no adapter import, no supabase import, no fetch/axios/XMLHttpRequest) + vitest 'keeps the history box visible with a real reason instead of hiding it' PASS (source = not_applicable) + browser 'The history box stays visible with a real reason' PASS",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none - the tool deliberately implements NO storage; the memory requirement stays with Tool 039 (owner decision D-08) and with the platform behind W18',
    close: 'Excluded from the denominator with proof: the absence of a storage path is asserted by a test, not by inspection.',
  },
  'SPEC-R6.1-4.g': {
    app: 'NOT_APPLICABLE (proved by scope): no image, file or voice input exists in this tool\'s contract; the capability contract states it explicitly',
    B: 'NOT_APPLICABLE', E: 'E3',
    files: `${FILES.genius} (CANNOT line)`,
    test: "vitest 'publishes the seven-part capability contract without claiming AI' PASS (the contract states there is no image, voice or lab-report reader)",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'SPEC-R6.1-4.h': {
    app: 'APPLICABLE: the tool must disclose its real capability envelope',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (data-r6-core="capability")`,
    test: "vitest 'publishes the seven-part capability contract without claiming AI' PASS (CAN, CANNOT, SOURCES, WHY, COST, STOP, RESTORE all present and tool-specific)",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'The contract is tool-specific, not the generic shell copy.',
  },
  'SPEC-R6.1-4.i': {
    app: 'APPLICABLE: the tool reports a band and must not invent confidence',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (C1 confidence line); ${FILES.pipeline} (provenance.confidence = null)`,
    test: "vitest 'C1 carries the unit, the reference edge and an honest confidence statement' PASS (the confidence line reads 'Deterministic - no model, no estimate' and the box contains no percentage); the pipeline test asserts provenance.confidence null and dataQuality 'not_assessed'",
    evid: `${FILES.acceptance}#S6-B`,
    gap: 'none',
    close: 'No percentage confidence is shown anywhere.',
  },
  'SPEC-R6.1-5.a': {
    app: 'NOT_APPLICABLE (proved by scope): this tool stores nothing at all - no device store, no server, no session. There is no tenant scope, no server-side key and no RLS boundary to enforce. The platform tenant work is tracked by W05 / G-R6.1-1 and stays BLOCKED by the owner\'s no-database instruction',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.tracker} (W05)`,
    test: "the source scan inside vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS asserts that the tool component imports no supabase, calls no createClient, uses no fetch / axios / XMLHttpRequest and references no app/api route; the browser check records 113 requests, all GET, none carrying a value",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator; the tool-level slice (no persistence) is proven by the source-scan test.',
  },
  'SPEC-R6.1-5.b': {
    app: 'NOT_APPLICABLE (proved by scope): the tool has no account, no role and no server-side impactful action, and it stores nothing, so there is no privileged state to guard. The platform IAM work is tracked by G-R6.1-1',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: 'the source scan inside vitest \'has NO persistence: no draft, no dashboard snapshot, no session\' PASS asserts that the tool components import no supabase, call no createClient and make no fetch / axios / XMLHttpRequest call',
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator; platform IAM is owned by G-R6.1-1.',
  },
  'SPEC-R6.1-5.c': {
    app: 'NOT_APPLICABLE (proved by scope): the tool performs a synchronous local calculation and a client-side CSV export; it starts no background job and has no server-side work',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.genius} (the CSV export is synchronous in the browser)`,
    test: 'the source scan inside vitest \'has NO persistence: no draft, no dashboard snapshot, no session\' PASS asserts no network call and no persistence',
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'Excluded from the denominator; platform queues are owned by G-R6.1-5.',
  },
  'SPEC-R6.1-5.d': {
    app: 'NOT_APPLICABLE (proved by scope): the tool is a client component with no server-side execution path, so it emits no application logs, metrics or traces; the platform logging layer covers the route',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: "browser 'No medical value reaches the application log' PASS (2 console messages, none containing a value or a unit)",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator; platform observability is owned by G-R6.1-5.',
  },
  'SPEC-R6.1-5.e': {
    app: 'NOT_APPLICABLE (proved by scope): the tool stores nothing on a server and nothing on the device, so there is no state to back up, replicate or restore; the user can still export the panel and the bands to CSV from the browser',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: "the source scan inside vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS asserts no server persistence and no network call; the export path is proven by vitest 'offers a client-side CSV export and never calls a server' PASS",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator; platform DR is owned by G-R6.1-5.',
  },
  'SPEC-R6.1-5.f': {
    app: 'NOT_APPLICABLE (proved by scope): the tool ships no feature flag of its own; the preview deployment itself is the canary surface and the rollback path is the Vercel deployment rollback owned by the release process',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.5`,
    test: 'Source citation only; no tool-side implementation expected',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator; the tool\'s deployment is a preview and can be rolled back by redeploying HEAD.',
  },
  'SPEC-R6.1-5.g': {
    app: 'APPLICABLE: a lipid-profile tool in a steroid context is a safety-critical surface (a very-high triglyceride band carries a pancreatitis risk)',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 7)`,
    test: "vitest 'C3 raises a red flag and a referral for a very-high result' PASS (triglycerides 520 mg/dL => the red-flag line, the referral list and the 500 mg/dL pancreatitis threshold are all rendered)",
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Flags are derived from the engine result (very-high TG, very-high LDL, the context combination); the tool states it does not diagnose or prescribe.',
  },
  'SPEC-R6.1-6.a': {
    app: 'APPLICABLE: every tool owes a documented proposal set',
    B: 'PASS', E: 'E3',
    files: FILES.proposals,
    test: "vitest 'publishes exactly ten tool-specific proposals, each with inputs, outputs, risks, cost, tests and acceptance criteria' PASS (10 proposals, 7 required fields each, labelled NOT IMPLEMENTED and explicitly not 10 execution tasks)",
    evid: FILES.proposals,
    gap: 'none',
    close: 'The proposals live in a dedicated tool file, separate from the platform 20-item map, and a test enforces their number and structure.',
  },
  'SPEC-R6.1-6.b': {
    app: 'NOT_APPLICABLE (proved by scope): no translation provider is used by this tool. The tool ships static AR/EN copy and calls no translation API, so there is no provider to swap',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.ui}; ${FILES.i18n}`,
    test: 'the source scan inside vitest \'has NO persistence: no draft, no dashboard snapshot, no session\' PASS asserts no network call; the i18n parity script proves both locales are complete (exit 0)',
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'Excluded from the denominator; the tool-slice of translation completeness is row SPEC-R6.1-3.d (PASS).',
  },
  'SPEC-R6.1-6.c': {
    app: 'NOT_APPLICABLE (proved by scope): no translation change was performed in this pass; the AR/EN copy was authored directly in the tool\'s i18n file',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.i18n,
    test: 'Evidence: the file is authored copy, not a provider output (i18n parity script exit 0)',
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator; a future provider swap would require this contract.',
  },
  'SPEC-R6.1-6.d': {
    app: 'APPLICABLE (tool slice): W18 is still NOT opened at project level, and the owner decision D-08 (Option A) was granted for TOOL 039 ONLY. This tool therefore implements NO persistence of any kind: no device store, no cloud sync, no session persistence, no shared storage between tools, no database and no session change',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui}; ${FILES.genius}`,
    test: "vitest source-scan PASS: the tool components import no supabase, call no createClient, make no fetch / axios / XMLHttpRequest call and reference no app/api route. No database, no migration, no RLS policy, no session and no cloud storage was created. REAL BROWSER: 113 requests, all GET navigations and assets, none carrying a value, and no value in the application log",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none - the tool implements nothing beyond the platform baseline, and nothing of the Tool 039 exception',
    close: 'No persistence code path exists, and a test asserts its absence.',
  },
  'ACC-R6.1-1.a': {
    app: 'APPLICABLE: the tool\'s acceptance rows must carry all three',
    B: 'PASS', E: 'E3',
    files: `${FILES.acceptance} (columns A, B, C); ${FILES.ledger}`,
    test: "calc script output: 'A status counts' and 'B status counts' computed from the ledger, exit 0",
    evid: FILES.ledger,
    gap: 'none',
    close: 'Every ledger row carries A, B and C values.',
  },
  'ACC-R6.1-1.b': {
    app: 'APPLICABLE: the tool\'s evidence must be levelled, not asserted',
    B: 'PASS', E: 'E3',
    files: `${FILES.ledger} (column E + evidence_uri)`,
    test: "the calc script asserts every ledger row has a non-empty E level and a non-empty evidence URI, and refuses to count a row whose E is below E3 (exit 0); the ledger contains no row with B=PASS and E0/E1/E2 as a completed item - the 'NOT_FOUND is inventory only' and 'SPECIFIED does not mean PASS' rules are enforced by the calculator, not asserted by a separate test",
    evid: FILES.ledger,
    gap: 'none',
    close: 'E-levels follow the closure layer ladder (E0-E5).',
  },
  'ACC-R6.1-1.c': {
    app: 'APPLICABLE: the tool acceptance table must be complete row by row',
    B: 'PASS', E: 'E3',
    files: `${FILES.ledger} (14 columns)`,
    test: 'calc script asserts every row has all 14 columns non-empty, exit 0',
    evid: FILES.ledger,
    gap: 'none',
    close: 'Column completeness is machine-checked.',
  },
  'ACC-R6.1-2.g0': {
    app: 'NOT_APPLICABLE (proved by scope): G-R6.1-0 is a programme-level reconciliation gate covering all 268-286 entries, not a single tool requirement; the Tool 040 slice is row SR-049 of the scope reconciliation',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.scope} (SR-049)`,
    test: 'Scope row SR-049 updated and read back: verificationState = tested',
    evid: FILES.scope,
    gap: 'none',
    close: 'Excluded from the denominator; the tool contributes its SR-049 row.',
  },
  'ACC-R6.1-2.g1': {
    app: 'NOT_APPLICABLE (proved by scope): the gate is platform-wide; the tool\'s slice is the input contract and the unit mirror, which are rows SPEC-R6.1-2.a and SPEC-R6.1-2.k (both PASS)',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation; tool slice referenced',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-2.g2': {
    app: 'NOT_APPLICABLE (proved by scope): the gate is platform-wide; the tool\'s slices are rows SPEC-R6.1-1.e, SPEC-R6.1-2.h, SPEC-R6.1-3.a and SPEC-R6.1-3.g',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation; tool slice referenced',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-2.g3': {
    app: 'NOT_APPLICABLE (proved by scope): the gate activates AI infrastructure; no AI feature is activated in this tool and the activation decision forbids doing so before the gate',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-2.g4': {
    app: 'NOT_APPLICABLE (proved by scope): the gate is platform-wide; the tool\'s slices are rows SPEC-R6.1-5.g, SPEC-R6.1-4.h and the Health Monitor domain profile row',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation; tool slice referenced',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-2.g5': {
    app: 'NOT_APPLICABLE (proved by scope): the gate is platform-wide and this tool has no server-side runtime, queue, canary or rollback surface',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-2.g6': {
    app: 'NOT_APPLICABLE (proved by scope): the gate covers the release programme, not a single tool page; Tool 040 is a preview deployment and is not a pilot entry',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-3.a': {
    app: 'APPLICABLE: the tool must be proven in a running environment',
    B: 'PASS', E: 'E3',
    files: `n/a (process) + the local production server on port 3100`,
    test: "npx next build => BUILD_EXIT_CODE=0 (506/506 pages, 'Compiled successfully'); npx tsc --noEmit => TSC_EXIT_CODE=0; npx eslint on the six Tool 040 sources => 0 errors, 0 warnings; scope 1 (Tool 039 + Tool 040 targeted: 14 test files, 171 tests, 171 passed); scope 2 (wider regression: 57 test files, 406 tests, 406 passed); the Tool 040 slice alone: 5 test files, 62 tests, 62 passed; the production server started on port 3100 and served the route (HTTP 200, the page h1 present); the runtime log contains no 5xx line",
    evid: `${FILES.acceptance}#S3`,
    gap: 'none for this requirement — the published-Preview proof (E4) is now closed by deployment dpl_GbCvuDp19tW61fNYM43usTJhYm2r and the published browser run (PASS=28), and the residual item is closed',
    close: 'Build, typecheck, lint, the tool tests, a live runtime snapshot and a runtime-log check without any 5xx are all recorded with their actual outputs.',
  },
  'ACC-R6.1-3.b': {
    app: 'APPLICABLE: this tool\'s whole result depends on units and dates',
    B: 'PASS', E: 'E3',
    files: `${FILES.engineTest}; ${FILES.pipelineTest}; ${FILES.contractTest}; ${FILES.uiTest}`,
    test: "engine suite PASS (3/3 in lib/tools/engines/tool-040-lipid-profile-optimizer.test.ts); pipeline 'applies no unit conversion: the entered mg/dL value is returned unchanged' PASS - the negative double-conversion check; pipeline 'keeps the non-HDL arithmetic in the same unit' PASS; contract 'applies the lab freshness rule at read time' PASS (28 days fresh / 151 days stale); contract 'computes the age in a timezone-free way (same result across DST boundaries)' PASS (2026-03-08 and 2026-11-01, the 90/91-day boundary exact); component 'flips the direction and localizes the labels in Arabic' PASS (RTL)",
    evid: `${FILES.acceptance}#S7`,
    gap: 'none',
    close: 'All four sub-tests exist and pass.',
  },
  'ACC-R6.1-3.c': {
    app: 'APPLICABLE: mandatory dynamic test set',
    B: 'PASS', E: 'E3',
    files: `${FILES.uiTest}; ${FILES.pipelineTest}`,
    test: "vitest EMPTY/PARTIAL/FULL/INVALID/DEGRADED + determinism + MVO assertions PASS (28/28 in components/tools/tool-040-lipid-profile-optimizer.test.tsx, plus 7/7 in the visual data-layer test); the browser suite observed EMPTY, PARTIAL, INVALID and FULL in a real browser",
    evid: `${FILES.acceptance}#S5`,
    gap: 'none',
    close: 'Dynamic test set complete.',
  },
  'ACC-R6.1-3.d': {
    app: 'APPLICABLE: the visual acceptance set applies to this tool page',
    B: 'PASS', E: 'E4',
    files: `${FILES.visual}; ${FILES.harness}`,
    test: `browser at 390x844 (real Chrome, DevTools Protocol, published Preview dpl_GbCvuDp19tW61fNYM43usTJhYm2r): 'Mobile 390px renders without horizontal overflow' PASS (overflow 0) and 'Mobile 390px keeps the visual elements' PASS (3 gauges + 5 visible steps) and 'Mobile 390px: the diagram text is rendered as real, readable text' PASS (the desktop SVG is hidden, 10 visible text elements, smallest 12 px / largest 13 px) + screenshot ${EVIDENCE_PUBLISHED}/tool-040-mobile-390.png; desktop 1440x900 PASS with screenshot ${EVIDENCE_PUBLISHED}/tool-040-desktop-1440.png; Arabic RTL at 1440x900 PASS (dir=rtl, no horizontal overflow) with screenshot ${EVIDENCE_PUBLISHED}/tool-040-arabic-rtl-1440.png. The browser suite as a whole (ON THE PUBLISHED DEPLOYMENT): ${BROWSER_COUNT} PASS`,
    evid: `${EVIDENCE_PUBLISHED}/tool-040-browser-verification.json; ${EVIDENCE_PUBLISHED}/tool-040-desktop-1440.png; ${EVIDENCE_PUBLISHED}/tool-040-mobile-390.png; ${EVIDENCE_PUBLISHED}/tool-040-arabic-rtl-1440.png`,
    gap: 'none - the mobile and desktop rendering is verified in a real browser with screenshots and a measured legibility figure, not by CSS inspection',
    close: 'The visual acceptance evidence is a machine-written JSON log plus three PNG screenshots from a real browser run.',
  },
  'ACC-R6.1-3.e': {
    app: 'NOT_APPLICABLE (proved by scope): the tool stores no tenant data and no server data - it stores nothing at all - so there is no cross-tenant read or write path to isolate. The platform RLS negative test belongs to G-R6.1-1 and stays BLOCKED by the owner\'s no-database instruction',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: "the source scan inside vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS asserts no supabase import, no createClient, no fetch / axios / XMLHttpRequest and no app/api reference in the tool components",
    evid: `${FILES.tracker} (W05)`,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-3.f': {
    app: 'NOT_APPLICABLE (proved by scope): no AI request can be made by this tool, so none of these AI-specific negatives is reachable at the tool boundary',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.activation}#3.7`,
    test: 'Source citation; the source-scan test proves no network call (vitest PASS)',
    evid: FILES.activation,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-3.g': {
    app: 'NOT_APPLICABLE (proved by scope): the tool starts no background job and no server-side work',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: 'the source scan inside vitest \'has NO persistence: no draft, no dashboard snapshot, no session\' PASS asserts no network and no persistence',
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-3.h': {
    app: 'NOT_APPLICABLE (proved by scope): the tool has no operational runtime of its own; these are platform acceptance items owned by G-R6.1-5',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.manifestDoc,
    test: 'Source citation',
    evid: FILES.manifestDoc,
    gap: 'none',
    close: 'Excluded from the denominator.',
  },
  'ACC-R6.1-3.i': {
    app: 'APPLICABLE: the medical monitoring domain requires a proven red-flag path',
    B: 'PASS', E: 'E3',
    files: `${FILES.uiTest}; ${FILES.genius}`,
    test: "vitest 'C3 raises a red flag and a referral for a very-high result' PASS (triglycerides 520 mg/dL => the red-flag line, the referral list and the pancreatitis threshold); vitest 'shows the freshness verdict of the panel and marks an old panel as stale' PASS (a panel dated 2020-01-01 is shown as Stale)",
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Red-flag and referral paths proven for the very-high case and the stale case.',
  },
  'ACC-R6.1-3.j': {
    app: 'APPLICABLE: the tool\'s row must be reconciled in the scope CSV',
    B: 'PASS', E: 'E3',
    files: `${FILES.scope} (row SR-049)`,
    test: "vitest 'reconciles the Tool 040 scope row as tested and pointing at the acceptance file' PASS (SR-049: component_exists,tested,...,TOOL-040-ACCEPTANCE.md,...)",
    evid: FILES.scope,
    gap: 'none',
    close: 'The scope row is asserted by a re-runnable test instead of being read by hand.',
  },
  'ACC-R6.1-4.a': {
    app: 'APPLICABLE: the tool\'s acceptance is the owner\'s decision',
    B: 'PASS', E: 'E3',
    files: `${FILES.acceptance} (column C = APPROVED on all 92 applicable rows — the owner decision of 2026-11-13, OWNER_ACCEPTED)`,
    test: "the calc script reports the C status counts: every applicable row is APPROVED and the excluded rows are NOT_DECISIONED; no self-approval is recorded",
    evid: FILES.acceptance,
    gap: 'none - the owner decision (C) was APPROVED on 2026-11-13 after the owner reviewed the published Preview dpl_GbCvuDp19tW61fNYM43usTJhYm2r',
    close: 'The owner decision is APPROVED on every applicable row; the developer recorded no decision.',
  },
  'ACC-R6.1-4.b': {
    app: 'APPLICABLE: the tool must supply its share of the acceptance package',
    B: 'PASS', E: 'E3',
    files: `${FILES.acceptance}; ${FILES.manifestDoc}; ${FILES.register}; ${FILES.crosswalk}; ${FILES.tracker}; ${FILES.ledger}`,
    test: "vitest 'ships the acceptance package with a manifest, hashes, a conflict log, a crosswalk, a tracker and the ledger' PASS + 'keeps every excluded requirement recorded in the system requirement register' PASS; the tool slice of the acceptance package is complete. The E5 part of this requirement (independent audit) is the owner's review step and is not claimed by the developer",
    evid: FILES.manifestDoc,
    gap: 'none - E5 (independent audit) remains the owner review step',
    close: 'The package completeness is machine-checked.',
  },
  'ACC-R6.1-4.c': {
    app: 'APPLICABLE: the R6.1 activation-status conflict affects the tool\'s acceptance state',
    B: 'PASS', E: 'E3',
    files: `${FILES.acceptance}#S8 (conflict record)`,
    test: "vitest 'records the activation conflict and the owner decision exactly as it was given' PASS (the 2026-11-09 decision is cited, every applicable row is APPROVED, the excluded rows are NOT_DECISIONED)",
    evid: FILES.activation,
    gap: 'none - the conflict is recorded and the owner decision (2026-11-13, APPROVED) is closed',
    close: 'The conflict is recorded and the owner decision is APPROVED on every applicable row.',
  },
  'LAYER-CORE5-C1': {
    app: 'APPLICABLE: mandatory CORE-5 box',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 2)`,
    test: "vitest 'C1 carries the unit, the reference edge and an honest confidence statement' PASS (160 mg/dL, the optimal-band edges 100 / 60 / 150 mg/dL, 'Deterministic - no model, no estimate', and no percentage anywhere in the box)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'The range is the edge of the optimal band per marker; the confidence is declared deterministic and uncalibrated.',
  },
  'LAYER-CORE5-C2': {
    app: 'APPLICABLE: mandatory CORE-5 box',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (boxes 3 and 4)`,
    test: "vitest 'C2 states the formula, the assumptions and the uncertainty' PASS + box 4 lists the entered panel values, the context and the freshness note",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Formula, assumptions, uncertainty and the entered inputs are all rendered.',
  },
  'LAYER-CORE5-C3': {
    app: 'APPLICABLE: mandatory CORE-5 box',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 7)`,
    test: "vitest 'C3 raises a red flag and a referral for a very-high result' PASS",
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Engine flags plus the referral list; the tool does not diagnose or prescribe.',
  },
  'LAYER-CORE5-C4': {
    app: 'APPLICABLE: mandatory CORE-5 box',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 9); ${FILES.contract} (TOOL_040_SOURCES)`,
    test: "vitest 'C4 publishes the sources with publisher, date, evidence level and link' PASS (4 links, E2, 2026-11-12, target=_blank rel=noopener); the four URLs were verified live with curl (HTTP 200 on 2026-11-12)",
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Four public references (MedlinePlus x3, CDC); each says what it supports and that it is not the source of the limits.',
  },
  'LAYER-CORE5-C5': {
    app: 'APPLICABLE: mandatory CORE-5 box',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 12)`,
    test: "vitest 'C5 gives one next step, what not to do and when to see a doctor' PASS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'The next action points to the clinician\'s plan, not to a dose change.',
  },
  'LAYER-GENIUS12-01': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 1)`,
    test: "vitest 'renders all twelve GENIUS boxes in their fixed order' PASS (box 1 exists with a source badge); browser 'the twelve GENIUS boxes keep their fixed order' PASS (1..12)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Overall band, worst marker, non-HDL.',
  },
  'LAYER-GENIUS12-02': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 2)`,
    test: "vitest C1 test PASS; the parity test compares the compact and the full C1 text and asserts equality",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Identical renderer in both modes.',
  },
  'LAYER-GENIUS12-03': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 3)`,
    test: 'vitest C2 test PASS',
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Two formulas, the assumptions and the uncertainty.',
  },
  'LAYER-GENIUS12-04': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 4)`,
    test: "vitest 12-box order test + the C2 inputs assertion PASS (the panel values, the context and the freshness note are listed, and an un-entered total cholesterol is marked as not entered)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'The panel values, the context and the freshness note.',
  },
  'LAYER-GENIUS12-05': {
    app: 'APPLICABLE: the engine is deterministic and cheap, so scenarios are genuinely computable',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 5)`,
    test: "vitest 'computes the what-if scenarios and the sensitivity through the same pipeline' PASS (three scenarios: LDL 100, HDL 60, TG 150 mg/dL)",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'Each scenario re-runs the same pipeline; labelled as arithmetic, not prediction.',
  },
  'LAYER-GENIUS12-06': {
    app: 'APPLICABLE: the tool has several independent inputs, so sensitivity is measurable',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 6)`,
    test: "vitest 'computes the what-if scenarios and the sensitivity through the same pipeline' PASS (five probes: LDL, HDL, TG, age, blood pressure)",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'Each row changes one input and reports the measured effect on the overall band.',
  },
  'LAYER-GENIUS12-07': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 7)`,
    test: 'vitest C3 and the stale-panel tests PASS',
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Red flags, the do-not list, the referral list, the engine suggestions.',
  },
  'LAYER-GENIUS12-08': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 8)`,
    test: "vitest 'renders the cross-tool links with their freshness rule and the no-transfer statement' PASS (2 links, the freshness rule, the stale action, the no-transfer statement)",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'The links describe what can be carried over by hand; nothing is transferred (W18 pending).',
  },
  'LAYER-GENIUS12-09': {
    app: 'APPLICABLE: part of the full page',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 9)`,
    test: 'vitest C4 test PASS',
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'Four public references with the evidence level and the links.',
  },
  'LAYER-GENIUS12-10': {
    app: 'APPLICABLE: the tool can export its own panel and result honestly without any server',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (buildLipidOptimizerCsv); ${FILES.genius} (box 10)`,
    test: "vitest contract test 'exports the panel and the computed bands as CSV' PASS (the panel, the three bands, the non-HDL, the overall band and the context); component test 'offers a client-side CSV export and never calls a server' PASS",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none',
    close: 'Client-side CSV; no account, no upload, no secrets.',
  },
  'LAYER-GENIUS12-11': {
    app: 'NOT_APPLICABLE (proved by scope, and deliberately): the owner decision D-08 (Option A - local, device-only storage) was granted for TOOL 039 ONLY, so this tool has no storage layer at all and therefore no history. The box stays in position 11 and states the reason; the cloud and per-tenant history stays behind W18',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.genius} (box 11)`,
    test: "vitest 'keeps the history box visible with a real reason instead of hiding it' PASS (data-r6-box-source = not_applicable, the text names the missing storage layer) + browser 'The history box stays visible with a real reason' PASS (source=not_applicable) + the 12-box order test PASS (box 11 is present, not hidden)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none - the box is present and honest; the history itself is NOT_APPLICABLE for this tool by owner decision',
    close: 'The box keeps its position and its order and states why there is no history, instead of vanishing.',
  },
  'LAYER-GENIUS12-12': {
    app: 'APPLICABLE for the C5 part (done) but NOT_APPLICABLE for the rating part: without a storage layer a rating or comment cannot be kept honestly',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (box 12)`,
    test: "vitest 'C5 gives one next step, what not to do and when to see a doctor' PASS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none for the next-actions half; the rating half is NOT_AVAILABLE and says why',
    close: 'The next step, what not to do and when to see a doctor are implemented and asserted.',
  },
  'LAYER-5IN12-COMPACT': {
    app: 'APPLICABLE: the tool ships a compact mode for embedded use',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (compact toggle)`,
    test: "vitest 'shows the compact mode with the five CORE boxes' PASS (boxes 2,3,7,9,12)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Exactly five boxes in compact.',
  },
  'LAYER-5IN12-PARITY': {
    app: 'APPLICABLE: mandatory parity rule',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (shared renderer)`,
    test: "vitest 'keeps C1 identical between the compact mode and the full page' PASS (the two texts are compared for equality)",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'The same renderer instance is reused.',
  },
  'LAYER-5IN12-NA': {
    app: 'APPLICABLE: the tool has non-applicable boxes',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (source badges + reasons)`,
    test: "vitest 'keeps the history box visible with a real reason instead of hiding it' PASS; the 12-box test asserts every box carries a data-r6-box-source",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'The reasons are stated, not hidden.',
  },
  'LAYER-DOMAIN-HM': {
    app: 'APPLICABLE: Tool 040 sits in the medical monitoring category and consumes a lab panel',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (boxes 2, 3, 4, 7); ${FILES.contract} (labFreshness)`,
    test: "vitest 'shows the freshness verdict of the panel and marks an old panel as stale' PASS (a panel dated 2020-01-01 is shown as Stale); the reference edges and the bands are proven in the marker rows and in the accessible table",
    evid: `${FILES.acceptance}#S6-D`,
    gap: 'none',
    close: 'The bands (limits), the alerts (flags), the freshness (90 days) and the entered values are all present.',
  },
  'LAYER-DOMAIN-RULE': {
    app: 'APPLICABLE: the tool must not drop or reorder GENIUS-12 boxes',
    B: 'PASS', E: 'E3',
    files: FILES.genius,
    test: "vitest 'renders all twelve GENIUS boxes in their fixed order' PASS (the exact order 1..12) + browser 'the twelve GENIUS boxes keep their fixed order' PASS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Order fixed; no box removed.',
  },
  'LAYER-VISUAL-512': {
    app: 'APPLICABLE: every tool UI must pass it',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius}; ${FILES.visual}`,
    test: "vitest compact-5 + full-12 + C1 parity tests PASS; the visual layer itself is proved by the separate atomic rows listed in the requirement text",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none for the box-visual scope',
    close: 'The row covers only the 12-box visual structure; it does not stand in for illustrations, charts, tooltips or accessibility.',
  },
  'LAYER-CAP-7': {
    app: 'APPLICABLE: the tool must publish its capability envelope',
    B: 'PASS', E: 'E3',
    files: `${FILES.genius} (data-r6-core="capability")`,
    test: "vitest 'publishes the seven-part capability contract without claiming AI' PASS",
    evid: `${FILES.acceptance}#S6-F`,
    gap: 'none',
    close: 'Tool-specific content, not the generic shell text.',
  },
  'LAYER-EVID-LADDER': {
    app: 'APPLICABLE: the tool\'s acceptance must be levelled this way',
    B: 'PASS', E: 'E3',
    files: FILES.ledger,
    test: 'the calc script assigns and counts the E levels per row and refuses to count a row as PASS without E>=E3',
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'Rows without E>=E3 are not counted as complete.',
  },
  'LAYER-NODELETE': {
    app: 'APPLICABLE: this pass modified existing tool files',
    B: 'PASS', E: 'E3',
    files: `${FILES.acceptance}; git status`,
    test: "vitest 'deletes nothing: the preserved R6.1 headers and the authoritative sources are untouched' PASS (SPEC.md and ACCEPTANCE_CRITERIA.md still carry 'OWNER REVIEW DRAFT'; git status shows the engine, the Zod schema and the registry unmodified)",
    evid: `${FILES.acceptance}#S8`,
    gap: 'none',
    close: 'The no-deletion rule is enforced by a test, not by inspection.',
  },
  'LAYER-20MAP-01': {
    app: 'APPLICABLE: the tool\'s input contract',
    B: 'PASS', E: 'E3',
    files: FILES.contract,
    test: 'the contract tests PASS (13/13 in lib/tools/r6/tool-040-lipid-profile-optimizer-contract.test.ts) - see SPEC-R6.1-2.a',
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'Same artefact as SPEC-R6.1-2.a.',
  },
  'LAYER-20MAP-02': {
    app: 'APPLICABLE: the tool\'s result engine',
    B: 'PASS', E: 'E3',
    files: FILES.pipeline,
    test: 'the pipeline determinism test PASS (11/11 in lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts) - see SPEC-R6.1-2.c and 2.e',
    evid: `${FILES.acceptance}#S6-B`,
    gap: 'none',
    close: 'Same artefact as SPEC-R6.1-2.c/e.',
  },
  'LAYER-20MAP-03': {
    app: 'APPLICABLE (tool slice): the tool publishes cross-tool links with a stale test and a link contract',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract}; ${FILES.genius} (box 8)`,
    test: "vitest contract test 'binds the cross-tool links with a freshness rule and a stale action' PASS + component test 'renders the cross-tool links with their freshness rule and the no-transfer statement' PASS (the 90-day freshness rule and the stale action are rendered)",
    evid: `${FILES.acceptance}#S6-E`,
    gap: 'none for the tool slice; automatic payload transfer stays blocked by W18',
    close: 'Links, mapped fields, the freshness rule and the stale action exist; the transfer mode is documented as manual re-entry.',
  },
  'LAYER-20MAP-04': {
    app: 'APPLICABLE: the tool\'s units are its main correctness risk',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract}; ${FILES.pipelineTest}`,
    test: 'the contract mirror test + the negative double-conversion test PASS',
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'Same artefact as SPEC-R6.1-2.k.',
  },
  'LAYER-20MAP-06': {
    app: 'APPLICABLE: the tool\'s page UI',
    B: 'PASS', E: 'E3',
    files: FILES.genius,
    test: 'the visual tests PASS (see LAYER-VISUAL-512)',
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none',
    close: 'Same artefact as SPEC-R6.1-3.a.',
  },
  'LAYER-20MAP-07': {
    app: 'APPLICABLE: the tool must be reachable from the registry route',
    B: 'PASS', E: 'E3',
    files: 'lib/tools/registry.ts (href /smarttools/medical-monitoring/tool-040-lipid-profile-optimizer); app/smarttools/[category]/[tool]/page.tsx',
    test: 'the production server returned HTTP 200 with the Tool 040 markup on the registry href (the browser harness loaded /en/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer and found the page h1)',
    evid: `${FILES.acceptance}#S3`,
    gap: 'none',
    close: 'The route is resolved from the registry, not guessed.',
  },
  'LAYER-TOOL111-CHARTS': {
    app: 'NOT_APPLICABLE (proved by the platform\'s own published reason): the shared R6 phase-2 manifest states for non composition domains \'No 3-segment composition for this domain; pie would be decorative\', so the pie chart is explicitly NOT_AVAILABLE for this tool. The tool also carries its OWN published pie/donut decision with a technical justification',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: 'lib/tools/r6/phase2-manifest.ts (chart.naReason); lib/tools/r6/tool-040-lipid-profile-optimizer-visual.ts (TOOL_040_PIE_DONUT_DECISION)',
    test: "the phase2-manifest test PASS inside the scope-2 regression (57 test files, 406 tests, 406 passed); the tool's own decision is proven by vitest 'documents why a pie or donut chart is not used here' PASS (applicable = false, with a technical reason: LDL, HDL and TG are not shares of one measured total and HDL is protective, so a slice whose size means 'more risk' would invert its own meaning)",
    evid: 'lib/tools/r6/phase2-manifest.ts',
    gap: 'none',
    close: 'Excluded from the denominator with the platform\'s own published reason, and the tool states its own decision in the UI as well.',
  },
  'LAYER-20MAP-03-TENANT': {
    app: 'NOT_APPLICABLE (proved by scope): the cross-tool tenant-isolation leg protects data that moves between tenants. Tool 040 stores nothing and moves no payload (transfer mode = manual re-entry), so it has no tenant data to isolate. The platform leg stays registered in the system requirement register',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: FILES.ui,
    test: "the source scan inside vitest 'has NO persistence: no draft, no dashboard snapshot, no session' PASS asserts no supabase import, no createClient, no fetch / axios / XMLHttpRequest and no app/api reference; the browser check records 113 requests, all GET, none carrying a value",
    evid: FILES.register,
    gap: 'none',
    close: 'Excluded from the Tool 040 denominator with proof; the platform requirement stays registered under G-R6.1-1 / W05.',
  },
  'LAYER-GENIUS12-12-RATING': {
    app: 'NOT_APPLICABLE (proved by scope, and deliberately): the owner decision D-08 (Option A) that allowed a locally stored rating was granted for TOOL 039 ONLY. This tool stores nothing, so there is no result to bind a rating to; the block states NOT_AVAILABLE and the reason instead of pretending',
    B: 'NOT_APPLICABLE', E: 'E2',
    files: `${FILES.genius} (box 12, data-r6-rating="not_available")`,
    test: "vitest 'keeps the history box visible with a real reason instead of hiding it' PASS and the CORE-5 test PASS (the box 12 content includes the NOT_AVAILABLE statement naming the missing storage layer); browser 'The history box stays visible with a real reason' PASS",
    evid: `${FILES.acceptance}#S6-C`,
    gap: 'none - the rating is deliberately NOT_AVAILABLE for this tool by owner decision; it is not claimed and not hidden',
    close: 'The block stays in position 12, states NOT_AVAILABLE and the reason, and no rating is fabricated.',
  },
  'ACC-5.5.1': {
    app: 'APPLICABLE: the tool renders charts from the R6 pipeline output',
    B: 'PASS', E: 'E3',
    files: `${FILES.visualData}; ${FILES.visual}`,
    test: "vitest 'builds one row per marker from the engine result, with the unit and the band' PASS (LDL 160 very-high, HDL 38 high with higherIsBetter, TG 210 high) + 'never invents a value the engine did not produce' PASS + browser 'the gauge shows the entered value and its band' PASS (LDL 160 mg/dL · Very high) + browser 'the accessible table equals the chart' PASS",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'Every plotted number is read from output.result; the unit comes from the contract and the reference edge from the documented constant.',
  },
  'ACC-5.5.2': {
    app: 'APPLICABLE: the charts are bound to the current result',
    B: 'PASS', E: 'E3',
    files: FILES.visual,
    test: "vitest 'scales each gauge on its own scale and clamps the fill to 100 percent' PASS + the component test 'never lets the result of an older input be shown as the current one' PASS (the input-signature binding of the pipeline result)",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'The chart is rendered only from the output that belongs to the current input signature; an outdated result is never displayed.',
  },
  'ACC-5.5.3': {
    app: 'APPLICABLE: the tool ships an explanatory diagram',
    B: 'PASS', E: 'E3',
    files: `${FILES.visual}; ${FILES.ui}; ${FILES.i18n}`,
    test: "browser 'EMPTY state: the explanatory illustration is visible before anything is entered' PASS (the section, the SVG and the five text steps are present before any value is entered) + browser 'EMPTY state: the illustration is labelled as illustrative, not as a measurement' PASS (the caption reads 'Illustrative diagram - it is not a scan, a measurement, a lab report or a diagnosis.') + browser 'FULL state: the explanatory illustration renders' PASS",
    evid: `${BROWSER}; ${FILES.evidence}/tool-040-desktop-1440.png`,
    gap: 'none',
    close: 'The caption states the limits; the illustration never presents itself as an image of the user or as clinical evidence.',
  },
  'ACC-5.5.4': {
    app: 'APPLICABLE: every meaningful visual element carries a tooltip',
    B: 'PASS', E: 'E4',
    files: FILES.visual,
    test: `browser (real Chrome via the DevTools Protocol, published Preview dpl_GbCvuDp19tW61fNYM43usTJhYm2r): 'Mouse hover opens the element tooltip' PASS, 'Keyboard focus opens the tooltip' PASS, 'Touch opens the tooltip' PASS, 'Escape closes the tooltip' PASS; the tooltip body carries Meaning, Value, Band, Explanation, Method, Source, Warning and Limitation. The suite as a whole (ON THE PUBLISHED DEPLOYMENT): ${BROWSER_COUNT} PASS`,
    evid: `${EVIDENCE_PUBLISHED}/tool-040-browser-verification.json`,
    gap: 'none',
    close: 'The same tooltip opens from a real pointer move, a real keyboard focus and a real touch tap.',
  },
  'ACC-5.5.5': {
    app: 'APPLICABLE: the tool has a chart, a diagram and interactive marks',
    B: 'PASS', E: 'E3',
    files: FILES.visual,
    test: "vitest 'builds the accessible text table equal to the chart values' PASS + 'gives every element its own tooltip payload' PASS + browser 'the accessible table equals the chart' PASS + the SVG carries aria-labelledby / aria-describedby with a <title> and a <desc>",
    evid: BROWSER,
    gap: 'none',
    close: 'The data table repeats every charted value; no information exists only inside the SVG.',
  },
  'ACC-5.5.6': {
    app: 'APPLICABLE: the tool ships in both locales',
    B: 'PASS', E: 'E4',
    files: `${FILES.i18n}; ${FILES.visual}`,
    test: "vitest 'flips the direction and localizes the labels in Arabic' PASS (dir=rtl, the Arabic title) + browser 'Arabic RTL renders the visual layer' PASS (dir=rtl) and 'Arabic RTL has no horizontal overflow' PASS (overflow 0)",
    evid: `${EVIDENCE_PUBLISHED}/tool-040-browser-verification.json; ${EVIDENCE_PUBLISHED}/tool-040-arabic-rtl-1440.png`,
    gap: 'none',
    close: 'All diagram, chart, legend and tooltip strings exist in both locales; the units and the marker acronyms stay canonical.',
  },
  'ACC-5.5.7': {
    app: 'APPLICABLE: the original requirement is kept in full. It is split into two atomic parts so that each part is provable on its own: (a) the layout works on a phone and on a desktop, every visual element stays reachable and nothing overflows horizontally; (b) the content inside the explanatory diagram is legible at 390 px. Part (a) is evidenced in this row; part (b) is evidenced in row ACC-5.5.7-LEGIBILITY. The two rows together cover the original requirement exactly once - part (a) is not counted again in part (b), and part (b) is not claimed here',
    B: 'PASS', E: 'E3',
    files: `${FILES.visual}; ${FILES.harness}`,
    test: "browser at 390x844 (real Chrome, DevTools Protocol): 'Mobile 390px renders without horizontal overflow' PASS (overflow 0) and 'Mobile 390px keeps the visual elements' PASS (3 gauges + 5 visible steps); desktop 1440x900 PASS with screenshot evidence/tool040/tool-040-desktop-1440.png. Part (a) - layout, reachability and no horizontal overflow - is proved here; part (b) - the legibility of the diagram text - is proved in row ACC-5.5.7-LEGIBILITY (PASS) and is not claimed again here",
    evid: `${BROWSER}; ${FILES.evidence}/tool-040-mobile-390.png`,
    gap: 'none - part (a) is closed and part (b) is closed in ACC-5.5.7-LEGIBILITY',
    close: 'Both parts of the original requirement are verified in a real browser at 390 px and 1440 px, with screenshots; the original requirement text is unchanged.',
  },
  'ACC-5.5.8': {
    app: 'APPLICABLE: the gauges and the diagram nodes are interactive',
    B: 'PASS', E: 'E4',
    files: FILES.visual,
    test: "browser: 'Keyboard focus opens the tooltip' PASS (real focus), 'Escape closes the tooltip' PASS (a real key event), the tooltip close button carries the aria-label 'Close the explanation'; the interactive elements are real focusable controls with a visible focus ring (CSS .r6-illustration-node:focus rect)",
    evid: `${EVIDENCE_PUBLISHED}/tool-040-browser-verification.json`,
    gap: 'none',
    close: 'Every interactive element is a real focusable control with a visible focus ring.',
  },
  'ACC-5.5.9': {
    app: 'APPLICABLE: the section adds transitions and focus effects',
    B: 'PASS', E: 'E3',
    files: FILES.visual,
    test: "the scoped prefers-reduced-motion media query is in the component ([data-r6-visual='tool-040'] * { transition: none !important; animation: none !important; })",
    evid: BROWSER,
    gap: 'none',
    close: 'A scoped media query removes transitions and animations inside the visual section only.',
  },
  'ACC-5.5.10': {
    app: 'APPLICABLE: the result has five states',
    B: 'PASS', E: 'E3',
    files: FILES.ui,
    test: "vitest state tests PASS: EMPTY, PARTIAL, INVALID (out of range and an impossible calendar date), FULL, and DEGRADED when the pipeline returns an error + browser: the state attribute was read from the DOM as EMPTY, PARTIAL, INVALID and FULL",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'Each state has its own copy; the data-driven charts never appear over an incomplete or invalid input.',
  },
  'ACC-5.5.11': {
    app: 'APPLICABLE (legacy-five compatibility): the five concepts must stay identifiable',
    B: 'PASS', E: 'E3',
    files: FILES.crosswalk,
    test: "the crosswalk maps every legacy concept (Advice, Predictions, Medical advice, Current status, Current feeling) to its Tool 040 location and states the one that is not applicable with a domain rationale; the browser check confirms the tool shows 12 boxes with sources and reasons",
    evid: FILES.crosswalk,
    gap: 'none',
    close: 'No legacy concept is fabricated; the non-applicable one is documented instead of simulated.',
  },
  'SPEC-6.7-TOOLTIP': {
    app: 'APPLICABLE: the tool has interactive charts, a diagram and KPI markers',
    B: 'PASS', E: 'E3',
    files: `${FILES.visualData} (buildLipidBarTooltip); ${FILES.visual}`,
    test: "vitest 'gives every element its own tooltip payload' PASS (the title, the value, the unit and the band per element) + 'gives different elements different tooltip content' PASS + browser hover / focus / touch / Escape checks PASS; the tooltip body carries Meaning, Value, Band, Explanation, Method, Source, Warning and Limitation",
    evid: BROWSER,
    gap: 'none',
    close: 'Each element builds its own payload from the engine output; the source line names the R6 pipeline and the public references.',
  },
  'SPEC-7.1-CHART': {
    app: 'APPLICABLE: the tool must show its result visually',
    B: 'PASS', E: 'E3',
    files: `${FILES.visualData} (TOOL_040_PIE_DONUT_DECISION); ${FILES.visual}`,
    test: "vitest 'documents why a pie or donut chart is not used here' PASS (applicable = false, chart = none, with a technical justification) + browser 'EMPTY state: no chart is drawn without a result' PASS (bars = 0) + browser 'the gauge shows the entered value and its band' PASS",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'The decision is recorded in the UI itself (the box "Why there is no pie or donut chart here") and in the code.',
  },
  'SPEC-7.2-ARROWS': {
    app: 'APPLICABLE: the diagram ends in the primary result',
    B: 'PASS', E: 'E3',
    files: `${FILES.visual}; ${FILES.genius}`,
    test: "the SVG carries the directional connectors (marker-end on every path between the five steps) and the cross-highlight event (r6:tool-040-highlight) links the last diagram node and the primary result box in both directions; the relation is also stated in text, so colour is never the only signal",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'The relationship is carried by a DOM event and a text label, not by colour alone.',
  },
  'SPEC-7.4-ILLUSTRATION': {
    app: 'APPLICABLE: the tool ships an explanatory diagram',
    B: 'PASS', E: 'E3',
    files: `${FILES.visual}; ${FILES.i18n}`,
    test: "browser 'EMPTY state: the explanatory illustration is visible before anything is entered' PASS and 'EMPTY state: the illustration is labelled as illustrative, not as a measurement' PASS; the illustration is original SVG drawn in the repository, so no third-party licence applies and no medical claim is made beyond the cited public references",
    evid: `${BROWSER}`,
    gap: 'none',
    close: 'The diagram explains the process only and is labelled as illustrative.',
  },
  'SPEC-15-A11Y': {
    app: 'APPLICABLE: the visual layer is part of the tool page',
    B: 'PASS', E: 'E4',
    files: `${FILES.visual}; ${FILES.ui}`,
    test: "browser: no horizontal overflow at 390 px and 1440 px, the AR RTL and the EN LTR layouts verified with screenshots, the keyboard focus and Escape verified, the tooltip clamped inside the viewport ('The tooltip stays inside the viewport' PASS, left 497 / right 785 within a 1440 px viewport); vitest: accessible names, the text alternative, the visible focus ring and the 390 px viewport width check",
    evid: `${EVIDENCE_PUBLISHED}/tool-040-browser-verification.json; ${EVIDENCE_PUBLISHED}/tool-040-mobile-390.png; ${EVIDENCE_PUBLISHED}/tool-040-arabic-rtl-1440.png`,
    gap: 'none',
    close: 'Accessibility is implemented in the component and verified in a real browser.',
  },
  'SPEC-6.6-SLIDER': {
    app: 'APPLICABLE (tool slice): one numeric field of this tool uses the shared slider upgrade',
    B: 'PASS', E: 'E3',
    files: `${FILES.contract} (the age field); ${FILES.ui} (data-r6-slider on the coarse integer field)`,
    test: "vitest contract test 'offers the slider only for the coarse integer field' PASS; every other field carries a documented refusal reason. The historical 'AI hint per slider' clause does not apply: no AI model is activated for this tool (the capability contract states it), so no suggestion is fabricated",
    evid: `${FILES.acceptance}#S6-A`,
    gap: 'none',
    close: 'The slider is applied only where precision allows; no AI suggestion is invented.',
  },
  'ACC-5.5.7-LEGIBILITY': {
    app: 'APPLICABLE: this is part (b) of the original ACC-R6.1-5.5 requirement "Mobile and desktop layouts are usable" (SPEC.md 15 "responsive desktop/mobile behaviour" and "charts have accessible names, descriptions and equivalent data table"). It is split out of ACC-5.5.7 so the legibility is measured instead of being absorbed by a passing row; the two rows together cover the original requirement exactly once',
    B: 'PASS', E: 'E3',
    files: `${FILES.visual} (the phone stack: the five steps rendered as real HTML text at 13 px / 12 px with the connectors); ${FILES.harness} (the re-runnable measurement)`,
    test: "browser check 'Mobile 390px: the diagram text is rendered as real, readable text' PASS, measured in a real Chrome at 390x844: the desktop SVG is hidden at that width (desktopSvgHidden = true), 10 visible text elements, the SMALLEST visible diagram text renders at 12.00 px and the largest at 13.00 px, horizontal overflow 0. The figure is recorded in the evidence file (legibility390). THRESHOLD PROVENANCE: the 12 px figure is an INTERNAL engineering criterion of this check, not an R6.1 rule (no R6.1 paragraph specifies a minimum font size); the PASS rests on the measured rendered size of the visible text and on the screenshot",
    evid: `${BROWSER} (legibility390); ${FILES.evidence}/tool-040-mobile-390.png`,
    gap: 'none',
    close: 'No step, connector or meaning was removed: the same five steps are rendered from one data source (diagramSteps), the SVG keeps its connectors on desktop, and the phone stack carries the same titles and bodies as real text with the same tooltip and result-box relationship.',
  },
  'ACC-5.5.3-VISIBILITY': {
    app: 'APPLICABLE: the tool ships an explanatory diagram; it explains the PROCESS and therefore does not depend on a result',
    B: 'PASS', E: 'E3',
    files: `${FILES.ui} (the visual section is rendered unconditionally; only the data-driven charts stay behind a result); ${FILES.visual} (the input and the output are optional; the diagram is rendered in every state)`,
    test: "browser (Chrome DevTools Protocol) on the production build: 'EMPTY state: the explanatory illustration is visible before anything is entered' PASS (section = true, svgVisible = true, the text equivalent has 5 steps) and 'EMPTY state: no chart is drawn without a result' PASS (bars = 0) and 'EMPTY state: nothing is pre-filled and nothing is invented' PASS (0 pre-filled values). The defect this row exists for was found by the browser harness itself and fixed before the ledger was written",
    evid: `${BROWSER}; ${FILES.evidence}/tool-040-desktop-1440.png`,
    gap: 'none - the defect was closed and the same suite passes on the rebuilt app',
    close: 'ROOT CAUSE (traced, not guessed): the whole visual section was rendered only under the condition "input && output", so on first load the page had no diagram at all. FIX: the illustration (SVG + phone stack + text equivalent) is now rendered unconditionally and the data-driven parts (the gauges and the table) remain behind a real result, so no value is ever invented (SPEC-R6.1-1.f, ACC-5.5.11). No engine, schema, registry or catalogue change.',
  },
};

/* ── build ───────────────────────────────────────────────────────────────── */

const raw = parseCsv(readFileSync(sourcePath, 'utf8'));
const sourceHeader = raw[0].map((h) => h.trim());
if (JSON.stringify(sourceHeader) !== JSON.stringify(HEADER)) {
  console.error('SOURCE_HEADER_MISMATCH');
  process.exit(2);
}
const sourceRows = raw.slice(1);

const problems = [];
const missing = Object.keys(OVERRIDES).filter((id) => !sourceRows.some((r) => (r[0] ?? '').trim() === id));
if (missing.length) problems.push(`OVERRIDES reference unknown requirement ids: ${missing.join(', ')}`);

const out = sourceRows.map((cells) => {
  const id = (cells[0] ?? '').trim();
  const requirement = (cells[1] ?? '').trim();
  const override = OVERRIDES[id];
  if (!override) {
    problems.push(`no Tool 040 override for ${id}`);
    return null;
  }
  const applicable = override.app.startsWith('APPLICABLE');
  const C = applicable ? OWNER_DECISION.status : 'NOT_DECISIONED';
  const evid = override.evid + (applicable ? OWNER_DECISION_POINTER : '');
  return {
    req_id: id,
    requirement,
    applicability: override.app,
    A: 'SPEC_APPROVED',
    B: override.B,
    C,
    E: override.E,
    files: override.files,
    test_result: override.test,
    verified_date: DATE,
    head: HEAD,
    evidence_uri: evid,
    gap_next_action: override.gap,
    closure_evidence: override.close,
  };
}).filter(Boolean);

const ids = out.map((r) => r.req_id);
if (new Set(ids).size !== ids.length) problems.push('duplicate requirement ids in the output');
if (ids.length !== sourceRows.length) problems.push(`row count mismatch: ${ids.length} vs ${sourceRows.length}`);

const quote = (value) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
const csv = [HEADER, ...out.map((r) => HEADER.map((k) => r[k]))]
  .map((row) => row.map(quote).join(','))
  .join('\n') + '\n';

if (problems.length) {
  console.error('LEDGER_PROBLEMS:');
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}

writeFileSync(targetPath, csv, 'utf8');
const applicable = out.filter((r) => r.applicability.startsWith('APPLICABLE'));
console.log(`TOOL 040 LEDGER: ${out.length} rows written to ${targetPath}`);
console.log(`  applicable      : ${applicable.length}`);
console.log(`  not applicable  : ${out.length - applicable.length}`);
console.log(`  B = PASS       : ${applicable.filter((r) => r.B === 'PASS').length}`);
console.log(`  C = APPROVED     : ${applicable.filter((r) => r.C === 'APPROVED').length} (the owner decision was recorded as APPROVED on ${OWNER_DECISION.date})`);
