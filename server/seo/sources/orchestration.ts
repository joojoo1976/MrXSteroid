/**
 * Source Orchestration Layer — Step 9 (Implementation Phase)
 * Reads registry → active sources → executes PROVEN sources only.
 * No pipeline redesign. Maintains existing semantics.
 * Does NOT fix TS2353 unless directly required by orchestration.
 */

import { sourceRegistry } from './registry';
import { internalBaselineAdapter } from './internalBaselineAdapter';
import { internalSearchAdapter } from './internalSearchAdapter';
import { gscAdapter } from './gscAdapter';
import { getBaselineKeywords } from '../baselineKeywords';
import { getSupabaseAdmin } from '../seoService';

// Type guard for SourceStatus
function isProven(status: string): status is 'PROVEN' {
  return status === 'PROVEN';
}

function isBlockedOrNotProven(status: string): status is 'BLOCKED' | 'NOT_PROVEN' {
  return status !== 'PROVEN';
}

/**
 * Orchestrate active SEO sources.
 * Returns results keyed by source name.
 * Pure function — no side effects beyond read-only adapter calls.
 */
export async function orchestrateSources(language: 'en' | 'ar' = 'en'): Promise<{
  baseline: Awaited<ReturnType<typeof internalBaselineAdapter.fetchDiscoveredKeywords>>;
  telemetry: Awaited<ReturnType<typeof internalSearchAdapter.fetchDiscoveredKeywords>>;
  gsc: 'skipped';
}> {
  const active = sourceRegistry.getActiveSources();
  const results = {
    baseline: [] as unknown[],
    telemetry: [] as unknown[],
    gsc: 'skipped' as const,
  };

  for (const adapter of active) {
    switch (adapter.source) {
      case 'internal_baseline_seeds': {
        // PROVEN: baseline keyword discovery
        // Uses existing getBaselineKeywords path; adapter interfaces read-only
        if (isProven(adapter.status)) {
          results.baseline = await internalBaselineAdapter.fetchDiscoveredKeywords!(language);
        }
        break;
      }

      case 'internal_search_telemetry': {
        // PROVEN: telemetry signal/boost only — NOT keyword discovery
        // Returns [] by adapter design; refresh pipeline reads telemetry directly
        if (isProven(adapter.status)) {
          results.telemetry = await internalSearchAdapter.fetchDiscoveredKeywords!();
        }
        break;
      }

      case 'google_search_console': {
        // BLOCKED: skip entirely
        if (isBlockedOrNotProven(gscAdapter.status)) {
          results.gsc = 'skipped';
        }
        break;
      }

      default:
        // NOT_PROVEN or unknown: skip
        break;
    }
  }

  return results;
}

/**
 * Orchestrated snapshot generation — Tier 3 fallback with provenance.
 * Integrates with existing seoService.getOrGenerateWeeklySnapshot path.
 */
export async function orchestratedTier3Snapshot(
  language: 'en' | 'ar' = 'en',
  year: number,
  weekNumber: number
): Promise<any> {
  const { baseline, telemetry } = await orchestrateSources(language);

  // Baseline provides keyword data; telemetry is signal-only (not merged into keywords)
  // Existing pipeline uses baseline data for snapshot; telemetry is tracked separately
  const baselineViaAdapter = baseline; // already from adapter, preserves provenance
  return {
    language,
    year,
    weekNumber,
    generatedAt: new Date().toISOString(),
    baselineSource: 'internal_baseline_seeds',
    telemetrySource: 'internal_search_telemetry',
    baselineKeywords: baselineViaAdapter,
    // telemetry is NOT merged into keywords — it remains a boost signal
    // (existing refresh/route.ts logic unchanged)
  };
}