// lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts
//
// RED phase for the Tool 039 LOCAL, DEVICE-ONLY history store.
//
// Owner decision D-08 (Option A). The store:
//   - writes NOTHING until the user has explicitly consented;
//   - keeps the values off the server entirely (no network call anywhere);
//   - does NOT store the medical values as readable plain text in the device
//     storage (the shared SecureStorage helper was measured to fall back to
//     PLAINTEXT in this app's browser bundle, so it is not used here);
//   - isolates two independent device profiles from each other;
//   - deletes the stored data when the consent is withdrawn.
//
// The storage adapter is injected, so the suite runs in the node project and
// two independent "devices" can be simulated exactly.
import { describe, expect, it, vi } from 'vitest';
import {
  TOOL_039_HISTORY_ENVELOPE_KEY,
  TOOL_039_HISTORY_KEY_STORAGE_KEY,
  createTool039HistoryStore,
  type Tool039StorageAdapter,
} from './tool-039-liver-enzyme-tracker-history-store';

function memoryStorage(): Tool039StorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); },
    removeItem: (key) => { map.delete(key); },
    dump: () => Object.fromEntries(map),
  };
}

const RESULT = {
  overall_status: 'elevated' as const,
  stop_orals: false,
  markers: [
    { marker: 'ALT', latest_value: 112, unit: 'U/L', uln_multiple: 2, status: 'elevated' as const, trend_per_30d: 0 },
  ],
};

const INPUT = {
  readings: [{ marker: 'ALT', value: 112, unit: 'U/L', date: '2026-02-01' }],
};

function makeStore(storage = memoryStorage(), now = '2026-03-01T00:00:00.000Z') {
  let counter = 0;
  return createTool039HistoryStore({
    storage,
    now: () => now,
    newId: () => `entry-${++counter}`,
    newKey: () => 'test-installation-key',
  });
}

