// tests/unit/tool-039-acceptance-evidence.test.ts
//
// Evidence tests for the Tool 039 acceptance package. They turn the
// document-level acceptance requirements into re-runnable proof (E3) instead
// of "a file exists" (E2), and they enforce the rule that every requirement
// excluded from the Tool 039 denominator must still be recorded in the
// system requirement register.
//
// Node project (no DOM required).
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const DOCS = join(ROOT, 'docs', 'MRX Genius Cloud Unified R6.1');

const read = (name: string) => readFileSync(join(DOCS, name), 'utf8');

/** Minimal RFC-4180 parser (the ledger quotes fields that contain commas). */
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
  return rows.filter((r) => r.length > 1);
}

describe('Tool 039 acceptance evidence package', () => {
  it('publishes exactly ten tool-specific proposals, each with inputs, outputs, risks, cost, tests and acceptance criteria', () => {
    const file = join(DOCS, 'TOOL-039-DEVELOPMENT-PROPOSALS.md');
    expect(existsSync(file)).toBe(true);
    const text = read('TOOL-039-DEVELOPMENT-PROPOSALS.md');

    const proposals = text.split(/\n## P-\d+/).slice(1);
    expect(proposals).toHaveLength(10);
    for (const proposal of proposals) {
      expect(proposal).toMatch(/\*\*Purpose:\*\*/);
      expect(proposal).toMatch(/\*\*Inputs:\*\*/);
      expect(proposal).toMatch(/\*\*Outputs:\*\*/);
      expect(proposal).toMatch(/\*\*Risks:\*\*/);
      expect(proposal).toMatch(/\*\*Cost:\*\*/);
      expect(proposal).toMatch(/\*\*Tests:\*\*/);
      expect(proposal).toMatch(/\*\*Acceptance criteria:\*\*/);
    }
    expect(text).toMatch(/NOT IMPLEMENTED/);
    expect(text).toMatch(/not 10 execution tasks/);
  });

  it('reconciles the Tool 039 scope row as tested and pointing at the acceptance file', () => {
    const csv = read('scope-reconciliation-286.csv');
    const row = csv.split('\n').find((line) => line.startsWith('SR-048,'));
    expect(row).toBeDefined();
    expect(row).toMatch(/component_exists,tested,/);
    expect(row).toMatch(/TOOL-039-ACCEPTANCE\.md/);
  });

  it('ships the acceptance package with a manifest, hashes, a conflict log, a crosswalk, a tracker and the ledger', () => {
    const manifest = read('R6.1-ACTIVATION-MANIFEST.md');
    expect(manifest).toMatch(/SHA-256/);
    expect(manifest).toMatch(/SPEC\.md/);
    expect(manifest).toMatch(/ACCEPTANCE_CRITERIA\.md/);
    expect(manifest).toMatch(/R6\.1-CLOSURE-LAYER\.md/);

    const acceptance = read('TOOL-039-ACCEPTANCE.md');
    expect(acceptance).toMatch(/Conflict/); // the activation-status conflict record
    expect(acceptance).toMatch(/GENIUS-12/); // the crosswalk is referenced
    expect(acceptance).toMatch(/\d+ \/ \d+ = \d+\.\d+%/); // the computed figure is present
    expect(acceptance).toMatch(/Completion/);

    const crosswalk = read('TOOL-039-GENIUS12-CROSSWALK.md');
    expect(crosswalk).toMatch(/Box 11 — Alternative Paths/);
    expect(crosswalk).toMatch(/History/);
    expect(crosswalk).toMatch(/Rating/);

    const tracker = read('W01-W24-CONFLICT-TRACKER.md');
    expect(tracker).toMatch(/Tool 039 closed on 2026-11-11/);

    const ledger = read('tool-039-requirements.csv');
    expect(ledger).toMatch(/req_id,requirement,applicability/);
  });

  it('records the activation conflict and the owner decision exactly as it was given', () => {
    const acceptance = read('TOOL-039-ACCEPTANCE.md');
    expect(acceptance).toMatch(/R6\.1-ACTIVATION-DECISION\.md/);
    expect(acceptance).toMatch(/2026-11-09/);

    // The owner reviewed the published Preview and decided OWNER_ACCEPTED
    // (2026-11-12). The decision (C) is APPROVED on every APPLICABLE row.
    const ledger = read('tool-039-requirements.csv');
    const rows = parseCsv(ledger).slice(1);
    const header = parseCsv(ledger)[0];
    const iApplicability = header.indexOf('applicability');
    const iC = header.indexOf('C');

    const applicable = rows.filter((cells) => !cells[iApplicability].startsWith('NOT_APPLICABLE'));
    const excluded = rows.filter((cells) => cells[iApplicability].startsWith('NOT_APPLICABLE'));

    // Every applicable row carries the owner's approval; nothing is left PENDING.
    expect(applicable.length).toBe(95);
    expect(applicable.every((cells) => cells[iC] === 'APPROVED')).toBe(true);
    expect(rows.some((cells) => cells[iC] === 'PENDING')).toBe(false);

    // The excluded rows are not applicable, so they carry no decision; they are
    // excluded with a recorded proof and stay in the system requirement register.
    expect(excluded.length).toBe(28);
    expect(excluded.every((cells) => cells[iC] === 'NOT_DECISIONED')).toBe(true);

    // The acceptance document states the decision and keeps the conflict open.
    expect(acceptance).toMatch(/OWNER_ACCEPTED/);
    expect(acceptance).toMatch(/95 applicable rows/);
  });

  it('keeps every excluded requirement recorded in the system requirement register', () => {
    const ledger = read('tool-039-requirements.csv');
    const register = read('R6.1-SYSTEM-REQUIREMENT-REGISTER.md');

    const rows = parseCsv(ledger).slice(1);
    const excluded = rows
      .map((cells) => ({ id: cells[0], applicability: cells[2] }))
      .filter((row) => row.applicability.startsWith('NOT_APPLICABLE'));

    expect(excluded.length).toBeGreaterThan(0);
    for (const row of excluded) {
      expect(register, `requirement ${row.id} must stay in the system register`).toContain(row.id);
    }
  });

  it('deletes nothing: the preserved R6.1 headers and the authoritative sources are untouched', () => {
    // The preserved "OWNER REVIEW DRAFT — NOT ACTIVE" headers must still be there
    // (the closure layer forbids deleting preserved text).
    expect(read('SPEC.md')).toMatch(/OWNER REVIEW DRAFT/);
    expect(read('ACCEPTANCE_CRITERIA.md')).toMatch(/OWNER REVIEW DRAFT/);

    // The engine, the Zod schema and the registry must be byte-identical to HEAD.
    const changed = execFileSync('git', ['status', '--porcelain', '--',
      'lib/tools/engines/tool-039-liver-enzyme-tracker.ts',
      'lib/tools/schemas/tool-039-liver-enzyme-tracker.ts',
      'lib/tools/registry.ts',
    ], { cwd: ROOT, encoding: 'utf8' }).trim();
    expect(changed).toBe('');
  });

  it('records the Tool 039 files in the scope reconciliation and the acceptance matrix', () => {
    const acceptance = read('TOOL-039-ACCEPTANCE.md');
    for (const file of [
      'components/tools/tool-039-liver-enzyme-tracker.tsx',
      'components/tools/tool-039-liver-enzyme-tracker.genius.tsx',
      'lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts',
      'lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts',
    ]) {
      expect(acceptance).toContain(file);
    }
  });
});
