// tests/unit/tool-041-acceptance-evidence-ledger.test.ts
//
// Ledger-integrity evidence for the Tool 041 R6.1 acceptance package.
//
// This is the runnable acceptance-evidence test required by the Phase 7
// package. It is deliberately named with the `-ledger` suffix so it does NOT
// overwrite the pre-existing source-scan evidence test at
// `tests/unit/tool-041-acceptance-evidence.test.ts` (which proves the pipeline
// routing and the absence of persistence).
//
// What it checks:
//   - the ledger has exactly the 14 ordered columns;
//   - every req_id is unique;
//   - no cell is empty;
//   - controlled vocabularies for A, B, C and E;
//   - NOT_APPLICABLE rows carry a specific reason and are excluded;
//   - B = PASS only with E >= E3 and a real test result;
//   - applicable rows keep the owner decision C = PENDING;
//   - the published completion figure is exactly the one the calculator emits.
//
// Node project, no DOM.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LEDGER = join(ROOT, 'docs', 'MRX Genius Cloud Unified R6.1', 'tool-041-requirements.csv');
const SUMMARY = join(ROOT, 'docs', 'MRX Genius Cloud Unified R6.1', 'tool-041-acceptance-calc.json');

const HEADER = [
  'req_id', 'requirement', 'applicability', 'A', 'B', 'C', 'E',
  'files', 'test_result', 'verified_date', 'head', 'evidence_uri',
  'gap_next_action', 'closure_evidence',
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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
    if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

const parsed = parseCsv(readFileSync(LEDGER, 'utf8'));
const header = parsed[0].map((h) => h.trim());
const records = parsed.slice(1).map((cells) => {
  const record: Record<string, string> = {};
  HEADER.forEach((key, i) => {
    record[key] = (cells[i] ?? '').trim();
  });
  return record;
});

describe('Tool 041 acceptance ledger integrity', () => {
  it('has exactly the 14 ordered columns', () => {
    expect(header).toEqual(HEADER);
    parsed.slice(1).forEach((cells) => expect(cells).toHaveLength(HEADER.length));
  });

  it('has no duplicate req_id and no empty cell', () => {
    const ids = records.map((r) => r.req_id);
    expect(new Set(ids).size).toBe(ids.length);
    records.forEach((record) => {
      HEADER.forEach((key) => {
        expect(record[key], `${record.req_id}.${key}`).not.toBe('');
      });
      expect(record.A).toMatch(/^(NOT_SPECIFIED|SPECIFIED|SPEC_APPROVED)$/);
      expect(record.B).toMatch(/^(PASS|PARTIAL|FAIL|BLOCKED|NOT_RUN|NOT_AVAILABLE|NOT_APPLICABLE)$/);
      expect(record.C).toMatch(/^(NOT_DECISIONED|PENDING|APPROVED|REJECTED|SUPERSEDED)$/);
      expect(record.E).toMatch(/^E[0-5]$/);
    });
  });

  it('keeps NOT_APPLICABLE rows justified and excluded, and PASS rows proven', () => {
    records.forEach((record) => {
      const na = record.applicability.startsWith('NOT_APPLICABLE');
      if (na) {
        expect(record.applicability, record.req_id).toMatch(/reason:/i);
        expect(record.applicability.length, record.req_id).toBeGreaterThanOrEqual(40);
        expect(record.B, record.req_id).toBe('NOT_APPLICABLE');
        expect(record.C, record.req_id).toBe('NOT_DECISIONED');
      } else {
        expect(record.C, record.req_id).toBe('PENDING');
        if (record.B === 'PASS') {
          expect(Number(record.E.slice(1)), record.req_id).toBeGreaterThanOrEqual(3);
          expect(record.test_result, record.req_id).not.toMatch(/NOT_RUN/i);
        }
      }
    });
  });

  it('computes 76 / 132 = 57.58% and matches the calculator summary', () => {
    const applicable = records.filter((r) => r.applicability.startsWith('APPLICABLE'));
    const completed = applicable.filter((r) => r.B === 'PASS' && Number(r.E.slice(1)) >= 3);
    const summary = JSON.parse(readFileSync(SUMMARY, 'utf8'));

    expect(applicable).toHaveLength(132);
    expect(completed).toHaveLength(76);
    expect(summary.totals.applicable).toBe(132);
    expect(summary.totals.not_applicable).toBe(6);
    expect(summary.completion.numerator).toBe(76);
    expect(summary.completion.denominator).toBe(132);
    expect(summary.completion.percent).toBe(57.58);
    expect(summary.integrity.ok).toBe(true);
    expect(summary.tool_status).toBe('OWNER_REVIEW');

    const crosstabRows = summary.cross_tab.reduce(
      (total: number, entry: { count: number }) => total + entry.count,
      0,
    );
    expect(crosstabRows).toBe(138);
    expect(summary.by_c.APPROVED ?? 0).toBe(0);
    expect(summary.by_c.REJECTED ?? 0).toBe(0);
  });
});
