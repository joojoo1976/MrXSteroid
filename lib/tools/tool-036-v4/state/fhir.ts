/**
 * Tool-036 V4 — FHIR export (decision R4: export-only in V4).
 *
 * Each recorded injection becomes a FHIR R4 Observation. Design choices,
 * all asserted in fhir.test.ts:
 *  - no invented terminology systems: codes are text-only CodeableConcepts;
 *    the only external system cited is UCUM for real unit codes (mL, mg);
 *  - `Observation.subject` is omitted on purpose — this is a local,
 *    de-identified export with no patient linkage, and inventing a subject
 *    would misrepresent provenance;
 *  - absolute times are preserved verbatim (offsets included).
 *
 * This bundle is NOT importable by V4 (parseImport refuses it explicitly).
 */
import type { AppState, InjectionEvent } from '../contracts';

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  code: { text: string };
  effectiveDateTime: string;
  issued: string;
  component: Array<{
    code: { text: string };
    valueString?: string;
    valueQuantity?: { value: number; unit: string; system: 'http://unitsofmeasure.org'; code: string };
  }>;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  entry: Array<{ resource: FhirObservation }>;
}

const UCUM = 'http://unitsofmeasure.org' as const;

function toObservation(event: InjectionEvent): FhirObservation {
  return {
    resourceType: 'Observation',
    id: event.id,
    status: 'final',
    code: { text: 'Intramuscular injection record (Tool-036 V4 local export)' },
    effectiveDateTime: event.occurredAt,
    issued: event.createdAt,
    component: [
      { code: { text: 'Injection site' }, valueString: event.siteId },
      {
        code: { text: 'Volume' },
        valueQuantity: { value: event.volumeMl, unit: 'mL', system: UCUM, code: 'mL' },
      },
      {
        code: { text: 'Dose' },
        valueQuantity: { value: event.doseMg, unit: 'mg', system: UCUM, code: 'mg' },
      },
      ...(event.painScore === undefined
        ? []
        : [{ code: { text: 'Self-reported pain score (informational)' }, valueString: String(event.painScore) }]),
    ],
  };
}

export function buildFhirBundle(state: AppState, nowIso: string): FhirBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: nowIso,
    entry: [...state.events]
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
      .map((event) => ({ resource: toObservation(event) })),
  };
}
