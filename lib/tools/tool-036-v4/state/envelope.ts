/**
 * Tool-036 V4 — export envelope (decision D3/R4).
 *
 * The envelope is the ONLY format the tool imports. It carries events, the
 * plan and the locale — and deliberately NOT the device-local preferences
 * (`acknowledgedAt`, tolerances, rest preference), so an exported file
 * never leaks an acknowledgement timestamp or personal thresholds
 * (asserted in envelope.test.ts).
 *
 * The checksum is sha-256 over a canonical serialisation (recursively
 * sorted keys, NFC-normalised strings) so that semantically identical
 * state always hashes identically — including Arabic text stored in
 * composed vs decomposed form.
 */
import { exportEnvelopeSchema, type AppState, type ExportEnvelope } from '../contracts';

/** Deterministic JSON: sorted object keys, NFC strings, arrays keep order. */
export function canonicalize(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
  return `{${entries.join(',')}}`;
}

export async function checksumOf(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function buildEnvelope(state: AppState, now: string): Promise<ExportEnvelope> {
  const payload = {
    events: state.events,
    plan: state.plan,
    locale: state.prefs.locale,
  } as const;
  const envelope = {
    format: 'tool-036-export' as const,
    schemaVersion: 2 as const,
    exportedAt: now,
    checksum: await checksumOf(payload),
    payload,
  };
  return exportEnvelopeSchema.parse(envelope);
}

export async function verifyChecksum(envelope: ExportEnvelope): Promise<boolean> {
  const expected = await checksumOf({
    events: envelope.payload.events,
    plan: envelope.payload.plan,
    locale: envelope.payload.locale,
  });
  return expected === envelope.checksum;
}
