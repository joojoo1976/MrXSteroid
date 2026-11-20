#!/usr/bin/env node
// Read-only generator for the 2026-11-20 SmartTools forensic audit individual reports
// and cross-tool matrices. Consumes only verified artifacts inside the audit folder.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve('E:/MrXSteroid-main');
const OUT = join(ROOT, 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20');
const EV = join(OUT, 'evidence-index');
const IND = join(OUT, 'individual-tools');
mkdirSync(IND, { recursive: true });

const scan = JSON.parse(readFileSync(join(EV, 'TOOL-SOURCE-SCAN.json'), 'utf8'));
const runtime = JSON.parse(readFileSync(join(EV, 'RUNTIME-PUBLISHED-CATALOG.json'), 'utf8'));
const csvParse = (text) => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const parseLine = (line) => {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur); return out;
  };
  const h = parseLine(lines[0]);
  return lines.slice(1).map((l) => Object.fromEntries(h.map((k, i) => [k, parseLine(l)[i] ?? ''])));
};
const comparisonPath = join(ROOT, 'docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/phase-next/R6.1-29-TOOLS-VS-039-COMPARISON.csv');
const comparison = existsSync(comparisonPath) ? csvParse(readFileSync(comparisonPath, 'utf8')) : [];
const cmpByNum = new Map(comparison.map((r) => [String(r.tool_id).trim(), r]));

const testMatrixPath = join(OUT, 'SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv');
const testMatrix = existsSync(testMatrixPath) ? csvParse(readFileSync(testMatrixPath, 'utf8')) : [];
const testsByTool = new Map();
for (const r of testMatrix) {
  const id = r['Tool ID'] || r.tool_id || '';
  if (!id) continue;
  const arr = testsByTool.get(id) || [];
  arr.push(r); testsByTool.set(id, arr);
}

const special = {
  '008': 'PRESERVE — `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL`; recorded 3/18 = 16.67% (E1 operational grid, canonical denominator unrecoverable). No independent engine-shape mismatch proof may be invented.',
  '014': 'PRESERVE — honest `NOT_AVAILABLE / NO_VALIDATED_MODEL`; recorded 3/18 = 16.67%. No model or threshold may be fabricated; P-05 not adopted.',
  '023': 'THREE-WAY SEPARATION MANDATORY — operational grid `0/18` must stay separate from expanded evidence view `2/21`; the 12,800-vs-32,000 acceptance grid item remains `NOT_RUN / NOT_VERIFIED`. Do not merge.',
  '039': 'ENGINEERING REFERENCE ONLY — historic baseline is ledger-internal; P-01–P-05 are post-baseline and unadopted; D-08 Option A is Tool-039-local only. Not part of any 29-tool denominator.',
  '040': 'UNCLEAN EVIDENCE LENS — recorded 77/92; strict clean-clone 2/92; 82/92 PASS rows cite untracked artifacts. None of these is a current-HEAD clean E3 award.',
  '041': 'FROZEN — `OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED`; recorded 76/132, bounded 70–76/132. Historic 18/18 browser JSONs are history only; no implementation authorized.',
  '042': 'STOPPED — `ORDER 580` with registry `order: 580`; recorded 44/53; six browser rows `NOT_RUN`. No activation, restart, or closure is inferred.',
  '050': 'E2 CORRECTION — canonical 7/26 = 26.92% E3; nine historic `PASS/E2` rows preserved but excluded; two FAIL/E0 histories preserved for 051 only; five browser rows NOT_RUN.',
  '051': 'E2/FAIL PRESERVATION — canonical 11/31 = 35.48% E3; eight historic `PASS/E2` excluded and two historic `FAIL/E0` rows preserved; Arabic plural fix remains worktree-only.',
};
const browserRowIds = ['PREVIEW-ROUTE', 'BROWSER-EN-AR', 'BROWSER-5-STATES', 'RTL-390', 'CONSOLE-HYDRATION', 'NO-DUP-GENIUS'];

