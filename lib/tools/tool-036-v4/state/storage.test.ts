/**
 * Tool-036 V4 — persistence tests (gates C2.2 continuity, C2.3 complete
 * wipe, C2.4 network silence).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyAction, initialState } from './reducer';
import { STORAGE_KEY, KEY_PREFIX, saveState, loadState, deleteAllData, enumerateDataKeys, type StorageLike } from './storage';
import type { AppState, NewEventInput } from '../contracts';

const CTX = { now: '2026-10-18T10:00:00+03:00', idGen: () => 'fixed-id-1' };
const INPUT: NewEventInput = {
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
  painScore: 4,
  note: 'ملاحظة عربية',
};

function fakeStorage(): StorageLike & { dump: () => Map<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    dump: () => map,
  };
}

function populatedState(): AppState {
  return applyAction(initialState('ar', 'Asia/Riyadh'), { type: 'event/add', event: INPUT }, CTX);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('V4 storage — C2.2 continuity', () => {
  it('save then load restores an identical state (Arabic note included)', () => {
    const storage = fakeStorage();
    const state = populatedState();
    expect(saveState(state, storage)).toBe(true);
    const loaded = loadState(storage);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.state).toEqual(state);
  });

  it('reports missing storage distinctly from invalid data', () => {
    const storage = fakeStorage();
    const missing = loadState(storage);
    expect(missing).toEqual({ ok: false, reason: 'missing', errors: [] });

    storage.setItem(STORAGE_KEY, '{not json');
    const invalid = loadState(storage);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.reason).toBe('invalid');
      expect(invalid.errors[0].code).toBe('not-json');
    }
  });

  it('rejects foreign/corrupt stored shapes with schema-mismatch', () => {
    const storage = fakeStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, events: [] }));
    const result = loadState(storage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('schema-mismatch');
  });
});

describe('V4 storage — C2.3 complete wipe', () => {
  it('deletes every tool key and touches nothing else', () => {
    const storage = fakeStorage();
    saveState(populatedState(), storage);
    storage.setItem(`${KEY_PREFIX}scratch`, 'x');
    storage.setItem('auth-token', 'keep-me'); // foreign key — must survive
    storage.setItem('theme', 'dark'); // foreign key — must survive

    const removed = deleteAllData(storage);
    expect(removed).toBe(2);
    expect(enumerateDataKeys(storage)).toHaveLength(0);
    expect(storage.getItem('auth-token')).toBe('keep-me');
    expect(storage.getItem('theme')).toBe('dark');
  });
});

describe('V4 storage — C2.4 network silence', () => {
  it('no fetch/XHR/beacon fires during save, load or delete', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const sendBeacon = vi.fn();
    vi.stubGlobal('navigator', { ...globalThis.navigator, sendBeacon });

    const storage = fakeStorage();
    const state = populatedState();
    saveState(state, storage);
    loadState(storage);
    deleteAllData(storage);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
