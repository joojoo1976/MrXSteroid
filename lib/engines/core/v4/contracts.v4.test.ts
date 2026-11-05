/**
 * lib/engines/core/v4/contracts.v4.test.ts
 * V4.0 Architecture Foundation — Contract Tests
 */

import { describe, it, expect } from 'vitest';
import {
  CONTRACT_VERSION,
  SCHEMA_VERSION,
  ENGINE_VERSION,
  LOCALES,
  UNIT_SYSTEMS,
  ACCESS_TIERS,
  V4_COMPATIBILITY_RULES,
  V4_MODULE_VERSION,
} from './index';

describe('V4.0 Contracts — Foundation', () => {
  describe('Version Constants', () => {
    it('should have correct contract version', () => {
      expect(CONTRACT_VERSION).toBe('4.0');
    });

    it('should have correct schema version', () => {
      expect(SCHEMA_VERSION).toBe('4.0.0');
    });

    it('should have correct engine version', () => {
      expect(ENGINE_VERSION).toBe('4.0.0');
    });

    it('should have correct module version', () => {
      expect(V4_MODULE_VERSION).toBe('4.0.0');
    });
  });

  describe('Primitive Unions', () => {
    it('should define correct locales', () => {
      expect(LOCALES).toEqual(['ar', 'en']);
    });

    it('should define correct unit systems', () => {
      expect(UNIT_SYSTEMS).toEqual(['metric', 'imperial']);
    });

    it('should define correct access tiers', () => {
      expect(ACCESS_TIERS).toEqual(['free', 'premium']);
    });
  });

  describe('Compatibility Rules', () => {
    it('should have at least 4 compatibility rules', () => {
      expect(V4_COMPATIBILITY_RULES.length).toBeGreaterThanOrEqual(4);
    });

    it('should have V4-COMPAT-001 rule', () => {
      const rule = V4_COMPATIBILITY_RULES.find(r => r.ruleId === 'V4-COMPAT-001');
      expect(rule).toBeDefined();
      expect(rule!.breaking).toBe(false);
      expect(rule!.migrationRequired).toBe(false);
    });

    it('should have V4-COMPAT-002 (Macro protection) rule', () => {
      const rule = V4_COMPATIBILITY_RULES.find(r => r.ruleId === 'V4-COMPAT-002');
      expect(rule).toBeDefined();
      expect(rule!.appliesTo).toContain('mrx.tool.macro');
      expect(rule!.breaking).toBe(false);
    });

    it('all rules should be non-breaking', () => {
      expect(V4_COMPATIBILITY_RULES.every(r => r.breaking === false)).toBe(true);
    });
  });

  describe('Type Exports', () => {
    it('should export all required contract types', async () => {
      const mod = await import('./contracts.v4');
      // Verify key types exist as exports
      expect(mod.CONTRACT_VERSION).toBeDefined();
      expect(mod.SCHEMA_VERSION).toBeDefined();
      expect(mod.ENGINE_VERSION).toBeDefined();
      expect(mod.LOCALES).toBeDefined();
      expect(mod.UNIT_SYSTEMS).toBeDefined();
      expect(mod.ACCESS_TIERS).toBeDefined();
      expect(mod.V4_COMPATIBILITY_RULES).toBeDefined();
    });
  });
});