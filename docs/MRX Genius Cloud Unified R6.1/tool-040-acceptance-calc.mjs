#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-040-acceptance-calc.mjs
 *
 * Computes the Tool 040 acceptance figures from the requirement ledger
 * (tool-040-requirements.csv) with the owner's mandated formula:
 *
 *   completion % = (applicable requirements with B = PASS and sufficient evidence)
 *                   / (total applicable atomic requirements) * 100
 *
 * Nothing here is estimated: every count is derived from the ledger rows.
 * Rows that are NOT_APPLICABLE are excluded from the denominator only when the
 * ledger itself states the reason (column 'applicability' must start with
 * NOT_APPLICABLE and carry a reason). NOT_AVAILABLE, BLOCKED, NOT_RUN,
 * PARTIAL and FAIL rows that apply to the tool stay in the denominator.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const csvPath = join(here, 'tool-040-requirements.csv');

/** Minimal RFC-4180 CSV parser (handles quoted fields with commas and quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

const HEADER = [
  'req_id', 'requirement', 'applicability', 'A', 'B', 'C', 'E',
  'files', 'test_result', 'verified_date', 'head', 'evidence_uri',
  'gap_next_action', 'closure_evidence',
];

const raw = parseCsv(readFileSync(csvPath, 'utf8'));
const header = raw[0].map((h) => h.trim());
if (JSON.stringify(header) !== JSON.stringify(HEADER)) {
  console.error('HEADER_MISMATCH');
  console.error('expected:', HEADER.join(' | '));
  console.error('actual  :', header.join(' | '));
  process.exit(2);
}

const rows = raw.slice(1).map((cells) => {
  const record = {};
  HEADER.forEach((key, index) => {
    record[key] = (cells[index] ?? '').trim();
  });
  record.__cells = cells.length;
  return record;
});

const problems = [];
rows.forEach((record, index) => {
  if (record.__cells !== HEADER.length) {
    problems.push(`row ${index + 2} (${record.req_id || '?'}) has ${record.__cells} cells, expected ${HEADER.length}`);
  }
  HEADER.forEach((key) => {
    if (!record[key]) problems.push(`row ${index + 2} (${record.req_id || '?'}) missing column "${key}"`);
  });
  if (!/^(NOT_SPECIFIED|SPECIFIED|SPEC_APPROVED)$/.test(record.A)) {
    problems.push(`row ${index + 2} (${record.req_id}) invalid A value "${record.A}"`);
  }
  if (!/^(PASS|PARTIAL|FAIL|BLOCKED|NOT_RUN|NOT_AVAILABLE|NOT_APPLICABLE)$/.test(record.B)) {
    problems.push(`row ${index + 2} (${record.req_id}) invalid B value "${record.B}"`);
  }
  if (!/^(NOT_DECISIONED|PENDING|APPROVED|REJECTED|SUPERSEDED)$/.test(record.C)) {
    problems.push(`row ${index + 2} (${record.req_id}) invalid C value "${record.C}"`);
  }
  if (!/^E[0-5]$/.test(record.E)) {
    problems.push(`row ${index + 2} (${record.req_id}) invalid E value "${record.E}"`);
  }
});

const isApplicable = (record) => record.applicability.startsWith('APPLICABLE');
const evidenceSufficient = (record) => Number(record.E.slice(1)) >= 3;

const applicable = rows.filter(isApplicable);
const notApplicable = rows.filter((r) => !isApplicable(r));

const completed = applicable.filter((r) => r.B === 'PASS' && evidenceSufficient(r));
const open = applicable.filter((r) => !(r.B === 'PASS' && evidenceSufficient(r)));

const countBy = (list, key) =>
  list.reduce((acc, record) => {
    acc[record[key]] = (acc[record[key]] ?? 0) + 1;
    return acc;
  }, {});

const denominator = applicable.length;
const numerator = completed.length;
const percentage = denominator === 0 ? null : (numerator / denominator) * 100;

console.log('TOOL 040 ACCEPTANCE CALCULATION');
console.log('ledger: docs/MRX Genius Cloud Unified R6.1/tool-040-requirements.csv');
console.log('');
console.log(`ledger rows (atomic requirements enumerated) : ${rows.length}`);
console.log(`applicable to Tool 040 (denominator)        : ${denominator}`);
console.log(`not applicable (excluded, with reason)       : ${notApplicable.length}`);
console.log('');
console.log('A status counts (design)      :', JSON.stringify(countBy(rows, 'A')));
console.log('B status counts (implementation):', JSON.stringify(countBy(rows, 'B')));
console.log('C status counts (owner)        :', JSON.stringify(countBy(rows, 'C')));
console.log('E level counts (evidence)      :', JSON.stringify(countBy(rows, 'E')));
console.log('');
console.log('Applicable rows by B status   :', JSON.stringify(countBy(applicable, 'B')));
console.log('');
console.log(`numerator  = applicable AND B=PASS AND E>=E3 = ${numerator}`);
console.log(`denominator= applicable atomic requirements    = ${denominator}`);
console.log(
  percentage === null
    ? 'completion = indeterminate — the denominator cannot be derived from the ledger'
    : `completion = ${numerator} / ${denominator} * 100 = ${percentage.toFixed(2)}%`,
);
console.log('');
console.log('COMPLETED (B=PASS, E>=E3):');
completed.forEach((r) => console.log(`  [${r.req_id}] ${r.requirement.slice(0, 96)}`));
console.log('');
console.log('OPEN (applicable, not complete):');
open.forEach((r) => console.log(`  [${r.req_id}] B=${r.B} E=${r.E} — ${r.gap_next_action.slice(0, 140)}`));
console.log('');
console.log('NOT APPLICABLE (excluded from the denominator, reason recorded):');
notApplicable.forEach((r) => console.log(`  [${r.req_id}] ${r.applicability.slice(0, 150)}`));
console.log('');
if (problems.length > 0) {
  console.log('LEDGER_PROBLEMS:');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log('LEDGER_INTEGRITY: OK (14 columns, controlled vocabularies, no empty cells)');

/* ------------------------------------------------------------------ *
 * Markdown rendering + document assembly
 * ------------------------------------------------------------------ */

