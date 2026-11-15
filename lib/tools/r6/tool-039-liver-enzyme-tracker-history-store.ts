/**
 * lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #039 — Liver Enzyme Tracker: LOCAL, DEVICE-ONLY history store.
 *
 * Owner decision D-08 (2026-11-11, Option A): a limited exception to the W18
 * blocker that allows local storage inside Tool 039 only. No cloud sync, no
 * session persistence, no shared storage between tools, no server write.
 *
 * WHY THIS MODULE DOES NOT USE `shared/lib/secureStorage.ts`
 * ─────────────────────────────────────────────────────────────────────────
 * The shared helper was MEASURED (real Chrome, the built app) and it writes
 * PLAINTEXT in this application:
 *   - `config/env.ts` reads the key from `VITE_ENCRYPTION_KEY`;
 *   - the build is Next.js, which inlines only `NEXT_PUBLIC_*`, so the key is
 *     absent from the client bundle (verified: the literal key value does not
 *     appear in any `.next/static/chunks/*.js`);
 *   - therefore `env.ENCRYPTION_KEY` is `undefined` in the browser and
 *     `SecureStorage.setItem` takes its `if (!ENCRYPTION_KEY)` branch, which
 *     stores the value verbatim in `localStorage`.
 *   Proof: `docs/MRX Genius Cloud Unified R6.1/tool-039-secure-storage-probe.mjs`
 *   wrote the probe value `PROBE_MEDICAL_VALUE_112` and read it back verbatim.
 *
 * So relying on it would be a false security claim. This store instead uses a
 * PER-INSTALLATION random key (generated locally with Web Crypto, stored in
 * that browser profile only) and encrypts the payload with AES. The values are
 * therefore not sitting in the profile as readable text.
 *
 * HONEST LIMIT (also stated in the UI): client-side encryption does NOT
 * protect against scripts running on this origin, nor against anyone who can
 * read this browser profile. It is not a secure vault for medical data.
 *
 * The store never performs a network call, never logs a value or a comment,
 * and writes nothing at all until the user has explicitly consented.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import CryptoJS from 'crypto-js';
import {
  TOOL_039_HISTORY_SCHEMA_VERSION,
  applyRatingToEntry,
  buildHistoryCsv,
  buildHistoryEntry,
  clearRatingFromEntry,
  pruneHistoryEntries,
  validateHistoryEnvelope,
  type Tool039HistoryEntry,
  type Tool039HistoryEnvelope,
  type Tool039HistoryInput,
  type Tool039HistoryResult,
} from './tool-039-liver-enzyme-tracker-history';

/** Device key under which the encrypted envelope is stored. */
export const TOOL_039_HISTORY_ENVELOPE_KEY = 'mrx_tool039_history_v1';

/** Device key under which the per-installation encryption key is stored. */
export const TOOL_039_HISTORY_KEY_STORAGE_KEY = 'mrx_tool039_history_key_v1';

/** The minimum subset of the Web Storage API this store needs. */
export interface Tool039StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Test/debug helper: the raw device contents. Never contains a value in clear text. */
  dump?(): Record<string, string>;
}

export interface Tool039HistoryStoreOptions {
  storage: Tool039StorageAdapter;
  /** Injected clock (ISO instant). */
  now?: () => string;
  /** Injected id factory. */
  newId?: () => string;
  /** Injected per-installation key factory. */
  newKey?: () => string;
}

export interface Tool039HistoryStore {
  readonly storageMode: 'local-device';
  isConsented(): boolean;
  grantConsent(): void;
  /** Withdraw consent AND delete everything stored locally. */
  revokeConsent(): void;
  list(): Tool039HistoryEntry[];
  /** Save the engine result. Returns null when there is no consent. */
  save(input: Tool039HistoryInput, result: Tool039HistoryResult): Tool039HistoryEntry | null;
  remove(entryId: string): boolean;
  clear(): void;
  /** Rate ONE saved result. Returns false when the id or the rating is invalid. */
  rate(entryId: string, rating: unknown, comment: unknown): boolean;
  /** Remove the rating and the comment from ONE saved result. */
  clearRating(entryId: string): boolean;
  exportCsv(): string;
}

