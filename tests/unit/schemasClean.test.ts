/**
 * tests/unit/schemasClean.test.ts
 * Guard against generated-file artifacts: an earlier PowerShell-based generator
 * emitted `` `nexport const schema = …;` `` (a template-literal no-op) at the end
 * of tool schemas. These lines are dead code and their intended `schema` export
 * never materializes — pin the schemas directory clean of this artifact.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SCHEMAS_DIR = join(process.cwd(), 'lib', 'tools', 'schemas');

describe('tool schemas hygiene', () => {
  it('no schema file contains a `nexport template-literal artifact', () => {
    const offenders: string[] = [];
    for (const f of readdirSync(SCHEMAS_DIR)) {
      if (!f.endsWith('.ts')) continue;
      const src = readFileSync(join(SCHEMAS_DIR, f), 'utf8');
      if (src.includes('`nexport') || src.includes('`n')) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it('no schema file contains stray lone-backtick lines', () => {
    const offenders: string[] = [];
    for (const f of readdirSync(SCHEMAS_DIR)) {
      if (!f.endsWith('.ts')) continue;
      const lines = readFileSync(join(SCHEMAS_DIR, f), 'utf8').split(/\r?\n/);
      if (lines.some((l) => /^`/.test(l.trim()))) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
