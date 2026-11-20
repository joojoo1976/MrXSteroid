#!/usr/bin/env node
/**
 * Tool 041 - acceptance calculator (current 138-row ledger).
 *
 * Status: OWNER_REVIEW - NOT ACCEPTED - NOT CLOSED.
 *
 * This script is evidence arithmetic only. It never grants acceptance and it
 * never fills the owner decision (C) column.
 *
 * Completion rule:
 *   numerator   = applicable rows with B === 'PASS' and E >= E3
 *   denominator = all rows classified APPLICABLE
 *   NOT_APPLICABLE rows are excluded only when the row carries a specific
 *   reason and its own closure evidence.
 *
 * Run:
 *   node "docs/MRX Genius Cloud Unified R6.1/tool-041-acceptance-calc.mjs"
 */

import { createHash } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOL_ID = 'mrx.tool.041-hematocrit-monitor';
export const TOOL_STATUS = 'OWNER_REVIEW';
export const AS_OF = '2026-11-14';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_LEDGER = join(HERE, 'tool-041-requirements.csv');
export const DEFAULT_JSON = join(HERE, 'tool-041-acceptance-calc.json');

const B_ORDER = ['PASS', 'PARTIAL', 'FAIL', 'NOT_AVAILABLE', 'BLOCKED', 'NOT_RUN', 'NOT_APPLICABLE'];
const E_ORDER = ['E0', 'E1', 'E2', 'E3', 'E4'];
const C_ORDER = ['PENDING', 'NOT_DECISIONED', 'APPROVED', 'REJECTED'];

