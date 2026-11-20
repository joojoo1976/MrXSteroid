/**
 * Builds atomic acceptance ledgers for Tools 045-051 from their real sources.
 *
 * Row sources (no generic 18-item template):
 *  1. Every assertion in the tool's own engine / contract / pipeline / component
 *     / i18n / adapter test files, read from a vitest JSON report produced in
 *     the clean export (HEAD + P-03 commit 37f047a4, real node_modules).
 *  2. The tool's i18n parity script output.
 *  3. Route registration + clean build evidence.
 *  4. P-03 structural coverage and runtime negative-branch coverage.
 *  5. Browser and content-governance gates that are genuinely open.
 *
 * Usage:
 *   node build-atomic-ledgers-045-051.mjs <clean-export-root> <output-dir>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CLEAN = process.argv[2];
const OUT = process.argv[3];
if (!CLEAN || !OUT) {
  console.error('usage: node build-atomic-ledgers-045-051.mjs <clean-export-root> <output-dir>');
  process.exit(2);
}

const TOOLS = [
  { n: '045', slug: 'tool-045-cycle-break-planner', cat: 'cycle-management' },
  { n: '046', slug: 'tool-046-trt-lifetime', cat: 'hormonal-health' },
  { n: '047', slug: 'tool-047-fertility-preservation', cat: 'hormonal-health' },
  { n: '048', slug: 'tool-048-cardiovascular-risk', cat: 'medical-monitoring' },
  { n: '049', slug: 'tool-049-bone-density', cat: 'medical-monitoring' },
  { n: '050', slug: 'tool-050-mental-health', cat: 'medical-monitoring' },
  { n: '051', slug: 'tool-051-peptide-dosage-calculator', cat: 'injection-formulation' },
];

// Runtime negative-branch simulations present in p03-result-schema-validation.test.ts.
const RUNTIME_COVERED = new Set(['045', '047']);

const read = (p) => fs.readFileSync(p, 'utf8');
const lineOf = (file, needle) => {
  const lines = read(file).split(/\r?\n/);
  const i = lines.findIndex((l) => l.includes(needle));
  return i < 0 ? null : i + 1;
};

function areaOf(file) {
  if (/\/engines\//.test(file)) return 'ENGINE';
  if (/-contract\.test\./.test(file)) return 'CONTRACT';
  if (/-pipeline\.test\./.test(file)) return 'PIPELINE';
  if (/\/components\//.test(file)) return 'UI';
  if (/\/adapters\//.test(file)) return 'BATCH';
  if (/(^|\/)tests\/unit\//.test(file)) return 'I18N-EVIDENCE';
  return 'TEST';
}

function testRows(tool) {
  const report = path.join(CLEAN, 'ledger-evidence', `tool-${tool.n}-tests.json`);
  if (!fs.existsSync(report)) return { rows: [], report: null };
  const j = JSON.parse(read(report));
  const rows = [];
  const counters = {};
  for (const suite of j.testResults) {
    const rel = path.relative(CLEAN, suite.name).split(path.sep).join('/');
    const area = areaOf(rel);
    for (const a of suite.assertionResults) {
      counters[area] = (counters[area] ?? 0) + 1;
      const id = `${tool.n}-${area}-${String(counters[area]).padStart(2, '0')}`;
      const status = a.status === 'passed' ? 'PASS' : a.status === 'failed' ? 'FAIL' : 'NOT_RUN';
      rows.push({
        id,
        area,
        criterion: a.title,
        b: status,
        e: status === 'PASS' ? 'E3' : 'E0',
        evidence: `${rel} :: ${a.title}`,
        source: `vitest JSON report ledger-evidence/tool-${tool.n}-tests.json`,
        next: status === 'PASS' ? 'none' : 'Re-run and fix the failing assertion, then re-generate this ledger',
      });
    }
  }
  return { rows, report: j };
}

function i18nRow(tool) {
  const script = path.join(CLEAN, 'docs', 'MRX Genius Cloud Unified R6.1', `tool-${tool.n}-i18n-check.mjs`);
  if (!fs.existsSync(script)) {
    return {
      id: `${tool.n}-I18N-01`, area: 'I18N', criterion: 'AR/EN i18n parity',
      b: 'NOT_RUN', e: 'E0', evidence: 'i18n check script not found for this tool',
      source: `docs/MRX Genius Cloud Unified R6.1/tool-${tool.n}-i18n-check.mjs`,
      next: 'Provide the tool i18n check script and run it in the clean export',
    };
  }
  let out = '';
  let ok = true;
  try {
    out = execFileSync(process.execPath, [script], { cwd: CLEAN, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  } catch (err) {
    out = String(err.stdout || '') + String(err.stderr || '');
    ok = false;
  }
  const counts = /keys:\s*en\s*=\s*(\d+),\s*ar\s*=\s*(\d+)/.exec(out);
  const parity = out.includes('I18N_PARITY: OK');
  const pass = ok && parity;
  return {
    id: `${tool.n}-I18N-01`,
    area: 'I18N',
    criterion: `AR/EN parity${counts ? ` (en ${counts[1]} / ar ${counts[2]} keys)` : ''}`,
    b: pass ? 'PASS' : 'FAIL',
    e: pass ? 'E3' : 'E0',
    evidence: `node tool-${tool.n}-i18n-check.mjs -> I18N_PARITY: ${parity ? 'OK' : 'FAILED'}${counts ? `; en=${counts[1]} ar=${counts[2]}` : ''}`,
    source: `docs/MRX Genius Cloud Unified R6.1/tool-${tool.n}-i18n-check.mjs`,
    next: pass ? 'none' : 'Resolve parity failures and re-run the check',
  };
}

function routeRow(tool) {
  const file = path.join(CLEAN, 'lib', 'tools', 'categories.ts');
  const line = lineOf(file, `'${tool.slug}'`);
  const mapped = line !== null && read(file).split(/\r?\n/)[line - 1].includes(`'${tool.cat}'`);
  const buildLog = path.join(OUT, 'evidence-clean-build-2026-11-18', 'next-build.out');
  const buildExit = path.join(OUT, 'evidence-clean-build-2026-11-18', 'next-build-2.exit');
  const buildOk = fs.existsSync(buildLog) && /506\/506/.test(read(buildLog)) && fs.existsSync(buildExit) && read(buildExit).includes('EXITCODE=0');
  return {
    id: `${tool.n}-ROUTE-01`,
    area: 'ROUTE',
    criterion: `Canonical route /smarttools/${tool.cat}/${tool.slug} registered and emitted by the clean build`,
    b: mapped && buildOk ? 'PASS' : 'FAIL',
    e: mapped && buildOk ? 'E3' : 'E1',
    evidence: `lib/tools/categories.ts:${line ?? 'missing'} -> '${tool.cat}'; clean build EXITCODE=0 with 506/506 static pages`,
    source: 'lib/tools/categories.ts + evidence-clean-build-2026-11-18/next-build.out + next-build-2.exit',
    next: mapped && buildOk ? 'none' : 'Register the slug in categories.ts and rebuild',
  };
}

function p03Rows(tool) {
  const structural = path.join(CLEAN, 'lib', 'tools', 'r6', 'p03-gate-structural.test.ts');
  const inStructural = fs.existsSync(structural) && read(structural).includes(`${tool.slug}-pipeline.ts`);
  const rows = [{
    id: `${tool.n}-P03-01`,
    area: 'P-03',
    criterion: 'ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded',
    b: inStructural ? 'PASS' : 'FAIL',
    e: inStructural ? 'E3' : 'E0',
    evidence: `lib/tools/r6/p03-gate-structural.test.ts covers ${tool.slug}-pipeline.ts (structural assertion)`,
    source: 'commit 37f047a4 + p03-gate-structural.test.ts (31/31 in clean export)',
    next: inStructural ? 'none' : 'Add the pipeline to the structural gate proof',
  }];
  const runtime = RUNTIME_COVERED.has(tool.n);
  rows.push({
    id: `${tool.n}-P03-02`,
    area: 'P-03',
    criterion: 'A mismatched engine result is rejected at runtime with no envelope produced',
    b: runtime ? 'PASS' : 'PARTIAL',
    e: runtime ? 'E3' : 'E2',
    evidence: runtime
      ? `p03-result-schema-validation.test.ts exercises this pipeline's invalid/missing result path`
      : 'Only structural coverage exists; no runtime negative-branch test targets this pipeline',
    source: 'p03-result-schema-validation.test.ts (5 runtime cases: 008, 016, 041, 045, 047)',
    next: runtime ? 'none' : 'Add a per-pipeline runtime negative test (mismatched engine result)',
  });
  return rows;
}

function browserRows(tool) {
  const base = [
    ['BROWSER-EN-AR', 'Authorized EN and AR render on the deployed route'],
    ['BROWSER-STATES-5', 'EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser'],
    ['BROWSER-RTL-390', '390 px RTL layout verified in a real browser'],
    ['BROWSER-CONSOLE', 'Console clean: no hydration errors or runtime exceptions'],
    ['BROWSER-GENIUS-DOM', 'GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box'],
  ];
  return base.map(([area, criterion], i) => ({
    id: `${tool.n}-${area}-${String(i + 1).padStart(2, '0')}`,
    area: 'BROWSER',
    criterion,
    b: 'NOT_RUN',
    e: 'E0',
    evidence: 'NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed',
    source: 'owner instruction 2026-11-18 (Playwright prepared, execution deferred)',
    next: 'Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots',
  }));
}

function governanceRows(tool) {
  return [
    {
      id: `${tool.n}-C4-01`, area: 'D-C4', criterion: 'Approved source pack with provenance is attached to clinical claims',
      b: 'NOT_AVAILABLE', e: 'E1',
      evidence: 'No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open)',
      source: 'owner decision D-C4', next: 'Supply an approved source pack or an explicit owner N/A decision',
    },
    {
      id: `${tool.n}-C5-01`, area: 'D-C5', criterion: 'Referral / escalation wording is specialist-approved',
      b: 'NOT_AVAILABLE', e: 'E1',
      evidence: 'Referral wording remains pending specialist approval (D-C5)',
      source: 'owner decision D-C5', next: 'Provide the approved wording pack',
    },
    {
      id: `${tool.n}-CLIN-01`, area: 'D-CLIN', criterion: 'Clinical / model review sign-off recorded',
      b: 'BLOCKED', e: 'E1',
      evidence: 'No qualified specialist review exists; self-approval is not permitted (D-CLIN)',
      source: 'owner decision D-CLIN', next: 'Route the unified specialist pack (AR/EN) for review',
    },
    {
      id: `${tool.n}-W18-01`, area: 'W18', criterion: 'History capability per W18',
      b: 'NOT_AVAILABLE', e: 'E1',
      evidence: 'W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision',
      source: 'owner decision D-W18', next: 'Owner decision on W18 storage; the box must keep stating the real reason',
    },
  ];
}

const STATIC_CHECKS = [
  ['STATIC-CONTRACT', 'Input/output contract is defined for the tool', (dir, t) => `lib/tools/r6/${t.slug}-contract.ts`],
  ['STATIC-PIPELINE', 'Component calculates through the R6 pipeline (not inline math)', (dir, t) => `components/tools/${t.slug}.tsx`],
  ['STATIC-STATES-5', 'Five UI states EMPTY / PARTIAL / INVALID / FULL / DEGRADED are explicit', (dir, t) => `components/tools/${t.slug}.tsx`],
  ['STATIC-GENIUS12', 'GENIUS-12 renderer present with data-r6-genius / data-r6-box markers', (dir, t) => `components/tools/${t.slug}.genius.tsx`],
  ['STATIC-CORE5', 'CORE-5 markers c1..c5 present in the renderer', (dir, t) => `components/tools/${t.slug}.genius.tsx`],
  ['STATIC-EXPORT', 'Client-side CSV export builder present', (dir, t) => `components/tools/${t.slug}.genius.tsx`],
  ['STATIC-RTL', 'RTL direction is derived, not hard-coded LTR', (dir, t) => `components/tools/${t.slug}.tsx`],
  ['STATIC-A11Y', 'Labels, aria-live state announcement and aria-invalid wiring present', (dir, t) => `components/tools/${t.slug}.tsx`],
  ['STATIC-NO-PERSIST', 'No localStorage / sessionStorage persistence in the tool', (dir, t) => `components/tools/${t.slug}.tsx`],
];

function staticRows(tool) {
  const rows = [];
  for (const [id, criterion, fileOf] of STATIC_CHECKS) {
    const rel = fileOf(CLEAN, tool);
    const file = path.join(CLEAN, rel.split('/').join(path.sep));
    if (!fs.existsSync(file)) {
      rows.push({
        id: `${tool.n}-${id}-01`, area: 'STATIC', criterion, b: 'FAIL', e: 'E0',
        evidence: `${rel} not found`, source: rel, next: 'Implement the missing artifact',
      });
      continue;
    }
    const src = read(file);
    let found = true;
    if (id === 'STATIC-PIPELINE') found = /pipeline/.test(src) && /run[A-Z]/.test(src);
    if (id === 'STATIC-STATES-5') found = ['EMPTY', 'PARTIAL', 'INVALID', 'FULL', 'DEGRADED'].every((s) => src.includes(s));
    if (id === 'STATIC-GENIUS12') found = src.includes('data-r6-genius') && src.includes('data-r6-box=');
    if (id === 'STATIC-CORE5') found = ['c1', 'c2', 'c3', 'c4', 'c5'].every((c) => src.includes(`data-r6-core="${c}"`));
    if (id === 'STATIC-EXPORT') found = /csv/i.test(src) && /export|download/i.test(src);
    if (id === 'STATIC-RTL') found = /rtl/i.test(src) && /dir=/.test(src);
    if (id === 'STATIC-A11Y') found = src.includes('aria-live') && src.includes('aria-invalid');
    if (id === 'STATIC-NO-PERSIST') found = !/localStorage|sessionStorage/.test(src);
    rows.push({
      id: `${tool.n}-${id}-01`,
      area: 'STATIC',
      criterion,
      b: found ? 'PASS' : 'PARTIAL',
      e: found ? 'E2' : 'E1',
      evidence: `${rel} inspected (static source evidence, not execution)`,
      source: rel,
      next: found ? 'Cover with an executable test to reach E3' : 'Complete the implementation, then test it',
    });
  }
  return rows;
}

const summaries = [];
for (const tool of TOOLS) {
  const { rows: tRows } = testRows(tool);
  const hasTests = tRows.length > 0;
  // Tools without their own contract AND component suites only have static
  // source evidence for the UI/contract criteria, so those rows are added
  // explicitly instead of being silently assumed.
  const hasContractSuite = fs.existsSync(path.join(CLEAN, 'lib', 'tools', 'r6', `${tool.slug}-contract.test.ts`));
  const hasComponentSuite = fs.existsSync(path.join(CLEAN, 'components', 'tools', `${tool.slug}.test.tsx`));
  const needsStaticRows = !hasContractSuite || !hasComponentSuite;
  const rows = [
    ...tRows,
    ...(needsStaticRows ? staticRows(tool) : []),
    i18nRow(tool),
    routeRow(tool),
    ...p03Rows(tool),
    ...browserRows(tool),
    ...governanceRows(tool),
  ];
  const applicable = rows.filter((r) => r.b !== 'NOT_APPLICABLE');
  const passE3 = applicable.filter((r) => r.b === 'PASS' && ['E3', 'E4', 'E5'].includes(r.e));
  const pct = applicable.length ? (passE3.length / applicable.length) * 100 : 0;
  const counts = {};
  for (const r of rows) counts[r.b] = (counts[r.b] ?? 0) + 1;
  summaries.push({ tool, rows, applicable: applicable.length, passE3: passE3.length, pct, counts, hasTests });

  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    'Tool,CriterionID,Area,Criterion,B,E,Evidence,Source,Gap/Next',
    ...rows.map((r) => [tool.n, r.id, r.area, r.criterion, r.b, r.e, r.evidence, r.source, r.next].map(esc).join(',')),
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `tool-${tool.n}-atomic-ledger-2026-11-18.csv`), csv, 'utf8');

  const md = [];
  md.push(`# Tool ${tool.n} - ${tool.slug} - Atomic Acceptance Ledger`);
  md.push('');
  md.push('**Generated:** 2026-11-18 (Asia/Hebron)');
  md.push('**Evidence environment:** clean export `E:\\p03-clean-build-20261118` = baseline `2a647fda` + P-03 commit `37f047a4`, real `node_modules`');
  md.push('**Formula:** B = PASS and E >= E3, divided by applicable rows. `PARTIAL`, `NOT_RUN`, `NOT_AVAILABLE`, `BLOCKED` are never PASS.');
  md.push('');
  md.push(`- **Result: ${passE3.length}/${applicable.length} = ${pct.toFixed(2)}%**`);
  md.push(`- Rows: ${rows.length} total; ${counts.PASS ?? 0} PASS, ${counts.PARTIAL ?? 0} PARTIAL, ${counts.NOT_RUN ?? 0} NOT_RUN, ${counts.NOT_AVAILABLE ?? 0} NOT_AVAILABLE, ${counts.BLOCKED ?? 0} BLOCKED`);
  md.push('- Status: `IN PROGRESS` (engineering). **Not 100% VERIFIED.** No browser evidence, no source pack, no specialist approval.');
  md.push('');
  md.push('## Criteria');
  md.push('');
  md.push('| ID | Area | Criterion | B | E | Evidence | Gap / Next |');
  md.push('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    md.push(`| ${r.id} | ${r.area} | ${r.criterion.replace(/\|/g, '\\|')} | ${r.b} | ${r.e} | ${r.evidence.replace(/\|/g, '\\|')} | ${r.next.replace(/\|/g, '\\|')} |`);
  }
  md.push('');
  md.push('## What is actually still blocking 100%');
  md.push('');
  const blockers = rows.filter((r) => !(r.b === 'PASS' && ['E3', 'E4', 'E5'].includes(r.e)));
  const byArea = {};
  for (const r of blockers) (byArea[r.area] ??= []).push(r);
  for (const [area, list] of Object.entries(byArea)) {
    md.push(`- **${area}:** ${list.length} row(s) - ${list.map((r) => r.id).join(', ')}`);
  }
  md.push('');
  fs.writeFileSync(path.join(OUT, `tool-${tool.n}-atomic-ledger-2026-11-18.md`), md.join('\n'), 'utf8');
}

const summary = [];
summary.push('# Atomic Acceptance Ledgers - Tools 045-051 - 2026-11-18');
summary.push('');
summary.push('**Environment:** clean export `E:\\p03-clean-build-20261118` (baseline `2a647fda` + P-03 commit `37f047a4`).');
summary.push('**Rule:** percentages come from each tool\'s own criteria; every row is traceable to a test assertion, a check script, a source file, or an explicit owner decision.');
summary.push('');
summary.push('| Tool | PASS (E>=E3) | Applicable | Percent | PASS | PARTIAL | NOT_RUN | NOT_AVAILABLE | BLOCKED |');
summary.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const s of summaries) {
  summary.push(`| ${s.tool.n} | ${s.passE3} | ${s.applicable} | **${s.pct.toFixed(2)}%** | ${s.counts.PASS ?? 0} | ${s.counts.PARTIAL ?? 0} | ${s.counts.NOT_RUN ?? 0} | ${s.counts.NOT_AVAILABLE ?? 0} | ${s.counts.BLOCKED ?? 0} |`);
}
summary.push('');
summary.push('## Notes');
summary.push('');
summary.push('- 045-049 have engine + contract + pipeline + component suites in the clean export; every assertion is a ledger row at E3.');
summary.push('- 050 and 051 have engine and i18n evidence tests only: **no contract suite and no component suite exist**, so their UI rows are static source evidence (E2) and cannot count toward PASS.');
summary.push('- The P-03 runtime negative branch is proven for 045 and 047 only; 046, 048, 049, 050, 051 remain `PARTIAL` on that row.');
summary.push('- Browser rows stay `NOT_RUN` until an authorized session is provided; SSO was not bypassed.');
summary.push('- D-C4 / D-C5 / D-CLIN / W18 remain `NOT_AVAILABLE` / `BLOCKED` by owner decision.');
summary.push('');
summary.push('## Per-tool ledgers');
summary.push('');
for (const s of summaries) {
  summary.push(`- \`tool-${s.tool.n}-atomic-ledger-2026-11-18.md\` / \`.csv\` - ${s.passE3}/${s.applicable} = ${s.pct.toFixed(2)}%`);
}
summary.push('');
fs.writeFileSync(path.join(OUT, 'ATOMIC-LEDGERS-045-051-2026-11-18.md'), summary.join('\n'), 'utf8');

console.log('WROTE ledgers for ' + summaries.length + ' tools');
for (const s of summaries) console.log(`${s.tool.n}: ${s.passE3}/${s.applicable} = ${s.pct.toFixed(2)}%`);