describe('Tool 039 local history store', () => {
  it('writes nothing until the user has consented', () => {
    const storage = memoryStorage();
    const store = makeStore(storage);

    expect(store.isConsented()).toBe(false);
    const saved = store.save(INPUT, RESULT);
    expect(saved).toBeNull();
    expect(storage.dump()[TOOL_039_HISTORY_ENVELOPE_KEY]).toBeUndefined();
    expect(store.list()).toEqual([]);
  });

  it('saves the engine result after consent and reads it back', () => {
    const storage = memoryStorage();
    const store = makeStore(storage);
    store.grantConsent();

    const saved = store.save(INPUT, RESULT);
    expect(saved).not.toBeNull();
    expect(saved?.overallStatus).toBe('elevated');

    const listed = store.list();
    expect(listed).toHaveLength(1);
    expect(listed[0].markers[0].latestValue).toBe(112);
    expect(listed[0].drawDate).toBe('2026-02-01');
  });

  it('does not store the medical values as readable plain text in the device storage', () => {
    const storage = memoryStorage();
    const store = makeStore(storage);
    store.grantConsent();
    store.save(INPUT, RESULT);

    const raw = JSON.stringify(storage.dump());
    expect(raw).not.toContain('112');
    expect(raw).not.toContain('U/L');
    expect(raw).not.toContain('elevated');
  });

  it('never calls the network', () => {
    const fetchSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    try {
      const store = makeStore();
      store.grantConsent();
      store.save(INPUT, RESULT);
      store.list();
      store.rate('entry-1', 5, 'great');
      store.remove('entry-1');
      store.clear();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('keeps two independent device profiles apart', () => {
    const deviceA = memoryStorage();
    const deviceB = memoryStorage();
    const storeA = makeStore(deviceA);
    const storeB = makeStore(deviceB);

    storeA.grantConsent();
    storeA.save(INPUT, RESULT);

    expect(storeA.list()).toHaveLength(1);
    expect(storeB.list()).toHaveLength(0);
    expect(storeB.isConsented()).toBe(false);
  });

  it('deletes the stored data when the consent is withdrawn', () => {
    const storage = memoryStorage();
    const store = makeStore(storage);
    store.grantConsent();
    store.save(INPUT, RESULT);
    expect(storage.dump()[TOOL_039_HISTORY_ENVELOPE_KEY]).toBeDefined();

    store.revokeConsent();
    expect(store.list()).toEqual([]);
    expect(store.isConsented()).toBe(false);
    expect(storage.dump()[TOOL_039_HISTORY_ENVELOPE_KEY]).toBeUndefined();
  });

  it('deletes one entry and deletes them all', () => {
    const storage = memoryStorage();
    let counter = 0;
    const store = createTool039HistoryStore({
      storage,
      now: () => '2026-03-01T00:00:00.000Z',
      newId: () => `entry-${++counter}`,
      newKey: () => 'test-installation-key',
    });
    store.grantConsent();
    store.save(INPUT, RESULT);
    store.save({ readings: [{ marker: 'AST', value: 30, unit: 'U/L', date: '2026-02-02' }] }, RESULT);
    expect(store.list()).toHaveLength(2);

    expect(store.remove('entry-1')).toBe(true);
    expect(store.list()).toHaveLength(1);

    store.clear();
    expect(store.list()).toEqual([]);
  });

  it('binds a rating to one saved result and keeps it across a reload', () => {
    const storage = memoryStorage();
    let counter = 0;
    const options = {
      storage,
      now: () => '2026-03-01T00:00:00.000Z',
      newId: () => `entry-${++counter}`,
      newKey: () => 'test-installation-key',
    };
    const store = createTool039HistoryStore(options);
    store.grantConsent();
    store.save(INPUT, RESULT);
    store.save({ readings: [{ marker: 'AST', value: 30, unit: 'U/L', date: '2026-02-02' }] }, RESULT);

    expect(store.rate('entry-1', 4, 'solid')).toBe(true);

    // A fresh store over the same device storage is what a page reload sees.
    const reloaded = createTool039HistoryStore({ ...options, newId: () => 'entry-ignored' });
    const entries = reloaded.list();
    expect(entries).toHaveLength(2);
    const rated = entries.find((entry) => entry.id === 'entry-1');
    const untouched = entries.find((entry) => entry.id === 'entry-2');
    expect(rated?.rating).toBe(4);
    expect(rated?.comment).toBe('solid');
    expect(untouched?.rating).toBeNull();
  });

  it('prunes entries that fall outside the retention window when they are read', () => {
    const storage = memoryStorage();
    const store = makeStore(storage, '2026-03-01T00:00:00.000Z');
    store.grantConsent();
    store.save({ readings: [{ marker: 'ALT', value: 80, unit: 'U/L', date: '2024-01-01' }] }, RESULT);
    // Saved today -> retained, even though the draw date is old.
    expect(store.list()).toHaveLength(1);

    // More than a year after it was saved -> outside the 365 day window.
    const future = createTool039HistoryStore({
      storage,
      now: () => '2027-06-01T00:00:00.000Z',
      newId: () => 'x',
      newKey: () => 'test-installation-key',
    });
    expect(future.list()).toHaveLength(0);
  });

  it('never writes a medical value or a comment to the console', () => {
    const logs: string[] = [];
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((level) =>
      vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
        logs.push(args.map((a) => String(a)).join(' '));
      }),
    );

    try {
      const store = makeStore();
      store.grantConsent();
      store.save(INPUT, RESULT);
      store.rate('entry-1', 5, 'my private comment about my liver');
      const joined = logs.join('\n');
      expect(joined).not.toContain('112');
      expect(joined).not.toContain('my private comment');
      expect(joined).not.toContain('U/L');
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });

  it('generates a per-installation key so the stored blob is not portable without it', () => {
    const storage = memoryStorage();
    const store = createTool039HistoryStore({
      storage,
      now: () => '2026-03-01T00:00:00.000Z',
      newId: () => 'entry-1',
      newKey: () => 'installation-specific-key',
    });
    store.grantConsent();
    store.save(INPUT, RESULT);

    expect(storage.dump()[TOOL_039_HISTORY_KEY_STORAGE_KEY]).toBe('installation-specific-key');
  });
});
