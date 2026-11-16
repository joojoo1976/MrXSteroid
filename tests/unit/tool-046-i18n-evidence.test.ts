// tests/unit/tool-046-i18n-evidence.test.ts
//
// Re-runnable evidence for the Tool 046 AR/EN structural copy. The check is a
// script so a reviewer can run it without the test runner; this test only
// asserts its verdict, so a missing key, an empty value, a contamination, a
// contract label map entry or a component key without a translation fails the
// battery.
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const DOCS = join(process.cwd(), 'docs', 'MRX Genius Cloud Unified R6.1');

describe('Tool 046 i18n evidence', () => {
  it('keeps AR/EN parity, every required key and no contamination', () => {
    const output = execFileSync(process.execPath, [join(DOCS, 'tool-046-i18n-check.mjs')], {
      encoding: 'utf8',
    });
    expect(output).toMatch(/I18N_PARITY: OK/);
    const counts = output.match(/keys: en = (\d+), ar = (\d+)/);
    expect(counts).not.toBeNull();
    expect(counts?.[1]).toBe(counts?.[2]);
    expect(output).toMatch(/required keys absent: none/);
    expect(output).toMatch(/stray Latin words in ar: none/);
    expect(output).toMatch(/unresolved t\.\* keys: none/);
    expect(output).toMatch(/unresolved contract keys: none/);
  });
});
