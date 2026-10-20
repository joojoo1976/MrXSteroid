/**
 * lib/tools/loaders.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Chargement paresseux (code-splitting) des composants SmartTools par slug.
 *
 *  ⚠️ G-08 — explicit slug → module map (was a webpack context module).
 *
 *  This file used to resolve components with:
 *
 *      import(`@/components/tools/${slug}`)
 *
 *  A dynamic import whose request is built from a variable makes webpack emit
 *  a *context module* that matches EVERY file under `components/tools/**`,
 *  recursively. Because the SmartTools catch-all route
 *  (`/smarttools/[category]/[tool]`) is the only consumer, every module in that
 *  folder — including non-tool helpers such as `tool-036-accumulation-chart`
 *  (recharts) and `tool-036-weekly-calendar` (dnd-kit), and even stray
 *  `*.test.tsx` files — was dragged into that one route's module graph.
 *
 *  Measured consequence: `recharts` chunks appeared in the *initial*
 *  `<script>` set of Tool-036 V3, whose own chart is already lazy via
 *  `next/dynamic(..., { ssr: false })`. See lib/tools/loaders.test.ts.
 *
 *  Each entry below is a statically analysable `import()`, so webpack emits a
 *  real async chunk per tool. Heavy widgets are now reachable ONLY through the
 *  tool that lazy-loads them, keeping them out of every other tool's first load.
 *
 *  Coverage is enforced by lib/tools/loaders.test.ts, which asserts that every
 *  published catalog slug (status !== 'planned') is present here. Adding a tool
 *  to the catalog without adding its entry makes that test fail.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ToolComponentModule = {
  default: React.ComponentType<Record<string, never>>;
};

/** Slug guard — a slug can never address a path or a non-published module. */
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Published SmartTools only (catalog entries with `status !== 'planned'`).
 * Helpers that live beside the tools in `components/tools/` are deliberately
 * absent: they are lazy-loaded by the tool that owns them.
 */