const BENCHMARKS = [
  'Component architecture', 'Engine/UI separation', 'Input validation', 'Schema validation',
  'Pipeline integrity', 'Equation correctness', 'Result states (5)', 'GENIUS-12', 'CORE-5',
  'Dynamic results', 'What-If (conditional)', 'Explainability', 'Capability contract',
  'Warnings and limits', 'EN/AR', 'RTL/LTR', 'Responsive UI', 'Accessibility',
  'Security/Privacy', 'Unit/Integration/Contract tests', 'Browser/Runtime verification',
  'Documentation/Sources', 'Rollback/Reproducibility',
];
const T039_BENCH = {
  'Component architecture': 'FULL — layered chain; E2 static; historic E1',
  'Engine/UI separation': 'FULL — pure engine separated from UI; E2 static',
  'Input validation': 'FULL — field validation + Zod; E2 static',
  'Schema validation': 'FULL — input/result schemas; E2 static',
  'Pipeline integrity': 'FULL structural — tryParse→engine→result schema→envelope; current-HEAD E4 NOT_RUN',
  'Equation correctness': 'FULL declared — fixed ULN/thresholds; E2 static; historic E1',
  'Result states (5)': 'FULL declared — EMPTY/PARTIAL/INVALID/FULL/DEGRADED; E2 static',
  'GENIUS-12': 'FULL — 12 tool-owned boxes with source badges; E2 static',
  'CORE-5': 'FULL declared — compact boxes 2,3,7,9,12; doc/code label discrepancy preserved; E2',
  'Dynamic results': 'FULL declared — 120ms debounce + inputSignature; E2 static',
  'What-If (conditional)': 'APPLICABLE — arithmetic scenarios, not predictions; E2',
  'Explainability': 'PARTIAL — confidence null, no calibrated interval; E2',
  'Capability contract': 'FULL — seven-part no-AI/no-diagnosis contract; E2',
  'Warnings and limits': 'FULL — explicit no-diagnosis/no-prescription wording; E2',
  'EN/AR': 'FULL declared — EN/AR resources; current-HEAD browser NOT_RUN',
  'RTL/LTR': 'FULL declared — direction from display preferences; historic screenshots only',
  'Responsive UI': 'NOT_RUN current-HEAD — historic 390/1440 screenshots only',
  'Accessibility': 'NOT_VERIFIED — no current-HEAD a11y test in scope',
  'Security/Privacy': 'FULL static — no network/DB/AI provider in engine or pipeline; E2',
  'Unit/Integration/Contract tests': 'PARTIAL — suites declared; profile did not execute them; historic E1 baseline only',
  'Browser/Runtime verification': 'NOT_RUN current-HEAD — historic deployment evidence non-transferable',
  'Documentation/Sources': 'NOT_AVAILABLE — D-C4 source pack unapproved; four static E2 references',
  'Rollback/Reproducibility': 'NOT_VERIFIED — no rollback drill; D-08 local-device only; no cloud/session sync',
};

function toolNum(r) {
  const m = r.toolId.match(/^mrx\.tool\.(\d+)/);
  return m ? String(Number(m[1])).padStart(3, '0') : r.slug.replace(/^tool-/, '').replace(/^mrx\.tool\./, '');
}
function evidenceFor(r, bench) {
  const c = r.criteria;
  const map = {
    'Component architecture': c.COMPONENT_FILE && c.ROUTE_FILE,
    'Engine/UI separation': c.ENGINE_FILE && c.COMPONENT_FILE,
    'Input validation': c.INPUT_VALIDATION,
    'Schema validation': c.SCHEMA_FILE,
    'Pipeline integrity': c.PIPELINE_FILE && c.PIPELINE_ENVELOPE,
    'Equation correctness': null,
    'Result states (5)': c.FIVE_STATES,
    'GENIUS-12': c.GENIUS_MARKER,
    'CORE-5': c.CORE5_COMPACT,
    'Dynamic results': c.DYNAMIC_RECALC,
    'What-If (conditional)': c.WHAT_IF,
    'Explainability': c.EXPLAINABILITY,
    'Capability contract': c.CAPABILITY_CONTRACT,
    'Warnings and limits': c.SAFETY_MARKER,
    'EN/AR': c.EN_AR_I18N_USAGE,
    'RTL/LTR': c.RTL_MARKER,
    'Responsive UI': null,
    'Accessibility': c.ACCESSIBILITY,
    'Security/Privacy': null,
    'Unit/Integration/Contract tests': c.TEST_FILE,
    'Browser/Runtime verification': false,
    'Documentation/Sources': false,
    'Rollback/Reproducibility': null,
  };
  const v = map[bench];
  if (v === null) return 'NOT_VERIFIED';
  if (v === false) return bench === 'Browser/Runtime verification' ? 'NOT_RUN — SSO/Deployment ID unavailable' : 'NOT_AVAILABLE — owner-gated';
  return v ? 'SOURCE_PRESENT_E2' : 'NOT_IMPLEMENTED_E0';
}
function comparisonOverride(num, bench) {
  const row = cmpByNum.get(num);
  if (!row) return null;
  const m = {
    'Component architecture': 'arch_vs_039', 'Engine/UI separation': 'engine_vs_039',
    'Input validation': 'validation_vs_039', 'Schema validation': 'validation_vs_039',
    'Pipeline integrity': 'validation_vs_039', 'Equation correctness': 'engine_vs_039',
    'GENIUS-12': 'genius12_vs_039', 'CORE-5': 'core5_vs_039',
    'Dynamic results': 'dynamic_results_vs_039', 'Result states (5)': 'dynamic_results_vs_039',
    'Capability contract': 'ai_vs_039', 'Warnings and limits': 'safety_vs_039',
    'Unit/Integration/Contract tests': 'testing_vs_039', 'Browser/Runtime verification': 'browser_vs_039',
  };
  const key = m[bench];
  return key && row[key] ? row[key] : null;
}

