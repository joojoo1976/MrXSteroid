import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * R5 accessibility guard: the shared slider must expose a 44px touch target
 * even though the visible track stays thin (8px). This is a CSS contract
 * because jsdom does not apply CSS-module styles.
 */
describe('R5 slider touch target', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'components/tools/tool-pilot-v4.module.css'),
    'utf8'
  );

  it('gives the range input a 44px hit area with a thin painted track', () => {
    const rule = css.match(/\.dynamic-slider-field__range\)\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(rule).toMatch(/height:\s*2\.75rem/);
    expect(rule).toMatch(/background-size:\s*100%\s*0\.5rem/);
    expect(rule).toMatch(/background-repeat:\s*no-repeat/);
    expect(rule).toMatch(/background-position:\s*center/);
  });
});
