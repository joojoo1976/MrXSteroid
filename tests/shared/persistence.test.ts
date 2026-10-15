// tests/shared/persistence.test.ts
/**
 * Persistence Service Integration Tests
 * Tests for lib/shared/persistence.ts
 */

import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import {
  persistence,
  getStorageKey,
  getBrowserStorage,
  DRAFT_SCHEMA_VERSION,
  AUTO_SAVE_DEBOUNCE_MS,
} from '@/lib/shared/persistence';

describe('Persistence Service Integration Tests', () => {
  // Node-environment shim: tests/shared runs in the vitest `node` project
  // (vitest.config.ts) — no `window`, but Node DOES ship a native global
  // `localStorage` that is invisible to the lib's `window` gate. Install an
  // in-memory browser shim via stubGlobal/unstubAllGlobals so persistence tests
  // exercise REAL lib code paths (not SSR early-returns). Restored in afterEach.
  const store: Record<string, string> = {};
  const memoryStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
  const hadWindow = typeof (globalThis as unknown as Record<string, unknown>)['window'] !== 'undefined';

  beforeEach(() => {
    memoryStorage.clear();
    vi.stubGlobal('window', { localStorage: memoryStorage });
    vi.stubGlobal('localStorage', memoryStorage);
  });

  afterEach(() => {
    memoryStorage.clear();
    vi.unstubAllGlobals();
    if (!hadWindow) {
      delete (globalThis as unknown as Record<string, unknown>)['window'];
    }
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('State Persistence', () => {
    it('get returns null for non-existent tool', () => {
      const result = persistence.get('non-existent-tool');
      expect(result).toBeNull();
    });

    it('set and get round-trip works', () => {
      const testData = { name: 'Test', compounds: [] };
      persistence.set('test-tool', testData);
      
      const retrieved = persistence.get('test-tool');
      expect(retrieved).toEqual({ ...testData, updated_at: expect.any(String) });
    });

    it('set merges with existing state', () => {
      persistence.set('test-tool', { name: 'Test' });
      persistence.set('test-tool', { compounds: ['compound1'] });
      
      const retrieved = persistence.get('test-tool');
      expect(retrieved).toEqual({
        name: 'Test',
        compounds: ['compound1'],
        updated_at: expect.any(String),
      });
    });

    it('updates updated_at timestamp', () => {
      persistence.set('test-tool', { name: 'Test' });
      const first = persistence.get('test-tool');
      
      // Small delay to ensure timestamp changes
      const start = Date.now();
      while (Date.now() - start < 10) {}
      
      persistence.set('test-tool', { name: 'Test Updated' });
      const second = persistence.get('test-tool');
      
      expect(second.updated_at).not.toBe(first.updated_at);
    });

    it('handles non-existent tool gracefully', () => {
      expect(() => persistence.set('new-tool', { data: 'test' })).not.toThrow();
    });
  });

  describe('Draft Persistence', () => {
    it('setDraft and getDraft round-trip', () => {
      const draftData = { value: 300, multiplier: 2 };
      persistence.setDraft('test-tool', draftData, {
        toolVersion: '1.0.0',
        locale: 'ar',
        unitSystem: 'metric',
      });
      
      const retrieved = persistence.getDraft('test-tool');
      expect(retrieved).toEqual({
        version: DRAFT_SCHEMA_VERSION,
        toolSlug: 'test-tool',
        toolVersion: '1.0.0',
        savedAt: expect.any(String),
        locale: 'ar',
        unitSystem: 'metric',
        inputs: draftData,
      });
    });

    it('clearDraft removes draft', () => {
      persistence.setDraft('test-tool', { value: 100 }, {
        toolVersion: '1.0',
        locale: 'en',
        unitSystem: 'metric',
      });
      
      persistence.clearDraft('test-tool');
      expect(persistence.getDraft('test-tool')).toBeNull();
    });

    it('handles missing draft gracefully', () => {
      expect(persistence.getDraft('non-existent')).toBeNull();
    });
  });

  describe('Storage Key Generation', () => {
    it('generates correct keys', () => {
      expect(getStorageKey('tool-010', 'state')).toBe('mrx:tool:state:tool-010');
      expect(getStorageKey('tool-010', 'draft')).toBe('mrx:tool:draft:tool-010');
    });
  });

  describe('Storage Availability', () => {
    it('isAvailable returns true in browser', () => {
      expect(persistence.isAvailable()).toBe(true);
    });
  });

  describe('Clear Operations', () => {
    it('clear removes both state and draft', () => {
      persistence.set('test-tool', { data: 'test' });
      persistence.setDraft('test-tool', { data: 'draft' }, {
        toolVersion: '1.0',
        locale: 'en',
        unitSystem: 'metric',
      });
      
      persistence.clear('test-tool');
      
      expect(persistence.get('test-tool')).toBeNull();
      expect(persistence.getDraft('test-tool')).toBeNull();
    });
  });

  describe('Constants', () => {
    it('DRAFT_SCHEMA_VERSION is 1', () => {
      expect(DRAFT_SCHEMA_VERSION).toBe(1);
    });

    it('AUTO_SAVE_DEBOUNCE_MS is 1500', () => {
      expect(AUTO_SAVE_DEBOUNCE_MS).toBe(1500);
    });
  });

  describe('Storage Availability', () => {
    it('getBrowserStorage returns storage or null', () => {
      const storage = getBrowserStorage();
      expect(storage).not.toBeNull();
    });
  });
});