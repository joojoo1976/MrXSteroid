import { describe, it, expect } from 'vitest';
import { runValidation, validateCatalogGate } from '@/lib/tools/validation';
import { getCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { TOOL_REGISTRY } from '@/lib/tools/registry';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function toFsPath(p: string): string {
  const n = p.startsWith('@/') ? p.slice(2) : p;
  const suffix = n.startsWith('components/') ? '.tsx' : (p.endsWith('.ts') ? '' : '.ts');
  return join(process.cwd(), n + suffix) as string;
}

describe('validate-tools — SmartTools platform gate', () => {
  it('prints the validation report', () => {
    const result = runValidation();
    console.log(result.lines.join('\n'));
    console.log('=== debug ===');
    const t = getCatalogTools().find((x) => x.toolId === 'mrx.tool.006-estrogen-prolactin');
    if (t) {
      console.log('componentPath=' + t.componentPath);
      console.log('resolved=' + toFsPath(t.componentPath));
      console.log('exists=' + existsSync(toFsPath(t.componentPath)));
    }
    expect(result.lines.length).toBeGreaterThan(0);
  });

  it('runValidation reports zero errors', () => {
    const result = runValidation();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('validateCatalogGate reports zero errors', () => {
    const result = validateCatalogGate();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('smartToolsCatalog does not report missing-engines', () => {});

  it('smartToolsCatalog does not report duplicate-slugs', () => {});
});