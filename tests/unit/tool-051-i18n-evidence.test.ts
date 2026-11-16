// tests/unit/tool-051-i18n-evidence.test.ts
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const DOCS = join(process.cwd(), 'docs', 'MRX Genius Cloud Unified R6.1');

describe('Tool 051 i18n evidence', () => {
  it('keeps AR/EN parity, every required key and no contamination', () => {
    const output = execFileSync(process.execPath, [join(DOCS, 'tool-051-i18n-check.mjs')], {
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