const TOOL_MODULE_LOADERS: Record<string, () => Promise<ToolComponentModule>> = {
  'aromatization-risk': () => import('@/components/tools/aromatization-risk'),
  'hcg-serm-protocol': () => import('@/components/tools/hcg-serm-protocol'),
  'hpta-recovery': () => import('@/components/tools/hpta-recovery'),
  'multi-ester-pharmacokinetics': () => import('@/components/tools/multi-ester-pharmacokinetics'),
  'pct-timing': () => import('@/components/tools/pct-timing'),
  'tool-006-estrogen-prolactin': () => import('@/components/tools/tool-006-estrogen-prolactin'),
  'tool-007-bloodwork-analyzer': () => import('@/components/tools/tool-007-bloodwork-analyzer'),
  'tool-008-side-effect-tracker': () => import('@/components/tools/tool-008-side-effect-tracker'),
  'tool-009-injection-site-rotator': () => import('@/components/tools/tool-009-injection-site-rotator'),
  'tool-010-compound-stack-builder': () => import('@/components/tools/tool-010-compound-stack-builder'),
  'tool-011-progress-tracker': () => import('@/components/tools/tool-011-progress-tracker'),
  'tool-012-calorie-adjuster': () => import('@/components/tools/tool-012-calorie-adjuster'),
  'tool-013-macro-optimizer': () => import('@/components/tools/tool-013-macro-optimizer'),
  'tool-014-water-retention': () => import('@/components/tools/tool-014-water-retention'),
  'tool-015-shbg-modulator': () => import('@/components/tools/tool-015-shbg-modulator'),
  'tool-016-half-life-calculator': () => import('@/components/tools/tool-016-half-life-calculator'),
  'tool-017-drug-interaction': () => import('@/components/tools/tool-017-drug-interaction'),
  'tool-018-hpta-recovery': () => import('@/components/tools/tool-018-hpta-recovery'),
  'tool-019-cardio-monitor': () => import('@/components/tools/tool-019-cardio-monitor'),
  'tool-020-genetic-potential': () => import('@/components/tools/tool-020-genetic-potential'),
  'tool-021-peptide-protocol': () => import('@/components/tools/tool-021-peptide-protocol'),
  'tool-022-half-life-stacker': () => import('@/components/tools/tool-022-half-life-stacker'),
  'tool-023-trt-optimization': () => import('@/components/tools/tool-023-trt-optimization'),
  'tool-024-bloodwork-interpreter': () => import('@/components/tools/tool-024-bloodwork-interpreter'),
  'tool-025-drug-interaction-pro': () => import('@/components/tools/tool-025-drug-interaction-pro'),
  'tool-026-injection-pain': () => import('@/components/tools/tool-026-injection-pain'),
  'tool-027-ester-conversion': () => import('@/components/tools/tool-027-ester-conversion'),
  'tool-028-stacking-synergy': () => import('@/components/tools/tool-028-stacking-synergy'),
  'tool-029-side-effect-early-warning': () => import('@/components/tools/tool-029-side-effect-early-warning'),
  'tool-030-cycle-cost-calculator': () => import('@/components/tools/tool-030-cycle-cost-calculator'),
  'tool-031-cycle-length-optimizer': () => import('@/components/tools/tool-031-cycle-length-optimizer'),
  'tool-032-advanced-pct-planner': () => import('@/components/tools/tool-032-advanced-pct-planner'),
  'tool-033-bloodwork-trend-analyzer': () => import('@/components/tools/tool-033-bloodwork-trend-analyzer'),
  'tool-034-compound-clearance': () => import('@/components/tools/tool-034-compound-clearance'),
  'tool-035-hormone-conversion': () => import('@/components/tools/tool-035-hormone-conversion'),
  'tool-036-injection-schedule': () => import('@/components/tools/tool-036-injection-schedule'),
  'tool-037-side-effect-probability': () => import('@/components/tools/tool-037-side-effect-probability'),
  'tool-038-stack-compatibility': () => import('@/components/tools/tool-038-stack-compatibility'),
  'tool-039-liver-enzyme-tracker': () => import('@/components/tools/tool-039-liver-enzyme-tracker'),
  'tool-040-lipid-profile-optimizer': () => import('@/components/tools/tool-040-lipid-profile-optimizer'),
  'tool-041-hematocrit-monitor': () => import('@/components/tools/tool-041-hematocrit-monitor'),
  'tool-042-estrogen-management': () => import('@/components/tools/tool-042-estrogen-management'),
  'tool-043-prolactin-management': () => import('@/components/tools/tool-043-prolactin-management'),
  'tool-044-dht-side-effects': () => import('@/components/tools/tool-044-dht-side-effects'),
  'tool-045-cycle-break-planner': () => import('@/components/tools/tool-045-cycle-break-planner'),
  'tool-046-trt-lifetime': () => import('@/components/tools/tool-046-trt-lifetime'),
  'tool-047-fertility-preservation': () => import('@/components/tools/tool-047-fertility-preservation'),
  'tool-048-cardiovascular-risk': () => import('@/components/tools/tool-048-cardiovascular-risk'),
  'tool-049-bone-density': () => import('@/components/tools/tool-049-bone-density'),
  'tool-050-mental-health': () => import('@/components/tools/tool-050-mental-health'),
  'tool-051-peptide-dosage-calculator': () => import('@/components/tools/tool-051-peptide-dosage-calculator'),
  'tool-052-growth-hormone-protocol-planner': () => import('@/components/tools/tool-052-growth-hormone-protocol-planner'),
  'tool-053-insulin-conversion-calculator': () => import('@/components/tools/tool-053-insulin-conversion-calculator'),
  'tool-054-glucose-tracker': () => import('@/components/tools/tool-054-glucose-tracker'),
  'tool-055-insulin-sensitivity-optimizer': () => import('@/components/tools/tool-055-insulin-sensitivity-optimizer'),
  'tool-056-mini-pct-calculator': () => import('@/components/tools/tool-056-mini-pct-calculator'),
  'tool-057-free-testosterone-manager': () => import('@/components/tools/tool-057-free-testosterone-manager'),
  'tool-058-androgenic-balance-calculator': () => import('@/components/tools/tool-058-androgenic-balance-calculator'),
  'tool-059-androgen-receptor-optimizer': () => import('@/components/tools/tool-059-androgen-receptor-optimizer'),
  'tool-060-5-alpha-conversion-calculator': () => import('@/components/tools/tool-060-5-alpha-conversion-calculator'),
  'tool-061-hair-loss-tracker': () => import('@/components/tools/tool-061-hair-loss-tracker'),
  'tool-062-prostate-health-manager': () => import('@/components/tools/tool-062-prostate-health-manager'),
  'tool-063-testicular-suppression-calculator': () => import('@/components/tools/tool-063-testicular-suppression-calculator'),
  'tool-064-sperm-production-optimizer': () => import('@/components/tools/tool-064-sperm-production-optimizer'),
  'tool-065-aromatase-conversion-calculator': () => import('@/components/tools/tool-065-aromatase-conversion-calculator'),
  'tool-066-estrogen-sensitivity-manager': () => import('@/components/tools/tool-066-estrogen-sensitivity-manager'),
  'tool-067-estrogen-balance-calculator': () => import('@/components/tools/tool-067-estrogen-balance-calculator'),
  'tool-068-gynecomastia-tracker': () => import('@/components/tools/tool-068-gynecomastia-tracker'),
  'tool-069-detoxification-optimizer': () => import('@/components/tools/tool-069-detoxification-optimizer'),
  'tool-070-oxidative-stress-calculator': () => import('@/components/tools/tool-070-oxidative-stress-calculator'),
  'tool-071-antioxidant-manager': () => import('@/components/tools/tool-071-antioxidant-manager'),
  'tool-072-systemic-inflammation-calculator': () => import('@/components/tools/tool-072-systemic-inflammation-calculator'),
  'tool-073-immune-system-optimizer': () => import('@/components/tools/tool-073-immune-system-optimizer'),
  'tool-074-blood-pressure-tracker': () => import('@/components/tools/tool-074-blood-pressure-tracker'),
  'tool-075-arterial-health-manager': () => import('@/components/tools/tool-075-arterial-health-manager'),
  'tool-076-blood-viscosity-calculator': () => import('@/components/tools/tool-076-blood-viscosity-calculator'),
  'tool-077-nitric-oxide-optimizer': () => import('@/components/tools/tool-077-nitric-oxide-optimizer'),
  'tool-078-endothelial-health-manager': () => import('@/components/tools/tool-078-endothelial-health-manager'),
  'tool-079-fat-metabolism-calculator': () => import('@/components/tools/tool-079-fat-metabolism-calculator'),
  'tool-080-mitochondrial-optimizer': () => import('@/components/tools/tool-080-mitochondrial-optimizer'),
  'tool-081-cellular-aging-calculator': () => import('@/components/tools/tool-081-cellular-aging-calculator'),
  'tool-082-telomere-manager': () => import('@/components/tools/tool-082-telomere-manager'),
  'tool-083-anti-aging-inflammation-calculator': () => import('@/components/tools/tool-083-anti-aging-inflammation-calculator'),
  'tool-084-cognitive-enhancer': () => import('@/components/tools/tool-084-cognitive-enhancer'),
  'tool-085-sleep-quality-manager': () => import('@/components/tools/tool-085-sleep-quality-manager'),
  'tool-086-cortisol-stress-calculator': () => import('@/components/tools/tool-086-cortisol-stress-calculator'),
  'tool-087-mood-optimizer': () => import('@/components/tools/tool-087-mood-optimizer'),
  'tool-088-dopamine-tracker': () => import('@/components/tools/tool-088-dopamine-tracker'),
  'tool-089-serotonin-manager': () => import('@/components/tools/tool-089-serotonin-manager'),
  'tool-090-female-hormone-balance-calculator': () => import('@/components/tools/tool-090-female-hormone-balance-calculator'),
  'tool-091-female-health-optimizer': () => import('@/components/tools/tool-091-female-health-optimizer'),
  'tool-092-female-dosage-calculator': () => import('@/components/tools/tool-092-female-dosage-calculator'),
  'tool-093-menstrual-cycle-manager': () => import('@/components/tools/tool-093-menstrual-cycle-manager'),
  'tool-094-pregnancy-risk-calculator': () => import('@/components/tools/tool-094-pregnancy-risk-calculator'),
  'tool-095-skin-health-optimizer': () => import('@/components/tools/tool-095-skin-health-optimizer'),
  'tool-096-hair-nail-tracker': () => import('@/components/tools/tool-096-hair-nail-tracker'),
  'tool-097-hydration-balance-calculator': () => import('@/components/tools/tool-097-hydration-balance-calculator'),
  'tool-098-sodium-potassium-manager': () => import('@/components/tools/tool-098-sodium-potassium-manager'),
  'tool-099-digestive-health-optimizer': () => import('@/components/tools/tool-099-digestive-health-optimizer'),
  'tool-100-comprehensive-report-generator': () => import('@/components/tools/tool-100-comprehensive-report-generator'),
  'tool-101-sarm-to-aas-transition-bridge-predictor': () => import('@/components/tools/tool-101-sarm-to-aas-transition-bridge-predictor'),
  'tool-102-subcutaneous-vs-intramuscular-pk-modeler': () => import('@/components/tools/tool-102-subcutaneous-vs-intramuscular-pk-modeler'),
  'tool-103-renal-function-hydration-index': () => import('@/components/tools/tool-103-renal-function-hydration-index'),
  'tool-104-thyroid-metabolic-rate-dynamics': () => import('@/components/tools/tool-104-thyroid-metabolic-rate-dynamics'),
  'tool-105-ai-health-data-fusion-hub': () => import('@/components/tools/tool-105-ai-health-data-fusion-hub'),
  'tool-106-glycogen-supercompensation-water-modeler': () => import('@/components/tools/tool-106-glycogen-supercompensation-water-modeler'),
  'tool-107-contest-prep-peak-week-manipulator': () => import('@/components/tools/tool-107-contest-prep-peak-week-manipulator'),
  'tool-108-ai-body-composition-vision-engine': () => import('@/components/tools/tool-108-ai-body-composition-vision-engine'),
  'tool-109-competition-readiness-posing-os': () => import('@/components/tools/tool-109-competition-readiness-posing-os'),
  'tool-110-ai-meal-vision-scanner': () => import('@/components/tools/tool-110-ai-meal-vision-scanner'),
};

/**
 * Returns a lazy loader for the given tool slug, or null when the slug is
 * invalid or not a published tool. Each call resolves to `{ default: Component }`.
 *
 * The returned function is NOT invoked here — callers decide when to fetch.
 */
export function toolLoaders(slug: string): (() => Promise<ToolComponentModule>) | null {
  if (!SLUG_RE.test(slug)) return null;
  const load = TOOL_MODULE_LOADERS[slug];
  return load ?? null;
}

/**
 * Resolves the React component for a slug (or null when unknown/invalid).
 * Awaits the underlying chunk, then returns the default export.
 */
export async function getToolComponent(
  slug: string
): Promise<React.ComponentType<Record<string, never>> | null> {
  const loader = toolLoaders(slug);
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod?.default ?? null;
  } catch {
    return null;
  }
}

/** Warm-up: triggers the chunk download for the given slugs (no await). */
export function preloadTools(slugs: readonly string[]): void {
  for (const slug of slugs) {
    try {
      toolLoaders(slug)?.();
    } catch {
      // Preload is best-effort — never break navigation on a missing chunk.
    }
  }
}