/** Parse RFC-4180-ish CSV without external dependencies. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

export function loadLedger(path = DEFAULT_LEDGER) {
  const text = readFileSync(path, 'utf8');
  const raw = parseCsv(text);
  const header = raw[0].map((h) => h.trim());
  const rows = raw.slice(1).map((cells, index) => {
    const row = {};
    header.forEach((key, i) => {
      row[key] = (cells[i] ?? '').trim();
    });
    row.__line = index + 2;
    return row;
  });
  return { path, text, header, rows };
}

export function applicabilityClass(row) {
  const value = (row.applicability || '').toUpperCase();
  if (value.startsWith('APPLICABLE')) return 'APPLICABLE';
  if (value.startsWith('NOT_APPLICABLE')) return 'NOT_APPLICABLE';
  throw new Error(`Row ${row.req_id} has an unrecognised applicability: ${row.applicability}`);
}

export function isApplicable(row) {
  return applicabilityClass(row) === 'APPLICABLE';
}

export function eLevel(row) {
  const match = /^E([0-4])$/.exec(row.E || '');
  if (!match) throw new Error(`Row ${row.req_id} has an invalid E value: ${row.E}`);
  return Number(match[1]);
}

export function isCompletion(row) {
  return isApplicable(row) && row.B === 'PASS' && eLevel(row) >= 3;
}

export function familyOf(reqId) {
  return String(reqId || '').split('-')[0];
}

function countBy(rows, pick) {
  const out = {};
  for (const row of rows) {
    const key = pick(row);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function orderedKeys(counts, preferred) {
  const keys = Object.keys(counts);
  const known = preferred.filter((key) => keys.includes(key));
  const extra = keys.filter((key) => !preferred.includes(key)).sort();
  return [...known, ...extra];
}

export function buildCrossTab(rows) {
  const counts = new Map();
  for (const row of rows) {
    const key = `${applicabilityClass(row)}|${row.B}|${row.E}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const entries = [];
  for (const applicability of ['APPLICABLE', 'NOT_APPLICABLE']) {
    for (const B of orderedKeys(countBy(rows, (r) => r.B), B_ORDER)) {
      for (const E of orderedKeys(countBy(rows, (r) => r.E), E_ORDER)) {
        const key = `${applicability}|${B}|${E}`;
        const count = counts.get(key) || 0;
        if (count > 0) entries.push({ applicability, B, E, count });
      }
    }
  }
  return entries;
}

export function computeSummary(rows, meta = {}) {
  const totalRows = rows.length;
  const uniqueIds = new Set(rows.map((r) => r.req_id)).size;
  const applicableRows = rows.filter(isApplicable);
  const excludedRows = rows.filter((r) => !isApplicable(r));
  const completionRows = applicableRows.filter(isCompletion);

  const byB = countBy(rows, (r) => r.B);
  const byC = countBy(rows, (r) => r.C);
  const byE = countBy(rows, (r) => r.E);
  const byEApplicable = countBy(applicableRows, (r) => r.E);

  const crossTab = buildCrossTab(rows);

  const families = {};
  for (const row of rows) {
    const family = familyOf(row.req_id);
    if (!families[family]) {
      families[family] = { family, rows: 0, applicable: 0, not_applicable: 0, pass: 0, completion: 0 };
    }
    const entry = families[family];
    entry.rows += 1;
    if (isApplicable(row)) {
      entry.applicable += 1;
      if (row.B === 'PASS') entry.pass += 1;
      if (isCompletion(row)) entry.completion += 1;
    } else {
      entry.not_applicable += 1;
    }
  }

  const percent = applicableRows.length === 0
    ? 0
    : Math.round((completionRows.length / applicableRows.length) * 10000) / 100;

  const excludedWithProof = excludedRows.filter(
    (r) => /reason:/i.test(r.applicability) && r.closure_evidence.trim() !== '',
  ).length;

  const checks = [
    { id: 'rows', ok: totalRows === 138, detail: `rows=${totalRows}` },
    { id: 'unique_ids', ok: uniqueIds === totalRows, detail: `unique=${uniqueIds}` },
    {
      id: 'applicability_partition',
      ok: applicableRows.length + excludedRows.length === totalRows,
      detail: `${applicableRows.length}+${excludedRows.length}=${totalRows}`,
    },
    {
      id: 'b_partition',
      ok: Object.values(byB).reduce((a, b) => a + b, 0) === totalRows,
      detail: JSON.stringify(byB),
    },
    {
      id: 'c_partition',
      ok: Object.values(byC).reduce((a, b) => a + b, 0) === totalRows,
      detail: JSON.stringify(byC),
    },
    {
      id: 'e_partition',
      ok: Object.values(byE).reduce((a, b) => a + b, 0) === totalRows,
      detail: JSON.stringify(byE),
    },
    {
      id: 'crosstab_partition',
      ok: crossTab.reduce((a, e) => a + e.count, 0) === totalRows,
      detail: `crosstab=${crossTab.reduce((a, e) => a + e.count, 0)}`,
    },
    {
      id: 'na_has_reason_and_proof',
      ok: excludedWithProof === excludedRows.length,
      detail: `${excludedWithProof}/${excludedRows.length}`,
    },
    {
      id: 'no_owner_approval_fabricated',
      ok: (byC.APPROVED || 0) === 0 && (byC.REJECTED || 0) === 0,
      detail: `APPROVED=${byC.APPROVED || 0}; REJECTED=${byC.REJECTED || 0}`,
    },
    {
      id: 'applicable_c_pending',
      ok: applicableRows.every((r) => r.C === 'PENDING'),
      detail: 'every applicable row keeps C=PENDING',
    },
    {
      id: 'excluded_c_not_decisioned',
      ok: excludedRows.every((r) => r.C === 'NOT_DECISIONED'),
      detail: 'every excluded row keeps C=NOT_DECISIONED',
    },
    {
      id: 'not_available_not_counted',
      ok: rows.filter((r) => r.B === 'NOT_AVAILABLE').every((r) => !isCompletion(r)),
      detail: 'NOT_AVAILABLE is never completion',
    },
    {
      id: 'non_completion_states_not_counted',
      ok: rows
        .filter((r) => ['PARTIAL', 'FAIL', 'BLOCKED', 'NOT_RUN'].includes(r.B))
        .every((r) => !isCompletion(r)),
      detail: 'PARTIAL/FAIL/BLOCKED/NOT_RUN are never completion',
    },
    {
      id: 'pass_requires_e3',
      ok: completionRows.every((r) => eLevel(r) >= 3),
      detail: 'completion rows require E>=E3',
    },
    {
      id: 'percent_matches',
      ok: Number.isFinite(percent),
      detail: `${completionRows.length}/${applicableRows.length}=${percent.toFixed(2)}%`,
    },
  ];

  return {
    tool_id: TOOL_ID,
    tool_status: TOOL_STATUS,
    as_of: AS_OF,
    ledger: {
      path: meta.path ?? null,
      sha256: meta.sha256 ?? null,
      bytes: meta.bytes ?? null,
      header: meta.header ?? null,
    },
    rules: {
      completion_formula: '(applicable rows with B=PASS and E>=E3) / applicable rows x 100',
      denominator_excludes_only: 'NOT_APPLICABLE rows that carry a specific reason and their own proof',
      not_available: 'stays in the denominator; never counted as PASS',
      non_completion_states: ['PARTIAL', 'FAIL', 'BLOCKED', 'NOT_RUN', 'NOT_AVAILABLE', 'NOT_APPLICABLE'],
      owner_decision: 'C is never filled by this calculator',
    },
    totals: {
      rows: totalRows,
      applicable: applicableRows.length,
      not_applicable: excludedRows.length,
      unique_ids: uniqueIds,
    },
    by_b: byB,
    by_c: byC,
    by_e: byE,
    by_e_applicable: byEApplicable,
    completion: {
      numerator: completionRows.length,
      denominator: applicableRows.length,
      percent,
      display: `${completionRows.length} / ${applicableRows.length} = ${percent.toFixed(2)}%`,
    },
    cross_tab: crossTab,
    families: Object.values(families).sort((a, b) => a.family.localeCompare(b.family)),
    integrity: {
      ok: checks.every((check) => check.ok),
      checks,
    },
  };
}

export function ledgerFingerprint(path = DEFAULT_LEDGER) {
  const buffer = readFileSync(path);
  return {
    path,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    bytes: statSync(path).size,
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function writeCrossTabFiles(rows, summary, ledgerInfo, outDir = HERE) {
  const csvLines = [
    'req_id,family,requirement,applicability_class,B,C,E,counts_as_completion,gap_next_action',
  ];
  for (const row of rows) {
    csvLines.push(
      [
        row.req_id,
        familyOf(row.req_id),
        row.requirement,
        applicabilityClass(row),
        row.B,
        row.C,
        row.E,
        isCompletion(row) ? 'YES' : 'NO',
        row.gap_next_action,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  writeFileSync(join(outDir, 'tool-041-ledger-crosstab.csv'), `${csvLines.join('\n')}\n`, 'utf8');

  const payload = {
    tool_id: TOOL_ID,
    tool_status: TOOL_STATUS,
    as_of: AS_OF,
    generated_from: {
      ledger_path: ledgerInfo.path,
      ledger_sha256: ledgerInfo.sha256,
      ledger_bytes: ledgerInfo.bytes,
      ledger_rows: rows.length,
    },
    summary: {
      totals: summary.totals,
      by_b: summary.by_b,
      by_c: summary.by_c,
      by_e: summary.by_e,
      by_e_applicable: summary.by_e_applicable,
      completion: summary.completion,
      integrity_ok: summary.integrity.ok,
    },
    cross_tab: summary.cross_tab,
    families: summary.families,
    rows: rows.map((row) => ({
      req_id: row.req_id,
      family: familyOf(row.req_id),
      requirement: row.requirement,
      applicability_class: applicabilityClass(row),
      B: row.B,
      C: row.C,
      E: row.E,
      counts_as_completion: isCompletion(row),
      gap_next_action: row.gap_next_action,
    })),
  };
  writeFileSync(join(outDir, 'tool-041-ledger-crosstab.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const md = [];
  md.push('# TOOL 041 - 138-ROW CROSS-TABULATION (applicability x B x E)');
  md.push('');
  md.push('**Status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED. This table is evidence arithmetic, not acceptance.');
  md.push('');
  md.push(`**As of:** ${AS_OF}`);
  md.push('');
  md.push('**Ledger:** `tool-041-requirements.csv` - 138 rows / 138 unique IDs');
  md.push('');
  md.push(`**Fingerprint:** \`${ledgerInfo.sha256}\` (${ledgerInfo.bytes} bytes)`);
  md.push('');
  md.push('**Completion rule:** `(applicable rows with B=PASS and E>=E3) / applicable rows x 100`.');
  md.push('`NOT_AVAILABLE` stays in the denominator and is never PASS. `NOT_APPLICABLE` is excluded only with a reason and proof. `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are never completion.');
  md.push('');
  md.push('## Aggregate result');
  md.push('');
  md.push('| Metric | Value |');
  md.push('|---|---:|');
  md.push(`| Rows | ${summary.totals.rows} |`);
  md.push(`| Applicable (denominator) | ${summary.totals.applicable} |`);
  md.push(`| NOT_APPLICABLE (excluded with proof) | ${summary.totals.not_applicable} |`);
  md.push(`| Completion numerator (B=PASS and E>=E3) | ${summary.completion.numerator} |`);
  md.push(`| Completion | **${summary.completion.display}** |`);
  md.push(`| Ledger integrity | ${summary.integrity.ok ? 'OK' : 'FAILED'} |`);
  md.push('');
  md.push('## Cross-tabulation: applicability x B x E');
  md.push('');
  md.push('| Applicability | B | E | Rows |');
  md.push('|---|---|---|---:|');
  for (const entry of summary.cross_tab) {
    md.push(`| ${entry.applicability} | ${entry.B} | ${entry.E} | ${entry.count} |`);
  }
  md.push('');
  md.push('## Marginals');
  md.push('');
  md.push('| B | Rows |');
  md.push('|---|---:|');
  for (const key of orderedKeys(summary.by_b, B_ORDER)) {
    md.push(`| ${key} | ${summary.by_b[key]} |`);
  }
  md.push('');
  md.push('| E | Rows (all) | Rows (applicable only) |');
  md.push('|---|---:|---:|');
  for (const key of orderedKeys(summary.by_e, E_ORDER)) {
    md.push(`| ${key} | ${summary.by_e[key] || 0} | ${summary.by_e_applicable[key] || 0} |`);
  }
  md.push('');
  md.push('| Owner decision (C) | Rows |');
  md.push('|---|---:|');
  for (const key of orderedKeys(summary.by_c, C_ORDER)) {
    md.push(`| ${key} | ${summary.by_c[key]} |`);
  }
  md.push('');
  md.push('## Family distribution');
  md.push('');
  md.push('| Family | Rows | Applicable | NOT_APPLICABLE | B=PASS | Counted completion |');
  md.push('|---|---:|---:|---:|---:|---:|');
  for (const family of summary.families) {
    md.push(
      `| ${family.family} | ${family.rows} | ${family.applicable} | ${family.not_applicable} | ${family.pass} | ${family.completion} |`,
    );
  }
  md.push('');
  md.push('## Full 138-row table');
  md.push('');
  md.push('| req_id | Family | B | E | Counted | Requirement | Gap / next action |');
  md.push('|---|---|---|---|---|---|---|');
  for (const row of rows) {
    const requirement = row.requirement.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    const gap = row.gap_next_action.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    md.push(
      `| ${row.req_id} | ${familyOf(row.req_id)} | ${row.B} | ${row.E} | ${isCompletion(row) ? 'YES' : 'NO'} | ${requirement} | ${gap} |`,
    );
  }
  md.push('');
  md.push('## State meanings');
  md.push('');
  md.push('- `APPLICABLE` - the requirement applies to Tool 041 and stays in the denominator.');
  md.push('- `NOT_APPLICABLE` - excluded from the denominator only because the row states a specific reason and carries its own proof.');
  md.push('- `PASS` - the only completion state, and only when `E>=E3`.');
  md.push('- `PARTIAL`, `FAIL`, `BLOCKED`, `NOT_RUN` - never completion.');
  md.push('- `NOT_AVAILABLE` - the requirement applies but the function or evidence is unavailable; it stays in the denominator and is not PASS.');
  md.push('- `E0`-`E4` - evidence strength, not acceptance. `E4` is published/runtime evidence and still does not equal acceptance.');
  md.push('- `C=PENDING` on every applicable row and `C=NOT_DECISIONED` on every excluded row. The calculator never fills the owner decision.');
  md.push('');
  writeFileSync(join(outDir, 'tool-041-ledger-crosstab.md'), `${md.join('\n')}\n`, 'utf8');
}

function main() {
  const { rows, header } = loadLedger(DEFAULT_LEDGER);
  const fingerprint = ledgerFingerprint(DEFAULT_LEDGER);
  const summary = computeSummary(rows, { ...fingerprint, header });
  writeFileSync(DEFAULT_JSON, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  writeCrossTabFiles(rows, summary, fingerprint, HERE);

  console.log(`TOOL 041 - acceptance calculation (${AS_OF})`);
  console.log(`status=${TOOL_STATUS}`);
  console.log(`ledger=${fingerprint.path}`);
  console.log(`sha256=${fingerprint.sha256}`);
  console.log(`rows=${summary.totals.rows} applicable=${summary.totals.applicable} not_applicable=${summary.totals.not_applicable}`);
  console.log(`completion=${summary.completion.display}`);
  console.log(`integrity=${summary.integrity.ok ? 'OK' : 'FAILED'}`);
  for (const check of summary.integrity.checks) {
    if (!check.ok) console.error(`FAILED CHECK ${check.id}: ${check.detail}`);
  }
  if (!summary.integrity.ok) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