const rows = scan.rows;
const compareRows = [];
const gapRows = [];
const complianceRows = [];
const reportSummaries = [];

for (const r of rows) {
  const num = toolNum(r);
  const cmp = cmpByNum.get(num);
  const recordedPct = cmp ? cmp.completion_pct : '';
  const recordedDecision = cmp ? cmp.decision : '';
  const st = special[num];
  const tRows = testsByTool.get(r.toolId) || [];
  const executedPass = tRows.filter((t) => /E3|PASS_EXECUTED|EXECUTED_PASS/i.test(String(t['E Level'] || '') + String(t.Result || ''))).length;
  const failedFiles = tRows.filter((t) => /FAIL/i.test(String(t.Result || '')));

  // Comparison rows
  for (const bench of BENCHMARKS) {
    const ov = comparisonOverride(num, bench);
    const cur = ov || evidenceFor(r, bench);
    compareRows.push({
      'Tool ID': num, 'Name EN': r.nameEn, 'Shared Benchmark': bench, 'Applicable to Tool 039?': 'YES',
      'Tool 039 Verified Status': T039_BENCH[bench], 'Applicable to current tool?': bench === 'What-If (conditional)' && !r.criteria.WHAT_IF ? 'CONDITIONAL — no source marker' : 'YES',
      'Current Tool Status': cur, 'Evidence Level': cur.includes('E2') ? 'E2' : cur.includes('E3') ? 'E3' : cur.startsWith('NOT_RUN') || cur.startsWith('NOT_AVAILABLE') ? 'E0' : 'E2 static',
      'Gap': cur.startsWith('SOURCE_PRESENT_E2') ? 'Static presence only; no reproduced E3+' : cur.startsWith('APPLICABLE') ? ov || 'Requires E3/E4 proof' : cur,
      'Required Action': cur.startsWith('SOURCE_PRESENT_E2') ? 'Archive reproducible focused test in true-clean at 37f047a4' : cur.startsWith('NOT_RUN') ? 'Authorized SSO + pinned Preview + Deployment ID required' : cur.startsWith('NOT_AVAILABLE') ? 'Owner/specialist decision required before any PASS' : 'Requirement-level mapping and E3+ evidence needed',
      'Specialized 039 feature transferred?': 'NO',
    });
  }

  // Compliance matrix rows (20 atomic static criteria + 5 gated rows)
  const critLabels = {
    ROUTE_FILE: 'Canonical route exists', COMPONENT_FILE: 'Real component implementation', ENGINE_FILE: 'Math/domain engine exists',
    SCHEMA_FILE: 'Input/result schema exists', PIPELINE_FILE: 'R6 pipeline exists', I18N_FILE: 'EN/AR resource exists',
    GENIUS_MARKER: 'GENIUS-12 markers present', FIVE_STATES: 'Five result states represented', CORE5_COMPACT: 'CORE-5 compact mapping [2,3,7,9,12]',
    PIPELINE_ENVELOPE: 'Envelope/safeParse gate present', INPUT_VALIDATION: 'Input validation present', DYNAMIC_RECALC: 'Live recalculation markers',
    WHAT_IF: 'What-If markers (conditional)', EXPLAINABILITY: 'Explainability markers', SAFETY_MARKER: 'Warnings/limits markers',
    EN_AR_I18N_USAGE: 'EN/AR used by component', RTL_MARKER: 'RTL markers', ACCESSIBILITY: 'Accessibility markers',
    TEST_FILE: 'Test file present', CAPABILITY_CONTRACT: 'Capability contract markers',
  };
  for (const [k, label] of Object.entries(critLabels)) {
    const pass = !!r.criteria[k];
    complianceRows.push({
      'Tool ID': num, 'Requirement ID': k, 'Requirement': label, 'Applicability': k === 'WHAT_IF' ? 'CONDITIONAL' : 'UNIVERSAL_SOURCE_CHECK',
      'Status': pass ? 'PARTIAL' : 'NOT_IMPLEMENTED', 'Evidence Level': pass ? 'E2' : 'E0',
      'PASS(E3+)?': 'NO', 'Source Path': r.component || r.engine || r.href, 'Notes': 'Static source presence only; no E3+ awarded',
    });
  }
  for (const id of [...browserRowIds, 'C4-SOURCES', 'C5-REFERRAL', 'CLINICAL-REVIEW', 'W18-HISTORY', 'P03-PIPELINE']) {
    complianceRows.push({
      'Tool ID': num, 'Requirement ID': id, 'Requirement': id, 'Applicability': 'APPLICABLE',
      'Status': id.startsWith('C4') || id.startsWith('C5') || id === 'W18-HISTORY' ? 'NOT_AVAILABLE' : id === 'CLINICAL-REVIEW' ? 'BLOCKED' : id === 'P03-PIPELINE' ? 'PARTIAL' : 'NOT_RUN',
      'Evidence Level': 'E0', 'PASS(E3+)?': 'NO', 'Source Path': 'evidence-index/SHARED-GATES-AND-SPECIAL-CONTROLS.md',
      'Notes': 'Externally gated; stays in denominator; NOT_AVAILABLE != NOT_APPLICABLE',
    });
  }

  // Remaining gaps
  const gaps = [
    ['CRITICAL', 'Browser/runtime E4 evidence', 'No authorized SSO, Preview pinned to 37f047a4, or Deployment ID', '6 browser rows; blocks 100%'],
    ['CRITICAL', 'Requirement-level E3 denominator', 'Canonical per-tool atomic denominator unrecoverable for most tools', 'Verified Completion cannot be honestly computed'],
    ['HIGH', 'D-C4 approved sources', 'Owner/specialist source pack not approved', 'C4-SOURCES stays NOT_AVAILABLE'],
    ['HIGH', 'D-C5 referral wording', 'Qualified wording approval absent', 'C5-REFERRAL stays NOT_AVAILABLE'],
    ['HIGH', 'D-CLIN clinical sign-off', 'No qualified clinical/model reviewer sign-off', 'CLINICAL-REVIEW stays BLOCKED'],
    ['HIGH', 'D-W18 history/persistence', 'Owner decision open; no unauthorized persistence', 'W18-HISTORY stays NOT_AVAILABLE'],
    ['HIGH', 'P-03 runtime effectiveness', 'Runtime-negative/control files untracked or NOT_RUN in true-clean', 'Structural-only posture preserved'],
  ];
  if (failedFiles.length) gaps.push(['CRITICAL', 'Failing test files', failedFiles.map((t) => t['Test File']).join('; '), 'Full-suite exit code 1; must be triaged']);
  if (!r.pipeline) gaps.push(['MEDIUM', 'R6 pipeline source', 'No dedicated pipeline file found', 'P3 unverified']);
  if (!r.i18n) gaps.push(['MEDIUM', 'i18n resource', 'No dedicated i18n resource found', 'EN/AR parity unverifiable']);
  if (!r.tests.length) gaps.push(['MEDIUM', 'Test files', 'No tool-specific test file discovered', 'E3 impossible']);
  for (const [sev, gap, cause, impact] of gaps) gapRows.push({ 'Tool ID': num, 'Severity': sev, 'Gap': gap, 'Cause': cause, 'Impact': impact, 'Local fix possible?': gap.includes('i18n') || gap.includes('Test files') || gap.includes('pipeline source') ? 'YES (after scoped authorization)' : 'NO', 'Authority required': gap.startsWith('D-') || gap.includes('Browser') || gap.includes('clinical') || gap.includes('W18') ? 'Owner/specialist/SSO' : 'Tool owner + clean-clone re-evidence' });

  // Individual report (Tool 039 has a dedicated forensic report authored separately)
  if (num === '039') continue;
  const arRoute = '/ar' + r.href;
  const lines = [];
  const A = (s) => lines.push(s);
  A(`# TOOL ${num} — R6.1 FORENSIC AUDIT (comprehensive 2026-11-20)`);
  A('');
  A('Mode: **READ-ONLY FORENSIC AUDIT**. No source, contract, schema, route, registry, ledger, git state, or prior report was modified. All values below are source-observed at HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` or explicitly labelled as recorded/historic.');
  A('');
  A('## A. Tool Identity');
  A('');
  A('| Item | Actual Finding |');
  A('|---|---|');
  A(`| Tool ID | \`${num}\` · \`${r.toolId}\` |`);
  A(`| Name EN | ${r.nameEn || 'NOT_VERIFIED'} |`);
  A(`| Name AR | ${r.nameAr || 'NOT_VERIFIED'} |`);
  A(`| Slug | \`${r.slug}\` |`);
  A(`| Category | ${r.category} |`);
  A(`| Canonical EN Route | \`${r.href}\` (catalog href; dynamic route \`${r.routeDynamic || 'NOT_VERIFIED'}\`) |`);
  A(`| Canonical AR Route | \`${arRoute}\` via \`middleware.ts\` \`/ar/*\` rewrite (E2 static; browser E4 NOT_RUN) |`);
  A(`| Component Path | \`${r.component || 'MISSING'}\` (${r.componentSource}) |`);
  A(`| Engine Path | \`${r.engine || 'MISSING'}\` (${r.engineSource}) |`);
  A(`| Pipeline Path | \`${r.pipeline || 'NOT_FOUND'}\` |`);
  A(`| Schema Path | \`${r.schema || 'MISSING'}\` (${r.schemaSource}) |`);
  A(`| Genius Path | \`${r.genius || 'NOT_FOUND'}\` |`);
  A(`| i18n Path | \`${r.i18n || 'NOT_FOUND'}\` |`);
  A(`| Batch | ${cmp ? 'Batch 1–4 phase-next scope' : 'NOT_ASSIGNED_IN_AUDIT_SCOPE'} |`);
  A(`| Registry Status | ${r.registryStatus} |`);
  A(`| Catalog Status | ${r.catalogStatus} |`);
  A(`| Worktree Status | ${r.worktreeStatus} |`);
  A(`| Last Relevant Commit | \`${r.lastCommit || 'NOT_VERIFIED'}\` |`);
  A(`| Source SHA-256 (primary file) | \`${r.sourceSha || 'NOT_VERIFIED'}\` |`);
  A('');
  A('## B. Overall Status');
  A('');
  A('| Indicator | Percentage | Evidence |');
  A('|---|---:|---|');
  A(`| Implementation Progress | NOT_VERIFIABLE (source-presence proxy ${r.proxy}% / 20 criteria, **E2 only, not credited**) | No functional behaviour or requirement-level weighting proven; file existence is not implementation credit |`);
  A(`| Verified Completion | ${cmp ? `${recordedPct} (RECORDED E1${st ? ' / special control' : ''}; canonical denominator unrecoverable; not re-awarded)` : 'NOT_VERIFIABLE — 0 requirement-level E3+ rows proven in this audit'} | E0–E2 excluded; ${tRows.length} test file(s) discovered; ${executedPass} executed-passing row(s) in fresh full-suite run |`);
  A('| Runtime / Deployment Verification | 0.00% (0 E4+/applicable; NOT_RUN) | No authorized SSO, Preview pinned to `37f047a4`, or Deployment ID |');
  A('');
  A(`**Current Development Stage:** ${r.currentStageHeuristic} (source-presence heuristic, not a verification claim).  `);
  A('**Last Fully Verified Stage:** NOT_VERIFIED (no stage-level E3+ gate re-executed for this tool in this audit).  ');
  A(`**Overall Classification:** ${st ? st.split('—')[0].trim() : (r.tests.length ? 'PARTIAL' : 'NOT_VERIFIABLE')}.  `);
  A(`**Owner Review Status:** ${num === '041' ? 'OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED' : num === '042' ? 'STOPPED — ORDER 580' : num === '039' ? 'Historic baseline accepted; post-baseline additions unresolved; no current acceptance transferred' : 'NOT_DECISIONED — no owner acceptance inferred'}.`);
  A('');
  if (st) { A('**Special control (preserve verbatim):** ' + st); A(''); }
  if (cmp) {
    A(`**Recorded phase-next decision:** \`${recordedDecision}\` — denominator \`${cmp.operational_or_atomic_denominator}\`, PASS(E3+) \`${cmp.pass_e3plus}\`, completion \`${recordedPct}\`. This is recorded E1 evidence and is not re-awarded by this audit. See \`phase-next/R6.1-29-TOOLS-VS-039-COMPARISON.csv\`.`);
    A('');
  }
  A('## C. Implemented Content Inventory');
  A('');
  A('| Feature / Component | Status | Source File | Test File | Evidence | Notes |');
  A('|---|---|---|---|---|---|');
  A(`| Route | SOURCE_PRESENT_E2 | \`${r.href}\` / \`${arRoute}\` | — | catalog + dynamic route + middleware /ar/* rewrite | EN from catalog; AR via rewrite; E4 NOT_RUN |`);
  A(`| Component | SOURCE_PRESENT_E2 | \`${r.component || 'MISSING'}\` | ${tRows.map((t) => `\`${t['Test File']}\``).join('; ') || 'NOT_AVAILABLE'} | static | ${r.criteria.GENIUS_MARKER ? 'GENIUS markers detected' : 'no GENIUS markers detected'} |`);
  A(`| Engine | SOURCE_PRESENT_E2 | \`${r.engine || 'MISSING'}\` | NOT_AVAILABLE | static | equation correctness NOT_VERIFIED |`);
  A(`| Pipeline | ${r.pipeline ? 'SOURCE_PRESENT_E2' : 'NOT_IMPLEMENTED'} | \`${r.pipeline || 'MISSING'}\` | NOT_AVAILABLE | static | ${r.criteria.PIPELINE_ENVELOPE ? 'envelope/safeParse markers detected' : 'no envelope markers detected'} |`);
  A(`| Schema | SOURCE_PRESENT_E2 | \`${r.schema || 'MISSING'}\` | NOT_AVAILABLE | static | Zod/input validation marker: ${r.criteria.INPUT_VALIDATION ? 'yes' : 'no'} |`);
  A(`| i18n | ${r.i18n ? 'SOURCE_PRESENT_E2' : 'NOT_AVAILABLE'} | \`${r.i18n || 'NOT_FOUND'}\` | NOT_AVAILABLE | static | EN/AR usage marker: ${r.criteria.EN_AR_I18N_USAGE ? 'yes' : 'no'} |`);
  A(`| GENIUS-12 / CORE-5 | ${r.criteria.GENIUS_MARKER ? 'SOURCE_PRESENT_E2' : 'NOT_IMPLEMENTED'} | \`${r.genius || r.component || 'MISSING'}\` | NOT_AVAILABLE | static | compact marker: ${r.criteria.CORE5_COMPACT ? 'yes' : 'no'} |`);
  A('');
  A('## D. Original R6.1 Compliance');
  A('');
  A('Requirement-level matrix is in `../SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` (all tools, one row per criterion). Static source checks below are E2 at most.');
  A('');
  A('| Original R6.1 principle | Status | Evidence |');
  A('|---|---|---|');
  A(`| Math engine authoritative / deterministic | ${r.engine ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | engine path observed; no equation re-derivation |`);
  A(`| Dynamic layer / live recalculation | ${r.criteria.DYNAMIC_RECALC ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | source markers |`);
  A(`| Cross-tool layer | ${r.criteria.WHAT_IF ? 'PARTIAL (E2)' : 'NOT_APPLICABLE_PENDING'} | markers only; no payload transfer proof |`);
  A(`| Adaptive layer | NOT_VERIFIABLE | no user-state adaptation proof |`);
  A(`| Explainable layer | ${r.criteria.EXPLAINABILITY ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | source markers |`);
  A('| ML layer | NOT_APPLICABLE_PENDING | no model/provider evidence in scope |');
  A('| Community layer | NOT_APPLICABLE_PENDING | no authorized community feature evidence |');
  A(`| Five result states | ${r.criteria.FIVE_STATES ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | source markers; no browser proof |`);
  A(`| GENIUS-12 / CORE-5 | ${r.criteria.GENIUS_MARKER && r.criteria.CORE5_COMPACT ? 'PARTIAL (E2)' : 'PARTIAL/NOT_IMPLEMENTED (E2/E0)'} | source markers |`);
  A(`| Capability contract | ${r.criteria.CAPABILITY_CONTRACT ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | source markers |`);
  A(`| EN/AR + RTL | ${r.criteria.EN_AR_I18N_USAGE && r.criteria.RTL_MARKER ? 'PARTIAL (E2)' : 'NOT_IMPLEMENTED (E0)'} | source markers; no E4 |`);
  A('');
  A('## E. Tool 039 Comparison');
  A('');
  A('Full 23-benchmark comparison for every tool is in `../SMARTTOOLS-TOOL039-COMPARISON.csv`. Tool 039 is an engineering benchmark only; no specialized 039 feature (De Ritis/OCR/PDF/D-08 history/rating/P-05) is transferred.');
  A('');
  A('| Shared benchmark | Tool 039 | This tool | Gap |');
  A('|---|---|---|---|');
  for (const bench of BENCHMARKS.slice(0, 8)) {
    const row = compareRows.find((x) => x['Tool ID'] === num && x['Shared Benchmark'] === bench);
    A(`| ${bench} | ${T039_BENCH[bench]} | ${row['Current Tool Status']} | ${row['Gap']} |`);
  }
  A('');
  A('## F. R6.1 Layers Assessment');
  A('');
  A('| Layer | Applicable? | Implemented? | Verified? | Evidence | Gap |');
  A('|---|---|---|---|---|---|');
  A(`| 1 Math | YES | ${r.engine ? 'SOURCE_PRESENT' : 'NOT_IMPLEMENTED'} | NO | E2 engine path | equations NOT_VERIFIED |`);
  A(`| 2 Dynamic | YES | ${r.criteria.DYNAMIC_RECALC ? 'SOURCE_PRESENT' : 'NOT_IMPLEMENTED'} | NO | E2 markers | no E3/E4 |`);
  A(`| 3 Cross-Tool | CONDITIONAL | ${r.criteria.WHAT_IF ? 'SOURCE_PRESENT' : 'NOT_IMPLEMENTED'} | NO | E2 markers | no payload proof |`);
  A('| 4 Adaptive | CONDITIONAL | NOT_VERIFIED | NO | — | no proof |');
  A(`| 5 Explainable | YES | ${r.criteria.EXPLAINABILITY ? 'SOURCE_PRESENT' : 'NOT_IMPLEMENTED'} | NO | E2 markers | no E3 |`);
  A('| 6 ML | NO (no model evidence) | NOT_IMPLEMENTED | N/A | — | do not fabricate ML |');
  A('| 7 Community | NO (no authorization) | NOT_IMPLEMENTED | N/A | — | do not fabricate community |');
  A('');
  A('## G. GENIUS-12 & CORE-5');
  A('');
  A(`GENIUS box markers: **${r.criteria.GENIUS_MARKER ? 'DETECTED (E2)' : 'NOT DETECTED'}**; CORE-5 compact marker \`[2,3,7,9,12]\`: **${r.criteria.CORE5_COMPACT ? 'DETECTED (E2)' : 'NOT DETECTED'}**. No DOM/runtime proof exists; browser row \`NO-DUP-GENIUS\` is \`NOT_RUN\`. Box-by-box EN/AR/order evidence is NOT_VERIFIED in this audit.`);
  A('');
  A('## H. Development Pipeline');
  A('');
  A('| Stage | Status | Evidence |');
  A('|---|---|---|');
  A('| P0 Discovery & Scope | COMPLETED | catalog identity + route observed |');
  A('| P1 Architecture & Contracts | SOURCE_PRESENT_UNVERIFIED | component/engine/schema paths |');
  A(`| P2 Math / Engine | ${r.engine ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED'} | engine path |`);
  A(`| P3 Pipeline & Schema | ${r.pipeline ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED'} | pipeline path |`);
  A(`| P4 UI & Results | ${r.component ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED'} | component path |`);
  A(`| P5 R6.1 Intelligence | ${r.criteria.GENIUS_MARKER || r.criteria.CORE5_COMPACT ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED'} | markers |`);
  A(`| P6 Safety & Localization | ${r.criteria.SAFETY_MARKER && r.criteria.EN_AR_I18N_USAGE ? 'SOURCE_PRESENT_UNVERIFIED' : 'PARTIAL'} | markers |`);
  A(`| P7 Automated Verification | ${r.tests.length ? 'TEST_FILE_PRESENT_UNVERIFIED' : 'NOT_STARTED'} | ${tRows.length} test file(s) |`);
  A('| P8 Runtime & Browser | NOT_RUN_SSO_REQUIRED | no authorized SSO/Deployment ID |');
  A('| P9 Closure | NOT_STARTED | no owner decision |');
  A('');
  A('## I. Test Results');
  A('');
  A('| Test Type | Files | Passed | Failed | Not Run | Clean Reproducible? |');
  A('|---|---:|---:|---:|---:|---|');
  A(`| Full true-clean Vitest (2026-11-20) | 594 files / 5602 tests | 5530 tests / 563 files | 67 tests / 30 files | 5 skipped / 1 file | YES at 37f047a4; exit code 1 |`);
  A(`| This tool's discovered test files | ${tRows.length} | ${executedPass} executed-passing rows | ${failedFiles.length} failing row(s) | — | See SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv |`);
  A('');
  if (failedFiles.length) A(`**Failing file(s) affecting this tool:** ${failedFiles.map((t) => `\`${t['Test File']}\``).join(', ')}. Failures are preserved, not erased.`);
  A('**Mapping caveat:** the test matrix attributes a file to a tool when the tool slug/ID appears in the test source. Generic shared test files are therefore E3 for *execution*, but are NOT tool-specific acceptance proof and do not by themselves award requirement-level E3 rows.');
  A('');
  A('## J. Defects & Gaps');
  A('');
  A('| Severity | Gap | Cause | Blocked requirement |');
  A('|---|---|---|---|');
  for (const g of gapRows.filter((x) => x['Tool ID'] === num)) A(`| ${g.Severity} | ${g.Gap} | ${g.Cause} | ${g.Impact} |`);
  A('');
  A('## K. Remaining Work to 100%');
  A('');
  A('- LOCAL: archive reproducible focused E3 evidence at HEAD `37f047a4`; resolve any failing test file; establish an owner-approved atomic denominator.');
  A('- EXTERNAL: D-C4 source pack, D-C5 referral wording, D-CLIN sign-off, D-W18 decision, P-03 runtime effectiveness, and authorized SSO/Preview/Deployment ID for six browser rows.');
  A('- OWNER: explicit `C=APPROVED` decision; never inferred from audit, tests, or historic acceptance.');
  A('');
  A('## L. Final Decision');
  A('');
  A(`**${num === '041' ? 'PARTIAL (OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED)' : num === '042' ? 'BLOCKED (STOPPED — ORDER 580)' : num === '039' ? 'OWNER_ACCEPTED — CLOSED (historic baseline only; post-baseline additions unresolved)' : r.tests.length ? 'PARTIAL' : 'NOT_VERIFIABLE'}** — not \`100% VERIFIED — OWNER REVIEW PENDING\`; no owner acceptance inferred.`);
  A('');
  A('## M. Delivery Information');
  A('');
  A('| Field | Verified Value |');
  A('|---|---|');
  A(`| Canonical Route | \`${r.href}\` |`);
  A('| Preview URL | NOT_VERIFIED |');
  A('| Deployment ID | NOT_VERIFIED |');
  A('| Source SHA | HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; primary file SHA-256 `' + (r.sourceSha || 'NOT_VERIFIED') + '` |');
  A('| Verification Date | 2026-11-20 |');
  A('| Evidence Package | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/` |');
  A('');
  writeFileSync(join(IND, `TOOL-${num}-R6.1-FORENSIC-AUDIT.md`), lines.join('\n') + '\n');
  reportSummaries.push({ num, toolId: r.toolId, recordedPct, decision: recordedDecision || (r.tests.length ? 'PARTIAL' : 'NOT_VERIFIABLE'), tested: tRows.length, failed: failedFiles.length });
}

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (headers, data) => [headers.join(','), ...data.map((r) => headers.map((h) => csvCell(r[h])).join(','))].join('\n');
const writeCsv = (name, headers, data) => writeFileSync(join(OUT, name), csv(headers, data) + '\n');

