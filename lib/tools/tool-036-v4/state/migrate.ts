/**
 * Tool-036 V4 — schema migration (gate C2.5).
 *
 * The product launches at v2, but the migration path is real and tested:
 * a synthetic v1 shape (the development-era layout before absolute-time
 * events) is upgraded rather than discarded. Unknown versions are refused
 * with an explicit error instead of being guessed at.
 */
import { z } from 'zod';
import {
  APP_SCHEMA_VERSION,
  appStateSchema,
  injectionEventSchema,
  planSpecSchema,
  prefsSchema,
  type AppState,
  type ImportError,
} from '../contracts';

/** Synthetic pre-release shape: events lack `source`/`createdAt`. */
const legacyEventSchema = injectionEventSchema.omit({ source: true, createdAt: true });
const legacyV1Schema = z.object({
  schemaVersion: z.literal(1),
  events: z.array(legacyEventSchema),
  plan: planSpecSchema,
  prefs: z.object({
    locale: z.enum(['ar', 'en']),
    tz: z.string().optional(),
    lateToleranceHours: z.number().int().optional(),
    restPreferenceDays: z.number().int().optional(),
  }),
});

export type MigrateResult = { ok: true; state: AppState } | { ok: false; errors: ImportError[] };

function fail(code: ImportError['code'], path: string, en: string, ar: string): MigrateResult {
  return { ok: false, errors: [{ code, path, messageEn: en, messageAr: ar }] };
}

export function migrate(raw: unknown): MigrateResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return fail('not-an-object', '(root)', 'File root must be a JSON object.', 'يجب أن يكون جذر الملف كائن JSON.');
  }
  const version = (raw as { schemaVersion?: unknown }).schemaVersion;

  if (version === APP_SCHEMA_VERSION) {
    const parsed = appStateSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return fail(
        'schema-mismatch',
        issue ? issue.path.map(String).join('.') : '(root)',
        issue ? issue.message : 'State does not match the v2 schema.',
        'البيانات لا تطابق مخطط الإصدار 2.',
      );
    }
    return { ok: true, state: parsed.data };
  }

  if (version === 1) {
    const parsed = legacyV1Schema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return fail(
        'schema-mismatch',
        issue ? `v1.${issue.path.map(String).join('.')}` : 'v1',
        issue ? issue.message : 'Legacy v1 data does not match the known legacy shape.',
        'بيانات الإصدار 1 لا تطابق الشكل المعروف.',
      );
    }
    const legacy = parsed.data;
    const state: AppState = {
      schemaVersion: 2,
      events: legacy.events.map((e) =>
        injectionEventSchema.parse({ ...e, source: 'imported' as const, createdAt: e.occurredAt }),
      ),
      plan: legacy.plan,
      prefs: prefsSchema.parse({
        locale: legacy.prefs.locale,
        tz: legacy.prefs.tz ?? 'UTC',
        lateToleranceHours: legacy.prefs.lateToleranceHours ?? 6,
        restPreferenceDays: legacy.prefs.restPreferenceDays ?? 7,
      }),
    };
    return { ok: true, state };
  }

  return fail(
    'version-unsupported',
    'schemaVersion',
    `Unsupported schemaVersion: ${String(version)}. This build understands v1 and v2.`,
    `إصدار بيانات غير مدعوم: ${String(version)}. يدعم هذا الإصدار 1 و2.`,
  );
}
