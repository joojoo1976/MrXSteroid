/**
 * Tool-036 V4 — import validation tests (decision R4, scenario S4).
 * The acceptance flow is Export → Import → Compare: the imported state must
 * be provably equal to the exported one, and every rejection path must name
 * its reason in Arabic.
 */
import { describe, it, expect } from 'vitest';
import { parseImport } from './import';
import { buildEnvelope } from './envelope';
import { applyAction, initialState } from './reducer';
import { buildFhirBundle } from './fhir';
import type { AppState, NewEventInput } from '../contracts';

const CTX = { now: '2026-10-18T10:00:00+03:00', idGen: () => 'evt-1' };
const INPUT: NewEventInput = {
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
  painScore: 4,
  note: 'ملاحظة عربية',
};

function stateWithEvent(): AppState {
  return applyAction(initialState('ar', 'Asia/Riyadh'), { type: 'event/add', event: INPUT }, CTX);
}

describe('V4 import — S4 round trip (Export → Import → Compare)', () => {
  it('an exported envelope imports back byte-identically into a fresh state', async () => {
    const source = stateWithEvent();
    const envelope = await buildEnvelope(source, '2026-10-18T12:00:00Z');
    const text = JSON.stringify(envelope);

    const fresh = initialState('ar', 'Asia/Riyadh');
    const result = await parseImport(text, fresh);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.added).toBe(1);
    expect(result.skippedDuplicates).toBe(0);

    const merged = applyAction(
      fresh,
      { type: 'import/merge', events: result.envelope.payload.events, plan: result.envelope.payload.plan },
      CTX,
    );
    expect(merged.events).toEqual(source.events);
    expect(merged.plan).toEqual(source.plan);
  });

  it('identical duplicates are skipped, not re-added', async () => {
    const source = stateWithEvent();
    const envelope = await buildEnvelope(source, '2026-10-18T12:00:00Z');
    const result = await parseImport(JSON.stringify(envelope), source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.added).toBe(0);
    expect(result.skippedDuplicates).toBe(1);
  });
});

describe('V4 import — rejections carry explicit Arabic reasons', () => {
  it('refuses FHIR bundles (export-only in V4, decision R4)', async () => {
    const fhir = buildFhirBundle(stateWithEvent(), '2026-10-18T12:00:00Z');
    const result = await parseImport(JSON.stringify(fhir), initialState('ar', 'UTC'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('wrong-format');
    expect(result.errors[0].messageAr).toContain('للتصدير فقط');
  });

  it('refuses a tampered payload via checksum', async () => {
    const envelope = await buildEnvelope(stateWithEvent(), '2026-10-18T12:00:00Z');
    const tampered = structuredClone(envelope);
    tampered.payload.events[0].doseMg = 999;
    const result = await parseImport(JSON.stringify(tampered), initialState('ar', 'UTC'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('checksum-mismatch');
    expect(result.errors[0].messageAr).toContain('بصمة التحقق');
  });

  it('refuses an unsupported schema version', async () => {
    const envelope = await buildEnvelope(stateWithEvent(), '2026-10-18T12:00:00Z');
    const future = { ...envelope, schemaVersion: 99 };
    const result = await parseImport(JSON.stringify(future), initialState('ar', 'UTC'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('version-unsupported');
  });

  it('refuses the whole file when an id conflicts with different local content', async () => {
    const source = stateWithEvent();
    const envelope = await buildEnvelope(source, '2026-10-18T12:00:00Z');
    const conflicting = structuredClone(envelope);
    conflicting.payload.events[0].siteId = 'ventro-r'; // same id, different fact
    // Re-checksumming is not needed: the conflict must be caught before the
    // checksum question matters for trust — but checksum still fails first,
    // which is also correct. Rebuild with a valid checksum over the conflict:
    const { checksumOf } = await import('./envelope');
    conflicting.checksum = await checksumOf({
      events: conflicting.payload.events,
      plan: conflicting.payload.plan,
      locale: conflicting.payload.locale,
    });
    const result = await parseImport(JSON.stringify(conflicting), source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('conflict-id');
    expect(result.errors[0].messageAr).toContain('يُرفض الملف كله');
  });

  it('refuses non-JSON and non-object files', async () => {
    for (const [text, code] of [
      ['not json at all', 'not-json'],
      ['42', 'not-an-object'],
      ['[]', 'not-an-object'],
    ] as const) {
      const result = await parseImport(text, initialState('ar', 'UTC'));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe(code);
    }
  });
});

describe('V4 FHIR export — structure and content (decision R4)', () => {
  it('emits one Observation per event with exact times, dose and volume', async () => {
    const state = stateWithEvent();
    const bundle = buildFhirBundle(state, '2026-10-18T12:00:00Z');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.timestamp).toBe('2026-10-18T12:00:00Z');
    expect(bundle.entry).toHaveLength(1);

    const obs = bundle.entry[0].resource;
    expect(obs.resourceType).toBe('Observation');
    expect(obs.status).toBe('final');
    expect(obs.effectiveDateTime).toBe('2026-10-18T08:00:00+03:00'); // offset preserved
    expect(obs.issued).toBe('2026-10-18T10:00:00+03:00');

    const byText = (t: string) => obs.component.find((c) => c.code.text === t);
    expect(byText('Injection site')?.valueString).toBe('dorso-l');
    expect(byText('Volume')?.valueQuantity).toMatchObject({ value: 1, unit: 'mL', code: 'mL' });
    expect(byText('Dose')?.valueQuantity).toMatchObject({ value: 125, unit: 'mg', code: 'mg' });
    expect(byText('Self-reported pain score (informational)')?.valueString).toBe('4');
  });

  it('invents no terminology systems: only text codes plus real UCUM units', () => {
    const bundle = buildFhirBundle(stateWithEvent(), '2026-10-18T12:00:00Z');
    const text = JSON.stringify(bundle);
    expect(text).not.toMatch(/snomed|loinc|icd-10/i);
    const systems = new Set<string>();
    for (const entry of bundle.entry) {
      for (const component of entry.resource.component) {
        const quantity = component.valueQuantity;
        if (quantity) systems.add(quantity.system);
      }
    }
    expect([...systems]).toEqual(['http://unitsofmeasure.org']);
  });

  it('omits subject — the export carries no patient linkage', () => {
    const bundle = buildFhirBundle(stateWithEvent(), '2026-10-18T12:00:00Z');
    expect(JSON.stringify(bundle)).not.toContain('"subject"');
  });
});
