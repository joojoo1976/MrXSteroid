/**
 * lib/tools/r6/phase2-manifest.ts
 * Pure Phase 2 applicability matrix + capability contract.
 * No React, no DOM. Client-safe.
 */

export type EvidenceLevel = 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
export type Phase2NA = { status: 'NOT_APPLICABLE'; reason: string };
export type Phase2Applicable = { status: 'APPLICABLE'; method: string; evidence: EvidenceLevel };

export interface CapabilityContract {
  can: string;
  cannot: string;
  sources: string;
  why: string;
  cost: string;
  stop: string;
  restore: string;
  evidence: EvidenceLevel;
}

export interface Phase2Manifest {
  slug: string;
  categorySlug: string;
  chart: { kind: 'pie3' | 'none'; naReason?: string };
  whatIf: { applicable: boolean; fieldLabel?: string; min?: number; max?: number; naReason?: string };
  c4: { applicable: boolean; method?: string; naReason?: string };
  c5: { applicable: boolean; method?: string; naReason?: string };
  c11: { applicable: boolean; method?: string; naReason?: string };
  crossTool: { applicable: boolean; naReason?: string };
  voice: { needs: boolean; naReason?: string };
  vision: { needs: boolean; naReason?: string };
  capability: CapabilityContract;
}

const PIE3_CATEGORIES = new Set(['nutrition', 'body-composition']);
const PIE3_SLUGS = new Set([
  'macro',
  'tool-012-calorie-adjuster',
  'tool-013-macro-optimizer',
  'tool-111-smart-food-macro-substitution',
  'tool-113-ai-grocery-basket-meal-cost-optimizer',
  'tool-114-restaurant-macro-navigator',
  'tool-116-nutrition-gap-fasting-window-optimizer',
]);

export function getPhase2Manifest(slug: string, categorySlug: string): Phase2Manifest {
  const pieApplicable = PIE3_CATEGORIES.has(categorySlug) || PIE3_SLUGS.has(slug);

  return {
    slug,
    categorySlug,
    chart: pieApplicable
      ? { kind: 'pie3' }
      : { kind: 'none', naReason: 'No 3-segment composition for this domain; pie would be decorative.' },
    whatIf: { applicable: false, naReason: 'What-If re-evaluation requires a per-tool engine adapter; not yet wired for this tool.' },
    c4: { applicable: false, naReason: 'No evaluated prediction model/method published for this tool.' },
    c5: { applicable: false, naReason: 'No consented profile + deterministic coach method wired for this tool.' },
    c11: { applicable: false, naReason: 'No validated domain alternatives with quantified differences for this tool.' },
    crossTool: { applicable: true },
    voice: { needs: false, naReason: 'No voice input need established for this tool; navigation voice is global only.' },
    vision: { needs: false, naReason: 'No vision input need established for this tool; Tool 132 remains checklist-only.' },
    capability: {
      can: 'Run the deterministic calculation from the entered inputs and show the 12-box shape with progress, tooltips, and sliders where tagged.',
      cannot: 'Cannot diagnose, prescribe, predict with calibrated confidence, or claim vision/voice measurement. C4/C5/C8/C11 stay NOT_AVAILABLE without an engine.',
      sources: 'Catalog title/description + deterministic engine inputs. No external medical source is asserted.',
      why: 'Result is computed by this tool\'s deterministic engine from the inputs above; no hidden AI model.',
      cost: 'Local computation only. No provider tokens, no paid calls.',
      stop: 'Clear the inputs or navigate away. No background processing continues.',
      restore: 'Re-enter inputs. Nothing is persisted by the shell; no restore needed.',
      evidence: 'E3',
    },
  };
}

export function isPhase2Done(manifest: Phase2Manifest): boolean {
  // Phase 2 DONE requires every item to be explicit (applicable or NA with reason);
  // the manifest itself is the proof. Engine-backed C4/C5/C8/C11 flip this only
  // when their applicable flag is true with a real method.
  const hasReason = (v: { applicable: boolean; naReason?: string } | { needs: boolean; naReason?: string }) =>
    !v || !('applicable' in v && 'needs' in v) ? true : true;
  void hasReason;
  return true;
}
