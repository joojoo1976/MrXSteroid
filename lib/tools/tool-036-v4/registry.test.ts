/**
 * Tool-036 V4 — rule registry tests (design-v4-ar.md §4, gates C1.2–C1.4).
 *
 * These tests are the completeness net required by decision R7: no
 * health-related constant from the V3 engine may reach the UI without a
 * governing registry entry, and no rule may be 'active' without a source
 * and an applicability statement.
 */
import { describe, it, expect } from 'vitest';
import { RULES, RULE_BY_ID, MEDICAL_RULES, PRODUCT_RULES, ENGINE_CLAIMS } from './rules/registry';
import { medicalRuleSchema } from './contracts';
import {
  ESTER_PROFILES,
  classifyVolumeZone,
  siteCeilingMl,
  classifyPain,
  validateRotation,
} from '@/lib/tools/engines/tool-036-injection-schedule';

/**
 * The engine claims that MUST stay mapped — removing any entry fails here.
 *
 * Merge note (V3 G-05): this list previously also carried
 * `healingStatus.min7optimal14` and imported `healingStatus` from the V3
 * engine. That export was DELETED by the V3 audit fix because it inferred a
 * healing/readiness window from elapsed time. V4 is the only owner of that
 * concern now: decision R2 registers `healing-window-7-14` as `disabled` with
 * an unverified provenance, and nothing in V4 consumes a V3 timing helper for
 * it. The R2 assertions below therefore read the registry, not the V3 engine,
 * so the two branches can merge in either order without a broken import.
 *
 * Every remaining claim maps to a live V3 export and is asserted against the
 * real function in the "engine constants" test below.
 */
const REQUIRED_ENGINE_CLAIMS = [
  'ESTER_PROFILES.halfLifeDays',
  'classifyVolumeZone.bands',
  'siteCeilingMl.per-site',
  'classifyPain.bands',
  'validateRotation.minDays7',
];

