/**
 * Tool-036 V4 — export envelope tests (decision D3/R4, gate C6 prep).
 * Checksum determinism, tamper detection, and the privacy rule that
 * device-local preferences never leave the device.
 */
import { describe, it, expect } from 'vitest';
import { applyAction, initialState } from './reducer';
import { buildEnvelope, canonicalize, checksumOf, verifyChecksum } from './envelope';
import type { NewEventInput } from '../contracts';

const CTX = { now: '2026-10-18T10:00:00+03:00', idGen: () => 'fixed-id-1' };
const INPUT: NewEventInput = {
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
  note: 'أَلم خفيف', // contains combining marks — exercises NFC
};

async function stateWithAck() {
  const withEvent = applyAction(initialState('ar', 'Asia/Riyadh'), { type: 'event/add', event: INPUT }, CTX);
  return applyAction(withEvent, { type: 'ack/set', at: '2026-10-17T12:00:00+03:00' }, CTX);
}

describe('V4 envelope — checksum integrity', () => {
  it('verifies its own checksum', async () => {
    const envelope = await buildEnvelope(await stateWithAck(), '2026-10-18T12:00:00Z');
    expect(await verifyChecksum(envelope)).toBe(true);
  });

  it('detects a tampered event', async () => {
    const envelope = await buildEnvelope(await stateWithAck(), '2026-10-18T12:00:00Z');
    const tampered = structuredClone(envelope);
    tampered.payload.events[0].doseMg = 999;
    expect(await verifyChecksum(tampered)).toBe(false);
  });

  it('canonical form is key-order independent', () => {
    expect(canonicalize({ a: 1, b: [2, { c: 3, d: 4 }] })).toBe(canonicalize({ b: [2, { d: 4, c: 3 }], a: 1 }));
  });

  it('canonical form is NFC-normalised (composed vs decomposed hash identically)', async () => {
    const composed = 'é';
    const decomposed = composed.normalize('NFD');
    expect(await checksumOf(composed)).toBe(await checksumOf(decomposed));
  });
});

describe('V4 envelope — privacy (R5/D5)', () => {
  it('exports events, plan and locale only — never acknowledgement or thresholds', async () => {
    const envelope = await buildEnvelope(await stateWithAck(), '2026-10-18T12:00:00Z');
    const payloadText = JSON.stringify(envelope.payload);
    expect(Object.keys(envelope.payload).sort()).toEqual(['events', 'locale', 'plan']);
    expect(payloadText).not.toContain('acknowledgedAt');
    expect(payloadText).not.toContain('lateToleranceHours');
    expect(payloadText).not.toContain('restPreferenceDays');
    expect(payloadText).not.toContain('tz');
  });
});
