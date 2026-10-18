/**
 * Tool-036 V4 — import validation (design-v4-ar.md §2/§7, decision R4).
 *
 * The ONLY accepted import format is the V4 export envelope. Before
 * anything is applied, `parseImport` verifies — in this order —
 *  1. the text is JSON and an object;
 *  2. it declares itself as a tool-036 export (anything else, including a
 *     FHIR Bundle, is refused with an explicit message: FHIR is export-only
 *     in V4 by the user's written decision);
 *  3. the schema version is supported;
 *  4. the full envelope matches the schema;
 *  5. the checksum matches its payload (tamper detection);
 *  6. integration with existing data: an event id that already exists with
 *     IDENTICAL content is skipped (counted), while the same id with
 *     DIFFERENT content is a hard conflict — the whole file is rejected
 *     rather than silently overwriting local ground truth.
 *
 * Nothing here touches storage or the network; the caller decides what to
 * do with the validated envelope.
 */
import {
  APP_SCHEMA_VERSION,
  exportEnvelopeSchema,
  type AppState,
  type ImportError,
  type ImportResult,
} from '../contracts';
import { canonicalize, verifyChecksum } from './envelope';

export async function parseImport(text: string, current: AppState): Promise<ImportResult> {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    return {
      ok: false,
      errors: [
        {
          code: 'not-json',
          path: '(file)',
          messageEn: 'The file is not valid JSON.',
          messageAr: 'الملف ليس JSON صالحًا.',
        },
      ],
    };
  }

  if (typeof parsedJson !== 'object' || parsedJson === null || Array.isArray(parsedJson)) {
    return {
      ok: false,
      errors: [
        {
          code: 'not-an-object',
          path: '(root)',
          messageEn: 'The file root must be a JSON object.',
          messageAr: 'يجب أن يكون جذر الملف كائن JSON.',
        },
      ],
    };
  }

  const root = parsedJson as Record<string, unknown>;
  const format = root.format;
  if (format !== 'tool-036-export') {
    const looksLikeFhir = (root as { resourceType?: unknown }).resourceType === 'Bundle';
    return {
      ok: false,
      errors: [
        {
          code: 'wrong-format',
          path: 'format',
          messageEn: looksLikeFhir
            ? 'FHIR bundles are export-only in V4 and cannot be imported.'
            : 'Unrecognised file format — expected a tool-036 V4 export envelope.',
          messageAr: looksLikeFhir
            ? 'حزم FHIR للتصدير فقط في الإصدار الرابع ولا يمكن استيرادها.'
            : 'صيغة الملف غير معروفة — يُتوقع ظرف تصدير الأداة V4 المنظّم.',
        },
      ],
    };
  }

  if (root.schemaVersion !== APP_SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        {
          code: 'version-unsupported',
          path: 'schemaVersion',
          messageEn: `Unsupported schemaVersion: ${String(root.schemaVersion)} (this build reads v${APP_SCHEMA_VERSION}).`,
          messageAr: `إصدار بيانات غير مدعوم: ${String(root.schemaVersion)} (هذا الإصدار يقرأ ${APP_SCHEMA_VERSION}).`,
        },
      ],
    };
  }

  const envelopeParse = exportEnvelopeSchema.safeParse(root);
  if (!envelopeParse.success) {
    const issue = envelopeParse.error.issues[0];
    return {
      ok: false,
      errors: [
        {
          code: 'schema-mismatch',
          path: issue ? issue.path.map(String).join('.') : '(root)',
          messageEn: issue ? issue.message : 'Envelope does not match the V4 export schema.',
          messageAr: 'الظرف لا يطابق مخطط تصدير الأداة V4.',
        },
      ],
    };
  }
  const envelope = envelopeParse.data;

  if (!(await verifyChecksum(envelope))) {
    return {
      ok: false,
      errors: [
        {
          code: 'checksum-mismatch',
          path: 'checksum',
          messageEn: 'Checksum does not match the payload — the file was altered or truncated.',
          messageAr: 'بصمة التحقق لا تطابق المحتوى — عُدِّل الملف أو قُصّ.',
        },
      ],
    };
  }

  // Integration check: identical duplicates are skipped; conflicting ids reject.
  const existingById = new Map(current.events.map((e) => [e.id, e]));
  const conflicts: ImportError[] = [];
  let added = 0;
  let skippedDuplicates = 0;

  for (const incoming of envelope.payload.events) {
    const existing = existingById.get(incoming.id);
    if (!existing) {
      added += 1;
      continue;
    }
    if (canonicalize(existing) === canonicalize(incoming)) {
      skippedDuplicates += 1;
      continue;
    }
    conflicts.push({
      code: 'conflict-id',
      path: `payload.events(${incoming.id})`,
      messageEn: `Event id "${incoming.id}" already exists with different content — refusing the whole file to protect local ground truth.`,
      messageAr: `المعرّف «${incoming.id}» موجود بمحتوى مختلف — يُرفض الملف كله حمايةً للبيانات المحلية.`,
    });
  }

  if (conflicts.length > 0) {
    return { ok: false, errors: conflicts };
  }

  return { ok: true, envelope, added, skippedDuplicates };
}