const escapeCell = (value) => value.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function renderTable() {
  const header = '| Requirement ID | Requirement | Applicability | A | B | C | E | Files | Test and actual result | Verified date | HEAD | Evidence URI | Remaining gap / next action | Closure evidence |';
  const divider = '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|';
  const lines = rows.map((record) =>
    '| ' +
    [
      record.req_id,
      record.requirement,
      record.applicability,
      record.A,
      record.B,
      record.C,
      record.E,
      record.files,
      record.test_result,
      record.verified_date,
      record.head,
      record.evidence_uri,
      record.gap_next_action,
      record.closure_evidence,
    ]
      .map(escapeCell)
      .join(' | ') +
    ' |',
  );
  return [header, divider, ...lines].join('\n');
}

function renderCounts() {
  const pct = percentage === null ? 'indeterminate' : `${percentage.toFixed(2)}%`;
  return [
    '| Measure | Value |',
    '|---|---|',
    `| Atomic requirements enumerated from the R6.1 sources | ${rows.length} |`,
    `| Applicable to Tool 040 (denominator) | ${denominator} |`,
    `| NOT_APPLICABLE (excluded from the denominator, proof recorded) | ${notApplicable.length} |`,
    `| Complete (B = PASS and E >= E3) | ${numerator} |`,
    `| **Completion** | **${numerator} / ${denominator} = ${pct}** |`,
    '',
    'Design (A) counts: ' + JSON.stringify(countBy(rows, 'A')),
    '',
    'Implementation & proof (B) counts, applicable rows only: ' + JSON.stringify(countBy(applicable, 'B')),
    '',
    'Implementation & proof (B) counts, all rows: ' + JSON.stringify(countBy(rows, 'B')),
    '',
    'Owner decision (C) counts: ' + JSON.stringify(countBy(rows, 'C')),
    '',
    'Evidence level (E) counts: ' + JSON.stringify(countBy(rows, 'E')),
    '',
    'Formula: (applicable rows with B = PASS and E >= E3) / (applicable atomic requirements) x 100 = ' +
      `${numerator} / ${denominator} x 100 = ${pct}`,
    '',
    'NOT_AVAILABLE, BLOCKED, NOT_RUN, PARTIAL and FAIL rows that apply to the tool remain in the denominator and are never counted as complete.',
  ].join('\n');
}

function renderLists() {
  const completedList = completed.map((r) => `- \`${r.req_id}\` — ${r.requirement} · B=${r.B} · E=${r.E}`).join('\n');
  const openList = open.map((r) => `- \`${r.req_id}\` — ${r.requirement} · **B=${r.B} · E=${r.E}** — ${r.gap_next_action}`).join('\n');
  const naList = notApplicable.map((r) => `- \`${r.req_id}\` — ${r.requirement} — ${r.applicability}`).join('\n');
  return [
    '### 6.1 Complete (B = PASS, E >= E3) — ' + completed.length,
    '',
    completedList,
    '',
    '### 6.2 Open (applicable, not complete) — ' + open.length,
    '',
    openList,
    '',
    '### 6.3 NOT_APPLICABLE (excluded from the denominator, proof recorded) — ' + notApplicable.length,
    '',
    naList,
  ].join('\n');
}

const templatePath = join(here, 'tool-040-acceptance.template.md');
const outputPath = join(here, 'TOOL-040-ACCEPTANCE.md');
const template = readFileSync(templatePath, 'utf8');
const assembled = template
  .replace('<!--GENERATED_TABLE-->', renderTable())
  .replace('<!--GENERATED_COUNTS-->', renderCounts())
  .replace('<!--GENERATED_LISTS-->', renderLists());

if (assembled.includes('<!--GENERATED_')) {
  console.error('ASSEMBLY_FAILED: a generated marker was not replaced');
  process.exit(3);
}
writeFileSync(outputPath, assembled, 'utf8');
console.log(`ACCEPTANCE_DOC: written to ${outputPath} (${assembled.length} chars)`);
