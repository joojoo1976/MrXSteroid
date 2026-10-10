/**
 * tests/unit/legacyRoutes.test.ts
 * PAGE_TO_PATH is typed `Record<Page, string>` — a new Page enum member without
 * a mapping is a compile error (latent behind parse errors) AND a runtime bug
 * (pageToPath falls back to '/'). This test pins the contract: every Page
 * enum member must have an explicit, canonical path.
 */
import { describe, it, expect } from 'vitest';
import { Page } from '@/shared/types/types';
import { PAGE_TO_PATH, pageToPath } from '@/lib/legacy-routes';

describe('PAGE_TO_PATH completeness', () => {
  it('has an explicit entry for every Page enum member', () => {
    const missing = Object.values(Page).filter((p) => !(p in PAGE_TO_PATH));
    expect(missing).toEqual([]);
  });

  it('never falls back to "/" for a real Page (HOME maps to "/" explicitly)', () => {
    for (const p of Object.values(Page)) {
      if (p === Page.HOME) continue;
      expect(pageToPath(p), `pageToPath(${p}) must not fall back`).not.toBe('/');
    }
  });

  it('maps the 036-040 batch to their canonical smarttools routes', () => {
    expect(PAGE_TO_PATH[Page.INJECTION_SCHEDULE]).toBe('/smarttools/tool-036-injection-schedule');
    expect(PAGE_TO_PATH[Page.SIDE_EFFECT_PROBABILITY]).toBe('/smarttools/tool-037-side-effect-probability');
    expect(PAGE_TO_PATH[Page.STACK_COMPATIBILITY]).toBe('/smarttools/tool-038-stack-compatibility');
    expect(PAGE_TO_PATH[Page.LIVER_ENZYME_TRACKER]).toBe('/smarttools/tool-039-liver-enzyme-tracker');
    expect(PAGE_TO_PATH[Page.LIPID_PROFILE_OPTIMIZER]).toBe('/smarttools/tool-040-lipid-profile-optimizer');
  });
});