function defaultNewId(): string {
  const cryptoRef = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') return cryptoRef.randomUUID();
  return `entry-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function defaultNewKey(): string {
  const cryptoRef = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoRef && typeof cryptoRef.getRandomValues === 'function') {
    const bytes = new Uint8Array(32);
    cryptoRef.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // No Web Crypto: fall back to a per-installation random-ish key. It is still
  // never shipped in the bundle, so it cannot be recovered from the source.
  return `local-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e16).toString(36)}`;
}

function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(blob: string, key: string): string | null {
  try {
    const text = CryptoJS.AES.decrypt(blob, key).toString(CryptoJS.enc.Utf8);
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Create the store. The adapters are injected so the suite can simulate two
 * independent devices and so the clock is never implicit.
 */
export function createTool039HistoryStore(options: Tool039HistoryStoreOptions): Tool039HistoryStore {
  const storage = options.storage;
  const now = options.now ?? (() => new Date().toISOString());
  const newId = options.newId ?? defaultNewId;
  const newKey = options.newKey ?? defaultNewKey;

  /** The per-installation key, created on first write and kept in the profile. */
  const readOrCreateKey = (): string => {
    const existing = storage.getItem(TOOL_039_HISTORY_KEY_STORAGE_KEY);
    if (existing && existing.length > 0) return existing;
    const created = newKey();
    storage.setItem(TOOL_039_HISTORY_KEY_STORAGE_KEY, created);
    return created;
  };

  const readEnvelope = (): Tool039HistoryEnvelope => {
    const blob = storage.getItem(TOOL_039_HISTORY_ENVELOPE_KEY);
    if (!blob) return { schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION, consented: false, entries: [] };
    const key = storage.getItem(TOOL_039_HISTORY_KEY_STORAGE_KEY);
    if (!key) return { schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION, consented: false, entries: [] };
    const decrypted = decrypt(blob, key);
    if (!decrypted) {
      // The payload cannot be read (key lost or tampered). Do not trust it and
      // do not keep it around pretending it is data.
      storage.removeItem(TOOL_039_HISTORY_ENVELOPE_KEY);
      return { schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION, consented: false, entries: [] };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(decrypted);
    } catch {
      storage.removeItem(TOOL_039_HISTORY_ENVELOPE_KEY);
      return { schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION, consented: false, entries: [] };
    }
    const validated = validateHistoryEnvelope(parsed);
    if (!validated.ok) {
      storage.removeItem(TOOL_039_HISTORY_ENVELOPE_KEY);
      return { schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION, consented: false, entries: [] };
    }
    return validated.envelope;
  };

  const writeEnvelope = (envelope: Tool039HistoryEnvelope): void => {
    const key = readOrCreateKey();
    storage.setItem(TOOL_039_HISTORY_ENVELOPE_KEY, encrypt(JSON.stringify(envelope), key));
  };

  const store: Tool039HistoryStore = {
    storageMode: 'local-device',

    isConsented: () => readEnvelope().consented,

    grantConsent: () => {
      const envelope = readEnvelope();
      writeEnvelope({ ...envelope, consented: true });
    },

    revokeConsent: () => {
      // Withdrawing consent deletes the stored data — it is not merely hidden.
      storage.removeItem(TOOL_039_HISTORY_ENVELOPE_KEY);
      storage.removeItem(TOOL_039_HISTORY_KEY_STORAGE_KEY);
    },

    list: () => {
      const envelope = readEnvelope();
      if (!envelope.consented) return [];
      const pruned = pruneHistoryEntries(envelope.entries, now());
      if (pruned.length !== envelope.entries.length) {
        writeEnvelope({ ...envelope, consented: true, entries: pruned });
      }
      return pruned;
    },

    save: (input, result) => {
      const envelope = readEnvelope();
      if (!envelope.consented) return null;
      const entry = buildHistoryEntry({ id: newId(), recordedAt: now(), input, result });
      const entries = pruneHistoryEntries([entry, ...envelope.entries], now());
      writeEnvelope({ ...envelope, consented: true, entries });
      return entry;
    },

    remove: (entryId) => {
      const envelope = readEnvelope();
      if (!envelope.consented) return false;
      const entries = envelope.entries.filter((entry) => entry.id !== entryId);
      if (entries.length === envelope.entries.length) return false;
      writeEnvelope({ ...envelope, consented: true, entries });
      return true;
    },

    clear: () => {
      const envelope = readEnvelope();
      writeEnvelope({ ...envelope, consented: envelope.consented, entries: [] });
    },

    rate: (entryId, rating, comment) => {
      const envelope = readEnvelope();
      if (!envelope.consented) return false;
      const entries = applyRatingToEntry(envelope.entries, entryId, rating, comment);
      if (entries === envelope.entries) return false;
      writeEnvelope({ ...envelope, consented: true, entries });
      return true;
    },

    clearRating: (entryId) => {
      const envelope = readEnvelope();
      if (!envelope.consented) return false;
      const entries = clearRatingFromEntry(envelope.entries, entryId);
      if (entries === envelope.entries) return false;
      writeEnvelope({ ...envelope, consented: true, entries });
      return true;
    },

    exportCsv: () => buildHistoryCsv(store.list(), now()),
  };

  return store;
}

/**
 * The store bound to the real browser storage. Used by the Tool 039 component.
 */
export function createBrowserHistoryStore(): Tool039HistoryStore {
  const storage: Tool039StorageAdapter = {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable (private mode / quota): the store simply cannot save */
      }
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
  return createTool039HistoryStore({ storage });
}

/** Remove the rating from ONE entry (exposed for the UI action). */
export function clearEntryRating(
  entries: Tool039HistoryEntry[],
  entryId: string,
): Tool039HistoryEntry[] {
  return clearRatingFromEntry(entries, entryId);
}
