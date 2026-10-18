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
  healingStatus,
  classifyPain,
  validateRotation,
} from '@/lib/tools/engines/tool-036-injection-schedule';

/** The engine claims that MUST stay mapped — removing any entry fails here. */
const REQUIRED_ENGINE_CLAIMS = [
  'ESTER_PROFILES.halfLifeDays',
  'classifyVolumeZone.bands',
  'siteCeilingMl.per-site',
  'classifyPain.bands',
  'healingStatus.min7optimal14',
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
    // healingStatus defaults are exactly the 7/14 constants the disabled rule names.
    const healing = healingStatus(0);
    expect(healing.minDays).toBe(7);
    expect(healing.optimalDays).toBe(14);
    // classifyPain exists and classifies a score.
    expect(classifyPain(0)).toBeTruthy();
    // validateRotation defaults are the 7/14 spacing the preference rule generalises.
    const uses = [
      { siteId: 'dorso-l', dayIndex: 0 },
      { siteId: 'dorso-l', dayIndex: 3 },
    ];
    expect(validateRotation(uses).some((v) => v.severity === 'error')).toBe(true);
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
