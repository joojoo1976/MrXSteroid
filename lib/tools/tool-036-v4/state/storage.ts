/**
 * Tool-036 V4 — persistence layer (decision D5/R7).
 *
 * - Local-only by design: this module has no network code and imports none.
 *   `storage.test.ts` asserts with a fetch spy that no request occurs while
 *   saving, loading or deleting (privacy gate C2.4).
 * - All tool data lives under a single key namespace (`mrx.tool-036-v4.`),
 *   so `deleteAllData` can prove a complete wipe without touching keys that
 *   belong to the rest of the site (gate C2.3).
 * - `loadState` validates through the schema; corrupt or foreign data is
 *   reported, never silently accepted.
 */
import { appStateSchema, type AppState, type ImportError } from '../contracts';

export const KEY_PREFIX = 'mrx.tool-036-v4.';
export const STORAGE_KEY = `${KEY_PREFIX}state`;

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

function defaultStorage(): StorageLike | null {
  const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
  return candidate ?? null;
}

export function saveState(state: AppState, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
}

export type LoadResult =
  | { ok: true; state: AppState }
  | { ok: false; reason: 'missing' | 'invalid'; errors: ImportError[] };

function toErrors(issues: { path: PropertyKey[]; message: string }[]): ImportError[] {
  return issues.map((issue) => ({
    code: 'schema-mismatch' as const,
    path: issue.path.map(String).join('.') || '(root)',
    messageEn: issue.message,
    messageAr: 'البيانات المخزنة لا تطابق مخطط الأداة الحالي',
  }));
}

export function loadState(storage: StorageLike | null = defaultStorage()): LoadResult {
  if (!storage) return { ok: false, reason: 'missing', errors: [] };
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return { ok: false, reason: 'missing', errors: [] };
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      reason: 'invalid',
      errors: [
        {
          code: 'not-json',
          path: STORAGE_KEY,
          messageEn: 'Stored data is not valid JSON.',
          messageAr: 'البيانات المخزنة ليست JSON صالحًا.',
        },
      ],
    };
  }
  const parsed = appStateSchema.safeParse(parsedJson);
  if (!parsed.success) return { ok: false, reason: 'invalid', errors: toErrors(parsed.error.issues) };
  return { ok: true, state: parsed.data };
}

/** Every key the tool owns — the wipe test counts these to prove completeness. */
export function enumerateDataKeys(storage: StorageLike | null = defaultStorage()): string[] {
  if (!storage) return [];
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const k = storage.key(i);
    if (k !== null && k.startsWith(KEY_PREFIX)) keys.push(k);
  }
  return keys;
}

/**
 * Delete every piece of health data the tool stores. Returns the number of
 * keys removed. Keys outside the tool's namespace are never touched.
 */
export function deleteAllData(storage: StorageLike | null = defaultStorage()): number {
  const keys = enumerateDataKeys(storage);
  for (const k of keys) storage?.removeItem(k);
  return keys.length;
}