const masterRows = rows.map((r) => {
  const num = toolNum(r);
  const c = cmpByNum.get(num);
  const arch = compareRows.find((x) => x['Tool ID'] === num && x['Shared Benchmark'] === 'Component architecture');
  const final = num === '041' ? 'PARTIAL (OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED)'
    : num === '042' ? 'BLOCKED (STOPPED — ORDER 580)'
    : num === '039' ? 'OWNER_ACCEPTED — CLOSED (historic baseline only)'
    : r.tests.length ? 'PARTIAL' : 'NOT_VERIFIABLE';
  return {
    'Tool ID': num, 'Name': r.nameEn, 'Category': r.category,
    'Implementation %': 'NOT_VERIFIABLE (E2 proxy ' + r.proxy + '%)',
    'Verified %': c ? c.completion_pct + ' (RECORDED E1)' : 'NOT_VERIFIABLE (0 requirement-level E3+ proven here)',
    'Runtime %': '0.00 (NOT_RUN — SSO/Deployment ID)',
    'Current Phase': r.currentStageHeuristic, 'Last Verified Phase': 'NOT_VERIFIED',
    'Tool 039 Gap': c ? c.key_gap : arch ? arch.Gap : 'No tool-specific 039 comparison recorded; 23-benchmark static gap matrix applies',
    'R6.1 Status': special[num] ? 'SPECIAL_CONTROL_PRESERVED' : 'PARTIAL / NOT_VERIFIABLE',
    'Final Classification': final,
  };
});
writeCsv('SMARTTOOLS-MASTER-COMPARISON.csv', ['Tool ID','Name','Category','Implementation %','Verified %','Runtime %','Current Phase','Last Verified Phase','Tool 039 Gap','R6.1 Status','Final Classification'], masterRows);
writeCsv('SMARTTOOLS-TOOL039-COMPARISON.csv', ['Tool ID','Name EN','Shared Benchmark','Applicable to Tool 039?','Tool 039 Verified Status','Applicable to current tool?','Current Tool Status','Evidence Level','Gap','Required Action','Specialized 039 feature transferred?'], compareRows);
writeCsv('SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv', ['Tool ID','Requirement ID','Requirement','Applicability','Status','Evidence Level','PASS(E3+)?','Source Path','Notes'], complianceRows);
writeCsv('SMARTTOOLS-REMAINING-GAPS.csv', ['Tool ID','Severity','Gap','Cause','Impact','Local fix possible?','Authority required'], gapRows);
writeCsv('SMARTTOOLS-100-PERCENT-VERIFIED-LIST.csv', ['Tool ID','Tool Name','Verified %','Canonical Route','Preview URL','Deployment ID','Source SHA','Verification Date','Evidence Package'], []);

writeFileSync(join(EV, 'INDIVIDUAL-REPORT-INDEX.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), head: scan.head,
  publishedCatalogCount: runtime.publishedCount, individualReports: reportSummaries.length,
  reports: reportSummaries,
}, null, 2) + '\n');
console.log(JSON.stringify({ reports: reportSummaries.length, compareRows: compareRows.length, complianceRows: complianceRows.length, gapRows: gapRows.length, recordedTools: reportSummaries.filter((x) => x.recordedPct).length }));
