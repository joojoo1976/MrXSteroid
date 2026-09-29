/**
 * Source Registry — Step 1 (Implementation Phase, Read-Only Design)
 * Separates integration status; prevents NOT_PROVEN / BLOCKED from runtime activation.
 * No provider keys, no API connections, no DB writes.
 */

import { SourceAdapterContract, SourceStatus, SourceAdapterResult } from './adapterContract';
import { internalSearchAdapter } from './internalSearchAdapter';
import { manualImportAdapter } from './manualImportAdapter';

export type RegistryEntry = {
  adapter: SourceAdapterContract;
  registered_at: string;
  verified_at?: string; // only when status transitions to PROVEN
};

export class SourceRegistry {
  private registry: Map<string, RegistryEntry> = new Map();

  // Only PROVEN sources may be activated at runtime. NOT_PROVEN / BLOCKED are rejected.
  register(adapter: SourceAdapterContract): SourceAdapterResult {
    const key = adapter.source;
    const now = new Date().toISOString();

    // Guard: never activate unverified sources
    if (adapter.status === 'NOT_PROVEN' || adapter.status === 'BLOCKED') {
      return {
        adapter,
        discovered: 0,
        status: adapter.status,
        evidence: adapter.evidence,
        error: `Source ${key} is ${adapter.status}; not allowed to enter runtime as active source until Production evidence verified.`,
      };
    }

    // Only PROVEN allowed to register
    if (adapter.status !== 'PROVEN') {
      return {
        adapter,
        discovered: 0,
        status: 'BLOCKED',
        evidence: adapter.evidence,
        error: `Unknown status for ${key}; defaulting to BLOCKED.`,
      };
    }

    this.registry.set(key, { adapter, registered_at: now });
    return {
      adapter,
      discovered: 0,
      status: 'PROVEN',
      evidence: adapter.evidence,
    };
  }

  getActiveSources(): SourceAdapterContract[] {
    const active: SourceAdapterContract[] = [];
    for (const entry of this.registry.values()) {
      if (entry.adapter.status === 'PROVEN') {
        active.push(entry.adapter);
      }
    }
    return active;
  }

  getStatusFor(source: string): SourceStatus | undefined {
    return this.registry.get(source)?.adapter.status;
  }

  isProven(source: string): boolean {
    return this.getStatusFor(source) === 'PROVEN';
  }

  isBlockedOrNotProven(source: string): boolean {
    const s = this.getStatusFor(source);
    return s === 'NOT_PROVEN' || s === 'BLOCKED';
  }

  // Explicit evidence check for Production verification
  requireEvidence(source: string): SourceAdapterResult {
    const entry = this.registry.get(source);
    if (!entry) {
      return { adapter: {} as SourceAdapterContract, discovered: 0, status: 'BLOCKED', evidence: 'unknown', error: 'Source not registered.' };
    }
    if (entry.adapter.status === 'PROVEN' && entry.verified_at) {
      return { adapter: entry.adapter, discovered: 0, status: 'PROVEN', evidence: entry.adapter.evidence };
    }
    return { adapter: entry.adapter, discovered: 0, status: entry.adapter.status, evidence: entry.adapter.evidence, error: 'Production evidence missing.' };
  }
}

import { gscAdapter } from './gscAdapter';
import { internalBaselineAdapter } from './internalBaselineAdapter';

// Default registry instance — safe for import; never activates unverified sources
export const sourceRegistry = new SourceRegistry();

// Step 2: GSC adapter registered explicitly as BLOCKED (no verified Production evidence / no active API access)
// This registers the adapter design without runtime activation.
// Once Production DB / GSC access is verified, status can transition (requires approval).
sourceRegistry.register({ ...gscAdapter, status: 'BLOCKED' });

// Step 4: Internal baseline adapter — PROVEN (existing verified seed source)
// No external auth; uses existing getBaselineKeywords; preserves all pipeline behavior.
sourceRegistry.register(internalBaselineAdapter);

// Step 7: Internal Search Intelligence — PROVEN (existing telemetry; signal/boost only; NOT keyword discovery)
sourceRegistry.register(internalSearchAdapter);

// Step 10: Manual/Public Import — PROVEN (verified manual/public source; no external auth, no scraping)
// No Production DB writes; used for manual augmentation only.
sourceRegistry.register(manualImportAdapter);