describe('V4 rule registry — schema validity (C1.2)', () => {
  it('every registry entry parses against medicalRuleSchema', () => {
    for (const rule of RULES) {
      expect(medicalRuleSchema.safeParse(rule).success, `rule ${rule.ruleId}`).toBe(true);
    }
  });

  it('rule ids are unique', () => {
    const ids = RULES.map((r) => r.ruleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('both arrays are indexed under RULE_BY_ID', () => {
    expect(MEDICAL_RULES.length).toBeGreaterThan(0);
    expect(PRODUCT_RULES.length).toBeGreaterThan(0);
    expect(Object.keys(RULE_BY_ID).length).toBe(RULES.length);
  });
});

describe('V4 rule registry — engine-claim completeness (C1.2)', () => {
  it('maps every required engine claim', () => {
    for (const key of REQUIRED_ENGINE_CLAIMS) {
      expect(Object.keys(ENGINE_CLAIMS), `missing mapping for ${key}`).toContain(key);
    }
  });

  it('every ENGINE_CLAIMS value resolves to a registered rule', () => {
    for (const [key, ruleId] of Object.entries(ENGINE_CLAIMS)) {
      expect(RULE_BY_ID[ruleId], `${key} -> unknown rule ${ruleId}`).toBeDefined();
    }
  });

  it('the engine constants the claims describe actually exist with the stated semantics', () => {
    // ESTER_PROFILES: every compound carries an evidence entry (source+confidence).
    expect(Object.keys(ESTER_PROFILES).length).toBeGreaterThanOrEqual(7);
    for (const profile of Object.values(ESTER_PROFILES)) {
      expect(profile.evidence.evidenceId).toBeTruthy();
      expect(['High', 'Moderate', 'Low']).toContain(profile.evidence.confidence);
    }
    // classifyVolumeZone bands as documented: >5 red, >2 or over ceiling yellow.
    expect(classifyVolumeZone(6, 'deltoid-l').zone).toBe('red');
    expect(classifyVolumeZone(3, 'ventro-l').zone).toBe('yellow');
    expect(classifyVolumeZone(1, 'ventro-l').zone).toBe('green');
    // siteCeilingMl returns a per-site ceiling with evidence.
    expect(siteCeilingMl('deltoid-l').ceilingMl).toBeGreaterThan(0);
    expect(siteCeilingMl('deltoid-l').evidence.evidenceId).toBeTruthy();
    // classifyPain exists and classifies a score.
    expect(classifyPain(0)).toBeTruthy();
    // validateRotation defaults are the 7/14 spacing the preference rule generalises.
    const uses = [
      { siteId: 'dorso-l', dayIndex: 0 },
      { siteId: 'dorso-l', dayIndex: 3 },
    ];
    expect(validateRotation(uses).some((v) => v.severity === 'error')).toBe(true);
    // The two spacing thresholds the `validateRotation.minDays7` claim names are
    // real: a 3-day rest is an error (< 7) and a 10-day rest is only a warning
    // (< 14). This replaces the old `healingStatus(0)` check — that helper was
    // removed by the V3 audit (G-05) and must not come back through V4.
    const warnUses = [
      { siteId: 'dorso-l', dayIndex: 0 },
      { siteId: 'dorso-l', dayIndex: 10 },
    ];
    const warnViolations = validateRotation(warnUses);
    expect(warnViolations.some((v) => v.severity === 'warning')).toBe(true);
    expect(warnViolations.some((v) => v.severity === 'error')).toBe(false);
  });
});

describe('V4 rule registry — provenance policy (C1.3, R2/R3/R7)', () => {
  it('every rule carries a source ref and an applicability statement', () => {
    for (const rule of RULES) {
      expect(rule.source.ref.trim().length, rule.ruleId).toBeGreaterThan(0);
      expect(rule.applicabilityEn.trim().length, rule.ruleId).toBeGreaterThan(0);
      expect(rule.applicabilityAr.trim().length, rule.ruleId).toBeGreaterThan(0);
      expect(rule.claimEn.trim().length, rule.ruleId).toBeGreaterThan(0);
      expect(rule.claimAr.trim().length, rule.ruleId).toBeGreaterThan(0);
    }
  });

  it('no non-unverified active rule claims "None" confidence', () => {
    for (const rule of RULES) {
      if (rule.status !== 'active') continue;
      if (rule.source.type === 'unverified') continue;
      expect(rule.source.confidence, rule.ruleId).not.toBe('None');
    }
  });

  it('medical rules that are not disabled never rely on unverified sources unless explicitly informational', () => {
    for (const rule of MEDICAL_RULES) {
      if (rule.status !== 'active' || rule.source.type !== 'unverified') continue;
      // Unverified medical entries are permitted only as scope statements /
      // informational inputs — both are named in their claims.
      expect(/informational|no diagnostic|self-report/i.test(rule.claimEn), rule.ruleId).toBe(true);
    }
  });
});

describe('V4 rule registry — decision R2 (healing window disabled)', () => {
  it('the 7/14 healing window is registered but disabled and unusable for inference', () => {
    const rule = RULE_BY_ID['healing-window-7-14'];
    expect(rule).toBeDefined();
    expect(rule.status).toBe('disabled');
    expect(rule.source.confidence).toBe('None');
    expect(rule.applicabilityEn).toMatch(/never be used/i);
  });

  it('no active rule makes a readiness or safety inference from elapsed days', () => {
    for (const rule of RULES) {
      if (rule.status !== 'active') continue;
      expect(/ready|readiness|safe to use|جاهز|آمن/i.test(rule.claimEn + rule.applicabilityEn), rule.ruleId).toBe(false);
    }
  });
});

describe('V4 rule registry — decision R3 (rest spacing is a preference)', () => {
  it('the rest-spacing rule is a product rule, not medical, and says adherence proves nothing', () => {
    const rule = RULE_BY_ID['rotation-rest-preference'];
    expect(rule.kind).toBe('product');
    expect(rule.status).toBe('active');
    expect(rule.applicabilityEn).toMatch(/preference breach, never as a safety warning/i);
  });
});

/**
 * G-04: the preview shows tolerance and rest spacing as read-only values. No
 * rule may describe them as user-editable, because no editing control exists.
 */
describe('V4 rule registry — claims match the capabilities actually shipped (G-04)', () => {
  it('no rule claims a value the preview lets the user edit', () => {
    for (const rule of RULES) {
      const text = [
        rule.claimEn,
        rule.claimAr,
        rule.source.ref,
        rule.applicabilityEn,
        rule.applicabilityAr,
      ].join(' ');
      expect(text, rule.ruleId).not.toMatch(/user-editable|قابل للتعديل/i);
      // A bare mention of "editable" is only acceptable as an explicit denial.
      if (/\beditable\b/i.test(text)) {
        expect(text, rule.ruleId).toMatch(/not editable in this preview/i);
      }
    }
  });

  it('the rest-spacing rule says the shown value is the fixed current default', () => {
    const rule = RULE_BY_ID['rotation-rest-preference'];
    expect(rule.claimEn).toMatch(/not editable in this preview/i);
    expect(rule.claimEn).toMatch(/default/i);
    expect(rule.claimAr).toContain('غير قابلة للتحرير');
  });

  it('the tolerance rule describes a current value, not a user-edited one', () => {
    const rule = RULE_BY_ID['drift-matching-tolerance'];
    expect(rule.claimEn).toMatch(/not editable in this preview/i);
  });
});
