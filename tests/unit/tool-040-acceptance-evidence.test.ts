// tests/unit/tool-040-acceptance-evidence.test.ts
//
// Evidence tests for the Tool 040 acceptance package. They turn the
// document-level acceptance requirements into re-runnable proof (E3) instead
// of "a file exists" (E2), and they enforce two rules that are specific to
// Tool 040:
//
//   1. every requirement excluded from the Tool 040 denominator must still be
//      recorded in the system requirement register;
//   2. the owner decision (C) was APPROVED on every applicable row by the owner
//      (final decision 2026-11-13, Tool 040 closed as OWNER_ACCEPTED) — the
//      developer never records an owner decision, and the D-08 storage
//      exception that Tool 039 holds must not leak into this tool.
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
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1);
}

describe('Tool 040 acceptance evidence package', () => {
  it('publishes exactly ten tool-specific proposals, each with inputs, outputs, risks, cost, tests and acceptance criteria', () => {
    const file = join(DOCS, 'TOOL-040-DEVELOPMENT-PROPOSALS.md');
    expect(existsSync(file)).toBe(true);
    const text = read('TOOL-040-DEVELOPMENT-PROPOSALS.md');

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

  it('reconciles the Tool 040 scope row as tested and pointing at the acceptance file', () => {
    const csv = read('scope-reconciliation-286.csv');
    const row = csv.split('\n').find((line) => line.startsWith('SR-049,'));
    expect(row).toBeDefined();
    expect(row).toMatch(/component_exists,tested,/);
    expect(row).toMatch(/TOOL-040-ACCEPTANCE\.md/);
  });

  it('ships the acceptance package with a manifest, hashes, a conflict log, a crosswalk, a tracker and the ledger', () => {
    const manifest = read('R6.1-ACTIVATION-MANIFEST.md');
    expect(manifest).toMatch(/SHA-256/);
    expect(manifest).toMatch(/SPEC\.md/);
    expect(manifest).toMatch(/ACCEPTANCE_CRITERIA\.md/);
    expect(manifest).toMatch(/R6\.1-CLOSURE-LAYER\.md/);

    const acceptance = read('TOOL-040-ACCEPTANCE.md');
    expect(acceptance).toMatch(/Conflict/); // the activation-status conflict record
    expect(acceptance).toMatch(/GENIUS-12/); // the crosswalk is referenced
    expect(acceptance).toMatch(/\d+ \/ \d+ = \d+\.\d+%/); // the computed figure is present
    expect(acceptance).toMatch(/Completion/);

    const crosswalk = read('TOOL-040-GENIUS12-CROSSWALK.md');
    expect(crosswalk).toMatch(/Box 11 — Alternative Paths/);
    expect(crosswalk).toMatch(/History/);
    expect(crosswalk).toMatch(/Rating/);

    const tracker = read('W01-W24-CONFLICT-TRACKER.md');
    expect(tracker).toMatch(/Tool 039 closed on 2026-11-11/);

    const ledger = read('tool-040-requirements.csv');
    expect(ledger).toMatch(/req_id,requirement,applicability/);
  });

  it('records the activation conflict and the owner decision exactly as it was given', () => {
    const acceptance = read('TOOL-040-ACCEPTANCE.md');
    expect(acceptance).toMatch(/R6\.1-ACTIVATION-DECISION\.md/);
    expect(acceptance).toMatch(/2026-11-09/);

    // The owner reviewed the published Preview and decided OWNER_ACCEPTED
    // (2026-11-13). The decision (C) is APPROVED on every APPLICABLE row.
    expect(acceptance).toMatch(/OWNER_ACCEPTED/);
    expect(acceptance).toMatch(/92 applicable rows/);

    const ledger = read('tool-040-requirements.csv');
    const rows = parseCsv(ledger).slice(1);
    const header = parseCsv(ledger)[0];
    const iApplicability = header.indexOf('applicability');
    const iC = header.indexOf('C');

    const applicable = rows.filter((cells) => !cells[iApplicability].startsWith('NOT_APPLICABLE'));
    const excluded = rows.filter((cells) => cells[iApplicability].startsWith('NOT_APPLICABLE'));

    // Every applicable row carries the owner's approval; nothing is left PENDING.
    expect(applicable.length).toBe(92);
    expect(applicable.every((cells) => cells[iC] === 'APPROVED')).toBe(true);
    expect(rows.some((cells) => cells[iC] === 'PENDING')).toBe(false);

    // The excluded rows are not applicable, so they carry no decision; they are
    // excluded with a recorded proof and stay in the system requirement register.
    expect(excluded.length).toBe(31);
    expect(excluded.every((cells) => cells[iC] === 'NOT_DECISIONED')).toBe(true);
    expect(excluded.every((cells) => cells[iApplicability].length > 40)).toBe(true);
  });

  it('keeps the Tool 039 owner decision untouched while Tool 040 is closed', () => {
    const tool039 = read('tool-039-requirements.csv');
    const tool039Rows = parseCsv(tool039).slice(1);
    const header = parseCsv(tool039)[0];
    const iApplicability = header.indexOf('applicability');
    const iC = header.indexOf('C');
    const applicable039 = tool039Rows.filter((cells) => !cells[iApplicability].startsWith('NOT_APPLICABLE'));
    // Tool 039 was accepted by the owner on 2026-11-12; that decision stands.
    expect(applicable039.every((cells) => cells[iC] === 'APPROVED')).toBe(true);
  });

  it('never claims the D-08 storage exception for Tool 040', () => {
    const source = readFileSync(join(ROOT, 'components', 'tools', 'tool-040-lipid-profile-optimizer.tsx'), 'utf8');
    // No persistence of any kind.
    expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
    expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest/);
    // The UI never calls the engine directly.
    expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-040/);
    expect(source).toMatch(/runLipidProfileOptimizer/);

    // The ledger states the same thing, in words.
    const ledger = read('tool-040-requirements.csv');
    expect(ledger).toMatch(/D-08 \(Option A - local, device-only storage\) was granted for TOOL 039 ONLY/);
  });

  it('records the real-browser evidence with the measured 390 px legibility figure', () => {
    const file = join(DOCS, 'evidence', 'tool040', 'tool-040-browser-verification.json');
    expect(existsSync(file)).toBe(true);
    const evidence = JSON.parse(readFileSync(file, 'utf8'));

    expect(Array.isArray(evidence.results)).toBe(true);
    expect(evidence.results.length).toBe(28);
    const failures = evidence.results.filter((entry: { result: string }) => entry.result !== 'PASS');
    expect(failures).toEqual([]);

    // The measured legibility figure is recorded, not asserted.
    expect(evidence.legibility390).toBeTruthy();
    expect(evidence.legibility390.desktopSvgHidden).toBe(true);
    expect(evidence.legibility390.visibleTextCount).toBeGreaterThanOrEqual(5);
    expect(evidence.legibility390.smallest).toBeGreaterThanOrEqual(12);

    // The three screenshots exist.
    for (const name of ['tool-040-desktop-1440.png', 'tool-040-mobile-390.png', 'tool-040-arabic-rtl-1440.png']) {
      expect(existsSync(join(DOCS, 'evidence', 'tool040', name))).toBe(true);
    }

    // The E4 evidence (retained from the published Preview) is the published run.
    const publishedFile = join(DOCS, 'evidence', 'tool040-published', 'tool-040-browser-verification.json');
    expect(existsSync(publishedFile)).toBe(true);
    const publishedEvidence = JSON.parse(readFileSync(publishedFile, 'utf8'));
    expect(Array.isArray(publishedEvidence.results)).toBe(true);
    expect(publishedEvidence.results.length).toBe(28);
    expect(publishedEvidence.results.filter((entry: { result: string }) => entry.result !== 'PASS')).toEqual([]);
  });

  it('keeps the AR/EN copy complete and free of contamination', () => {
    const output = execFileSync(
      process.execPath,
      [join(DOCS, 'tool-040-i18n-check.mjs')],
      { encoding: 'utf8' },
    );
    expect(output).toMatch(/I18N_PARITY: OK/);
    const keyCounts = output.match(/keys: en = (\d+), ar = (\d+)/);
    expect(keyCounts).not.toBeNull();
    expect(keyCounts?.[1]).toBe(keyCounts?.[2]);
    expect(output).toMatch(/CJK\/Hangul contamination count: 0/);
    expect(output).toMatch(/stray Latin words in ar: none/);
  });

  it('recomputes the acceptance figures from the ledger without hand arithmetic', () => {
    const output = execFileSync(
      process.execPath,
      [join(DOCS, 'tool-040-acceptance-calc.mjs')],
      { encoding: 'utf8' },
    );
    expect(output).toMatch(/ledger rows \(atomic requirements enumerated\) : 123/);
    expect(output).toMatch(/applicable to Tool 040 \(denominator\)        : 92/);
    expect(output).toMatch(/not applicable \(excluded, with reason\)       : 31/);
    expect(output).toMatch(/completion = 92 \/ 92 \* 100 = 100\.00%/);
    expect(output).toMatch(/LEDGER_INTEGRITY: OK/);
    // The owner decision is closed: APPROVED on every applicable row.
    expect(output).toMatch(/C status counts \(owner\)\s*: \{"APPROVED":92,"NOT_DECISIONED":31\}/);
  });

  it('keeps every excluded requirement recorded in the system requirement register', () => {
    const ledger = read('tool-040-requirements.csv');
    const register = read('R6.1-SYSTEM-REQUIREMENT-REGISTER.md');

    const rows = parseCsv(ledger).slice(1);
    const header = parseCsv(ledger)[0];
    const iApplicability = header.indexOf('applicability');
    const excluded = rows
      .map((cells) => ({ id: cells[0], applicability: cells[iApplicability] }))
      .filter((row) => row.applicability.startsWith('NOT_APPLICABLE'));

    expect(excluded.length).toBe(31);
    // Every excluded requirement is named in the register.
    for (const row of excluded) {
      expect(register).toContain(row.id);
    }
    // The register keeps the platform owner for every excluded row.
    expect(register).toMatch(/Tool 040/);
  });

  it('records the ledger change log with the round that built the ledger', () => {
    const log = read('tool-040-ledger-change-log.md');
    expect(log).toMatch(/## Round 1/);
    expect(log).toMatch(/## Round 2/);
    expect(log).toMatch(/92 \/ 92 = 100\.00%/);
    // The rows that differ from Tool 039 are named.
    expect(log).toMatch(/SPEC-R6\.1-4\.f/);
    expect(log).toMatch(/LAYER-GENIUS12-11/);
    expect(log).toMatch(/LAYER-GENIUS12-12-RATING/);
  });
});
